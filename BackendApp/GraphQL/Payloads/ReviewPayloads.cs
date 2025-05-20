using BackendApp.Models; // Upewnij się, że masz using dla modelu Review
using System.Collections.Generic;

namespace BackendApp.GraphQL.Payloads
{
    public record ReviewError(string Message, string Code);

    public record ReviewPayload(Review? Review, IReadOnlyList<ReviewError>? Errors = null)
    {
        // Konstruktor dla przypadku sukcesu
        public ReviewPayload(Review review) : this(review, null) { }

        // Konstruktor dla przypadku listy błędów
        public ReviewPayload(IReadOnlyList<ReviewError> errors) : this(null, errors) { }

        // Konstruktor dla przypadku pojedynczego błędu
        public ReviewPayload(ReviewError error) : this(null, new List<ReviewError> { error }) { }
    }
}