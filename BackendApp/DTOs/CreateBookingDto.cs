// In BackendApp/DTOs/CreateBookingDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace BackendApp.DTOs
{
    public record CreateBookingDto(
        [Required]
        Guid ApartmentId,
        [Required]
        DateTime CheckInDate,
        [Required]
        DateTime CheckOutDate,
        [Required]
        [Range(0.01, 1000000.00)] // Use double literals for the range boundaries
        decimal TotalPrice // Property remains decimal
    );
}