using System.ComponentModel.DataAnnotations;

namespace BackendApp.DTOs
{
    public record RegisterUserDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; init; } = string.Empty; // Używamy init dla niemutowalności

        [Required]
        [EmailAddress]
        public string Email { get; init; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; init; } = string.Empty;

        [Required]
        [Compare(nameof(Password), ErrorMessage = "Hasła nie pasują do siebie.")]
        public string ConfirmPassword { get; init; } = string.Empty;

        // Opcjonalny konstruktor, jeśli chcesz łatwo tworzyć instancje
        public RegisterUserDto(string name, string email, string password, string confirmPassword)
        {
            Name = name;
            Email = email;
            Password = password;
            ConfirmPassword = confirmPassword;
        }

        // Konstruktor bezparametrowy potrzebny dla niektórych mechanizmów (np. model binding)
        public RegisterUserDto() { }
    }
}