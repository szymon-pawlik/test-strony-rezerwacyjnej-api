using System;

namespace BackendApp.GraphQL.Mutations.Inputs
{
    public record AddBookingInput(
        Guid ApartmentId,
        Guid UserId,
        DateTime CheckInDate,
        DateTime CheckOutDate,
        double TotalPrice);
}