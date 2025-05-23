using BackendApp.Data;
using BackendApp.Models;
using BackendApp.GraphQL.Mutations.Inputs; // Dla UpdateUserProfileInput
using BackendApp.DTOs; // Dla RegisterUserDto
using Microsoft.EntityFrameworkCore; // Dla metod EF Core
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; // Dla ILogger

namespace BackendApp.Services
{
    /// <summary>
    /// Serwis odpowiedzialny za logikę biznesową związaną z użytkownikami.
    /// Implementuje interfejs IUserService.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly AppDbContext _context; // Kontekst bazy danych
        private readonly ILogger<UserService> _logger; // Logger

        // Konstruktor wstrzykujący zależności.
        public UserService(AppDbContext context, ILogger<UserService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Pobiera użytkownika na podstawie jego ID.
        /// </summary>
        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            _logger.LogInformation("[UserService] Attempting to fetch user with ID: {UserId}", id);
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("[UserService] User with ID {UserId} NOT FOUND.", id);
            }
            else
            {
                _logger.LogInformation("[UserService] User with ID {UserId} FOUND: {UserName}", id, user.Name);
            }
            return user;
        }

        /// <summary>
        /// Aktualizuje profil użytkownika (imię, email).
        /// </summary>
        public async Task<(User? User, string? ErrorMessage)> UpdateUserProfileAsync(Guid userId, UpdateUserProfileInput input)
        {
            _logger.LogInformation("[UserService] Attempting to update profile for UserID: {UserId}", userId);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                _logger.LogWarning("[UserService] Update failed. User with ID {UserId} NOT FOUND.", userId);
                return (null, "User not found."); // Użytkownik nie znaleziony.
            }

            bool changed = false; // Flaga wskazująca, czy dokonano jakichkolwiek zmian.

            // Aktualizacja imienia, jeśli zostało podane i jest różne od obecnego.
            if (input.Name.HasValue && user.Name != input.Name.Value)
            {
                user.Name = input.Name.Value;
                changed = true;
                _logger.LogInformation("[UserService] Name updated for UserID: {UserId}", userId);
            }

            // Aktualizacja emaila, jeśli został podany i jest różny od obecnego.
            if (input.Email.HasValue && user.Email != input.Email.Value)
            {
                var newEmail = input.Email.Value;
                _logger.LogInformation("[UserService] UserID: {UserId} attempting to update email to {NewEmail}", userId, newEmail);

                // Sprawdzenie, czy nowy email nie jest już zajęty przez innego użytkownika.
                var emailExists = await _context.Users.AnyAsync(u => u.Email == newEmail && u.Id != userId);
                if (emailExists)
                {
                    _logger.LogWarning("[UserService] Email update failed for UserID: {UserId}. Email {NewEmail} is already taken.", userId, newEmail);
                    return (null, "Email already taken."); // Email jest już zajęty.
                }
                user.Email = newEmail;
                changed = true;
                _logger.LogInformation("[UserService] Email updated for UserID: {UserId} to {NewEmail}", userId, newEmail);
            }

            // Jeśli dokonano zmian, zapisz je w bazie danych.
            if (changed)
            {
                try
                {
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("[UserService] Profile updated successfully for UserID: {UserId}", userId);
                    return (user, null); // Zwraca zaktualizowanego użytkownika i brak błędu.
                }
                catch (DbUpdateConcurrencyException ex) // Obsługa błędów współbieżności.
                {
                     _logger.LogError(ex, "[UserService] Concurrency exception while updating profile for UserID {UserId}.", userId);
                    return (null, "A concurrency error occurred while updating the profile.");
                }
                catch (Exception ex) // Obsługa innych błędów zapisu.
                {
                    _logger.LogError(ex, "[UserService] Error updating profile for UserID {UserId}.", userId);
                    return (null, "An error occurred while updating the profile.");
                }
            }
            else
            {
                // Jeśli nie dokonano żadnych zmian, zwróć oryginalnego użytkownika.
                _logger.LogInformation("[UserService] No changes detected for profile update for UserID: {UserId}. Returning original user.", userId);
                return (user, null);
            }
        }

        /// <summary>
        /// Rejestruje nowego użytkownika w systemie.
        /// </summary>
        public async Task<(User? User, string? ErrorMessage)> RegisterUserAsync(RegisterUserDto registerDto)
        {
            _logger.LogInformation("[UserService] Attempting to register user with email: {Email}", registerDto.Email);

            // Sprawdzenie, czy użytkownik o podanym emailu już istnieje.
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("[UserService] Registration failed: Email {Email} already exists.", registerDto.Email);
                return (null, "Email already exists."); // Email jest już zajęty.
            }

            // Sprawdzenie, czy hasła się zgadzają (choć to powinno być też walidowane na poziomie DTO/kontrolera).
            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                _logger.LogWarning("[UserService] Registration failed: Passwords do not match for email: {Email}", registerDto.Email);
                return (null, "Passwords do not match."); // Hasła się nie zgadzają.
            }

            // Haszowanie hasła przed zapisem do bazy.
            var hashedPassword = PasswordHasher.HashPassword(registerDto.Password);

            // Tworzenie nowej encji użytkownika.
            var newUser = new User(
                Guid.NewGuid(), // Nowe ID dla użytkownika
                registerDto.Name,
                registerDto.Email,
                hashedPassword, // Zapisz zahaszowane hasło
                Models.UserRoles.User // Domyślna rola dla nowego użytkownika
            );

            try
            {
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                _logger.LogInformation("[UserService] User registered successfully with ID: {UserId} and Email: {Email}, Role: {Role}", newUser.Id, newUser.Email, newUser.Role);
                return (newUser, null); // Zwraca nowo utworzonego użytkownika i brak błędu.
            }
            catch (Exception ex) // Obsługa błędów zapisu.
            {
                _logger.LogError(ex, "[UserService] Error occurred while saving new user with email: {Email}", registerDto.Email);
                return (null, "An error occurred during registration.");
            }
        }
    }
}