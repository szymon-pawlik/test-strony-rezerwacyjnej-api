using System;

namespace BackendApp.GraphQL.Mutations.Inputs
{
    // Dane wejściowe dla mutacji dodającej nową rezerwację.
    public record AddBookingInput(
        Guid ApartmentId,
        Guid UserId,
        DateTime CheckInDate,
        DateTime CheckOutDate,
        decimal TotalPrice);
}