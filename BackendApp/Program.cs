using BackendApp.Data;
using BackendApp.Models;
using BackendApp.Services;
using BackendApp.DTOs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

//Services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<ApartmentService>();
builder.Services.AddSingleton<BookingService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Endpoints Apartments
app.MapGet("/apartments", (ApartmentService apartmentService) =>
    Results.Ok(apartmentService.GetAllApartments()))
    .WithName("GetAllApartments")
    .WithOpenApi();

app.MapGet("/apartments/{id}", (Guid id, ApartmentService apartmentService) =>
    {
        var apartment = apartmentService.GetApartmentById(id);
        return apartment is not null ? Results.Ok(apartment) : Results.NotFound();
    })
    .WithName("GetApartmentById")
    .WithOpenApi();

app.MapPost("/apartments", (ApartmentDTO apartmentDto, ApartmentService apartmentService) =>
    {
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
        return Results.Created($"/apartments/{createdApartment.Id}", createdApartment);
    })
    .WithName("CreateApartment")
    .WithOpenApi();

// Endpoints Bookings
app.MapPost("/bookings", (BookingDTO bookingDto, BookingService bookingService) =>
    {
        var booking = new Booking(
            Guid.NewGuid(),
            bookingDto.ApartmentId,
            bookingDto.UserId,
            bookingDto.CheckInDate,
            bookingDto.CheckOutDate,
            bookingDto.TotalPrice,
            DateTime.UtcNow);

        var createdBooking = bookingService.AddBooking(booking);
        return Results.Created($"/bookings/{createdBooking.Id}", createdBooking);
    })
    .WithName("CreateBooking")
    .WithOpenApi();

app.MapGet("/bookings/{userId}", (Guid userId, BookingService bookingService) =>
    {
        var bookings = bookingService.GetBookingsByUser(userId);
        return Results.Ok(bookings);
    })
    .WithName("GetBookingsByUser")
    .WithOpenApi();

app.Run();