using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Mutations.Inputs;
using BackendApp.GraphQL.Payloads; // Dodaj ten using dla UserPayload
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.AspNetCore.Authorization; // Dodaj ten using dla [Authorize]
using System;
using System.Security.Claims; // Dodaj ten using dla ClaimsPrincipal
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization; // Dodaj ten using dla List<UserError>


namespace BackendApp.GraphQL.Mutations
{
    public class Mutation
    {
        public async Task<Apartment> AddApartmentAsync(
            AddApartmentInput input,
            [Service] IApartmentService apartmentService)
        {
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

        public async Task<Apartment?> UpdateApartmentAsync(
            UpdateApartmentInput input,
            [Service] IApartmentService apartmentService)
        {
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

        public async Task<bool> DeleteApartmentAsync(
            Guid id,
            [Service] IApartmentService apartmentService)
        {
            return await apartmentService.DeleteApartmentAsync(id);
        }

        public async Task<Booking> AddBookingAsync(
            AddBookingInput input,
            [Service] IBookingService bookingService)
        {
            var booking = new Booking(
                Guid.NewGuid(),
                input.ApartmentId,
                input.UserId,
                input.CheckInDate,
                input.CheckOutDate,
                input.TotalPrice,
                DateTime.UtcNow
            );
            return await bookingService.CreateBookingAsync(booking);
        }

        public async Task<Review> AddReviewAsync(
            AddReviewInput input,
            [Service] IReviewService reviewService)
        {
            var review = new Review(
                Guid.NewGuid(),
                input.ApartmentId,
                input.UserId,
                input.Rating,
                input.Comment,
                DateTime.UtcNow
            );
            return await reviewService.CreateReviewAsync(review);
        }
        
        [Authorize]
        public async Task<UserPayload> UpdateUserProfileAsync(
            UpdateUserProfileInput input,
            [Service] IUserService userService,
            ClaimsPrincipal claimsPrincipal)
        {
            if (claimsPrincipal.Identity == null || !claimsPrincipal.Identity.IsAuthenticated)
            {
                return new UserPayload(new UserError("User not authenticated.", "AUTH_NOT_AUTHENTICATED"));
            }

            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return new UserPayload(new UserError("Invalid user identifier.", "AUTH_INVALID_USER_ID"));
            }

            var updatedUser = await userService.UpdateUserProfileAsync(userId, input);

            if (updatedUser == null)
            {
                return new UserPayload(new UserError("User not found or update failed.", "USER_UPDATE_FAILED"));
            }

            return new UserPayload(updatedUser);
        }
    }
}