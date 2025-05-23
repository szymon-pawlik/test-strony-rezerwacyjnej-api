
using System.ComponentModel.DataAnnotations;

namespace UserServiceApp.DTOs
{
    public record LoginRequestDto(
        [Required][EmailAddress] string Email,
        [Required] string Password
    );
}