using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Mutations.Inputs;
using BackendApp.GraphQL.Payloads;
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.AspNetCore.Authorization;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using BackendApp.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;

namespace BackendApp.GraphQL.Mutations
{
    public class Mutation
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<Mutation> _logger;

        public Mutation(IHttpContextAccessor httpContextAccessor, ILogger<Mutation> logger)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<Apartment> AddApartmentAsync(
            AddApartmentInput input,
            [Service] IApartmentService apartmentService)
        {
            _logger.LogInformation("AddApartmentAsync: Mutation called by an authorized user.");
            var apartment = new Apartment(
                Guid.NewGuid(),
                input.Name,
                input.Description,
                input.Location,
                input.NumberOfBedrooms,
                input.NumberOfBathrooms,
                input.Amenities,
                input.IsAvailable,
                input.PricePerNight
            );
            return await apartmentService.CreateApartmentAsync(apartment);
        }

        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<Apartment?> UpdateApartmentAsync(
            UpdateApartmentInput input,
            [Service] IApartmentService apartmentService)
        {
            _logger.LogInformation("UpdateApartmentAsync: Mutation called by an authorized user for ApartmentId {ApartmentId}", input.Id);
            var existingApartment = await apartmentService.GetApartmentByIdAsync(input.Id);
            if (existingApartment == null) return null;

            var updated = existingApartment with
            {
                Name = input.Name.HasValue ? input.Name.Value : existingApartment.Name,
                Description = input.Description.HasValue ? input.Description.Value : existingApartment.Description,
                Location = input.Location.HasValue ? input.Location.Value : existingApartment.Location,
                NumberOfBedrooms = input.NumberOfBedrooms.HasValue ? input.NumberOfBedrooms.Value : existingApartment.NumberOfBedrooms,
                NumberOfBathrooms = input.NumberOfBathrooms.HasValue ? input.NumberOfBathrooms.Value : existingApartment.NumberOfBathrooms,
                Amenities = input.Amenities.HasValue ? input.Amenities.Value : existingApartment.Amenities,
                IsAvailable = input.IsAvailable.HasValue ? input.IsAvailable.Value : existingApartment.IsAvailable,
                PricePerNight = input.PricePerNight.HasValue ? input.PricePerNight.Value : existingApartment.PricePerNight
            };
            return await apartmentService.UpdateApartmentAsync(input.Id, updated);
        }

        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<bool> DeleteApartmentAsync(
            Guid id,
            [Service] IApartmentService apartmentService)
        {
             _logger.LogInformation("DeleteApartmentAsync: Mutation called by an authorized user for ApartmentId {ApartmentId}", id);
            return await apartmentService.DeleteApartmentAsync(id);
        }

        [Authorize]
        public async Task<BookingPayload> AddBookingAsync(
            AddBookingInput input,
            [Service] IBookingService bookingService,
            ClaimsPrincipal claimsPrincipal)
        {
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                return new BookingPayload(new BookingError("User not authenticated or token is invalid.", "AUTH_ERROR_ID"));
            }
            
            // Tworzymy DTO dla serwisu na podstawie GraphQL input
            // Zakładamy, że AddBookingInput ma odpowiednie pola (ApartmentId, CheckInDate, CheckOutDate, TotalPrice)
            var bookingDto = new CreateBookingDto(
                input.ApartmentId,
                input.CheckInDate,
                input.CheckOutDate,
                input.TotalPrice
            );
            
            // Wywołujemy serwis, który zwraca krotkę
            var (createdBooking, errorMessage) =  await bookingService.CreateBookingAsync(authenticatedUserId, bookingDto);

            // --- POPRAWKA TUTAJ ---
            // Sprawdzamy, czy jest błąd LUB czy obiekt rezerwacji jest null
            if (!string.IsNullOrEmpty(errorMessage) || createdBooking == null) 
            {
                return new BookingPayload(new BookingError(errorMessage ?? "Failed to create booking.", "BOOKING_CREATION_FAILED"));
            }
            // --- KONIEC POPRAWKI ---

            return new BookingPayload(createdBooking);
        }

        [Authorize]
        public async Task<ReviewPayload> AddReviewAsync(
            AddReviewInput input,
            [Service] IReviewService reviewService,
            ClaimsPrincipal claimsPrincipal)
        {
            _logger.LogInformation("AddReviewAsync: Resolver started. User authenticated: {IsAuth}", claimsPrincipal.Identity?.IsAuthenticated);
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            _logger.LogInformation("AddReviewAsync: userIdString from claim '{ClaimTypeToFind}': '{UserIdStringFound}'", ClaimTypes.NameIdentifier, userIdString);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                _logger.LogError("AddReviewAsync: Failed to get/parse authenticated user ID from claim '{ClaimTypeToFind}'. userIdString: '{UserIdString}'", ClaimTypes.NameIdentifier, userIdString);
                return new ReviewPayload(new ReviewError("User not authenticated or token is invalid (cannot get user ID).", "AUTH_ERROR_ID"));
            }

            HttpContext? httpContext = _httpContextAccessor.HttpContext;
            string? accessToken = httpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (string.IsNullOrEmpty(accessToken))
            {
                _logger.LogWarning("AddReviewAsync: Access token is missing from HttpContext for microservice call.");
                return new ReviewPayload(new ReviewError("Authorization token is missing for microservice call.", "AUTH_TOKEN_MISSING_INJECTED"));
            }

            var reviewDtoForBackendService = new CreateReviewDtoInBackendApp(
                input.ApartmentId,
                input.Rating,
                input.Comment
            );
            var createdReview = await reviewService.CreateReviewAsync(reviewDtoForBackendService, accessToken);
            if (createdReview == null)
            {
                return new ReviewPayload(new ReviewError("Failed to create review via microservice.", "REVIEW_CREATION_FAILED"));
            }
            return new ReviewPayload(createdReview);
        }
        
        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<bool> DeleteReview(
            [ID(nameof(Review))] Guid id, 
            [Service] IReviewService reviewService
        )
        {
            // Jeśli ClaimsPrincipal jest nadal potrzebny (np. do logowania kto usuwa):
            var claimsPrincipal = _httpContextAccessor.HttpContext?.User; // Pobierz ClaimsPrincipal z HttpContext
            var adminName = claimsPrincipal?.Identity?.Name ?? "Unknown Admin";
            _logger.LogInformation("GraphQL Mutation DeleteReview called for decoded local ReviewId: {ReviewId} by Admin: {AdminName}", id, adminName);

            string? adminAccessToken = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (string.IsNullOrEmpty(adminAccessToken))
            {
                _logger.LogWarning("DeleteReview: Admin access token is missing from HttpContext (this shouldn't happen if [Authorize] works).");
                return false; 
            }
        
            return await reviewService.DeleteReviewAsync(id, adminAccessToken);
        }
        
        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<bool> DeleteBooking(
            Guid id, // ID rezerwacji do usunięcia
            [Service] IBookingService bookingService,
            ClaimsPrincipal claimsPrincipal)
        {
            var adminUserIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(adminUserIdString) || !Guid.TryParse(adminUserIdString, out Guid adminId))
            {
                _logger.LogError("DeleteBooking: Failed to get admin ID from claims.");
                return false;
            }
            _logger.LogInformation("GraphQL Mutation DeleteBooking called for ID: {BookingId} by AdminID: {AdminId}", id, adminId);
            return await bookingService.DeleteBookingAsync(id, adminId);
        }

        [Authorize]
        public async Task<UserPayload> UpdateUserProfileAsync(
            UpdateUserProfileInput input,
            [Service] IUserService userService,
            ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal.Identity == null || !claimsPrincipal.Identity.IsAuthenticated)
            {
                return new UserPayload(new UserError("User not authenticated (identity missing).", "AUTH_ERROR_IDENTITY"));
            }
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return new UserPayload(new UserError("Invalid user identifier in token.", "AUTH_INVALID_ID"));
            }

            var (updatedUser, errorMessage) = await userService.UpdateUserProfileAsync(userId, input);

            if (!string.IsNullOrEmpty(errorMessage))
            {
                // Możesz chcieć bardziej specyficznych kodów błędów na podstawie komunikatu
                string errorCode = "UPDATE_PROFILE_ERROR";
                if (errorMessage.Contains("Email already taken"))
                {
                    errorCode = "EMAIL_TAKEN";
                }
                else if (errorMessage.Contains("User not found"))
                {
                    errorCode = "USER_NOT_FOUND";
                }
                return new UserPayload(new UserError(errorMessage, errorCode));
            }
            
            // updatedUser może być null, jeśli nie było zmian, a serwis tak to obsługuje.
            // Jeśli UpdateUserProfileAsync zwraca (user, null) gdy nie było zmian,
            // to poniższy warunek jest OK. Jeśli zwraca (null, null) gdy nie było zmian,
            // to trzeba by to inaczej obsłużyć. Zakładamy, że zwraca (user, null)
            // nawet jeśli nie było zmian, lub (updatedUserPoZmianach, null)
            if (updatedUser == null) // Dodatkowe sprawdzenie, na wypadek gdyby serwis zwrócił null bez błędu
            {
                 return new UserPayload(new UserError("User not found or update failed.", "USER_UPDATE_FAILED"));
            }

            return new UserPayload(updatedUser);
        }
    }
}