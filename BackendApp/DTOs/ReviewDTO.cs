namespace BackendApp.DTOs;

public record CreateReviewDtoInBackendApp(
    Guid ApartmentId,
    int Rating,
    string? Comment
);