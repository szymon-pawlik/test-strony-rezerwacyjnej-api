using System;
using System.ComponentModel.DataAnnotations; // Przestrzeń nazw dla atrybutów walidacji, np. [Required], [Range]

namespace BackendApp.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) używany do tworzenia nowej rezerwacji.
    /// Zawiera dane niezbędne do zainicjowania procesu rezerwacji.
    /// Używa atrybutów DataAnnotations do podstawowej walidacji.
    /// </summary>
    /// <param name="ApartmentId">Identyfikator mieszkania, które jest rezerwowane. Wymagane.</param>
    /// <param name="CheckInDate">Data zameldowania. Wymagane.</param>
    /// <param name="CheckOutDate">Data wymeldowania. Wymagane.</param>
    /// <param name="TotalPrice">Całkowita cena rezerwacji. Wymagane, wartość musi być większa od 0.</param>
    public record CreateBookingDto(
        [Required] // Atrybut walidacji: to pole jest wymagane.
        Guid ApartmentId,

        [Required] // Atrybut walidacji: to pole jest wymagane.
        DateTime CheckInDate,

        [Required] // Atrybut walidacji: to pole jest wymagane.
        DateTime CheckOutDate,

        [Required] // Atrybut walidacji: to pole jest wymagane.
        [Range(0.01, 1000000.00)] // Atrybut walidacji: wartość musi mieścić się w podanym zakresie.
        // Tutaj cena musi być co najmniej 0.01.
        decimal TotalPrice
    );
}