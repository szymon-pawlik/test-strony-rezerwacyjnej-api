using System;

namespace BackendApp.Models
{
    public class Booking
    {
        public Guid Id { get; set; }
        public Guid ApartmentId { get; set; }
        public Guid UserId { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime BookingDate { get; set; }

        public Apartment? Apartment { get; set; }
        public User? User { get; set; }
        public Guid LocalDatabaseId => Id;

        public Booking() { }

        public Booking(Guid id, Guid apartmentId, Guid userId, DateTime checkInDate, DateTime checkOutDate, decimal totalPrice, DateTime bookingDate)
        {
            Id = id;
            ApartmentId = apartmentId;
            UserId = userId;
            CheckInDate = checkInDate;
            CheckOutDate = checkOutDate;
            TotalPrice = totalPrice;
            BookingDate = bookingDate;
        }
    }
}