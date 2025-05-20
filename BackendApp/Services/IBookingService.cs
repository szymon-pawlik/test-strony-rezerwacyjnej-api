using BackendApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IBookingService
    {
        Task<Booking?> GetBookingByIdAsync(Guid id);
        Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId);
        Task<IEnumerable<Booking>> GetBookingsByApartmentIdAsync(Guid apartmentId);
        Task<Booking> CreateBookingAsync(Booking booking);
    }
}