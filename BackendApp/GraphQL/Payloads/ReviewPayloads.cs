using BackendApp.Models; // Upewnij się, że masz using dla modelu Review
using System.Collections.Generic;

namespace BackendApp.GraphQL.Payloads
{
    public record ReviewError(string Message, string Code);

    public record ReviewPayload(Review? Review, IReadOnlyList<ReviewError>? Errors = null)
    {

        public ReviewPayload(Review review) : this(review, null) { }

        public ReviewPayload(IReadOnlyList<ReviewError> errors) : this(null, errors) { }

        public ReviewPayload(ReviewError error) : this(null, new List<ReviewError> { error }) { }
    }
}