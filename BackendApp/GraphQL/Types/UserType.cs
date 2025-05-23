using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types; // Dla BookingType, ReviewType
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay; // Dla Node, ImplementsNode, [ID]
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotChocolate.Types.Pagination; // Dla PagingOptions
using Microsoft.AspNetCore.Http;    // Dla IHttpContextAccessor

namespace BackendApp.GraphQL.Types
{
    /// <summary>
    /// Definiuje typ GraphQL dla modelu User.
    /// Odpowiada za mapowanie właściwości modelu User na pola w schemacie GraphQL.
    /// </summary>
    public class UserType : ObjectType<User>
    {
        // Konfiguruje strukturę typu User w schemacie GraphQL.
        protected override void Configure(IObjectTypeDescriptor<User> descriptor)
        {
            // Implementacja interfejsu Node dla globalnej identyfikacji obiektów.
            descriptor.ImplementsNode()
                .IdField(u => u.Id) // Wskazuje, że właściwość 'Id' modelu User dostarcza lokalne ID.
                .ResolveNode(async (ctx, id) => // Definiuje logikę pobierania obiektu User na podstawie jego ID.
                {
                    var userService = ctx.Service<IUserService>();
                    return await userService.GetUserByIdAsync(id); // 'id' jest tutaj Guid
                });

            // Mapowanie podstawowych właściwości modelu User na pola GraphQL.
            descriptor.Field(u => u.Name); // Domyślnie StringType, może być null
            descriptor.Field(u => u.Email).Type<NonNullType<StringType>>(); // Email jest wymagany
            descriptor.Field(u => u.PasswordHash).Ignore(); // Hasło nie powinno być eksponowane przez API.

            // Definicja pola 'bookings' jako kolekcji z paginacją, filtrowaniem i sortowaniem.
            descriptor.Field<UserResolvers>(r => r.GetBookingsForUserAsync(default!, default!))
                .Name("bookings")
                .UsePaging<BookingType>(options: new PagingOptions { IncludeTotalCount = true }) // Używa BookingType dla elementów listy
                .UseFiltering()
                .UseSorting();

            // Definicja pola 'reviews' jako kolekcji z paginacją, filtrowaniem i sortowaniem.
            descriptor.Field<UserResolvers>(r => r.GetReviewsForUserAsync(default!, default!, default!))
                .Name("reviews")
                .UsePaging<ReviewType>() // Używa ReviewType dla elementów listy
                .UseFiltering()
                .UseSorting();
        }

        // Prywatna klasa wewnętrzna grupująca metody resolverów dla UserType.
        private class UserResolvers
        {
            // Resolver dla pola 'bookings'.
            public async Task<IEnumerable<Booking>> GetBookingsForUserAsync(
                [Parent] User user, // Obiekt nadrzędny (użytkownik)
                [Service] IBookingService bookingService) // Wstrzykiwany serwis rezerwacji
            {
                return await bookingService.GetBookingsByUserIdAsync(user.Id);
            }

            // Resolver dla pola 'reviews'.
            public async Task<IEnumerable<Review>> GetReviewsForUserAsync(
                [Parent] User user, // Obiekt nadrzędny (użytkownik)
                [Service] IReviewService reviewService, // Wstrzykiwany serwis recenzji
                [Service] IHttpContextAccessor httpContextAccessor) // Dostęp do HttpContext
            {
                // Przykład pobrania tokenu autoryzacyjnego z nagłówka żądania,
                // jeśli serwis recenzji wymagałby go do wywołania (np. inny mikroserwis).
                string? tokenForMicroserviceCall = httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

                return await reviewService.GetReviewsByUserIdAsync(user.Id, tokenForMicroserviceCall);
            }
        }
    }
}