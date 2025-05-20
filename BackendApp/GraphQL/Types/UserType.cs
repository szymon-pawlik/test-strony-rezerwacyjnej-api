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
    public class UserType : ObjectType<User>
    {
        protected override void Configure(IObjectTypeDescriptor<User> descriptor)
        {
            descriptor.ImplementsNode()
                .IdField(u => u.Id)
                .ResolveNode(async (ctx, id) =>
                    await ctx.Service<IUserService>().GetUserByIdAsync(id));

            descriptor.Field(u => u.Name);
            descriptor.Field(u => u.Email).Type<NonNullType<StringType>>();
            descriptor.Field(u => u.PasswordHash).Ignore();

            descriptor.Field<UserResolvers>(r => r.GetBookingsForUserAsync(default!, default!))
                .Name("bookings")
                .Type<ListType<NonNullType<BookingType>>>();

            descriptor.Field<UserResolvers>(r => r.GetReviewsForUserAsync(default!, default!))
                .Name("reviews")
                .Type<ListType<NonNullType<ReviewType>>>();
        }

        private class UserResolvers
        {
            public async Task<IEnumerable<Booking>> GetBookingsForUserAsync(
                [Parent] User user,
                [Service] IBookingService bookingService)
            {
                return await bookingService.GetBookingsByUserIdAsync(user.Id);
            }

            public async Task<IEnumerable<Review>> GetReviewsForUserAsync(
                [Parent] User user,
                [Service] IReviewService reviewService)
            {
                return await reviewService.GetReviewsByUserIdAsync(user.Id);
            }
        }
    }
}