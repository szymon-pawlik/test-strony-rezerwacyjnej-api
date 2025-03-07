namespace BackendApp.Models;

public record Booking(
    Guid Id,
    Guid ApartmentId,
    Guid UserId,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    decimal TotalPrice,
    DateTime BookingDate);