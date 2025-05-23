
using System.ComponentModel.DataAnnotations;

namespace UserServiceApp.DTOs
{
    public record CreateUserDto(
        [Required][StringLength(100)] string Name,
        [Required][EmailAddress][StringLength(100)] string Email,
        [Required][MinLength(6)] string Password, // Hasło w plain text, będzie hashowane
        [Required] string Role // Możesz tu dodać walidację na dozwolone role
    );
}