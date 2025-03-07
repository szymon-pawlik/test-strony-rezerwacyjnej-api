namespace BackendApp.Models;

public record Review(
    Guid Id,
    Guid ApartmentId,
    Guid UserId,
    int Rating,
    string Comment,
    DateTime ReviewDate);