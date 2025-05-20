using System.ComponentModel.DataAnnotations;

namespace BackendApp.DTOs
{
    public record LoginRequestDto(
        [Required]
        [EmailAddress]
        string Email,

        [Required]
        string Password
    );
}