using System;
namespace BackendApp.Models
{
    public record Booking(
        Guid Id,
        Guid ApartmentId, 
        Guid UserId,      
        DateTime CheckInDate,
        DateTime CheckOutDate,
        double TotalPrice,
        DateTime BookingDate)
    {
        public Apartment? Apartment { get; set; }
        public User? User { get; set; }
    }
}