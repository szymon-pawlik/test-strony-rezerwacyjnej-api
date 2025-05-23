using BackendApp.Models; // Dla modelu User
using Microsoft.Extensions.Configuration; // Dla IConfiguration do odczytu ustawień
using Microsoft.IdentityModel.Tokens; // Dla SymmetricSecurityKey, SigningCredentials, SecurityAlgorithms
using System;
using System.Collections.Generic;     // Dla List<Claim>
using System.IdentityModel.Tokens.Jwt; // Dla JwtRegisteredClaimNames, JwtSecurityTokenHandler, SecurityTokenDescriptor
using System.Security.Claims;        // Dla Claim, ClaimsIdentity, ClaimTypes
using System.Text;                   // Dla Encoding.UTF8

namespace BackendApp.Services
{
    /// <summary>
    /// Interfejs dla serwisu odpowiedzialnego za generowanie tokenów.
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Generuje token JWT dla podanego użytkownika.
        /// </summary>
        string GenerateJwtToken(User user);
    }

    /// <summary>
    /// Serwis implementujący logikę generowania tokenów JWT.
    /// </summary>
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration; // Dostęp do konfiguracji aplikacji (np. appsettings.json)

        // Konstruktor wstrzykujący zależność IConfiguration.
        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Generuje token JWT na podstawie danych użytkownika i ustawień z konfiguracji.
        /// </summary>
        public string GenerateJwtToken(User user)
        {
            // Odczytanie ustawień JWT z konfiguracji.
            var jwtKey = _configuration["JwtSettings:Key"];
            var jwtIssuer = _configuration["JwtSettings:Issuer"];
            var jwtAudience = _configuration["JwtSettings:Audience"];

            // Walidacja, czy wszystkie niezbędne ustawienia JWT są obecne.
            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
            {
                throw new InvalidOperationException("Ustawienia JWT (Key, Issuer, Audience) muszą być skonfigurowane, aby wygenerować token.");
            }

            // Tworzenie klucza bezpieczeństwa i poświadczeń podpisu.
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Definiowanie oświadczeń (claims) dla tokenu.
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Podmiot (identyfikator użytkownika)
                new Claim(JwtRegisteredClaimNames.Email, user.Email),       // Adres email
                new Claim(JwtRegisteredClaimNames.Name, user.Name),         // Nazwa użytkownika
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unikalny identyfikator tokenu JWT
                new Claim(ClaimTypes.Role, user.Role)                       // Rola użytkownika
            };

            // Tworzenie deskryptora tokenu, który zawiera wszystkie informacje potrzebne do jego utworzenia.
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims), // Podmiot z listą oświadczeń
                Expires = DateTime.UtcNow.AddHours(1), // Data wygaśnięcia tokenu (np. 1 godzina od teraz)
                Issuer = jwtIssuer,                   // Wystawca tokenu
                Audience = jwtAudience,               // Odbiorca (publiczność) tokenu
                SigningCredentials = credentials      // Poświadczenia używane do podpisania tokenu
            };

            // Tworzenie i zapisywanie tokenu.
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor); // Tworzenie obiektu tokenu

            return tokenHandler.WriteToken(token); // Zapisanie tokenu jako string
        }
    }
}