using System; // Wymagane dla typów Guid i DateTime

namespace BackendApp.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) reprezentujący dane rezerwacji.
    /// Używany do przesyłania informacji o rezerwacji, np. w odpowiedziach API.
    /// </summary>
    public class BookingDto
    {
        /// <summary>
        /// Unikalny identyfikator rezerwacji.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Data zameldowania.
        /// </summary>
        public DateTime CheckInDate { get; set; }

        /// <summary>
        /// Data wymeldowania.
        /// </summary>
        public DateTime CheckOutDate { get; set; }

        /// <summary>
        /// Całkowita cena rezerwacji.
        /// </summary>
        public decimal TotalPrice { get; set; }

        /// <summary>
        /// Data dokonania rezerwacji.
        /// </summary>
        public DateTime BookingDate { get; set; }

        /// <summary>
        /// Identyfikator zarezerwowanego mieszkania.
        /// </summary>
        public Guid ApartmentId { get; set; }

        /// <summary>
        /// Opcjonalna nazwa zarezerwowanego mieszkania.
        /// Może być null, jeśli nie jest wymagana lub dostępna w danym kontekście.
        /// </summary>
        public string? ApartmentName { get; set; } // `string?` oznacza, że właściwość może przyjmować wartość null (nullable reference type)

        /// <summary>
        /// Identyfikator użytkownika, który dokonał rezerwacji.
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Opcjonalna nazwa użytkownika, który dokonał rezerwacji.
        /// Może być null.
        /// </summary>
        public string? UserName { get; set; }
    }
}