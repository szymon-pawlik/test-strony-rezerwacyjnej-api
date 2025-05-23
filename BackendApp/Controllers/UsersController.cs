using BackendApp.Data;         // Prawdopodobnie zawiera AppDbContext
using BackendApp.DTOs;         // Importowanie Data Transfer Objects (DTOs) dla użytkowników
using BackendApp.Services;     // Importowanie serwisów (np. IUserService, ITokenService)
using BackendApp.Models;       // Importowanie modeli encji (np. User) - choć nieużywane bezpośrednio w deklaracjach pól, może być w serwisach
using FluentValidation;        // Importowanie biblioteki FluentValidation
using Microsoft.AspNetCore.Authorization; // Dla atrybutu [AllowAnonymous]
using Microsoft.AspNetCore.Mvc;        // Dla klas bazowych kontrolerów i atrybutów akcji
using Microsoft.EntityFrameworkCore; // Dla metod asynchronicznych Entity Framework Core, np. FirstOrDefaultAsync
using Microsoft.Extensions.Logging;  // Dla logowania informacji i błędów
using System.Threading.Tasks;      // Dla operacji asynchronicznych

namespace BackendApp.Controllers
{
    /// <summary>
    /// Kontroler API do zarządzania użytkownikami, w tym rejestracją i logowaniem.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Definiuje bazową trasę jako "api/users"
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService; // Serwis do obsługi logiki biznesowej użytkowników (np. rejestracja)
        private readonly ITokenService _tokenService; // Serwis do generowania tokenów JWT
        private readonly AppDbContext _dbContext; // Kontekst bazy danych (używany tutaj bezpośrednio do logowania)
        private readonly IValidator<RegisterUserDto> _registerUserValidator; // Walidator dla DTO rejestracji
        private readonly ILogger<UsersController> _logger; // Logger do zapisywania informacji i błędów

        /// <summary>
        /// Konstruktor kontrolera UsersController.
        /// Wstrzykuje zależności serwisów, kontekstu bazy danych, walidatora i loggera.
        /// </summary>
        public UsersController(
            IUserService userService,
            ITokenService tokenService,
            AppDbContext dbContext,
            IValidator<RegisterUserDto> registerUserValidator,
            ILogger<UsersController> logger)
        {
            _userService = userService;
            _tokenService = tokenService;
            _dbContext = dbContext;
            _registerUserValidator = registerUserValidator;
            _logger = logger;
        }

        /// <summary>
        /// Rejestruje nowego użytkownika w systemie.
        /// Dostępne publicznie (bez autoryzacji).
        /// </summary>
        /// <param name="registerDto">Dane nowego użytkownika do rejestracji.</param>
        /// <returns>Status 201 Created z danymi użytkownika lub odpowiedni kod błędu.</returns>
        [HttpPost("register")] // Obsługuje żądania HTTP POST na trasie "api/users/register"
        [AllowAnonymous]       // Pozwala na dostęp do tego endpointu bez autoryzacji
        public async Task<IActionResult> Register([FromBody] RegisterUserDto registerDto)
        {
            // Walidacja danych wejściowych DTO za pomocą FluentValidation
            var validationResult = await _registerUserValidator.ValidateAsync(registerDto);
            if (!validationResult.IsValid)
            {
                // Jeśli walidacja nie powiodła się, zwróć status 400 BadRequest z błędami walidacji
                // .ToDictionary() jest często używane z FluentValidation do przekształcenia błędów na słownik
                return BadRequest(validationResult.ToDictionary());
            }

            // Próba rejestracji użytkownika za pomocą serwisu
            var (user, errorMessage) = await _userService.RegisterUserAsync(registerDto);

            // Obsługa błędów zwróconych przez serwis (np. email już istnieje, hasła się nie zgadzają)
            if (user == null || !string.IsNullOrEmpty(errorMessage))
            {
                if (errorMessage == "Email already exists.")
                {
                    return Conflict(new { Message = errorMessage }); // Status 409 Conflict, jeśli email jest zajęty
                }
                if (errorMessage == "Passwords do not match.")
                {
                    return BadRequest(new { Message = errorMessage }); // Błąd, jeśli hasła się nie zgadzają (choć to powinno być pokryte walidacją DTO)
                }
                return BadRequest(new { Message = errorMessage ?? "Registration failed." }); // Inne błędy rejestracji
            }

            // Przygotowanie odpowiedzi z wybranymi danymi użytkownika
            var userResponse = new { user.Id, user.Name, user.Email, user.Role };

            // Zwrócenie statusu 201 Created wraz z lokalizacją (hipotetyczną) nowo utworzonego zasobu
            // oraz uproszczonymi danymi użytkownika w ciele odpowiedzi.
            return Created($"/api/users/{user.Id}", userResponse);
        }

        /// <summary>
        /// Loguje istniejącego użytkownika do systemu.
        /// Dostępne publicznie (bez autoryzacji).
        /// </summary>
        /// <param name="loginRequest">Dane logowania (email i hasło).</param>
        /// <returns>Status 200 OK z tokenem JWT lub status 401 Unauthorized.</returns>
        [HttpPost("login")] // Obsługuje żądania HTTP POST na trasie "api/users/login"
        [AllowAnonymous]    // Pozwala na dostęp bez autoryzacji
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            _logger.LogInformation("Login attempt for email: {Email}", loginRequest.Email); // Logowanie próby logowania

            // Bezpośrednie odpytanie bazy danych o użytkownika po emailu
            // UWAGA: Często logika pobierania użytkownika i weryfikacji hasła jest w serwisie (np. IUserService lub dedykowanym AuthenticationService)
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            // Sprawdzenie, czy użytkownik istnieje i czy hasło jest poprawne
            // PasswordHasher.VerifyPassword powinno być metodą statyczną lub częścią serwisu
            if (user == null || !PasswordHasher.VerifyPassword(loginRequest.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login attempt FAILED for email: {Email}", loginRequest.Email); // Logowanie nieudanej próby
                return Unauthorized(); // Zwraca status 401 Unauthorized, jeśli dane są niepoprawne
            }

            _logger.LogInformation("Password verification SUCCEEDED for user: {Email}", loginRequest.Email); // Logowanie udanej weryfikacji
            // Generowanie tokenu JWT dla zalogowanego użytkownika
            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new { Token = token }); // Zwraca status 200 OK wraz z tokenem
        }
    }
}