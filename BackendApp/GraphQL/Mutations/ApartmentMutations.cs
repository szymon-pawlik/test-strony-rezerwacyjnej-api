using System;
using System.Collections.Generic; // Dla List<string>
using System.Threading.Tasks;    // Dla Task<T>
using BackendApp.Models;         // Zawiera model Apartment oraz UserRoles
using BackendApp.Services;       // Zawiera interfejs IApartmentService
using BackendApp.GraphQL.Mutations.Inputs; // Zawiera rekordy AddApartmentInput i UpdateApartmentInput
using HotChocolate;              // Dla atrybutu [Service] do wstrzykiwania zależności
using HotChocolate.AspNetCore.Authorization; // Dla atrybutu [Authorize] specyficznego dla HotChocolate (choć tutaj używamy Microsoft.AspNetCore.Authorization)
using Microsoft.AspNetCore.Authorization; // Używane dla atrybutu [Authorize]
using Microsoft.Extensions.Logging;      // Dla ILogger do logowania informacji

namespace BackendApp.GraphQL.Mutations
{
    /// <summary>
    /// Klasa częściowa (partial class) zawierająca mutacje GraphQL
    /// związane z zarządzaniem mieszkaniami (Apartments).
    /// Mutacje te pozwalają na modyfikację danych (tworzenie, aktualizacja, usuwanie).
    /// </summary>
    public partial class Mutation // Definicja klasy częściowej, która będzie łączona z innymi plikami 'Mutation.cs'
    {
        /// <summary>
        /// Mutacja GraphQL do dodawania nowego mieszkania.
        /// Wymaga, aby użytkownik wykonujący tę mutację posiadał rolę administratora.
        /// </summary>
        /// <param name="input">Dane wejściowe dla nowego mieszkania (zgodne z AddApartmentInput).</param>
        /// <param name="apartmentService">Serwis do zarządzania mieszkaniami, wstrzykiwany przez HotChocolate ([Service]).</param>
        /// <returns>Nowo utworzony obiekt Apartment.</returns>
        [Authorize(BackendApp.Models.UserRoles.Admin)] // Atrybut autoryzacji: tylko użytkownicy z rolą Admin mogą wykonać tę mutację.
                                                        // UserRoles.Admin powinno być zdefiniowane w BackendApp.Models.
        public async Task<Apartment> AddApartmentAsync(
            AddApartmentInput input,             // Parametr wejściowy mutacji, mapowany z argumentów GraphQL.
            [Service] IApartmentService apartmentService) // Wstrzykiwanie serwisu IApartmentService. HotChocolate automatycznie rozwiąże tę zależność.
        {
            // Logowanie informacji o wywołaniu mutacji (używa ILogger wstrzykniętego w głównym pliku Mutation.cs).
            _logger.LogInformation("AddApartmentAsync: Mutation called.");

            // Tworzenie nowej instancji modelu Apartment na podstawie danych wejściowych.
            var apartment = new Apartment(
                Guid.NewGuid(), // Generowanie nowego, unikalnego ID dla mieszkania.
                input.Name,
                input.Description,
                input.Location,
                input.NumberOfBedrooms,
                input.NumberOfBathrooms,
                input.Amenities,
                input.IsAvailable,
                input.PricePerNight
            );
            // Wywołanie metody serwisu do utworzenia mieszkania w bazie danych.
            return await apartmentService.CreateApartmentAsync(apartment);
        }

        /// <summary>
        /// Mutacja GraphQL do aktualizowania istniejącego mieszkania.
        /// Wymaga roli administratora.
        /// </summary>
        /// <param name="input">Dane wejściowe do aktualizacji mieszkania (zgodne z UpdateApartmentInput).
        /// Zawiera ID mieszkania do zaktualizowania oraz opcjonalne pola do zmiany.</param>
        /// <param name="apartmentService">Serwis do zarządzania mieszkaniami.</param>
        /// <returns>Zaktualizowany obiekt Apartment lub null, jeśli mieszkanie o podanym ID nie istnieje.</returns>
        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<Apartment?> UpdateApartmentAsync( // Znak '?' oznacza, że zwracany typ może być null.
            UpdateApartmentInput input,
            [Service] IApartmentService apartmentService)
        {
            _logger.LogInformation("UpdateApartmentAsync: Mutation called for ApartmentId {ApartmentId}", input.Id);

            // Pobranie istniejącego mieszkania z bazy danych.
            var existingApartment = await apartmentService.GetApartmentByIdAsync(input.Id);
            if (existingApartment == null)
            {
                _logger.LogWarning("UpdateApartmentAsync: Apartment with ID {ApartmentId} not found.", input.Id);
                return null; // Jeśli mieszkanie nie istnieje, zwróć null.
            }

            // Tworzenie zaktualizowanego obiektu mieszkania.
            // Użycie wyrażenia 'with' (dostępnego dla rekordów i struktur w C# 9+)
            // pozwala na utworzenie nowej instancji z zmodyfikowanymi wartościami,
            // zachowując pozostałe wartości z `existingApartment`.
            // `input.PropertyName.HasValue` sprawdza, czy dana opcjonalna wartość została przekazana w inpucie.
            var updated = existingApartment with
            {
                Name = input.Name.HasValue ? input.Name.Value : existingApartment.Name,
                Description = input.Description.HasValue ? input.Description.Value : existingApartment.Description,
                Location = input.Location.HasValue ? input.Location.Value : existingApartment.Location,
                NumberOfBedrooms = input.NumberOfBedrooms.HasValue ? input.NumberOfBedrooms.Value : existingApartment.NumberOfBedrooms,
                NumberOfBathrooms = input.NumberOfBathrooms.HasValue ? input.NumberOfBathrooms.Value : existingApartment.NumberOfBathrooms,
                Amenities = input.Amenities.HasValue ? input.Amenities.Value : existingApartment.Amenities,
                IsAvailable = input.IsAvailable.HasValue ? input.IsAvailable.Value : existingApartment.IsAvailable,
                PricePerNight = input.PricePerNight.HasValue ? input.PricePerNight.Value : existingApartment.PricePerNight
            };

            // Wywołanie metody serwisu do zaktualizowania mieszkania w bazie danych.
            return await apartmentService.UpdateApartmentAsync(input.Id, updated);
        }

        /// <summary>
        /// Mutacja GraphQL do usuwania mieszkania o podanym ID.
        /// Wymaga roli administratora.
        /// </summary>
        /// <param name="id">ID mieszkania (GUID) do usunięcia.</param>
        /// <param name="apartmentService">Serwis do zarządzania mieszkaniami.</param>
        /// <returns>Wartość logiczna wskazująca, czy operacja usunięcia powiodła się (`true`) czy nie (`false`).</returns>
        [Authorize(BackendApp.Models.UserRoles.Admin)]
        public async Task<bool> DeleteApartmentAsync(
            Guid id, // ID mieszkania przekazywane jako argument GraphQL.
            [Service] IApartmentService apartmentService)
        {
            _logger.LogInformation("DeleteApartmentAsync: Mutation called for ApartmentId {ApartmentId}", id);
            // Wywołanie metody serwisu do usunięcia mieszkania.
            return await apartmentService.DeleteApartmentAsync(id);
        }
    }
}