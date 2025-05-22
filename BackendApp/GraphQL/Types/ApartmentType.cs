using BackendApp.Models;
using BackendApp.Services;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotChocolate.Types.Pagination;

namespace BackendApp.GraphQL.Types
{
    public class ApartmentType : ObjectType<Apartment>
    {
        protected override void Configure(IObjectTypeDescriptor<Apartment> descriptor)
        {
            // Pola modelu Apartment
            descriptor.Field(a => a.LocalDatabaseId)
                .Name("databaseId")
                .Type<NonNullType<UuidType>>();

            descriptor.Field(a => a.Name).Type<NonNullType<StringType>>();
            descriptor.Field(a => a.Description).Type<StringType>();
            descriptor.Field(a => a.Location).Type<StringType>();
            descriptor.Field(a => a.NumberOfBedrooms);
            descriptor.Field(a => a.NumberOfBathrooms);
            descriptor.Field(a => a.Amenities).Type<ListType<NonNullType<StringType>>>();
            descriptor.Field(a => a.IsAvailable);
            descriptor.Field(a => a.PricePerNight).Type<DecimalType>();
            

            // Relacje
            descriptor.Field<ApartmentResolvers>(r => r.GetReviewsForApartmentAsync(default!, default!))
                .Name("reviews")
                .UsePaging<NonNullType<ReviewType>>(options: new PagingOptions { IncludeTotalCount = true })
                .UseFiltering()
                .UseSorting();

            descriptor.Field<ApartmentResolvers>(r => r.GetBookingsForApartmentAsync(default!, default!))
                .Name("bookings")
                .Type<ListType<NonNullType<BookingType>>>();

            // Relay node interface
            descriptor.ImplementsNode()
                .IdField(a => a.Id)
                .ResolveNode(async (ctx, localId) => await ctx.Service<IApartmentService>().GetApartmentByIdAsync(localId));
        }

        private class ApartmentResolvers
        {
            public async Task<IEnumerable<Review>> GetReviewsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IReviewService reviewService)
            {
                return await reviewService.GetReviewsByApartmentIdAsync(apartment.Id);
            }

            public async Task<IEnumerable<Booking>> GetBookingsForApartmentAsync(
                [Parent] Apartment apartment,
                [Service] IBookingService bookingService)
            {
                return await bookingService.GetBookingsByApartmentIdAsync(apartment.Id);
            }
        }
    }
}
