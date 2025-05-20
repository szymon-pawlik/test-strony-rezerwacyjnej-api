using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.GraphQL.Types
{
    public class ApartmentType : ObjectType<Apartment>
    {
        protected override void Configure(IObjectTypeDescriptor<Apartment> descriptor)
        {
            descriptor.ImplementsNode()
                .IdField(a => a.Id)
                .ResolveNode(async (ctx, id) =>
                    await ctx.Service<IApartmentService>().GetApartmentByIdAsync(id));

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
                .Type<ListType<NonNullType<ReviewType>>>();

            descriptor.Field<ApartmentResolvers>(r => r.GetBookingsForApartmentAsync(default!, default!))
                .Name("bookings")
                .Type<ListType<NonNullType<BookingType>>>();
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