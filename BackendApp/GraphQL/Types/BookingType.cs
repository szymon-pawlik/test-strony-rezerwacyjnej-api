using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types; // Dla ApartmentType, UserType
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay; // Dla Node, ImplementsNode, [ID]
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging; // Nieużywane bezpośrednio, ale często spotykane w projektach

namespace BackendApp.GraphQL.Types
{
    /// <summary>
    /// Definiuje typ GraphQL dla modelu Booking.
    /// Odpowiada za mapowanie właściwości modelu Booking na pola w schemacie GraphQL.
    /// </summary>
    public class BookingType : ObjectType<Booking>
    {
        // Konfiguruje strukturę typu Booking w schemacie GraphQL.
        protected override void Configure(IObjectTypeDescriptor<Booking> descriptor)
        {
            // Mapowanie podstawowych właściwości modelu Booking na pola GraphQL.
            descriptor.Field(b => b.LocalDatabaseId) // Zakładając, że Booking ma LocalDatabaseId, lub to powinno być b.Id
                .Name("databaseId") // Nazwa pola w schemacie GraphQL
                .Type<NonNullType<UuidType>>(); // Typ pola: nie-nullowalny UUID

            descriptor.Field(b => b.CheckInDate).Type<NonNullType<DateTimeType>>();
            descriptor.Field(b => b.CheckOutDate).Type<NonNullType<DateTimeType>>();
            descriptor.Field(b => b.TotalPrice).Type<NonNullType<FloatType>>(); // Użycie FloatType dla decimal może być preferowane w GraphQL dla prostoty
            descriptor.Field(b => b.BookingDate).Type<NonNullType<DateTimeType>>();

            // Definicja pola 'apartment' jako obiektu ApartmentType, pobieranego przez resolver.
            descriptor.Field<BookingResolvers>(r => r.GetApartmentForBookingAsync(default!, default!))
                .Name("apartment")
                .Type<NonNullType<ApartmentType>>();

            // Definicja pola 'user' jako obiektu UserType, pobieranego przez resolver.
            descriptor.Field<BookingResolvers>(r => r.GetUserForBookingAsync(default!, default!))
                .Name("user")
                .Type<NonNullType<UserType>>();

            // Implementacja interfejsu Node dla globalnej identyfikacji obiektów.
            descriptor.ImplementsNode()
                .IdField(b => b.Id) // Wskazuje, która właściwość dostarcza lokalne ID dla globalnego ID Relay.
                .ResolveNode(async (ctx, localId) => // Definiuje logikę pobierania obiektu na podstawie jego (lokalnego) ID.
                {
                    // Ten resolver jest odpowiedzialny za odtworzenie obiektu Booking na podstawie jego ID.
                    var bookingService = ctx.Service<IBookingService>();
                    return await bookingService.GetBookingByIdAsync(localId); // localId jest tutaj Guid
                });
        }

        // Prywatna klasa wewnętrzna grupująca metody resolverów dla BookingType.
        private class BookingResolvers
        {
            // Resolver dla pola 'apartment'.
            public async Task<Apartment?> GetApartmentForBookingAsync(
                [Parent] Booking booking,
                [Service] IApartmentService apartmentService)
            {
                return await apartmentService.GetApartmentByIdAsync(booking.ApartmentId);
            }

            // Resolver dla pola 'user'.
            public async Task<User?> GetUserForBookingAsync(
                [Parent] Booking booking,
                [Service] IUserService userService)
            {
                return await userService.GetUserByIdAsync(booking.UserId);
            }
        }
    }
}