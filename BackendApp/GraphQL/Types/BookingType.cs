using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Dla IHttpContextAccessor, jeśli używany w ResolveNode
using Microsoft.Extensions.Logging;

namespace BackendApp.GraphQL.Types
{
    public class BookingType : ObjectType<Booking>
    {
        protected override void Configure(IObjectTypeDescriptor<Booking> descriptor)
        {
            // 1. Definicja pola "databaseId"
            descriptor.Field(b => b.LocalDatabaseId)
                .Name("databaseId")
                .Type<NonNullType<UuidType>>();

            // 2. Pozostałe pola
            descriptor.Field(b => b.CheckInDate).Type<NonNullType<DateTimeType>>();
            descriptor.Field(b => b.CheckOutDate).Type<NonNullType<DateTimeType>>();
            descriptor.Field(b => b.TotalPrice).Type<NonNullType<FloatType>>();
            descriptor.Field(b => b.BookingDate).Type<NonNullType<DateTimeType>>();

            descriptor.Field<BookingResolvers>(r => r.GetApartmentForBookingAsync(default!, default!))
                .Name("apartment")
                .Type<NonNullType<ApartmentType>>();

            descriptor.Field<BookingResolvers>(r => r.GetUserForBookingAsync(default!, default!))
                .Name("user")
                .Type<NonNullType<UserType>>();

            // 3. Implementacja Node na końcu
            descriptor.ImplementsNode()
                .IdField(b => b.Id)
                .ResolveNode(async (ctx, localId) =>
                {
                    var bookingService = ctx.Service<IBookingService>();
                    return await bookingService.GetBookingByIdAsync(localId);
                });
        }

        private class BookingResolvers
        {
            public async Task<Apartment?> GetApartmentForBookingAsync(
                [Parent] Booking booking,
                [Service] IApartmentService apartmentService)
            {
                return await apartmentService.GetApartmentByIdAsync(booking.ApartmentId);
            }

            public async Task<User?> GetUserForBookingAsync(
                [Parent] Booking booking,
                [Service] IUserService userService)
            {
                return await userService.GetUserByIdAsync(booking.UserId);
            }
        }
    }
}