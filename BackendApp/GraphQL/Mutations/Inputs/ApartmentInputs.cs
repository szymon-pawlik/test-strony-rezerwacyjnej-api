using System;
using System.Collections.Generic;
using HotChocolate.Types; 

namespace BackendApp.GraphQL.Mutations.Inputs
{

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
    
    public record UpdateApartmentInput(
        Guid Id,
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