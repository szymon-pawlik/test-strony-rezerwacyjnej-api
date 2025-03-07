namespace BackendApp.DTOs;

public record ReviewDTO(
    Guid ApartmentId,
    Guid UserId,
    int Rating,
    string Comment);