// UserServiceApp/Services/IAuthService.cs
using System.Threading.Tasks;
using UserServiceApp.DTOs;
using UserServiceApp.Models;

namespace UserServiceApp.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterUserAsync(CreateUserDto createUserDto);
        Task<string?> LoginUserAsync(LoginRequestDto loginRequestDto); // Zwraca token lub null
        // Możesz dodać metodę do pobierania UserDto dla zalogowanego użytkownika
        Task<UserDto?> GetUserDtoByEmailAsync(string email);
    }
}