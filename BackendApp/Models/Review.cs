using System;
namespace BackendApp.Models
{
    public class Review // ZMIENIONE NA CLASS
    {
        public Guid Id { get; set; }
        public Guid ApartmentId { get; set; } // Publiczne get; set;
        public Guid UserId { get; set; }      // Publiczne get; set;
        public int Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; }

        public Apartment? Apartment { get; set; }
        public User? User { get; set; }

        public Review() { Comment = string.Empty; } // Konstruktor bezparametrowy
    }
}