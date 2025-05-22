using BackendApp.Models;
using BackendApp.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IBookingService
    {
        Task<(Booking? Booking, string? ErrorMessage)> CreateBookingAsync(Guid authenticatedUserId, CreateBookingDto bookingDto);
        Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId);
        Task<IEnumerable<Booking>> GetBookingsByApartmentIdAsync(Guid apartmentId);
        Task<bool> DeleteBookingAsync(Guid bookingId, Guid adminUserId); // adminUserId do logowania/weryfikacji
        Task<bool> IsApartmentAvailableAsync(Guid apartmentId, DateTime checkInDate, DateTime checkOutDate);
        Task<Booking?> GetBookingByIdAsync(Guid bookingId);
        Task<IEnumerable<Booking>> GetAllBookingsAsync();
        
        
        
        
    }
}