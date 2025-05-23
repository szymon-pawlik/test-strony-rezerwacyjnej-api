using System;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Mutations.Inputs; // Zawiera AddReviewInput
using BackendApp.GraphQL.Payloads;
using HotChocolate;
using HotChocolate.Types; // Dla [ID(...)]
using HotChocolate.AspNetCore.Authorization; // Używane dla [Authorize]
using Microsoft.AspNetCore.Authorization;    // Używane dla [Authorize]
using Microsoft.Extensions.Logging;

namespace BackendApp.GraphQL.Mutations
{
    /// <summary>
    /// Zawiera mutacje GraphQL związane z zarządzaniem recenzjami.
    /// </summary>
    public partial class Mutation // Klasa częściowa
    {
        [Authorize] // Wymaga zalogowanego użytkownika
        public async Task<ReviewPayload> AddReviewAsync(
            AddReviewInput input,
            [Service] IReviewService reviewService,
            ClaimsPrincipal claimsPrincipal)
        {
            _logger.LogInformation("AddReviewAsync: Resolver started."); // Logowanie dla celów deweloperskich
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                _logger.LogError("AddReviewAsync: Failed to get/parse authenticated user ID.");
                return new ReviewPayload(new ReviewError("User not authenticated or token is invalid (cannot get user ID).", "AUTH_ERROR_ID"));
            }

            // Tworzenie DTO na podstawie danych wejściowych GraphQL
            var reviewDto = new BackendApp.Services.CreateReviewDto(
                ApartmentId: input.ApartmentId,
                Rating: input.Rating,
                Comment: input.Comment
            );

            Review? createdReview = await reviewService.CreateReviewAsync(reviewDto, authenticatedUserId);

            if (createdReview == null)
            {
                _logger.LogWarning("AddReviewAsync: reviewService.CreateReviewAsync returned null.");
                return new ReviewPayload(new ReviewError("Failed to create review.", "REVIEW_CREATION_FAILED"));
            }

            _logger.LogInformation("AddReviewAsync: Review created successfully with ID: {ReviewId}", createdReview.Id);
            return new ReviewPayload(createdReview); // Zwrócenie payloadu z utworzoną recenzją
        }

        [Authorize(BackendApp.Models.UserRoles.Admin)] // Tylko dla administratorów
        public async Task<bool> DeleteReviewAsync(
            [ID(nameof(Review))] Guid id, // Oznaczenie, że 'id' jest globalnym ID GraphQL dla typu Review
            [Service] IReviewService reviewService,
            ClaimsPrincipal claimsPrincipal)
        {
            var adminName = claimsPrincipal?.Identity?.Name ?? "Unknown Admin";
            _logger.LogInformation("GraphQL Mutation DeleteReviewAsync called for ReviewId: {ReviewId} by Admin: {AdminName}", id, adminName);

            bool success = await reviewService.DeleteReviewAsync(id);

            if (!success)
            {
                _logger.LogWarning("DeleteReviewAsync: reviewService.DeleteReviewAsync returned false for ReviewId: {ReviewId}", id);
            }
            else
            {
                _logger.LogInformation("DeleteReviewAsync: Review with ID: {ReviewId} successfully deleted.", id);
            }
            return success; // Zwraca true, jeśli usunięcie się powiodło
        }
    }
}