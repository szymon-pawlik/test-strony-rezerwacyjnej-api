using BackendApp.Data;
using BackendApp.Models;
using BackendApp.DTOs;
using Microsoft.EntityFrameworkCore; // Dla metod EF Core jak FindAsync, AnyAsync, ToListAsync, Include
using System;
using System.Collections.Generic;
using System.Linq; // Dla metod LINQ jak Where, OrderByDescending
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; // Dla ILogger

namespace BackendApp.Services
{
    /// <summary>
    /// Serwis odpowiedzialny za logikę biznesową związaną z rezerwacjami.
    /// Implementuje interfejs IBookingService.
    /// </summary>
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context; // Kontekst bazy danych
        private readonly ILogger<BookingService> _logger; // Logger

        // Konstruktor wstrzykujący zależności.
        public BookingService(AppDbContext context, ILogger<BookingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Sprawdza, czy mieszkanie jest dostępne w podanym zakresie dat.
        /// </summary>
        public async Task<bool> IsApartmentAvailableAsync(Guid apartmentId, DateTime checkInDate, DateTime checkOutDate)
        {
            _logger.LogInformation("Checking availability for ApartmentId {ApartmentId} between {CheckIn} and {CheckOut}", apartmentId, checkInDate, checkOutDate);

            // Podstawowa walidacja dat.
            if (checkInDate >= checkOutDate)
            {
                _logger.LogWarning("Availability check failed: CheckInDate must be before CheckOutDate.");
                return false;
            }
            // Sprawdzenie, czy mieszkanie istnieje i jest oznaczone jako dostępne.
            var apartment = await _context.Apartments.FindAsync(apartmentId);
            if (apartment == null || !apartment.IsAvailable)
            {
                _logger.LogWarning("Availability check failed: Apartment {ApartmentId} not found or not available.", apartmentId);
                return false;
            }

            // Sprawdzenie, czy istnieją jakiekolwiek rezerwacje kolidujące z podanymi datami.
            var conflictingBooking = await _context.Bookings
                .AnyAsync(b =>
                        b.ApartmentId == apartmentId &&
                        b.CheckInDate < checkOutDate && // Koliduje, jeśli istniejąca rezerwacja zaczyna się przed końcem nowej
                        b.CheckOutDate > checkInDate    // Oraz kończy się po początku nowej
                );

            if (conflictingBooking)
            {
                _logger.LogInformation("Apartment {ApartmentId} is NOT available for the selected dates due to conflicting bookings.", apartmentId);
                return false; // Mieszkanie jest zajęte w tym terminie.
            }

            _logger.LogInformation("Apartment {ApartmentId} IS available for the selected dates.", apartmentId);
            return true; // Mieszkanie jest dostępne.
        }

        /// <summary>
        /// Tworzy nową rezerwację po sprawdzeniu dostępności i walidacji dat.
        /// </summary>
        public async Task<(Booking? Booking, string? ErrorMessage)> CreateBookingAsync(Guid authenticatedUserId, CreateBookingDto bookingDto)
        {
            _logger.LogInformation("Attempting to create booking for ApartmentId {ApartmentId} by UserId {UserId}", bookingDto.ApartmentId, authenticatedUserId);

            // Walidacja dat.
            if (bookingDto.CheckInDate >= bookingDto.CheckOutDate)
            {
                return (null, "Check-in date must be before check-out date.");
            }
            if (bookingDto.CheckInDate < DateTime.UtcNow.Date) // Zapobiega rezerwacjom na przeszłe daty (tylko data, bez godziny).
            {
                return (null, "Check-in date cannot be in the past.");
            }

            // Sprawdzenie dostępności mieszkania.
            var isAvailable = await IsApartmentAvailableAsync(bookingDto.ApartmentId, bookingDto.CheckInDate, bookingDto.CheckOutDate);
            if (!isAvailable)
            {
                return (null, "The apartment is not available for the selected dates.");
            }

            // Tworzenie nowej encji rezerwacji.
            var booking = new Booking(
                Guid.NewGuid(), // Nowe ID dla rezerwacji
                bookingDto.ApartmentId,
                authenticatedUserId,
                bookingDto.CheckInDate.Date, // Użycie .Date do zignorowania części czasowej
                bookingDto.CheckOutDate.Date,
                bookingDto.TotalPrice,
                DateTime.UtcNow // Data utworzenia rezerwacji
            );

            try
            {
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Booking created successfully. BookingId: {BookingId}", booking.Id);
                return (booking, null); // Zwraca utworzoną rezerwację i brak błędu.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking for ApartmentId {ApartmentId} by UserId {UserId}", bookingDto.ApartmentId, authenticatedUserId);
                return (null, "An error occurred while creating the booking."); // Zwraca błąd.
            }
        }

        /// <summary>
        /// Usuwa rezerwację o podanym ID (operacja dla administratora).
        /// </summary>
        public async Task<bool> DeleteBookingAsync(Guid bookingId, Guid adminUserId)
        {
            _logger.LogInformation("Admin {AdminUserId} attempting to delete booking with ID: {BookingId}", adminUserId, bookingId);
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
            {
                _logger.LogWarning("Admin delete failed. Booking with ID {BookingId} not found.", bookingId);
                return false; // Rezerwacja nie znaleziona.
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Booking with ID {BookingId} deleted successfully by admin {AdminUserId}.", bookingId, adminUserId);
            return true; // Pomyślnie usunięto.
        }

        /// <summary>
        /// Pobiera wszystkie rezerwacje dla danego użytkownika.
        /// </summary>
        public async Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId)
        {
            _logger.LogInformation("Fetching bookings for UserId {UserId}", userId);
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Apartment) // Dołącza powiązane dane mieszkania.
                .OrderByDescending(b => b.BookingDate) // Sortuje od najnowszych.
                .ToListAsync();
        }

        /// <summary>
        /// Pobiera wszystkie rezerwacje dla danego mieszkania.
        /// </summary>
        public async Task<IEnumerable<Booking>> GetBookingsByApartmentIdAsync(Guid apartmentId)
        {
            _logger.LogInformation("Fetching bookings for ApartmentId {ApartmentId}", apartmentId);
            return await _context.Bookings
                .Where(b => b.ApartmentId == apartmentId)
                .Include(b => b.User) // Dołącza powiązane dane użytkownika.
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        /// <summary>
        /// Pobiera konkretną rezerwację na podstawie jej ID.
        /// </summary>
        public async Task<Booking?> GetBookingByIdAsync(Guid bookingId)
        {
            _logger.LogInformation("Fetching booking with ID {BookingId}", bookingId);
            var booking = await _context.Bookings
                .Include(b => b.Apartment) // Dołącza dane mieszkania.
                .Include(b => b.User)      // Dołącza dane użytkownika.
                .FirstOrDefaultAsync(b => b.Id == bookingId); // Znajduje rezerwację o danym ID.

            if (booking == null)
            {
                _logger.LogWarning("Booking with ID {BookingId} not found.", bookingId);
            }
            return booking;
        }

        /// <summary>
        /// Pobiera wszystkie rezerwacje z systemu (dla widoku administratora).
        /// </summary>
        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            _logger.LogInformation("Fetching all bookings for admin view.");
            return await _context.Bookings
                .Include(b => b.User)     // Dołącza dane użytkowników.
                .Include(b => b.Apartment) // Dołącza dane mieszkań.
                .OrderByDescending(b => b.BookingDate) // Sortuje od najnowszych.
                .ToListAsync();
        }
    }
}