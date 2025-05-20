using BackendApp.Data;
using BackendApp.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;

        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetBookingByIdAsync(Guid id)
        {
            return await _context.Bookings
                                 .Include(b => b.Apartment)
                                 .Include(b => b.User)
                                 .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetBookingsByUserIdAsync(Guid userId)
        {
            return await _context.Bookings
                                 .Where(b => b.UserId == userId)
                                 .Include(b => b.Apartment)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByApartmentIdAsync(Guid apartmentId)
        {
            return await _context.Bookings
                                 .Where(b => b.ApartmentId == apartmentId)
                                 .Include(b => b.User)
                                 .ToListAsync();
        }

        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public Booking AddBooking(Booking booking)
        {
            _context.Bookings.Add(booking);
            _context.SaveChanges();
            return booking;
        }

        public IEnumerable<Booking> GetBookingsByUser(Guid userId)
        {
             return _context.Bookings
                           .Where(b => b.UserId == userId)
                           .Include(b => b.Apartment)
                           .ToList();
        }
    }
}