namespace BackendApp.DTOs;

public record ApartmentDTO(
    string Name,
    string Description,
    string Location,
    int NumberOfBedrooms,
    int NumberOfBathrooms,
    List<string> Amenities,
    bool IsAvailable);