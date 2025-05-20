using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types; // Dla BookingType, ReviewType
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Dla HttpContext i IHttpContextAccessor

namespace BackendApp.GraphQL.Types
{
    public class UserType : ObjectType<User>
    {
        protected override void Configure(IObjectTypeDescriptor<User> descriptor)
        {
            descriptor.ImplementsNode()
                .IdField(u => u.Id)
                .ResolveNode(async (ctx, id) => // 'id' to lokalne Guid
                {
                    var userService = ctx.Service<IUserService>();
                    // Tutaj nie potrzebujemy HttpContext, chyba że GetUserByIdAsync by go wymagał
                    return await userService.GetUserByIdAsync(id);
                });

            descriptor.Field(u => u.Name);
            descriptor.Field(u => u.Email).Type<NonNullType<StringType>>();
            descriptor.Field(u => u.PasswordHash).Ignore();

            descriptor.Field<UserResolvers>(r => r.GetBookingsForUserAsync(default!, default!))
                .Name("bookings")
                .UsePaging<BookingType>()
                .UseProjection()
                .UseFiltering()
                .UseSorting();

            descriptor.Field<UserResolvers>(r => r.GetReviewsForUserAsync(default!, default!, default!))
                .Name("reviews")
                .UsePaging<ReviewType>()
                //.UseProjection()
                .UseFiltering()
                .UseSorting();
        }

        private class UserResolvers
        {
            public async Task<IEnumerable<Booking>> GetBookingsForUserAsync(
                [Parent] User user,
                [Service] IBookingService bookingService)
            {
                return await bookingService.GetBookingsByUserIdAsync(user.Id);
            }

            // Poprawiona metoda GetReviewsForUserAsync
            public async Task<IEnumerable<Review>> GetReviewsForUserAsync(
                [Parent] User user,
                [Service] IReviewService reviewService,
                [Service] IHttpContextAccessor httpContextAccessor) 
            {
                string? tokenForMicroserviceCall = httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                
                return await reviewService.GetReviewsByUserIdAsync(user.Id, tokenForMicroserviceCall);
            }
        }
    }
}