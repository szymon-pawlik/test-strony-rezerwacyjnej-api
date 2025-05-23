using BackendApp.Data;
using BackendApp.Models;
using Microsoft.EntityFrameworkCore; // Dla metod EF Core jak FindAsync, ToListAsync, AnyAsync
using Microsoft.Extensions.Logging;  // Dla ILogger
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    /// <summary>
    /// Serwis odpowiedzialny za logikę biznesową związaną z mieszkaniami.
    /// Implementuje interfejs IApartmentService.
    /// </summary>
    public class ApartmentService : IApartmentService
    {
        private readonly AppDbContext _context; // Kontekst bazy danych
        private readonly ILogger<ApartmentService> _logger; // Logger do zapisywania informacji

        // Konstruktor wstrzykujący zależności (DbContext i Logger).
        public ApartmentService(AppDbContext context, ILogger<ApartmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // --- Asynchroniczne metody CRUD dla mieszkań ---

        public async Task<Apartment?> GetApartmentByIdAsync(Guid id)
        {
            _logger.LogInformation("[ApartmentService] Attempting to fetch apartment with ID: {ApartmentId}", id);
            var apartment = await _context.Apartments.FindAsync(id);
            if (apartment == null)
            {
                _logger.LogWarning("[ApartmentService] Apartment with ID {ApartmentId} NOT FOUND in BackendApp's database.", id);
            }
            else
            {
                _logger.LogInformation("[ApartmentService] Apartment with ID {ApartmentId} FOUND: {ApartmentName}", id, apartment.Name);
            }
            return apartment;
        }

        public async Task<IEnumerable<Apartment>> GetAllApartmentsAsync()
        {
            _logger.LogInformation("[ApartmentService] Fetching all apartments.");
            return await _context.Apartments.ToListAsync();
        }

        public async Task<Apartment> CreateApartmentAsync(Apartment apartment)
        {
            _logger.LogInformation("[ApartmentService] Creating new apartment: {ApartmentName}", apartment.Name);
            _context.Apartments.Add(apartment);
            await _context.SaveChangesAsync();
            _logger.LogInformation("[ApartmentService] Apartment created with ID: {ApartmentId}", apartment.Id);
            return apartment;
        }

        public async Task<Apartment?> UpdateApartmentAsync(Guid id, Apartment apartment)
        {
            _logger.LogInformation("[ApartmentService] Attempting to update apartment with ID: {ApartmentId}", id);
            var existingApartment = await _context.Apartments.FindAsync(id);
            if (existingApartment == null)
            {
                _logger.LogWarning("[ApartmentService] Update failed. Apartment with ID {ApartmentId} NOT FOUND.", id);
                return null;
            }

            // Aktualizacja istniejącej encji przy użyciu wyrażenia 'with' (dla rekordów)
            // i jawne zarządzanie stanem śledzenia przez EF Core.
            var updatedApartment = existingApartment with
            {
                Name = apartment.Name,
                Description = apartment.Description,
                Location = apartment.Location,
                NumberOfBedrooms = apartment.NumberOfBedrooms,
                NumberOfBathrooms = apartment.NumberOfBathrooms,
                Amenities = apartment.Amenities,
                IsAvailable = apartment.IsAvailable,
                PricePerNight = apartment.PricePerNight
            };

            _context.Entry(existingApartment).State = EntityState.Detached; // Odłączenie oryginalnej encji
            updatedApartment = updatedApartment with { Id = id }; // Upewnienie się, że ID jest poprawne
            _context.Apartments.Update(updatedApartment); // Rozpoczęcie śledzenia zaktualizowanej encji

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("[ApartmentService] Apartment with ID {ApartmentId} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException ex) // Obsługa konfliktów współbieżności
            {
                _logger.LogError(ex, "[ApartmentService] Concurrency exception while updating apartment ID {ApartmentId}.", id);
                if (!await _context.Apartments.AnyAsync(e => e.Id == id)) // Sprawdzenie, czy encja nadal istnieje
                {
                    return null; // Encja została usunięta przez inny proces
                }
                else
                {
                    throw; // Rzucenie wyjątku dalej, jeśli encja istnieje, ale wystąpił inny błąd współbieżności
                }
            }
            return updatedApartment;
        }

        public async Task<bool> DeleteApartmentAsync(Guid id)
        {
            _logger.LogInformation("[ApartmentService] Attempting to delete apartment with ID: {ApartmentId}", id);
            var apartment = await _context.Apartments.FindAsync(id);
            if (apartment == null)
            {
                _logger.LogWarning("[ApartmentService] Delete failed. Apartment with ID {ApartmentId} NOT FOUND.", id);
                return false;
            }

            _context.Apartments.Remove(apartment);
            await _context.SaveChangesAsync();
            _logger.LogInformation("[ApartmentService] Apartment with ID {ApartmentId} deleted successfully.", id);
            return true;
        }

        // --- Synchroniczne metody (potencjalnie starsze lub do specyficznych zastosowań) ---
        // W aplikacjach webowych preferowane są metody asynchroniczne.

        public IEnumerable<Apartment> GetAllApartments()
        {
            return _context.Apartments.ToList();
        }

        public Apartment? GetApartmentById(Guid id)
        {
            return _context.Apartments.Find(id);
        }
         public Apartment AddApartment(Apartment apartment)
        {
            _context.Apartments.Add(apartment);
            _context.SaveChanges();
            return apartment;
        }
    }
}