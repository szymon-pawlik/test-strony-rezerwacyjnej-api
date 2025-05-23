using Microsoft.AspNetCore.Authentication.JwtBearer; // Przestrzeń nazw dla domyślnych schematów i opcji JwtBearer
using Microsoft.Extensions.Configuration; // Dla IConfiguration do odczytu ustawień
using Microsoft.Extensions.DependencyInjection; // Dla IServiceCollection i metod rozszerzających
using Microsoft.IdentityModel.Tokens; // Dla SymmetricSecurityKey i TokenValidationParameters
using System.Text; // Dla Encoding.UTF8

namespace BackendApp.Extensions
{
    /// <summary>
    /// Klasa statyczna zawierająca metody rozszerzające do konfiguracji uwierzytelniania.
    /// </summary>
    public static class AuthenticationSetupExtensions
    {
        /// <summary>
        /// Dodaje i konfiguruje uwierzytelnianie JWT Bearer do kontenera usług.
        /// Odczytuje ustawienia JWT (Key, Issuer, Audience) z konfiguracji aplikacji.
        /// </summary>
        /// <param name="services">Kolekcja usług, do której dodawane jest uwierzytelnianie.</param>
        /// <param name="configuration">Konfiguracja aplikacji, z której pobierane są ustawienia JWT.</param>
        /// <returns>Ta sama kolekcja usług, umożliwiająca dalsze konfigurowanie (fluent chaining).</returns>
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            // Odczytanie ustawień JWT z pliku konfiguracyjnego (np. appsettings.json)
            var jwtKey = configuration["JwtSettings:Key"];         // Klucz używany do podpisywania i weryfikacji tokenu
            var jwtIssuer = configuration["JwtSettings:Issuer"];   // Wystawca tokenu
            var jwtAudience = configuration["JwtSettings:Audience"]; // Odbiorca (publiczność) tokenu

            // Sprawdzenie, czy kluczowe ustawienia JWT są skonfigurowane; jeśli nie, wyświetl ostrzeżenie.
            // Jest to ważne, ponieważ brak tych ustawień może prowadzić do niepoprawnego działania uwierzytelniania.
            if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
            {
                Console.WriteLine("OSTRZEŻENIE: Ustawienia JWT (Key, Issuer, Audience) nie są w pełni skonfigurowane. Uwierzytelnianie może nie działać zgodnie z oczekiwaniami.");
                // W środowisku produkcyjnym można by tu rzucić wyjątek lub zastosować inne mechanizmy powiadamiania.
            }

            // Dodanie usług uwierzytelniania do kontenera DI.
            services.AddAuthentication(options =>
            {
                // Ustawienie domyślnych schematów uwierzytelniania.
                // JwtBearerDefaults.AuthenticationScheme oznacza, że domyślnie będzie używane uwierzytelnianie oparte na tokenach Bearer.
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // Schemat używany do uwierzytelniania żądania.
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;    // Schemat używany, gdy nieautoryzowane żądanie próbuje uzyskać dostęp do zasobu.
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;             // Ogólny domyślny schemat.
            })
            // Dodanie i skonfigurowanie obsługi tokenów JWT Bearer.
            .AddJwtBearer(options =>
            {
                options.SaveToken = true; // Określa, czy token powinien być zapisywany w AuthenticationProperties po pomyślnym uwierzytelnieniu.
                                          // Przydatne, jeśli token ma być później dostępny.
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // --- Klucz podpisujący ---
                    ValidateIssuerSigningKey = true, // Określa, czy klucz podpisujący tokenu powinien być walidowany.
                                                     // Jest to kluczowe dla bezpieczeństwa, aby upewnić się, że token pochodzi z zaufanego źródła.
                    // Klucz używany do weryfikacji podpisu tokenu. Powinien być taki sam jak klucz użyty do podpisania tokenu.
                    // Jeśli jwtKey jest pusty, IssuerSigningKey pozostanie null, co może spowodować błąd walidacji, jeśli ValidateIssuerSigningKey jest true.
                    // Lepszym podejściem byłoby rzucenie wyjątku, jeśli klucz jest pusty, a walidacja klucza jest włączona.
                    IssuerSigningKey = string.IsNullOrEmpty(jwtKey) ? null : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

                    // --- Wystawca (Issuer) ---
                    ValidateIssuer = !string.IsNullOrEmpty(jwtIssuer), // Włącza walidację wystawcy tokenu tylko, jeśli jest on zdefiniowany w konfiguracji.
                    ValidIssuer = jwtIssuer,                           // Oczekiwana wartość dla oświadczenia "iss" (issuer) w tokenie.

                    // --- Odbiorca (Audience) ---
                    ValidateAudience = !string.IsNullOrEmpty(jwtAudience), // Włącza walidację odbiorcy tokenu tylko, jeśli jest on zdefiniowany w konfiguracji.
                    ValidAudience = jwtAudience,                           // Oczekiwana wartość dla oświadczenia "aud" (audience) w tokenie.

                    // --- Czas życia tokenu ---
                    ValidateLifetime = true,      // Określa, czy czas życia tokenu (oświadczenia "nbf" - not before, "exp" - expiration) powinien być walidowany.
                    ClockSkew = TimeSpan.Zero     // Ustawia tolerancję czasową na zero przy walidacji czasu życia tokenu.
                                                  // Domyślnie jest to 5 minut, co pozwala na niewielkie różnice w zegarach między serwerami.
                                                  // Ustawienie na TimeSpan.Zero jest bardziej rygorystyczne.
                };
            });

            return services; // Zwrócenie IServiceCollection, aby umożliwić dalsze łączenie wywołań konfiguracji (fluent API).
        }
    }
}