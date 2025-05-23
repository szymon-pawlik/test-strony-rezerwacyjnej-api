using BackendApp.DTOs;      // Importowanie Data Transfer Objects (DTOs)
using BackendApp.Models;    // Importowanie modeli encji (np. Booking)
using BackendApp.Services;  // Importowanie serwisów (logika biznesowa)
using FluentValidation;     // Importowanie biblioteki FluentValidation
using Microsoft.AspNetCore.Authorization; // Dla atrybutów [Authorize]
using Microsoft.AspNetCore.Mvc;     // Dla klas bazowych kontrolerów i atrybutów akcji
using System;
using System.Collections.Generic; // Dla List<T>
using System.Linq;                // Dla metod LINQ, np. .Select(), .Any()
using System.Security.Claims;     // Dla dostępu do oświadczeń (claims) użytkownika
using System.Threading.Tasks;   // Dla operacji asynchronicznych

namespace BackendApp.Controllers
{
    /// <summary>
    /// Kontroler API do zarządzania rezerwacjami.
    /// Wszystkie endpointy w tym kontrolerze domyślnie wymagają autoryzacji.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Definiuje bazową trasę jako "api/bookings"
    [Authorize] // Wymaga autoryzacji dla wszystkich akcji w tym kontrolerze, chyba że zdefiniowano inaczej
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService; // Serwis do obsługi logiki biznesowej rezerwacji
        private readonly IValidator<CreateBookingDto> _bookingValidator; // Walidator dla DTO tworzenia rezerwacji

        /// <summary>
        /// Konstruktor kontrolera BookingsController.
        /// Wstrzykuje zależności serwisu rezerwacji i walidatora.
        /// </summary>
        /// <param name="bookingService">Serwis rezerwacji.</param>
        /// <param name="bookingValidator">Walidator dla CreateBookingDto.</param>
        public BookingsController(
            IBookingService bookingService,
            IValidator<CreateBookingDto> bookingValidator
            )
        {
            // Zapewnienie, że wstrzyknięte zależności nie są null
            _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
            _bookingValidator = bookingValidator ?? throw new ArgumentNullException(nameof(bookingValidator));
        }

        /// <summary>
        /// Tworzy nową rezerwację dla zalogowanego użytkownika.
        /// </summary>
        /// <param name="createBookingDto">Dane nowej rezerwacji.</param>
        /// <returns>Status 201 Created z utworzoną rezerwacją, lub odpowiedni kod błędu.</returns>
        [HttpPost] // Obsługuje żądania HTTP POST na trasie "api/bookings"
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto createBookingDto)
        {
            // Pobranie ID zalogowanego użytkownika z jego oświadczeń (claims)
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                // Jeśli ID użytkownika nie jest dostępne lub nie jest poprawnym GUIDem, zwróć błąd autoryzacji
                return Unauthorized(new { Message = "Użytkownik nie jest poprawnie zautoryzowany." });
            }

            // Walidacja DTO rezerwacji
            var validationResult = await _bookingValidator.ValidateAsync(createBookingDto);
            if (!validationResult.IsValid)
            {
                // Jeśli walidacja nie powiodła się, zwróć błędy w ustrukturyzowanym formacie
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName, StringComparer.OrdinalIgnoreCase) // Grupuj błędy po nazwie pola
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                return BadRequest(new { Title = "Błędy walidacji", Status = 400, Errors = errors });
            }

            // Próba utworzenia rezerwacji za pomocą serwisu
            var (createdBookingEntity, errorMessage) = await _bookingService.CreateBookingAsync(authenticatedUserId, createBookingDto);

            // Obsługa błędów zwróconych przez serwis (np. mieszkanie niedostępne)
            if (!string.IsNullOrEmpty(errorMessage) || createdBookingEntity == null)
            {
                if (errorMessage == "The apartment is not available for the selected dates.") // Specyficzny błąd konfliktu
                {
                    return Conflict(new { Message = errorMessage }); // Status 409 Conflict
                }
                // Inne błędy serwisu
                return BadRequest(new { Message = errorMessage ?? "Nie udało się utworzyć rezerwacji." });
            }

            // Mapowanie utworzonej encji rezerwacji na DTO odpowiedzi
            var bookingResponseDto = new BookingDto
            {
                Id = createdBookingEntity.Id,
                CheckInDate = createdBookingEntity.CheckInDate,
                CheckOutDate = createdBookingEntity.CheckOutDate,
                TotalPrice = createdBookingEntity.TotalPrice,
                BookingDate = createdBookingEntity.BookingDate,
                ApartmentId = createdBookingEntity.ApartmentId,
                ApartmentName = createdBookingEntity.Apartment?.Name, // Pobierz nazwę mieszkania, jeśli załadowane
                UserId = createdBookingEntity.UserId,
                UserName = createdBookingEntity.User?.Name // Pobierz nazwę użytkownika, jeśli załadowane
            };

            // Zwrócenie statusu 201 Created wraz z lokalizacją nowo utworzonego zasobu i samym zasobem
            return CreatedAtAction(nameof(GetBookingById), new { id = bookingResponseDto.Id }, bookingResponseDto);
        }

        /// <summary>
        /// Pobiera wszystkie rezerwacje dla aktualnie zalogowanego użytkownika.
        /// </summary>
        /// <returns>Lista rezerwacji użytkownika.</returns>
        [HttpGet("user")] // Obsługuje żądania HTTP GET na trasie "api/bookings/user"
        public async Task<IActionResult> GetMyBookings()
        {
            // Pobranie ID zalogowanego użytkownika
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                return Unauthorized(new { Message = "Użytkownik nie jest poprawnie zautoryzowany." });
            }

            // Pobranie rezerwacji dla użytkownika
            var bookingEntities = await _bookingService.GetBookingsByUserIdAsync(authenticatedUserId);

            // Jeśli użytkownik nie ma rezerwacji, zwróć pustą listę
            if (bookingEntities == null || !bookingEntities.Any())
            {
                return Ok(new List<BookingDto>());
            }

            // Mapowanie encji rezerwacji na listę DTO
            var bookingDtos = bookingEntities.Select(bookingEntity => new BookingDto
            {
                Id = bookingEntity.Id,
                CheckInDate = bookingEntity.CheckInDate,
                CheckOutDate = bookingEntity.CheckOutDate,
                TotalPrice = bookingEntity.TotalPrice,
                BookingDate = bookingEntity.BookingDate,
                ApartmentId = bookingEntity.ApartmentId,
                ApartmentName = bookingEntity.Apartment?.Name,
                UserId = bookingEntity.UserId,
                UserName = bookingEntity.User?.Name
            }).ToList();

            return Ok(bookingDtos); // Zwróć listę rezerwacji DTO
        }

        /// <summary>
        /// Pobiera wszystkie rezerwacje dla określonego użytkownika (tylko dla administratora).
        /// </summary>
        /// <param name="userId">ID użytkownika, którego rezerwacje mają być pobrane.</param>
        /// <returns>Lista rezerwacji dla danego użytkownika.</returns>
        [HttpGet("user/{userId:guid}")] // Obsługuje żądania HTTP GET na "api/bookings/user/{userId}"
        [Authorize(Roles = UserRoles.Admin)] // Wymaga, aby zalogowany użytkownik miał rolę Admin (zakładając istnienie UserRoles.Admin)
        public async Task<IActionResult> GetBookingsForUserByAdmin(Guid userId)
        {
            // Pobranie rezerwacji dla podanego ID użytkownika
            var bookingEntities = await _bookingService.GetBookingsByUserIdAsync(userId);

            // Jeśli brak rezerwacji, zwróć pustą listę
            if (bookingEntities == null || !bookingEntities.Any())
            {
                return Ok(new List<BookingDto>());
            }

            // Mapowanie na DTO
            var bookingDtos = bookingEntities.Select(bookingEntity => new BookingDto
            {
                Id = bookingEntity.Id,
                CheckInDate = bookingEntity.CheckInDate,
                CheckOutDate = bookingEntity.CheckOutDate,
                TotalPrice = bookingEntity.TotalPrice,
                BookingDate = bookingEntity.BookingDate,
                ApartmentId = bookingEntity.ApartmentId,
                ApartmentName = bookingEntity.Apartment?.Name,
                UserId = bookingEntity.UserId,
                UserName = bookingEntity.User?.Name
            }).ToList();

            return Ok(bookingDtos);
        }

        /// <summary>
        /// Pobiera rezerwację o podanym identyfikatorze.
        /// Dostępne dla właściciela rezerwacji lub administratora.
        /// </summary>
        /// <param name="id">Identyfikator GUID rezerwacji.</param>
        /// <returns>Dane rezerwacji lub status 404 Not Found, jeśli nie znaleziono lub brak dostępu.</returns>
        [HttpGet("{id:guid}", Name = "GetBookingById")] // Obsługuje GET na "api/bookings/{id}", Name używane przez CreatedAtAction
        public async Task<IActionResult> GetBookingById(Guid id)
        {
            // Pobranie rezerwacji z serwisu
            var bookingEntity = await _bookingService.GetBookingByIdAsync(id);
            if (bookingEntity == null)
            {
                // Jeśli rezerwacja nie istnieje
                return NotFound(new { Message = $"Booking with ID {id} not found." });
            }

            // Pobranie ID zalogowanego użytkownika
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                 return Unauthorized(new { Message = "Użytkownik nie jest poprawnie zautoryzowany." });
            }

            // Sprawdzenie uprawnień: użytkownik musi być właścicielem rezerwacji LUB adminem
            if (bookingEntity.UserId != authenticatedUserId && !User.IsInRole(UserRoles.Admin))
            {
                // Jeśli brak uprawnień, zwróć 404, aby nie ujawniać istnienia zasobu
                // (alternatywnie można zwrócić 403 Forbidden, jeśli polityka tego wymaga)
                return NotFound(new { Message = $"Booking with ID {id} not found or access denied." });
            }

            // Mapowanie na DTO
            var bookingResponseDto = new BookingDto
            {
                Id = bookingEntity.Id,
                CheckInDate = bookingEntity.CheckInDate,
                CheckOutDate = bookingEntity.CheckOutDate,
                TotalPrice = bookingEntity.TotalPrice,
                BookingDate = bookingEntity.BookingDate,
                ApartmentId = bookingEntity.ApartmentId,
                ApartmentName = bookingEntity.Apartment?.Name,
                UserId = bookingEntity.UserId,
                UserName = bookingEntity.User?.Name
            };
            return Ok(bookingResponseDto); // Zwróć dane rezerwacji
        }
    }
}