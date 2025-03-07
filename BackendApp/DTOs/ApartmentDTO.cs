namespace BackendApp.DTOs;

public record ApartmentDTO(
    string Name,
    string Description,
    string Location,
    decimal PricePerNight,
    int NumberOfBedrooms,
    int NumberOfBathrooms,
    List<string> Amenities,
    bool IsAvailable);