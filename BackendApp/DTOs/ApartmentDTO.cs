using System.Collections.Generic; // Wymagane dla List<string>

namespace BackendApp.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) używany do transferu danych mieszkania,
    /// np. podczas tworzenia lub aktualizacji.
    /// Rekordy są typami niemutowalnymi (domyślnie) i zwięzłymi do definiowania klas danych.
    /// </summary>
    /// <param name="Name">Nazwa mieszkania.</param>
    /// <param name="Description">Opis mieszkania.</param>
    /// <param name="Location">Lokalizacja mieszkania.</param>
    /// <param name="NumberOfBedrooms">Liczba sypialni.</param>
    /// <param name="NumberOfBathrooms">Liczba łazienek.</param>
    /// <param name="Amenities">Lista udogodnień dostępnych w mieszkaniu.</param>
    /// <param name="IsAvailable">Określa, czy mieszkanie jest aktualnie dostępne do rezerwacji.</param>
    /// <param name="PricePerNight">Cena za jedną noc pobytu.</param>
    public record ApartmentDTO(
        string Name,
        string Description,
        string Location,
        int NumberOfBedrooms,
        int NumberOfBathrooms,
        List<string> Amenities,
        bool IsAvailable,
        decimal PricePerNight
    );
}