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
        [Range(0.01, double.MaxValue)]
        double TotalPrice
    );
}