using BackendApp.Data;
using BackendApp.Models;
using BackendApp.GraphQL.Mutations.Inputs;
using BackendApp.DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace BackendApp.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(AppDbContext context, ILogger<UserService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

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

        public async Task<(User? User, string? ErrorMessage)> UpdateUserProfileAsync(Guid userId, UpdateUserProfileInput input)
        {
            _logger.LogInformation("[UserService] Attempting to update profile for UserID: {UserId}", userId);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                _logger.LogWarning("[UserService] Update failed. User with ID {UserId} NOT FOUND.", userId);
                return (null, "User not found.");
            }

            bool changed = false;

            if (input.Name.HasValue && user.Name != input.Name.Value)
            {
                user = user with { Name = input.Name.Value };
                changed = true;
                _logger.LogInformation("[UserService] Name updated for UserID: {UserId}", userId);
            }

            if (input.Email.HasValue && user.Email != input.Email.Value)
            {
                var newEmail = input.Email.Value;
                _logger.LogInformation("[UserService] UserID: {UserId} attempting to update email to {NewEmail}", userId, newEmail);

                var emailExists = await _context.Users.AnyAsync(u => u.Email == newEmail && u.Id != userId);
                if (emailExists)
                {
                    _logger.LogWarning("[UserService] Email update failed for UserID: {UserId}. Email {NewEmail} is already taken.", userId, newEmail);
                    return (null, "Email already taken."); // Zwracamy błąd
                }
                user = user with { Email = newEmail };
                changed = true;
                _logger.LogInformation("[UserService] Email updated for UserID: {UserId} to {NewEmail}", userId, newEmail);
            }

            if (changed)
            {
                try
                {
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("[UserService] Profile updated successfully for UserID: {UserId}", userId);
                    return (user, null); // Sukces, zwracamy zaktualizowanego użytkownika
                }
                catch (DbUpdateConcurrencyException ex)
                {
                     _logger.LogError(ex, "[UserService] Concurrency exception while updating profile for UserID {UserId}.", userId);
                    return (null, "A concurrency error occurred while updating the profile.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[UserService] Error updating profile for UserID {UserId}.", userId);
                    return (null, "An error occurred while updating the profile.");
                }
            }
            else
            {
                _logger.LogInformation("[UserService] No changes detected for profile update for UserID: {UserId}. Returning original user.", userId);
                return (user, null); // Brak zmian, zwracamy oryginalnego użytkownika (lub można by zwrócić błąd "no changes")
            }
        }

        public async Task<(User? User, string? ErrorMessage)> RegisterUserAsync(RegisterUserDto registerDto)
        {
            _logger.LogInformation("[UserService] Attempting to register user with email: {Email}", registerDto.Email);

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("[UserService] Registration failed: Email {Email} already exists.", registerDto.Email);
                return (null, "Email already exists.");
            }

            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                _logger.LogWarning("[UserService] Registration failed: Passwords do not match for email: {Email}", registerDto.Email);
                return (null, "Passwords do not match.");
            }

            var hashedPassword = PasswordHasher.HashPassword(registerDto.Password);

            var newUser = new User(
                Guid.NewGuid(),
                registerDto.Name,
                registerDto.Email,
                hashedPassword,
                Models.UserRoles.User
            );

            try
            {
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                _logger.LogInformation("[UserService] User registered successfully with ID: {UserId} and Email: {Email}, Role: {Role}", newUser.Id, newUser.Email, newUser.Role);
                return (newUser, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[UserService] Error occurred while saving new user with email: {Email}", registerDto.Email);
                return (null, "An error occurred during registration.");
            }
        }
    }
}