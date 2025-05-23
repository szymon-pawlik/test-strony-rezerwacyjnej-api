using BackendApp.Models;
using BackendApp.Services;


using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Types.Relay; // Dla Node, ImplementsNode, [ID]
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Nieużywane bezpośrednio, ale może być wstrzykiwane przez kontekst
using Microsoft.Extensions.Logging; // Dla ILogger

namespace BackendApp.GraphQL.Types
{
    /// <summary>
    /// Definiuje typ GraphQL dla modelu Review.
    /// Odpowiada za mapowanie właściwości modelu Review na pola w schemacie GraphQL.
    /// </summary>
    public class ReviewType : ObjectType<Review>
    {
        // Konfiguruje strukturę typu Review w schemacie GraphQL.
        protected override void Configure(IObjectTypeDescriptor<Review> descriptor)
        {
            // Mapowanie podstawowych właściwości modelu Review na pola GraphQL.
            descriptor.Field(r => r.Id) // Odwołuje się do właściwości C# 'Id'
                .Name("databaseId")     // Nazwa w schemacie GraphQL
                .Type<NonNullType<UuidType>>(); // Typ pola: nie-nullowalny UUID

            descriptor.Field(r => r.Rating).Type<NonNullType<IntType>>();
            descriptor.Field(r => r.Comment); // Domyślnie StringType, może być null
            descriptor.Field(r => r.ReviewDate).Type<NonNullType<DateTimeType>>();

            // Definicja pola 'apartment' jako obiektu ApartmentType, pobieranego przez resolver.
            descriptor.Field<ReviewResolvers>(r => r.GetApartmentForReviewAsync(default!, default!, default!))
                .Name("apartment")
                .Type<ApartmentType>(); // Może być null, jeśli mieszkanie zostało usunięte

            // Definicja pola 'user' jako obiektu UserType, pobieranego przez resolver.
            descriptor.Field<ReviewResolvers>(r => r.GetUserForReviewAsync(default!, default!, default!))
                .Name("user")
                .Type<UserType>(); // Może być null, jeśli użytkownik został usunięty

            // Implementacja interfejsu Node dla globalnej identyfikacji obiektów.
            descriptor.ImplementsNode()
                .IdField(r => r.Id) // Wskazuje, że właściwość 'Id' modelu Review dostarcza lokalne ID.
                .ResolveNode(async (ctx, id) => // Definiuje logikę pobierania obiektu Review na podstawie jego ID.
                {
                    // Ten resolver jest odpowiedzialny za odtworzenie obiektu Review.
                    var reviewService = ctx.Service<IReviewService>();

                    // Sprawdzenie, czy przekazane ID jest typu Guid.
                    if (id is Guid reviewGuid)
                    {
                        // Sprawdzenie, czy ID nie jest puste.
                        if (reviewGuid == Guid.Empty)
                        {
                            // Logowanie i zwracanie null, jeśli ID jest puste.
                            // (Logger jest wstrzykiwany do resolverów, nie bezpośrednio tutaj, ale można by dodać)
                            // ctx.Service<ILogger<ReviewType>>().LogWarning("ResolveNode for Review: Received an empty Guid.");
                            return null;
                        }
                        // Pobranie recenzji z serwisu.
                        return await reviewService.GetReviewByIdAsync(reviewGuid);
                    }
                    else
                    {
                        // Obsługa błędu nieprawidłowego formatu ID.
                        string idType = id == null ? "null" : id.GetType().FullName ?? "unknown";
                        ctx.ReportError(ErrorBuilder.New()
                            .SetMessage($"Invalid node ID format for Review. Expected Guid, got {idType}.")
                            .SetCode("INVALID_NODE_ID")
                            .Build());
                        return null;
                    }
                });
        }

        // Prywatna klasa wewnętrzna grupująca metody resolverów dla ReviewType.
        private class ReviewResolvers
        {
            // Resolver dla pola 'apartment'.
            public async Task<Apartment?> GetApartmentForReviewAsync(
                [Parent] Review review, // Obiekt nadrzędny (recenzja)
                [Service] IApartmentService apartmentService, // Wstrzykiwany serwis mieszkań
                [Service] ILogger<ReviewType> logger) // Wstrzykiwany logger
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

            // Resolver dla pola 'user'.
            public async Task<User?> GetUserForReviewAsync(
                [Parent] Review review, // Obiekt nadrzędny (recenzja)
                [Service] IUserService userService, // Wstrzykiwany serwis użytkowników
                [Service] ILogger<ReviewType> logger) // Wstrzykiwany logger
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