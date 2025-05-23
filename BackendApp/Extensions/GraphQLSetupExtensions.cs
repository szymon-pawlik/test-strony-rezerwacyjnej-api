using BackendApp.GraphQL.Queries;   // Zawiera główny typ Query dla GraphQL
using BackendApp.GraphQL.Mutations; // Zawiera główny typ Mutation dla GraphQL
using BackendApp.GraphQL.Types;     // Zawiera definicje niestandardowych typów GraphQL (np. ApartmentType)
using HotChocolate.Types;           // Dla NodeType, jeśli jest używany bezpośrednio (często HotChocolate.Types.Relay)
using Microsoft.Extensions.DependencyInjection; // Dla IServiceCollection i metod rozszerzających

namespace BackendApp.Extensions
{
    /// <summary>
    /// Klasa statyczna zawierająca metody rozszerzające do konfiguracji serwera GraphQL.
    /// </summary>
    public static class GraphQLSetupExtensions
    {
        /// <summary>
        /// Dodaje i konfiguruje serwer GraphQL (HotChocolate) do kontenera usług.
        /// </summary>
        /// <param name="services">Kolekcja usług aplikacji.</param>
        /// <param name="isDevelopmentEnvironment">Flaga wskazująca, czy aplikacja działa w środowisku deweloperskim.</param>
        /// <returns>Ta sama kolekcja usług, umożliwiająca dalsze konfigurowanie.</returns>
        public static IServiceCollection AddAppGraphQL(this IServiceCollection services, bool isDevelopmentEnvironment)
        {
            // Rejestracja i konfiguracja serwera GraphQL.
            services
                .AddGraphQLServer() // Inicjalizuje budowniczego serwera GraphQL.

                // Integracja z systemem autoryzacji ASP.NET Core.
                // Umożliwia stosowanie atrybutów [Authorize] na polach i typach GraphQL.
                .AddAuthorization()

                // Rejestracja głównych typów operacji GraphQL.
                .AddQueryType<Query>(d => d.Name("Query")) // Rejestruje główny typ zapytań (Query).
                .AddMutationType<Mutation>()               // Rejestruje główny typ mutacji (Mutation).

                // Rejestracja niestandardowych typów obiektów GraphQL.
                // Mapują one modele domenowe na typy zrozumiałe dla schematu GraphQL.
                .AddType<ApartmentType>()
                .AddType<BookingType>()
                .AddType<ReviewType>()
                .AddType<UserType>()

                // Rejestracja interfejsu Node, kluczowego dla globalnej identyfikacji obiektów (Relay spec).
                // Pozwala to na jednoznaczne identyfikowanie i pobieranie dowolnego obiektu w grafie.
                .AddType<NodeType>() // Zazwyczaj HotChocolate.Types.Relay.NodeObjectType lub podobny, jeśli używasz Relay.
                .AddGlobalObjectIdentification() // Włącza mechanizm globalnej identyfikacji obiektów.

                // Dodanie wsparcia dla zaawansowanych funkcji zapytań.
                .AddProjections()  // Umożliwia optymalizację zapytań do bazy danych poprzez wybieranie tylko potrzebnych kolumn (tzw. "projekcje").
                .AddFiltering()    // Dodaje możliwość filtrowania wyników zapytań (np. WHERE clauses).
                .AddSorting()      // Dodaje możliwość sortowania wyników zapytań (np. ORDER BY clauses).

                // Konfiguracja opcji żądania GraphQL.
                .ModifyRequestOptions(opt =>
                    // Włącza szczegółowe informacje o wyjątkach w odpowiedziach GraphQL,
                    // ale tylko w środowisku deweloperskim (dla łatwiejszego debugowania).
                    opt.IncludeExceptionDetails = isDevelopmentEnvironment);

            return services; // Umożliwia łączenie wywołań konfiguracji.
        }
    }
}