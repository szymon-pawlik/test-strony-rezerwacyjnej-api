using BackendApp.Data;
using BackendApp.DTOs;
using BackendApp.Models;
using BackendApp.Services;
using BackendApp.Validators;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddCors();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ApartmentService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddValidatorsFromAssemblyContaining<ApartmentValidator>();

var app = builder.Build();

// Configure CORS
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

// Serve static files
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// API Endpoints
var api = app.MapGroup("/api");

api.MapGet("/apartments", (ApartmentService apartmentService) =>
    Results.Ok(apartmentService.GetAllApartments()))
    .WithName("GetAllApartments")
    .WithOpenApi();

api.MapGet("/apartments/{id}", (Guid id, ApartmentService apartmentService) =>
{
    var apartment = apartmentService.GetApartmentById(id);
    return apartment is not null ? Results.Ok(apartment) : Results.NotFound();
})
.WithName("GetApartmentById")
.WithOpenApi();

api.MapPost("/apartments", async (ApartmentDTO apartmentDto, ApartmentService apartmentService, IValidator<ApartmentDTO> validator) =>
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
        apartmentDto.PricePerNight,
        apartmentDto.NumberOfBedrooms,
        apartmentDto.NumberOfBathrooms,
        apartmentDto.Amenities,
        apartmentDto.IsAvailable);

    var createdApartment = apartmentService.AddApartment(apartment);
    return Results.Created($"/api/apartments/{createdApartment.Id}", createdApartment);
})
.WithName("CreateApartment")
.WithOpenApi();

api.MapPost("/bookings", async (BookingDTO bookingDto, BookingService bookingService, IValidator<BookingDTO> validator) =>
{
    var validationResult = await validator.ValidateAsync(bookingDto);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }

    var booking = new Booking(
        Guid.NewGuid(),
        bookingDto.ApartmentId,
        bookingDto.UserId,
        bookingDto.CheckInDate,
        bookingDto.CheckOutDate,
        bookingDto.TotalPrice,
        DateTime.UtcNow);

    var createdBooking = bookingService.AddBooking(booking);
    return Results.Created($"/api/bookings/{createdBooking.Id}", createdBooking);
})
.WithName("CreateBooking")
.WithOpenApi();

api.MapGet("/bookings/{userId}", (Guid userId, BookingService bookingService) =>
{
    var bookings = bookingService.GetBookingsByUser(userId);
    return Results.Ok(bookings);
})
.WithName("GetBookingsByUser")
.WithOpenApi();

app.Run();