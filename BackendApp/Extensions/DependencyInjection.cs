// Extensions/DependencyInjectionExtensions.cs
using BackendApp.Data;
using BackendApp.Services;
using BackendApp.Validators;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; // Dodaj ten using dla IConfiguration
using Microsoft.Extensions.DependencyInjection; // Dodaj ten using dla IServiceCollection

namespace BackendApp.Extensions
{
    public static class DependencyInjectionExtensions
    {
        // Twoja istniejąca metoda, która jest świetna!
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IApartmentService, ApartmentService>();
            services.AddScoped<IBookingService, BookingService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddHttpContextAccessor();

            services.AddValidatorsFromAssemblyContaining<ApartmentValidator>();

            return services;
        }

        public static IServiceCollection AddAppCors(this IServiceCollection services)
        {
            services.AddCors(); // Podstawowa rejestracja, konfiguracja CORS dla potoku jest w MiddlewarePipelineExtensions
            return services;
        }

        public static IServiceCollection AddSwaggerAndApiExplorer(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            return services;
        }
    }
}