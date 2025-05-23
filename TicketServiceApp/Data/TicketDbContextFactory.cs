using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design; // Dla IDesignTimeDbContextFactory
using Microsoft.Extensions.Configuration;   // Dla IConfiguration, ConfigurationBuilder
using System.IO;                            // Dla Directory.GetCurrentDirectory()

namespace TicketServiceApp.Data
{
    /// <summary>
    /// Fabryka kontekstu bazy danych używana przez narzędzia Entity Framework Core w czasie projektowania (np. do tworzenia migracji).
    /// Umożliwia narzędziom EF Core utworzenie instancji DbContext poza środowiskiem uruchomieniowym aplikacji.
    /// </summary>
    public class TicketDbContextFactory : IDesignTimeDbContextFactory<TicketDbContext>
    {
        /// <summary>
        /// Tworzy i konfiguruje nową instancję TicketDbContext.
        /// Ta metoda jest wywoływana przez narzędzia EF Core.
        /// </summary>
        /// <param name="args">Argumenty przekazywane z wiersza poleceń (zazwyczaj nieużywane w prostych scenariuszach).</param>
        /// <returns>Skonfigurowana instancja TicketDbContext.</returns>
        public TicketDbContext CreateDbContext(string[] args)
        {
            // Budowanie konfiguracji aplikacji w celu odczytania connection stringa.
            // Odczytuje ustawienia z appsettings.json, appsettings.{Environment}.json oraz zmiennych środowiskowych.
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory()) // Ustawia bazową ścieżkę do katalogu bieżącego projektu.
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true) // Główny plik konfiguracyjny.
                // Opcjonalny plik konfiguracyjny dla danego środowiska (np. Development, Production).
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true)
                .AddEnvironmentVariables() // Odczytuje zmienne środowiskowe.
                .Build();

            // Tworzenie opcji dla DbContext.
            var optionsBuilder = new DbContextOptionsBuilder<TicketDbContext>();
            // Pobranie connection stringa o nazwie "TicketDbConnection" z konfiguracji.
            var connectionString = configuration.GetConnectionString("TicketDbConnection");

            // Sprawdzenie, czy connection string został znaleziony.
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'TicketDbConnection' not found in appsettings.json.");
            }

            // Konfiguracja DbContext do używania SQLite z odczytanym connection stringiem.
            optionsBuilder.UseSqlite(connectionString);

            // Zwrócenie nowej instancji TicketDbContext ze skonfigurowanymi opcjami.
            return new TicketDbContext(optionsBuilder.Options);
        }
    }
}