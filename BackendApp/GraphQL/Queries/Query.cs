using BackendApp.Models;
using BackendApp.Services;
using HotChocolate.AspNetCore.Authorization;
using HotChocolate.Types;
using HotChocolate.Types.Relay;
using System;
using System.Collections.Generic;
using System.Security.Claims; // Potrzebny dla ClaimTypes
using System.Threading.Tasks;
using HotChocolate;
using Microsoft.AspNetCore.Http;
// using System.IdentityModel.Tokens.Jwt; // JwtRegisteredClaimNames.Sub nie jest już potrzebne, jeśli używamy ClaimTypes.NameIdentifier
using Microsoft.Extensions.Logging;

namespace BackendApp.GraphQL.Queries
{
    public class Query
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<Query> _logger;

        public Query(IHttpContextAccessor httpContextAccessor, ILogger<Query> logger)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [UsePaging(IncludeTotalCount = true)] // <-- POPRAWIONA KONFIGURACJA
        //[UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IEnumerable<Apartment>> GetApartments(
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetAllApartmentsAsync();

        public async Task<Apartment?> GetApartmentById(
            // Usunięto [ID] aby przyjmować Guid jako string, jeśli tak zdecydowałeś wcześniej.
            // Jeśli chcesz używać globalnych ID Relay, przywróć [ID] i wysyłaj globalne ID.
            Guid id,
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetApartmentByIdAsync(id);

        public async Task<User?> GetUserById(
            [ID] Guid id, // Zakładamy, że to pole nadal ma używać globalnych ID Relay do rozwiązywania
            [Service] IUserService userService) =>
            await userService.GetUserByIdAsync(id);

        public async Task<Booking?> GetBookingById(
            [ID] Guid id, // Zakładamy, że to pole nadal ma używać globalnych ID Relay do rozwiązywania
            [Service] IBookingService bookingService) =>
            await bookingService.GetBookingByIdAsync(id);

        public async Task<Review?> GetReviewById(
            [ID] Guid id, // Zakładamy, że to pole nadal ma używać globalnych ID Relay do rozwiązywania
            [Service] IReviewService reviewService)
        {
            string? userToken = null;
            HttpContext? httpContext = _httpContextAccessor.HttpContext;

            if (httpContext?.User?.Identity != null && httpContext.User.Identity.IsAuthenticated)
            {
                userToken = httpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            }
            return await reviewService.GetReviewByIdAsync(id, userToken);
        }

        [HotChocolate.Authorization.Authorize(Policy = "AuthenticatedUserPolicy")]
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

        [HotChocolate.Authorization.Authorize(Policy = "AuthenticatedUserPolicy")]
        public async Task<User?> GetMyProfile(
            [Service] IUserService userService,
            ClaimsPrincipal claimsPrincipal)
        {
            _logger.LogInformation("--- GetMyProfile RESOLVER START ---");
            if (claimsPrincipal == null)
            {
                _logger.LogWarning("GetMyProfile: ClaimsPrincipal is NULL.");
                return null;
            }

            if (claimsPrincipal.Identity == null)
            {
                _logger.LogWarning("GetMyProfile: ClaimsPrincipal.Identity is NULL.");
                return null;
            }

            _logger.LogInformation("GetMyProfile: ClaimsPrincipal.Identity.IsAuthenticated: {IsAuth}", claimsPrincipal.Identity.IsAuthenticated);
            _logger.LogInformation("GetMyProfile: ClaimsPrincipal.Identity.AuthenticationType: {AuthType}", claimsPrincipal.Identity.AuthenticationType);

            foreach (var claim in claimsPrincipal.Claims)
            {
                _logger.LogInformation("GetMyProfile: Claim - Type: {Type}, Value: {Value}, Issuer: {Issuer}", claim.Type, claim.Value, claim.Issuer);
            }
            
            // --- POPRAWKA TUTAJ ---
            // Używamy ClaimTypes.NameIdentifier, ponieważ logi pokazały, że ten claim zawiera ID użytkownika.
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier); 
            _logger.LogInformation("GetMyProfile: userIdString from claim '{ClaimTypeToFind}': '{UserIdStringFound}'", ClaimTypes.NameIdentifier, userIdString);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning("GetMyProfile: Failed to get/parse user ID from '{ClaimTypeToFind}'. userIdString: '{UserIdString}'", ClaimTypes.NameIdentifier, userIdString);
                return null;
            }

            _logger.LogInformation("GetMyProfile: Successfully parsed userId: {UserId}. Fetching user from service.", userId);
            var user = await userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("GetMyProfile: User with ID {UserId} not found in service.", userId);
            }
            else
            {
                _logger.LogInformation("GetMyProfile: User with ID {UserId} found. Name: {UserName}", userId, user.Name);
            }
            _logger.LogInformation("--- GetMyProfile RESOLVER END ---");
            return user;
        }
    }
}