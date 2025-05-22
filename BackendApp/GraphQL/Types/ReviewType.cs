using BackendApp.Models;
using BackendApp.Services;
// Upewnij się, że masz using dla ApartmentType i UserType, jeśli są w innym namespace
// Np. using BackendApp.GraphQL.Types;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BackendApp.GraphQL.Types
{
    public class ReviewType : ObjectType<Review>
    {
        protected override void Configure(IObjectTypeDescriptor<Review> descriptor)
        {
            // Definiujemy wszystkie "zwykłe" pola obiektu
            descriptor.Field(r => r.Id) // Odwołuje się do właściwości C# 'Id'
                .Name("databaseId")     // Nazwa w schemacie GraphQL
                .Type<NonNullType<UuidType>>();

            descriptor.Field(r => r.Rating).Type<NonNullType<IntType>>();
            descriptor.Field(r => r.Comment);
            descriptor.Field(r => r.ReviewDate).Type<NonNullType<DateTimeType>>();

            descriptor.Field<ReviewResolvers>(r => r.GetApartmentForReviewAsync(default!, default!, default!))
                .Name("apartment")
                .Type<ApartmentType>(); 

            descriptor.Field<ReviewResolvers>(r => r.GetUserForReviewAsync(default!, default!, default!))
                .Name("user")
                .Type<UserType>(); 

            // Dopiero na końcu definiujemy implementację interfejsu Node
            descriptor.ImplementsNode()
                .IdField(r => r.Id) // Mówi, że właściwość C# 'Id' jest podstawą dla globalnego ID
                .ResolveNode(async (ctx, localId) =>
                {
                    var reviewService = ctx.Service<IReviewService>();
                    string? userToken = null;
                    // Poniższe pobieranie tokenu jest opcjonalne, jeśli GetReviewByIdAsync go nie wymaga
                    // lub jeśli endpoint w ReviewServiceApp dla GET /api/reviews/{id} jest publiczny.
                    IHttpContextAccessor? httpContextAccessor = ctx.Service<IHttpContextAccessor>();
                    if (httpContextAccessor?.HttpContext?.User?.Identity?.IsAuthenticated ?? false)
                    {
                        userToken = httpContextAccessor.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                    }
                    return await reviewService.GetReviewByIdAsync(localId, userToken);
                });
        }

        private class ReviewResolvers
        {
            public async Task<Apartment?> GetApartmentForReviewAsync(
                [Parent] Review review,
                [Service] IApartmentService apartmentService,
                [Service] ILogger<ReviewType> logger)
            {
                logger.LogInformation("[ReviewType Resolver] GetApartmentForReviewAsync: Called for ReviewId {ReviewId}, trying to fetch Apartment by ApartmentId {ApartmentId}", review.Id, review.ApartmentId);
                if (review.ApartmentId == Guid.Empty) {
                    logger.LogWarning("[ReviewType Resolver] GetApartmentForReviewAsync: ApartmentId is Guid.Empty for ReviewId {ReviewId}", review.Id);
                    return null;
                }
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
                [Service] ILogger<ReviewType> logger)
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