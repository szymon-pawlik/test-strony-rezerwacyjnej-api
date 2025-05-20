using BackendApp.Models;
using System.Collections.Generic;

namespace BackendApp.GraphQL.Payloads
{
    public record BookingError(string Message, string Code);

    public record BookingPayload(Booking? Booking, IReadOnlyList<BookingError>? Errors = null)
    {
        public BookingPayload(Booking booking) : this(booking, null) { }
        public BookingPayload(IReadOnlyList<BookingError> errors) : this(null, errors) { }
        public BookingPayload(BookingError error) : this(null, new List<BookingError> { error }) { }
    }
}