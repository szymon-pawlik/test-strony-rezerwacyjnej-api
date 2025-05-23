using System.ComponentModel.DataAnnotations; // Przestrzeń nazw dla atrybutów walidacji

namespace BackendApp.DTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) używany do rejestracji nowego użytkownika.
    /// Zawiera dane niezbędne do utworzenia konta użytkownika.
    /// Właściwości są typu `init`-only, co oznacza, że mogą być ustawione tylko podczas inicjalizacji obiektu.
    /// </summary>
    public record RegisterUserDto
    {
        /// <summary>
        /// Imię lub nazwa użytkownika.
        /// Wymagane, o długości od 2 do 100 znaków.
        /// </summary>
        [Required(ErrorMessage = "Nazwa jest wymagana.")] // Pole jest wymagane
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Nazwa musi mieć od 2 do 100 znaków.")] // Ograniczenie długości
        public string Name { get; init; } = string.Empty; // Domyślna wartość, aby uniknąć ostrzeżeń o nullable

        /// <summary>
        /// Adres email użytkownika.
        /// Wymagany i musi być poprawnym formatem adresu email.
        /// </summary>
        [Required(ErrorMessage = "Email jest wymagany.")]
        [EmailAddress(ErrorMessage = "Niepoprawny format adresu email.")] // Walidacja formatu email
        public string Email { get; init; } = string.Empty;

        /// <summary>
        /// Hasło użytkownika.
        /// Wymagane, o długości od 6 do 100 znaków.
        /// </summary>
        [Required(ErrorMessage = "Hasło jest wymagane.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Hasło musi mieć od 6 do 100 znaków.")]
        public string Password { get; init; } = string.Empty;

        /// <summary>
        /// Potwierdzenie hasła.
        /// Wymagane i musi być identyczne z wartością pola Password.
        /// </summary>
        [Required(ErrorMessage = "Potwierdzenie hasła jest wymagane.")]
        [Compare(nameof(Password), ErrorMessage = "Hasła nie pasują do siebie.")] // Porównanie z innym polem
        public string ConfirmPassword { get; init; } = string.Empty;

        /// <summary>
        /// Konstruktor parametryzowany do tworzenia instancji `RegisterUserDto` z określonymi wartościami.
        /// </summary>
        /// <param name="name">Imię/nazwa użytkownika.</param>
        /// <param name="email">Adres email użytkownika.</param>
        /// <param name="password">Hasło użytkownika.</param>
        /// <param name="confirmPassword">Potwierdzenie hasła.</param>
        public RegisterUserDto(string name, string email, string password, string confirmPassword)
        {
            Name = name;
            Email = email;
            Password = password;
            ConfirmPassword = confirmPassword;
        }

        /// <summary>
        /// Konstruktor bezparametrowy.
        /// Wymagany przez niektóre mechanizmy, np. model binding w ASP.NET Core MVC/API
        /// lub deserializację.
        /// </summary>
        public RegisterUserDto() { }
    }
}