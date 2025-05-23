
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; 
using Microsoft.IdentityModel.Tokens;     
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;  
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using UserServiceApp.Data;
using UserServiceApp.DTOs;
using UserServiceApp.Models;

namespace UserServiceApp.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserDbContext _context;
        private readonly IConfiguration _configuration; 

        public AuthService(UserDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User?> RegisterUserAsync(CreateUserDto createUserDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
            {
                return null; 
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password),
                Role = createUserDto.Role 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<string?> LoginUserAsync(LoginRequestDto loginRequestDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequestDto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequestDto.Password, user.PasswordHash))
            {
                return null; 
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _configuration["JwtSettings:Key"];
            if (string.IsNullOrEmpty(keyString)) throw new InvalidOperationException("JWT Key is not configured.");

            var key = Encoding.ASCII.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), 
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Name, user.Name),
                    new Claim(ClaimTypes.Role, user.Role), 
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) 
                }),
                Expires = DateTime.UtcNow.AddHours(1), 
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<UserDto?> GetUserDtoByEmailAsync(string email)
        {
            var user = await _context.Users.AsNoTracking()
                                 .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;
            return new UserDto(user.Id, user.Name, user.Email, user.Role);
        }
    }
}