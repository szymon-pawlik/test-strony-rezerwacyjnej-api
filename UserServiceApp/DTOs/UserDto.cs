
using System;

namespace UserServiceApp.DTOs
{
    public record UserDto(
        Guid Id,
        string Name,
        string Email,
        string Role
    );
}