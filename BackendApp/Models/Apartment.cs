namespace BackendApp.Models;

public record Apartment(
    Guid Id,
    string Name,
    string Description,
    string Location,
    decimal PricePerNight,
    int NumberOfBedrooms,
    int NumberOfBathrooms,
    List<string> Amenities,
    bool IsAvailable);