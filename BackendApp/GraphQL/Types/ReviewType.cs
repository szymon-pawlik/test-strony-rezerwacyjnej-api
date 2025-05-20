using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Types;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Threading.Tasks;

namespace BackendApp.GraphQL.Types
{
    public class ReviewType : ObjectType<Review>
    {
        protected override void Configure(IObjectTypeDescriptor<Review> descriptor)
        {
            descriptor.ImplementsNode()
                .IdField(r => r.Id)
                .ResolveNode(async (ctx, id) =>
                    await ctx.Service<IReviewService>().GetReviewByIdAsync(id));

            descriptor.Field(r => r.Rating).Type<NonNullType<IntType>>();
            descriptor.Field(r => r.Comment);
            descriptor.Field(r => r.ReviewDate).Type<NonNullType<DateTimeType>>();

            descriptor.Field<ReviewResolvers>(r => r.GetApartmentForReviewAsync(default!, default!))
                .Name("apartment")
                .Type<NonNullType<ApartmentType>>();

            descriptor.Field<ReviewResolvers>(r => r.GetUserForReviewAsync(default!, default!))
                .Name("user")
                .Type<NonNullType<UserType>>();
        }

        private class ReviewResolvers
        {
            public async Task<Apartment?> GetApartmentForReviewAsync(
                [Parent] Review review,
                [Service] IApartmentService apartmentService)
            {
                return await apartmentService.GetApartmentByIdAsync(review.ApartmentId);
            }

            public async Task<User?> GetUserForReviewAsync(
                [Parent] Review review,
                [Service] IUserService userService)
            {
                return await userService.GetUserByIdAsync(review.UserId);
            }
        }
    }
}