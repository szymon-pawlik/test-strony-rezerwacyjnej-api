using Microsoft.EntityFrameworkCore;
using System.Text;
using BackendApp.Data;
using BackendApp.DTOs;
using BackendApp.Models;
using BackendApp.Services;
using BackendApp.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BackendApp.GraphQL.Queries;
using BackendApp.GraphQL.Mutations;
using BackendApp.GraphQL.Types;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IApartmentService, ApartmentService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddValidatorsFromAssemblyContaining<ApartmentValidator>();

var jwtKey = builder.Configuration["JwtSettings:Key"];
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];

if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
{
    Console.WriteLine("OSTRZEŻENIE: Ustawienia JWT (Key, Issuer, Audience) nie są w pełni skonfigurowane. Uwierzytelnianie może nie działać zgodnie z oczekiwaniami.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = string.IsNullOrEmpty(jwtKey) ? null : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer),
        ValidIssuer = jwtIssuer,
        ValidateAudience = !string.IsNullOrEmpty(jwtAudience),
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AuthenticatedUserPolicy", policy => policy.RequireAuthenticatedUser());
});

builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>(d => d.Name("Query"))
    .AddMutationType<Mutation>()
    .AddType<ApartmentType>()
    .AddType<BookingType>()
    .AddType<ReviewType>()
    .AddType<UserType>()
    .AddGlobalObjectIdentification()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment());

var app = builder.Build();

app.UseCors(corsBuilder => corsBuilder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapGraphQL();

var api = app.MapGroup("/api");

api.MapGet("/test", () => "API group test OK");

api.MapPost("/users/login", async (LoginRequestDto loginRequest, ITokenService tokenService, AppDbContext dbContext, ILogger<Program> logger) =>
{
    logger.LogInformation("Login attempt for email: {Email} with received password: {Password}", loginRequest.Email, loginRequest.Password);
    var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
    if (user == null || !PasswordHasher.VerifyPassword(loginRequest.Password, user.PasswordHash))
    {
        logger.LogWarning("Login attempt FAILED for email: {Email}", loginRequest.Email);
        return Results.Unauthorized();
    }
    logger.LogInformation("Password verification SUCCEEDED for user: {Email}", loginRequest.Email);
    var token = tokenService.GenerateJwtToken(user);
    return Results.Ok(new { Token = token });
})
.WithName("LoginUser")
.WithOpenApi()
.AllowAnonymous();

api.MapGet("/apartments", async (IApartmentService apartmentService) =>
    Results.Ok(await apartmentService.GetAllApartmentsAsync()))
    .WithName("GetAllApartments")
    .WithOpenApi()
    .RequireAuthorization();

api.MapGet("/apartments/{id}", async (Guid id, IApartmentService apartmentService) =>
{
    var apartment = await apartmentService.GetApartmentByIdAsync(id);
    return apartment is not null ? Results.Ok(apartment) : Results.NotFound();
})
.WithName("GetApartmentById")
.WithOpenApi();


api.MapPost("/apartments", async (ApartmentDTO apartmentDto, IApartmentService apartmentService, IValidator<ApartmentDTO> validator) =>
{
    var validationResult = await validator.ValidateAsync(apartmentDto);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }
    var apartment = new Apartment(
        Guid.NewGuid(),
        apartmentDto.Name,
        apartmentDto.Description,
        apartmentDto.Location,
        apartmentDto.NumberOfBedrooms,
        apartmentDto.NumberOfBathrooms,
        apartmentDto.Amenities,
        apartmentDto.IsAvailable,
        apartmentDto.PricePerNight
    );
    var createdApartment = await apartmentService.CreateApartmentAsync(apartment);
    return Results.Created($"/api/apartments/{createdApartment.Id}", createdApartment);
})
.WithName("CreateApartment")
.WithOpenApi()
.RequireAuthorization();


api.MapPost("/bookings", async (BookingDTO bookingDto, IBookingService bookingService, IValidator<BookingDTO> validator, ClaimsPrincipal claimsPrincipal) =>
{
    var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
    {
        return Results.Unauthorized();
    }

    var validationResult = await validator.ValidateAsync(bookingDto);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }
    var booking = new Booking(
        Guid.NewGuid(),
        bookingDto.ApartmentId,
        authenticatedUserId,
        bookingDto.CheckInDate,
        bookingDto.CheckOutDate,
        bookingDto.TotalPrice,
        DateTime.UtcNow
    );
    var createdBooking = await bookingService.CreateBookingAsync(booking);
    return Results.Created($"/api/bookings/{createdBooking.Id}", createdBooking);
})
.WithName("CreateBooking")
.WithOpenApi()
.RequireAuthorization();

api.MapGet("/bookings/{userId}", async (Guid userId, IBookingService bookingService, ClaimsPrincipal claimsPrincipal) =>
{
    var authenticatedUserIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(authenticatedUserIdString) || !Guid.TryParse(authenticatedUserIdString, out Guid authenticatedUserId))
    {
        return Results.Unauthorized();
    }

    if (userId != authenticatedUserId)
    {
        return Results.Forbid();
    }

    var bookings = await bookingService.GetBookingsByUserIdAsync(userId);
    return Results.Ok(bookings);
})
.WithName("GetBookingsByUser")
.WithOpenApi()
.RequireAuthorization();

app.Run();