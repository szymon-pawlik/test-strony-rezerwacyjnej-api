using BackendApp.Models; // Upewnij się, że przestrzeń nazw dla UserRoles jest poprawna
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace BackendApp.Extensions
{
    public static class AuthorizationSetupExtensions
    {
        public static IServiceCollection AddAppAuthorization(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                // Polityka dla uwierzytelnionych użytkowników (dowolna rola)
                options.AddPolicy("AuthenticatedUserPolicy", policy => 
                    policy.RequireAuthenticatedUser());

                // Polityka dla roli Administratora
                options.AddPolicy("AdminPolicy", policy => 
                    policy.RequireRole(UserRoles.Admin)); 

                // Polityka dla roli Użytkownika (jeśli potrzebujesz specyficznej polityki poza ogólnym uwierzytelnieniem)
                options.AddPolicy("UserPolicy", policy => 
                    policy.RequireRole(UserRoles.User));   
            });

            return services;
        }
    }
}