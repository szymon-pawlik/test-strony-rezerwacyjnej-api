using BackendApp.Models;
using BackendApp.Services;
using HotChocolate.AspNetCore.Authorization; // Dla [Authorize]
using HotChocolate.Types;
using HotChocolate.Types.Relay; // Dla [ID]
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HotChocolate;
using Microsoft.AspNetCore.Authorization; // Dla [Service]

namespace BackendApp.GraphQL.Queries
{
    public class Query
    {
        [UsePaging]
        [UseProjection]
        [UseFiltering]
        [UseSorting]
        public async Task<IEnumerable<Apartment>> GetApartments(
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetAllApartmentsAsync();

        public async Task<Apartment?> GetApartmentById(
            [ID] Guid id,
            [Service] IApartmentService apartmentService) =>
            await apartmentService.GetApartmentByIdAsync(id);

        public async Task<User?> GetUserById(
            [ID] Guid id,
            [Service] IUserService userService) =>
            await userService.GetUserByIdAsync(id);

        public async Task<Booking?> GetBookingById(
            [ID] Guid id,
            [Service] IBookingService bookingService) =>
            await bookingService.GetBookingByIdAsync(id);

        public async Task<Review?> GetReviewById(
            [ID] Guid id,
            [Service] IReviewService reviewService) =>
            await reviewService.GetReviewByIdAsync(id);

        [Authorize] // Pozostawiamy atrybut, mimo że nie działał idealnie
        public string GetSecretMessage()
        {
            return "This is a secret message for authenticated users!";
        }

        [Authorize] // Pozostawiamy atrybut
        public async Task<User?> GetMyProfile(
            [Service] IUserService userService,
            ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal.Identity == null || !claimsPrincipal.Identity.IsAuthenticated)
            {
                return null; 
            }
            
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return null;
            }

            return await userService.GetUserByIdAsync(userId);
        }
    }
}