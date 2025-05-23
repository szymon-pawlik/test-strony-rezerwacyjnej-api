using System;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendApp.Models;
using BackendApp.Services;
using BackendApp.GraphQL.Mutations.Inputs; // Zawiera UpdateUserProfileInput
using BackendApp.GraphQL.Payloads;       // Zawiera UserPayload i UserError
using HotChocolate;                      // Dla atrybutu [Service]
using HotChocolate.AspNetCore.Authorization; // Używane dla [Authorize] (choć tu używamy też Microsoft.AspNetCore.Authorization)
using Microsoft.AspNetCore.Authorization;    // Używane dla atrybutu [Authorize]
using Microsoft.Extensions.Logging;          // Dla ILogger

namespace BackendApp.GraphQL.Mutations
{
    /// <summary>
    /// Zawiera mutacje GraphQL związane z zarządzaniem profilem użytkownika.
    /// </summary>
    public partial class Mutation // Klasa częściowa
    {
        [Authorize] // Wymaga zalogowanego użytkownika
        public async Task<UserPayload> UpdateUserProfileAsync(
            UpdateUserProfileInput input,         // Dane wejściowe do aktualizacji profilu
            [Service] IUserService userService, // Wstrzykiwany serwis użytkownika
            ClaimsPrincipal claimsPrincipal)    // Informacje o zalogowanym użytkowniku
        {
            // Sprawdzenie, czy tożsamość użytkownika jest dostępna i czy jest uwierzytelniony
            if (claimsPrincipal.Identity == null || !claimsPrincipal.Identity.IsAuthenticated)
            {
                return new UserPayload(new UserError("User not authenticated (identity missing).", "AUTH_ERROR_IDENTITY"));
            }

            // Pobranie ID użytkownika z oświadczeń (claims)
            var userIdString = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return new UserPayload(new UserError("Invalid user identifier in token.", "AUTH_INVALID_ID"));
            }

            // Wywołanie serwisu do aktualizacji profilu użytkownika
            var (updatedUser, errorMessage) = await userService.UpdateUserProfileAsync(userId, input);

            // Obsługa błędów zwróconych przez serwis
            if (!string.IsNullOrEmpty(errorMessage))
            {
                string errorCode = "UPDATE_PROFILE_ERROR"; // Domyślny kod błędu
                // Przypisanie bardziej szczegółowego kodu błędu na podstawie komunikatu
                if (errorMessage.Contains("Email already taken")) errorCode = "EMAIL_TAKEN";
                else if (errorMessage.Contains("User not found")) errorCode = "USER_NOT_FOUND";
                return new UserPayload(new UserError(errorMessage, errorCode));
            }

            // Jeśli użytkownik nie został zaktualizowany (np. nie znaleziono, a serwis nie zwrócił konkretnego błędu)
            if (updatedUser == null)
            {
                 return new UserPayload(new UserError("User not found or update failed.", "USER_UPDATE_FAILED"));
            }

            // Zwrócenie payloadu z zaktualizowanymi danymi użytkownika
            return new UserPayload(updatedUser);
        }
    }
}