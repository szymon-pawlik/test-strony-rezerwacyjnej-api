using System;

namespace BackendApp.GraphQL.Mutations.Inputs
{
    public record AddReviewInput(
        Guid ApartmentId,
        Guid UserId,
        int Rating,
        string Comment);
}