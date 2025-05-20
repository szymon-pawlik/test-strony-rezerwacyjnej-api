using System; // Upewnij się, że ten using jest obecny

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
        public Apartment? Apartment { get; set; } 
        public User? User { get; set; }       
    }
}