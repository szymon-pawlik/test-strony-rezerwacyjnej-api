using BackendApp.Models;
using BackendApp.GraphQL.Mutations.Inputs; // Dla UpdateUserProfileInput
using BackendApp.DTOs; // Dla RegisterUserDto
using System;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(Guid id);
        Task<(User? User, string? ErrorMessage)> RegisterUserAsync(RegisterUserDto registerDto);
        Task<(User? User, string? ErrorMessage)> UpdateUserProfileAsync(Guid userId, UpdateUserProfileInput input); // ZMIENIONA SYGNATURA
    }
}