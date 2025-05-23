using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

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
        
        [NotMapped]
        public Guid DatabaseId => Id;
        
        [NotMapped]
        public Guid LocalDatabaseId => Id;
        
        public virtual ICollection<Review>? Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Booking>? Bookings { get; set; } = new List<Booking>(); 
        
    }
}