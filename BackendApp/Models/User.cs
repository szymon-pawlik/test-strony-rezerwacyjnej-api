namespace BackendApp.Models;

public record User(
    Guid Id,
    string Name,
    string Email,
    string PasswordHash);