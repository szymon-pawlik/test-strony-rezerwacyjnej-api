using BackendApp.Data;          // Dla AppDbContext
using BackendApp.Services;      // Dla interfejsów i implementacji serwisów
using BackendApp.Validators;    // Dla klas walidatorów (np. ApartmentValidator)
using FluentValidation;         // Dla AddValidatorsFromAssemblyContaining
using Microsoft.EntityFrameworkCore; // Dla UseSqlite i AddDbContext
using Microsoft.Extensions.Configuration; // Dla IConfiguration
using Microsoft.Extensions.DependencyInjection; // Dla IServiceCollection i metod rozszerzających

namespace BackendApp.Extensions
{
    /// <summary>
    /// Klasa statyczna zawierająca metody rozszerzające dla IServiceCollection,
    /// używane do konfiguracji wstrzykiwania zależności (DI) w aplikacji.
    /// </summary>
    public static class DependencyInjectionExtensions
    {
        /// <summary>
        /// Rejestruje podstawowe usługi aplikacyjne w kontenerze DI.
        /// Obejmuje to kontekst bazy danych, serwisy biznesowe, walidatory i inne.
        /// </summary>
        /// <param name="services">Kolekcja usług aplikacji.</param>
        /// <param name="configuration">Konfiguracja aplikacji (do odczytu np. connection stringów).</param>
        /// <returns>Ta sama kolekcja usług dla umożliwienia łączenia wywołań.</returns>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Rejestracja kontekstu bazy danych (AppDbContext) z użyciem SQLite.
            // Connection string jest pobierany z konfiguracji aplikacji.
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

            // Rejestracja serwisów aplikacyjnych z czasem życia "scoped".
            // Oznacza to, że instancja serwisu jest tworzona raz na żądanie HTTP.
            services.AddScoped<IApartmentService, ApartmentService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<ITokenService, TokenService>();

            // Rejestracja IHttpContextAccessor, który umożliwia dostęp do HttpContext
            // w serwisach, gdzie bezpośrednie wstrzyknięcie nie jest możliwe lub pożądane.
            services.AddHttpContextAccessor();

            // Rejestracja wszystkich walidatorów FluentValidation znajdujących się
            // w tym samym assembly (projekcie) co klasa ApartmentValidator.
            services.AddValidatorsFromAssemblyContaining<ApartmentValidator>();

            return services;
        }

        /// <summary>
        /// Dodaje podstawowe usługi CORS (Cross-Origin Resource Sharing) do kontenera DI.
        /// Polityki CORS są konfigurowane oddzielnie (np. w Startup.cs lub Program.cs).
        /// </summary>
        /// <param name="services">Kolekcja usług aplikacji.</param>
        /// <returns>Ta sama kolekcja usług.</returns>
        public static IServiceCollection AddAppCors(this IServiceCollection services)
        {
            services.AddCors(); // Rejestruje usługi CORS.
            return services;
        }

        /// <summary>
        /// Dodaje usługi niezbędne do generowania dokumentacji API Swagger/OpenAPI.
        /// </summary>
        /// <param name="services">Kolekcja usług aplikacji.</param>
        /// <returns>Ta sama kolekcja usług.</returns>
        public static IServiceCollection AddSwaggerAndApiExplorer(this IServiceCollection services)
        {
            // Dodaje usługi eksploratora API, używane m.in. przez Swagger do odkrywania endpointów.
            services.AddEndpointsApiExplorer();
            // Dodaje generator Swaggera, który tworzy dokumentację OpenAPI na podstawie kodu.
            services.AddSwaggerGen();
            return services;
        }
    }
}