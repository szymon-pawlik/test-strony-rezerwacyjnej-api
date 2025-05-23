using Microsoft.AspNetCore.Builder;     // Dla WebApplication i metod rozszerzających Use...
using Microsoft.Extensions.Hosting;     // Dla IHostEnvironment (choć tu używamy bool isDevelopment)
using Microsoft.Extensions.DependencyInjection; // Potencjalnie dla metod rozszerzających (choć nieużywane bezpośrednio tutaj)

namespace BackendApp.Extensions
{
    /// <summary>
    /// Klasa statyczna zawierająca metody rozszerzające dla WebApplication,
    /// służące do konfiguracji potoku przetwarzania żądań HTTP (middleware pipeline).
    /// </summary>
    public static class MiddlewarePipelineExtensions
    {
        /// <summary>
        /// Konfiguruje potok middleware dla aplikacji ASP.NET Core.
        /// Kolejność dodawania middleware ma znaczenie.
        /// </summary>
        /// <param name="app">Instancja WebApplication do skonfigurowania.</param>
        /// <param name="isDevelopment">Flaga wskazująca, czy aplikacja działa w środowisku deweloperskim.</param>
        /// <returns>Ta sama instancja WebApplication, umożliwiająca dalsze konfigurowanie.</returns>
        public static WebApplication ConfigureMiddlewarePipeline(this WebApplication app, bool isDevelopment)
        {
            // Konfiguracja CORS (Cross-Origin Resource Sharing).
            // Poniższa polityka jest bardzo otwarta (zezwala na wszystko) i jest typowa dla środowisk deweloperskich.
            // W środowisku produkcyjnym należy ją odpowiednio zawęzić.
            app.UseCors(corsBuilder => corsBuilder
                .AllowAnyOrigin()  // Zezwala na żądania z dowolnego źródła.
                .AllowAnyMethod()  // Zezwala na dowolne metody HTTP (GET, POST, PUT, DELETE, etc.).
                .AllowAnyHeader()); // Zezwala na dowolne nagłówki HTTP.

            // Konfiguracja serwowania plików statycznych.
            // UseDefaultFiles musi być przed UseStaticFiles, aby np. żądanie do katalogu serwowało index.html.
            app.UseDefaultFiles(); // Umożliwia serwowanie domyślnych plików (np. index.html) dla katalogów.
            app.UseStaticFiles();  // Umożliwia serwowanie plików statycznych z katalogu wwwroot.

            // Konfiguracja Swagger/OpenAPI tylko dla środowiska deweloperskiego.
            // Ułatwia testowanie i dokumentowanie API.
            if (isDevelopment)
            {
                app.UseSwagger(); // Włącza middleware generujący dokument JSON Swaggera.
                app.UseSwaggerUI(); // Włącza middleware serwujący interfejs użytkownika Swaggera.
            }

            // Przekierowuje żądania HTTP na HTTPS, zwiększając bezpieczeństwo.
            app.UseHttpsRedirection();

            // Dodaje middleware do obsługi routingu, czyli dopasowywania żądań do odpowiednich endpointów.
            app.UseRouting();

            // Dodaje middleware uwierzytelniania. Próbuje zidentyfikować użytkownika na podstawie żądania (np. tokenu JWT).
            app.UseAuthentication();
            // Dodaje middleware autoryzacji. Sprawdza, czy uwierzytelniony użytkownik ma uprawnienia do dostępu do danego zasobu.
            app.UseAuthorization();

            // Zwrócenie instancji aplikacji, aby umożliwić dalsze łączenie konfiguracji.
            return app;
        }
    }
}