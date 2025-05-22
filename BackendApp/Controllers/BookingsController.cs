// Controllers/BookingsController.cs
using BackendApp.DTOs;
using BackendApp.Models; // Dla UserRoles
using BackendApp.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims; // Dla ClaimTypes
using System.Threading.Tasks;

namespace BackendApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // /api/bookings
    [Authorize] // Wszystkie akcje w tym kontrolerze domyślnie wymagają autoryzacji
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IValidator<CreateBookingDto> _bookingValidator;

        public BookingsController(IBookingService bookingService, IValidator<CreateBookingDto> bookingValidator)
        {
            _bookingService = bookingService;
            _bookingValidator = bookingValidator;
        }

        [HttpPost] // POST /api/bookings
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto createBookingDto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier); // Dostęp do ClaimsPrincipal przez User
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                return Unauthorized(); // Chociaż [Authorize] powinno to już załatwić
            }

            var validationResult = await _bookingValidator.ValidateAsync(createBookingDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ToDictionary());
            }

            var (newBooking, errorMessage) = await _bookingService.CreateBookingAsync(authenticatedUserId, createBookingDto);

            if (!string.IsNullOrEmpty(errorMessage) || newBooking == null)
            {
                if (errorMessage == "The apartment is not available for the selected dates.")
                {
                    return Conflict(new { Message = errorMessage });
                }
                return BadRequest(new { Message = errorMessage ?? "Failed to create booking." });
            }
            // Trzeba by mieć GetBookingById, aby użyć CreatedAtAction poprawnie
            return Created($"/api/bookings/{newBooking.Id}", newBooking);
        }

        [HttpGet("user/{userId:guid}")] // GET /api/bookings/user/{userId}
        public async Task<IActionResult> GetBookingsByUser(Guid userId)
        {
            var authenticatedUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(authenticatedUserIdString, out Guid authenticatedUserId);

            // Użytkownik może pobrać tylko swoje rezerwacje, chyba że jest adminem
            if (userId != authenticatedUserId && !User.IsInRole(UserRoles.Admin))
            {
                return Forbid(); // 403 Forbidden
            }

            var bookings = await _bookingService.GetBookingsByUserIdAsync(userId);
            return Ok(bookings);
        }
    }
}