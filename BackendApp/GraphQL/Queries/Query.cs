using BackendApp.Models;
using BackendApp.Services;
using HotChocolate.Types;         // Dla atrybutów HotChocolate, np. [UsePaging], [UseFiltering], [UseSorting]
using HotChocolate.Types.Relay;  // Dla [ID] jeśli używamy specyfikacji Relay dla Node ID
using System;
using System.Collections.Generic;
using System.Security.Claims;    // Dla ClaimsPrincipal do pracy z tożsamością użytkownika
using System.Threading.Tasks;
using HotChocolate;              // Dla atrybutu [Service] do wstrzykiwania zależności
using Microsoft.AspNetCore.Http; // Dla IHttpContextAccessor
using Microsoft.Extensions.Logging; // Dla ILogger
using HotChocolate.Authorization;  // Dla atrybutu [Authorize] z HotChocolate (może być też Microsoft.AspNetCore.Authorization)

namespace BackendApp.GraphQL.Queries
{
    /// <summary>
    /// Główny typ zapytań (Query) dla schematu GraphQL.
    /// Definiuje wszystkie dostępne operacje odczytu danych.
    /// </summary>
    public class Query
    {
        // Prywatne pola do wstrzykiwania zależności, np. loggera
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<Query> _logger;

        // Konstruktor do wstrzykiwania zależności
        public Query(IHttpContextAccessor httpContextAccessor, ILogger<Query> logger)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Zapytanie o listę mieszkań z obsługą paginacji, filtrowania i sortowania.
        [UsePaging(IncludeTotalCount = true)]
        [UseFiltering]
        [UseSorting]
        public async Task<IEnumerable<Apartment>> GetApartments(
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetAllApartmentsAsync();

        // Zapytanie o pojedyncze mieszkanie na podstawie jego ID (Guid).
        public async Task<Apartment?> GetApartmentById(
            Guid id,
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetApartmentByIdAsync(id);

        // Zapytanie o wszystkie rezerwacje, dostępne tylko dla administratorów.
        // Używa paginacji, filtrowania i sortowania.
        [UsePaging(IncludeTotalCount = true)]
        [UseFiltering]
        [UseSorting]
        [Authorize(Roles = new[] { "Admin" })] // Autoryzacja na podstawie roli "Admin"
        public async Task<IEnumerable<Booking>> AllBookingsForAdmin(
            [Service] IBookingService bookingService)
        {
            return await bookingService.GetAllBookingsAsync();
        }

        // Zapytanie o użytkownika na podstawie jego globalnego ID GraphQL.
        public async Task<User?> GetUserById(
            [ID] Guid id, // Atrybut [ID] oznacza, że 'id' jest globalnym ID GraphQL.
            [Service] IUserService userService) =>
            await userService.GetUserByIdAsync(id);

        // Zapytanie o rezerwację na podstawie jej globalnego ID GraphQL.
        public async Task<Booking?> GetBookingById(
            [ID] Guid id,
            [Service] IBookingService bookingService) =>
            await bookingService.GetBookingByIdAsync(id);

        // Zapytanie o recenzję na podstawie jej globalnego ID GraphQL, specyficznego dla typu Review.
        public async Task<Review?> GetReviewById(
            [ID(nameof(Review))] Guid id, // [ID(nameof(Review))] precyzuje, że to ID dla typu Review.
            [Service] IReviewService reviewService)
        {
            _logger.LogInformation("GraphQL Query GetReviewById called for ReviewId: {ReviewId}", id);
            if (id == Guid.Empty)
            {
                _logger.LogWarning("GetReviewById: Received an empty Guid for ReviewId.");
                return null;
            }
            Review? review = await reviewService.GetReviewByIdAsync(id);
            if (review == null)
            {
                _logger.LogInformation("GetReviewById: Review with ID {ReviewId} not found by service.", id);
            }
            else
            {
                _logger.LogInformation("GetReviewById: Review with ID {ReviewId} found.", id);
            }
            return review;
        }

        // Proste zapytanie testowe, wymagające zalogowanego użytkownika.
        [Authorize(Policy = "AuthenticatedUserPolicy")] // Autoryzacja na podstawie zdefiniowanej polityki.
        public string GetSecretMessage()
        {
            _logger.LogInformation("--- GetSecretMessage RESOLVER START ---");
            if (_httpContextAccessor.HttpContext?.User?.Identity == null)
            {
                 _logger.LogWarning("GetSecretMessage: HttpContext.User.Identity is NULL.");
            }
            else
            {
                _logger.LogInformation("GetSecretMessage: HttpContext.User.Identity.IsAuthenticated: {IsAuth}", _httpContextAccessor.HttpContext.User.Identity.IsAuthenticated);
            }
            _logger.LogInformation("--- GetSecretMessage RESOLVER END ---");
            return "This is a secret message for authenticated users!";
        }

        // Zapytanie o profil zalogowanego użytkownika.
        [Authorize(Policy = "AuthenticatedUserPolicy")] // Wymaga zalogowanego użytkownika.
        public async Task<User?> GetMyProfile(
            [Service] IUserService userService,
            ClaimsPrincipal claimsPrincipal) // Dostęp do danych zalogowanego użytkownika.
        {
            _logger.LogInformation("--- GetMyProfile RESOLVER START ---");
            // Logika do debugowania i weryfikacji tożsamości użytkownika
            if (claimsPrincipal == null || claimsPrincipal.Identity == null)
            {
                _logger.LogWarning("GetMyProfile: ClaimsPrincipal or its Identity is NULL.");
                return null;
            }
            _logger.LogInformation("GetMyProfile: User IsAuthenticated: {IsAuth}, AuthType: {AuthType}", claimsPrincipal.Identity.IsAuthenticated, claimsPrincipal.Identity.AuthenticationType);
            foreach (var claim in claimsPrincipal.Claims)
            {
                _logger.LogInformation("GetMyProfile: Claim - Type: {Type}, Value: {Value}, Issuer: {Issuer}", claim.Type, claim.Value, claim.Issuer);
            }

            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            _logger.LogInformation("GetMyProfile: userIdString from claim '{ClaimType}': '{UserIdString}'", ClaimTypes.NameIdentifier, userIdString);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning("GetMyProfile: Failed to get/parse user ID. userIdString: '{UserIdString}'", userIdString);
                return null;
            }

            _logger.LogInformation("GetMyProfile: Parsed userId: {UserId}. Fetching user.", userId);
            var user = await userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("GetMyProfile: User with ID {UserId} not found.", userId);
            }
            else
            {
                _logger.LogInformation("GetMyProfile: User {UserId} found. Name: {UserName}", userId, user.Name);
            }
            _logger.LogInformation("--- GetMyProfile RESOLVER END ---");
            return user;
        }
    }
}