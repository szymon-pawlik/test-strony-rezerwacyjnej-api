using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotChocolate.Types.Pagination; // Upewnij się, że ten using jest

namespace BackendApp.GraphQL.Types
{
    public class ApartmentType : ObjectType<Apartment>
    {
        protected override void Configure(IObjectTypeDescriptor<Apartment> descriptor)
        {
            // Najpierw definiujemy wszystkie "zwykłe" pola obiektu
            descriptor.Field(a => a.LocalDatabaseId) // <-- ZMIANA TUTAJ: użyj nowej właściwości
                .Name("databaseId")
                .Type<NonNullType<UuidType>>();

            descriptor.Field(a => a.Name);
            descriptor.Field(a => a.Description);
            descriptor.Field(a => a.Location);
            descriptor.Field(a => a.NumberOfBedrooms);
            descriptor.Field(a => a.NumberOfBathrooms);
            descriptor.Field(a => a.Amenities).Type<ListType<NonNullType<StringType>>>();
            descriptor.Field(a => a.IsAvailable);
            descriptor.Field(a => a.PricePerNight).Type<DecimalType>();

            descriptor.Field<ApartmentResolvers>(r => r.GetReviewsForApartmentAsync(default!, default!))
                .Name("reviews")
                .UsePaging<NonNullType<ReviewType>>(options: new PagingOptions { IncludeTotalCount = true })
                .UseFiltering()
                .UseSorting();
                // Usunęliśmy .UseProjection() stąd, bo powodowało problemy z konstruktorem Review

            descriptor.Field<ApartmentResolvers>(r => r.GetBookingsForApartmentAsync(default!, default!))
                .Name("bookings")
                .Type<ListType<NonNullType<BookingType>>>(); // Bez paginacji na razie

            // Dopiero na końcu definiujemy implementację interfejsu Node
            // To zapewni, że pole "id" (globalne ID Relay) zostanie poprawnie dodane
            // i nie będzie kolidować z Twoim polem "databaseId"
            descriptor.ImplementsNode()
                .IdField(a => a.Id) // Wskazuje, że właściwość C# 'Id' jest lokalnym identyfikatorem dla Node
                .ResolveNode(async (ctx, localId) => await ctx.Service<IApartmentService>().GetApartmentByIdAsync(localId));
        }

        private class ApartmentResolvers
        {
            public async Task<IEnumerable<Review>> GetReviewsForApartmentAsync(
                    [Parent] Apartment apartment,
                    [Service] IReviewService reviewService)
            {
                // Zakładamy, że GetReviewsByApartmentIdAsync nie potrzebuje tokenu,
                // bo endpoint w ReviewServiceApp jest publiczny
                return await reviewService.GetReviewsByApartmentIdAsync(apartment.Id);
            }

            public async Task<IEnumerable<Booking>> GetBookingsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IBookingService bookingService)
            {
                // Tutaj podobnie, jeśli potrzebny token, trzeba by go przekazać
                return await bookingService.GetBookingsByApartmentIdAsync(apartment.Id);
            }
        }
    }
}