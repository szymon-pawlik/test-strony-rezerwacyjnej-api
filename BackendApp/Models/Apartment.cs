using System;
using System.Collections.Generic; 

namespace BackendApp.Models
{
    public record Apartment(
        Guid Id,
        string Name,
        string Description,
        string Location,
        int NumberOfBedrooms,
        int NumberOfBathrooms,
        List<string> Amenities,
        bool IsAvailable,
        decimal PricePerNight)
    {
        public Apartment() : this(Guid.Empty, "", "", "", 0, 0, new List<string>(), false, 0m) { }
        
        public Guid DatabaseId => Id;
        public Guid LocalDatabaseId => Id;

        public ICollection<Review>? Reviews { get; set; } // Zakładając, że masz tu nawigacje
        public ICollection<Booking>? Bookings { get; set; }
    }
}