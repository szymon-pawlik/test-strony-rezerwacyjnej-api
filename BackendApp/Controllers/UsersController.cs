// Controllers/UsersController.cs
using BackendApp.Data;
using BackendApp.DTOs;
using BackendApp.Services;
using BackendApp.Models; // Dla UserRoles
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Dla FirstOrDefaultAsync
using Microsoft.Extensions.Logging;
using System.Threading.Tasks; // Dla Task
// Jeśli PasswordHasher jest statyczny i w innym miejscu:
// using static BackendApp.Services.PasswordHasher;

namespace BackendApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Ścieżka bazowa to /api/users
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly AppDbContext _dbContext;
        private readonly IValidator<RegisterUserDto> _registerUserValidator;
        private readonly ILogger<UsersController> _logger; // Używamy ILogger<T> z typem kontrolera

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

        [HttpPost("register")] // Pełna ścieżka: POST /api/users/register
        [AllowAnonymous] // Rejestracja powinna być anonimowa
        public async Task<IActionResult> Register([FromBody] RegisterUserDto registerDto)
        {
            var validationResult = await _registerUserValidator.ValidateAsync(registerDto);
            if (!validationResult.IsValid)
            {
                // [ApiController] automatycznie zwróci 400 z ModelState,
                // ale można też ręcznie:
                return BadRequest(validationResult.ToDictionary());
            }

            var (user, errorMessage) = await _userService.RegisterUserAsync(registerDto);

            if (user == null || !string.IsNullOrEmpty(errorMessage))
            {
                if (errorMessage == "Email already exists.")
                {
                    return Conflict(new { Message = errorMessage });
                }
                if (errorMessage == "Passwords do not match.")
                {
                    return BadRequest(new { Message = errorMessage });
                }
                return BadRequest(new { Message = errorMessage ?? "Registration failed." });
            }

            var userResponse = new { user.Id, user.Name, user.Email, user.Role };
            // Zwracamy CreatedAtAction dla poprawnego kodu 201 z lokalizacją
            // Musisz mieć endpoint "GetUserById" (lub podobny) albo użyć Created z URI
            // Dla uproszczenia, jeśli nie masz GetUserById:
            return Created($"/api/users/{user.Id}", userResponse);
        }

        [HttpPost("login")] // Pełna ścieżka: POST /api/users/login
        [AllowAnonymous] // Logowanie również anonimowe
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            _logger.LogInformation("Login attempt for email: {Email}", loginRequest.Email);
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            // Upewnij się, że PasswordHasher jest dostępny (np. jako statyczna metoda)
            // lub wstrzyknij go jako usługę, jeśli tak wolisz
            if (user == null || !PasswordHasher.VerifyPassword(loginRequest.Password, user.PasswordHash))
            {
                _logger.LogWarning("Login attempt FAILED for email: {Email}", loginRequest.Email);
                return Unauthorized(); // Zwraca 401 Unauthorized
            }

            _logger.LogInformation("Password verification SUCCEEDED for user: {Email}", loginRequest.Email);
            var token = _tokenService.GenerateJwtToken(user);
            return Ok(new { Token = token }); // Zwraca 200 OK z tokenem
        }
    }
}