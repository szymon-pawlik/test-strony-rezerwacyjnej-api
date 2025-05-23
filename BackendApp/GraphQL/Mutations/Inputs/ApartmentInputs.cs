using System;
using System.Collections.Generic;
using HotChocolate.Types; // Dla Optional<T>

namespace BackendApp.GraphQL.Mutations.Inputs
{
    // Dane wejściowe dla mutacji dodającej nowe mieszkanie.
    public record AddApartmentInput(
        string Name,
        string Description,
        string Location,
        int NumberOfBedrooms,
        int NumberOfBathrooms,
        List<string> Amenities,
        bool IsAvailable,
        decimal PricePerNight
    );

    // Dane wejściowe dla mutacji aktualizującej istniejące mieszkanie.
    // Użycie Optional<T> pozwala na przekazanie tylko tych pól, które mają być zmienione.
    public record UpdateApartmentInput(
        Guid Id, // ID mieszkania do aktualizacji (nie Optional, bo wymagane)
        Optional<string> Name,
        Optional<string> Description,
        Optional<string> Location,
        Optional<int> NumberOfBedrooms,
        Optional<int> NumberOfBathrooms,
        Optional<List<string>> Amenities,
        Optional<bool> IsAvailable,
        Optional<decimal> PricePerNight
    );
}