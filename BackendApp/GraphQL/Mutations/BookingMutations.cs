using System;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendApp.DTOs;
using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Mutations.Inputs;
using BackendApp.GraphQL.Payloads;
using HotChocolate;
using HotChocolate.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace BackendApp.GraphQL.Mutations
{
    /// <summary>
    /// Zawiera mutacje GraphQL związane z zarządzaniem rezerwacjami.
    /// </summary>
    public partial class Mutation // Klasa częściowa
    {
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

            var bookingDto = new CreateBookingDto(
                input.ApartmentId,
                input.CheckInDate,
                input.CheckOutDate,
                input.TotalPrice
            );

            var (createdBooking, errorMessage) =  await bookingService.CreateBookingAsync(authenticatedUserId, bookingDto);

            if (!string.IsNullOrEmpty(errorMessage) || createdBooking == null)
            {
                return new BookingPayload(new BookingError(errorMessage ?? "Failed to create booking.", "BOOKING_CREATION_FAILED"));
            }

            return new BookingPayload(createdBooking);
        }

        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<bool> DeleteBooking(
            Guid id,
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
    }
}