using BackendApp.Data; // Upewnij się, że to jest poprawna przestrzeń nazw dla AppDbContext
using BackendApp.Models; // Upewnij się, że to jest poprawna przestrzeń nazw dla Booking, Apartment, User
using BackendApp.DTOs; // Upewnij się, że to jest poprawna przestrzeń nazw dla CreateBookingDto
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace BackendApp.Services
{
    public class BookingService : IBookingService // Upewnij się, że implementujesz IBookingService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BookingService> _logger;

        public BookingService(AppDbContext context, ILogger<BookingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> IsApartmentAvailableAsync(Guid apartmentId, DateTime checkInDate, DateTime checkOutDate)
        {
            _logger.LogInformation("Checking availability for ApartmentId {ApartmentId} between {CheckIn} and {CheckOut}", apartmentId, checkInDate, checkOutDate);

            if (checkInDate >= checkOutDate)
            {
                _logger.LogWarning("Availability check failed: CheckInDate must be before CheckOutDate.");
                return false;
            }
            var apartment = await _context.Apartments.FindAsync(apartmentId);
            if (apartment == null || !apartment.IsAvailable)
            {
                _logger.LogWarning("Availability check failed: Apartment {ApartmentId} not found or not available.", apartmentId);
                return false;
            }
            
            var conflictingBooking = await _context.Bookings
                .AnyAsync(b =>
                        b.ApartmentId == apartmentId &&
                        b.CheckInDate < checkOutDate && // Nowy check-in jest przed starym check-out
                        b.CheckOutDate > checkInDate    // Nowy check-out jest po starym check-in
                );

            if (conflictingBooking)
            {
                _logger.LogInformation("Apartment {ApartmentId} is NOT available for the selected dates due to conflicting bookings.", apartmentId);
                return false;
            }

            _logger.LogInformation("Apartment {ApartmentId} IS available for the selected dates.", apartmentId);
            return true;
        }

        public async Task<(Booking? Booking, string? ErrorMessage)> CreateBookingAsync(Guid authenticatedUserId, CreateBookingDto bookingDto)
        {
            _logger.LogInformation("Attempting to create booking for ApartmentId {ApartmentId} by UserId {UserId}", bookingDto.ApartmentId, authenticatedUserId);

            if (bookingDto.CheckInDate >= bookingDto.CheckOutDate)
            {
                return (null, "Check-in date must be before check-out date.");
            }
            if (bookingDto.CheckInDate < DateTime.UtcNow.Date) // Prosta walidacja, czy data nie jest z przeszłości
            {
                return (null, "Check-in date cannot be in the past.");
            }

            var isAvailable = await IsApartmentAvailableAsync(bookingDto.ApartmentId, bookingDto.CheckInDate, bookingDto.CheckOutDate);
            if (!isAvailable)
            {
                return (null, "The apartment is not available for the selected dates.");
            }

            var booking = new Booking(
                Guid.NewGuid(), // Zakładam, że model Booking ma konstruktor przyjmujący te parametry
                bookingDto.ApartmentId,
                authenticatedUserId,
                bookingDto.CheckInDate.Date,
                bookingDto.CheckOutDate.Date,
                bookingDto.TotalPrice,
                DateTime.UtcNow
            );

            try
            {
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Booking created successfully. BookingId: {BookingId}", booking.Id);
                return (booking, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating booking for ApartmentId {ApartmentId} by UserId {UserId}", bookingDto.ApartmentId, authenticatedUserId);
                return (null, "An error occurred while creating the booking.");
            }
        }
        
        public async Task<bool> DeleteBookingAsync(Guid bookingId, Guid adminUserId)
        {
            _logger.LogInformation("Admin {AdminUserId} attempting to delete booking with ID: {BookingId}", adminUserId, bookingId);
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
            {
                _logger.LogWarning("Admin delete failed. Booking with ID {BookingId} not found.", bookingId);
                return false;
            }
            
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Booking with ID {BookingId} deleted successfully by admin {AdminUserId}.", bookingId, adminUserId);
            return true;
        }

        public async Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId)
        {
            _logger.LogInformation("Fetching bookings for UserId {UserId}", userId);
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Apartment)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByApartmentIdAsync(Guid apartmentId)
        {
            _logger.LogInformation("Fetching bookings for ApartmentId {ApartmentId}", apartmentId);
            return await _context.Bookings
                .Where(b => b.ApartmentId == apartmentId)
                .Include(b => b.User)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<Booking?> GetBookingByIdAsync(Guid bookingId)
        {
            _logger.LogInformation("Fetching booking with ID {BookingId}", bookingId);
            var booking = await _context.Bookings
                .Include(b => b.Apartment)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
            {
                _logger.LogWarning("Booking with ID {BookingId} not found.", bookingId);
            }
            return booking;
        }

        // NOWO DODANA METODA
        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            _logger.LogInformation("Fetching all bookings for admin view.");
            return await _context.Bookings
                .Include(b => b.User)     // Dołącz dane użytkownika
                .Include(b => b.Apartment) // Dołącz dane mieszkania
                .OrderByDescending(b => b.BookingDate) // Opcjonalnie, dla sortowania
                .ToListAsync();
        }
    }
}