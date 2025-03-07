using BackendApp.Models;
using BackendApp.Data;

namespace BackendApp.Services;

public class BookingService
{
    public Booking AddBooking(Booking booking)
    {
        booking = booking with { Id = Guid.NewGuid(), BookingDate = DateTime.UtcNow };
        DataStore.Bookings.Add(booking);
        return booking;
    }

    public List<Booking> GetBookingsByUser(Guid userId) =>
        DataStore.Bookings.Where(b => b.UserId == userId).ToList();
}