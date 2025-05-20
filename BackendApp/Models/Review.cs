// W BackendApp/Models/Review.cs
using System;

namespace BackendApp.Models
{
    public record Review(
        Guid Id,
        Guid ApartmentId,
        Guid UserId,
        int Rating,
        string Comment,
        DateTime ReviewDate)
    {
        public Review() : this(
            Guid.Empty,       
            Guid.Empty,       
            Guid.Empty,       
            0,                
            string.Empty,     
            DateTime.MinValue) 
        {
        }

        public Apartment? Apartment { get; set; }
        public User? User { get; set; }
    }
}