using BackendApp.Models; // Prawdopodobnie zawiera definicję UserRoles
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace BackendApp.Extensions
{
    /// <summary>
    /// Klasa statyczna zawierająca metody rozszerzające do konfiguracji autoryzacji w aplikacji.
    /// </summary>
    public static class AuthorizationSetupExtensions
    {
        /// <summary>
        /// Dodaje i konfiguruje niestandardowe polityki autoryzacji dla aplikacji.
        /// </summary>
        /// <param name="services">Kolekcja usług, do której dodawane są konfiguracje autoryzacji.</param>
        /// <returns>Ta sama kolekcja usług, umożliwiająca dalsze konfigurowanie.</returns>
        public static IServiceCollection AddAppAuthorization(this IServiceCollection services)
        {
            // Rejestracja usług autoryzacji i definiowanie polityk.
            services.AddAuthorization(options =>
            {
                // Polityka "AuthenticatedUserPolicy":
                // Wymaga, aby użytkownik był po prostu zalogowany (uwierzytelniony), bez względu na rolę.
                options.AddPolicy("AuthenticatedUserPolicy", policy =>
                    policy.RequireAuthenticatedUser());

                // Polityka "AdminPolicy":
                // Wymaga, aby użytkownik posiadał rolę administratora (zdefiniowaną w UserRoles.Admin).
                options.AddPolicy("AdminPolicy", policy =>
                    policy.RequireRole(UserRoles.Admin));

                // Polityka "UserPolicy":
                // Wymaga, aby użytkownik posiadał rolę zwykłego użytkownika (zdefiniowaną w UserRoles.User).
                options.AddPolicy("UserPolicy", policy =>
                    policy.RequireRole(UserRoles.User));
            });

            return services; // Umożliwia łączenie wywołań konfiguracji (fluent API).
        }
    }
}