
using System.Threading.Tasks;
using UserServiceApp.DTOs;
using UserServiceApp.Models;

namespace UserServiceApp.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterUserAsync(CreateUserDto createUserDto);
        Task<string?> LoginUserAsync(LoginRequestDto loginRequestDto); // Zwraca token lub null

        Task<UserDto?> GetUserDtoByEmailAsync(string email);
    }
}