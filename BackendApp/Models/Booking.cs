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
        // --- POCZĄTEK KLUCZOWYCH ZMIAN ---
        // Właściwości nawigacyjne do powiązanych encji
        // Te właściwości są niezbędne dla Entity Framework Core (dla .Include() i konfiguracji relacji)

        public Apartment? Apartment { get; set; } // Właściwość nawigacyjna do Apartment
        public User? User { get; set; }         // Właściwość nawigacyjna do User
        // --- KONIEC KLUCZOWYCH ZMIAN ---
    }
}