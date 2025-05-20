using System;
using System.ComponentModel.DataAnnotations; // Dla atrybutów walidacji, jeśli będziesz ich tu używać

namespace ReviewServiceApp.Models
{
    public class Review
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ApartmentId { get; set; } // ID mieszkania, którego dotyczy recenzja

        [Required]
        public Guid UserId { get; set; } // ID użytkownika, który napisał recenzję

        // Możemy dodać UserName i ApartmentName, jeśli chcemy przechowywać
        // zdenormalizowane dane dla uproszczenia zapytań, ale to zwiększa złożoność synchronizacji.
        // Na razie pomińmy.
        // public string? UserName { get; set; }
        // public string? ApartmentName { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; } // Komentarz może być opcjonalny

        [Required]
        public DateTime ReviewDate { get; set; }
    }
}