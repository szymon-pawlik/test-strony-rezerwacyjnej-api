// UserServiceApp/DTOs/LoginResponseDto.cs
namespace UserServiceApp.DTOs
{
    public record LoginResponseDto(
        string Token,
        UserDto User
    );
}