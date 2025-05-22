// Extensions/MiddlewarePipelineExtensions.cs
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting; // Dla IHostEnvironment, używane przez app.Environment.IsDevelopment()
using Microsoft.Extensions.DependencyInjection; // Jeśli potrzebujesz tu dostępu do usług, np. dla niestandardowego middleware

namespace BackendApp.Extensions // Upewnij się, że przestrzeń nazw jest poprawna
{
    public static class MiddlewarePipelineExtensions // Klasa musi być public static
    {
        // Metoda rozszerzająca dla WebApplication
        public static WebApplication ConfigureMiddlewarePipeline(this WebApplication app, bool isDevelopment) // Metoda public static, "this"
        {
            // Konfiguracja CORS - ważne, aby była na początku dla niektórych scenariuszy
            app.UseCors(corsBuilder => corsBuilder
                .AllowAnyOrigin() // Dostosuj do swoich potrzeb w produkcji
                .AllowAnyMethod()
                .AllowAnyHeader());

            // Serwowanie plików statycznych i domyślnych (np. index.html)
            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Swagger UI tylko w środowisku deweloperskim
            if (isDevelopment)
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection(); // Przekierowanie HTTP na HTTPS

            app.UseRouting(); // Kluczowe dla działania endpointów

            app.UseAuthentication(); // Włączenie autentykacji
            app.UseAuthorization();  // Włączenie autoryzacji

            // app.MapGraphQL(); // Było w Program.cs, możesz je przenieść tutaj jeśli wolisz,
            // ale jako że to mapowanie endpointu, zostawienie w Program.cs jest też OK.

            return app; // Zwracanie app jest opcjonalne, ale spójne
        }
    }
}