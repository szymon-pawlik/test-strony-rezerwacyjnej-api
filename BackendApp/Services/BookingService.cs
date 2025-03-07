using BackendApp.Data;
using BackendApp.Models;

namespace BackendApp.Services;

public class BookingService
{
    private readonly AppDbContext _context;

    public BookingService(AppDbContext context)
    {
        _context = context;
    }

    public Booking AddBooking(Booking booking)
    {
        _context.Bookings.Add(booking);
        _context.SaveChanges();
        return booking;
    }

    public List<Booking> GetBookingsByUser(Guid userId) => 
        _context.Bookings.Where(b => b.UserId == userId).ToList();
}