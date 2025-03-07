namespace BackendApp.DTOs;

public record BookingDTO(
    Guid ApartmentId,
    Guid UserId,
    DateTime CheckInDate,
    DateTime CheckOutDate,
    double TotalPrice);