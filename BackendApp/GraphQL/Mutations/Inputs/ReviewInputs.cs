using System; 

namespace BackendApp.GraphQL.Mutations.Inputs
{
    public record AddReviewInput(
        Guid ApartmentId,
        int Rating,
        string? Comment

    );
}