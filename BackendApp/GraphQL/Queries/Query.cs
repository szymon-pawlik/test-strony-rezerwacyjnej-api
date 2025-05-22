using BackendApp.Models;
using BackendApp.Services; // Upewnij się, że IBookingService, IApartmentService, IUserService, IReviewService są tutaj
using HotChocolate.Types;
using HotChocolate.Types.Relay; // Dla [ID] jeśli używane, oraz UsePaging
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HotChocolate; // Dla [Service]
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using HotChocolate.Authorization;


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

        [UsePaging(IncludeTotalCount = true)]
        [UseFiltering]
        [UseSorting]
        public async Task<IEnumerable<Apartment>> GetApartments(
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetAllApartmentsAsync();

        public async Task<Apartment?> GetApartmentById(
            Guid id, // Przyjmuje Guid bezpośrednio
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetApartmentByIdAsync(id);
        
        [UsePaging(IncludeTotalCount = true)] // Dla paginacji wyników
        [UseFiltering] // Dla możliwości filtrowania po stronie klienta GraphQL
        [UseSorting] // Dla możliwości sortowania po stronie klienta GraphQL
        [Authorize(Roles = new[] { "Admin" })] // Tylko użytkownicy z rolą "Admin"
        public async Task<IEnumerable<Booking>> AllBookingsForAdmin(
            [Service] IBookingService bookingService) // Poprawne wstrzyknięcie IBookingService
        {
            return await bookingService.GetAllBookingsAsync();
        }

        public async Task<User?> GetUserById(
            [ID] Guid id, // Zakładamy, że to pole nadal ma używać globalnych ID Relay
            [Service] IUserService userService) =>
            await userService.GetUserByIdAsync(id);

        public async Task<Booking?> GetBookingById(
            [ID] Guid id, // Zakładamy, że to pole nadal ma używać globalnych ID Relay
            [Service] IBookingService bookingService) =>
            await bookingService.GetBookingByIdAsync(id);

        public async Task<Review?> GetReviewById(
            [ID] Guid id, // Zakładamy, że to pole nadal ma używać globalnych ID Relay
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

        [Authorize(Policy = "AuthenticatedUserPolicy")]
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

        [Authorize(Policy = "AuthenticatedUserPolicy")]
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