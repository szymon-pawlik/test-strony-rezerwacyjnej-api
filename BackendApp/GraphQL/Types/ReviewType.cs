using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types; // Upewnij się, że ten using jest, jeśli UserType jest używany
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Threading.Tasks; // Dla Task
using Microsoft.AspNetCore.Http; // Dla IHttpContextAccessor, jeśli jest używany w ResolveNode
using Microsoft.Extensions.Logging; // Dla ILogger

namespace BackendApp.GraphQL.Types
{
    public class ReviewType : ObjectType<Review>
    {
        protected override void Configure(IObjectTypeDescriptor<Review> descriptor)
        {
            descriptor.ImplementsNode()
                .IdField(r => r.Id)
                .ResolveNode(async (ctx, id) =>
                {
                    var reviewService = ctx.Service<IReviewService>();
                    string? userToken = null;
                    IHttpContextAccessor? httpContextAccessor = ctx.Service<IHttpContextAccessor>();
                    if (httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false)
                    {
                        userToken = httpContextAccessor.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                    }
                    return await reviewService.GetReviewByIdAsync(id, userToken);
                });

            descriptor.Field(r => r.Rating).Type<NonNullType<IntType>>();
            descriptor.Field(r => r.Comment);
            descriptor.Field(r => r.ReviewDate).Type<NonNullType<DateTimeType>>();

            descriptor.Field<ReviewResolvers>(r => r.GetApartmentForReviewAsync(default!, default!, default!))
                .Name("apartment")
                .Type<ApartmentType>(); 

            // --- POPRAWKA TUTAJ ---
            descriptor.Field<ReviewResolvers>(r => r.GetUserForReviewAsync(default!, default!, default!)) // <-- DODANO TRZECI default!
                .Name("user")
                .Type<UserType>(); // Ustawione na nullowalny, jak ostatnio
            // --- KONIEC POPRAWKI ---
        }

        private class ReviewResolvers
        {
            public async Task<Apartment?> GetApartmentForReviewAsync(
                [Parent] Review review,
                [Service] IApartmentService apartmentService,
                [Service] ILogger<ReviewType> logger) // Tutaj ILogger był poprawnie dodany
            {
                logger.LogInformation("[ReviewType Resolver] GetApartmentForReviewAsync: Called for ReviewId {ReviewId}, trying to fetch Apartment by ApartmentId {ApartmentId}", review.Id, review.ApartmentId);
                var apartment = await apartmentService.GetApartmentByIdAsync(review.ApartmentId);
                if (apartment == null)
                {
                    logger.LogWarning("[ReviewType Resolver] GetApartmentForReviewAsync: Apartment NOT FOUND in BackendApp for ApartmentId {ApartmentId} (from ReviewId {ReviewId})", review.ApartmentId, review.Id);
                }
                else
                {
                    logger.LogInformation("[ReviewType Resolver] GetApartmentForReviewAsync: Apartment FOUND in BackendApp: {ApartmentName} for ApartmentId {ApartmentId}", apartment.Name, review.ApartmentId);
                }
                return apartment;
            }

            public async Task<User?> GetUserForReviewAsync(
                [Parent] Review review,
                [Service] IUserService userService,
                [Service] ILogger<ReviewType> logger) // Upewnij się, że ILogger jest oznaczony [Service]
            {
                logger.LogInformation("[ReviewType Resolver] GetUserForReviewAsync: Called for ReviewId {ReviewId}, trying to fetch User by UserId {UserId}", review.Id, review.UserId);
                if (review.UserId == Guid.Empty)
                {
                    logger.LogWarning("[ReviewType Resolver] GetUserForReviewAsync: Review has an empty UserId. ReviewId: {ReviewId}", review.Id);
                    return null;
                }
                var user = await userService.GetUserByIdAsync(review.UserId);
                if (user == null)
                {
                    logger.LogWarning("[ReviewType Resolver] GetUserForReviewAsync: User NOT FOUND in BackendApp for UserId {UserId} (from ReviewId {ReviewId})", review.UserId, review.Id);
                }
                else
                {
                    logger.LogInformation("[ReviewType Resolver] GetUserForReviewAsync: User FOUND in BackendApp: {UserName} for UserId {UserId}", user.Name, review.UserId);
                }
                return user;
            }
        }
    }
}