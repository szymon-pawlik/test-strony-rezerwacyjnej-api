// W BackendApp/DTOs/BookingDto.cs
using System;

namespace BackendApp.DTOs
{
    public class BookingDto // To będzie DTO zwracane przez API po utworzeniu/pobraniu rezerwacji
    {
        public Guid Id { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime BookingDate { get; set; }

        // Dane z powiązanych encji (bez całych obiektów, aby uniknąć cykli)
        public Guid ApartmentId { get; set; }
        public string? ApartmentName { get; set; } // Nazwa mieszkania

        public Guid UserId { get; set; }
        public string? UserName { get; set; } // Nazwa użytkownika (opcjonalnie)
        public string? UserEmail { get; set; } // Email użytkownika (opcjonalnie)

        // Możesz dodać inne pola, które są potrzebne na frontendzie
        // np. status rezerwacji, jeśli taki istnieje
    }
}