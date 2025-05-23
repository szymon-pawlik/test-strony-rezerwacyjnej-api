using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;

namespace BackendApp.GraphQL.Mutations
{
    /// <summary>
    /// Główny typ agregujący wszystkie mutacje GraphQL w aplikacji.
    /// Definicje poszczególnych mutacji znajdują się w plikach częściowych (partial).
    /// </summary>
    public partial class Mutation // Zmieniono na partial
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<Mutation> _logger;

        // Konstruktor wstrzykujący współdzielone zależności.
        public Mutation(IHttpContextAccessor httpContextAccessor, ILogger<Mutation> logger)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
    }
}