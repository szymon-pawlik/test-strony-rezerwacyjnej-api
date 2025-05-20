using BackendApp.Data;
using BackendApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Dodaj ten using
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public class ApartmentService : IApartmentService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ApartmentService> _logger; // Dodane pole loggera

        // Zmodyfikowany konstruktor do wstrzyknięcia ILogger
        public ApartmentService(AppDbContext context, ILogger<ApartmentService> logger)
        {
            _context = context;
            _logger = logger; // Przypisanie loggera
        }

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
            
            _context.Entry(existingApartment).State = EntityState.Detached;
            updatedApartment = updatedApartment with { Id = id };
            _context.Apartments.Update(updatedApartment);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("[ApartmentService] Apartment with ID {ApartmentId} updated successfully.", id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "[ApartmentService] Concurrency exception while updating apartment ID {ApartmentId}.", id);
                if (!await _context.Apartments.AnyAsync(e => e.Id == id))
                {
                    return null;
                }
                else
                {
                    throw;
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

        // Synchroniczne metody - pozostawiam bez logowania dla zwięzłości,
        // ale w razie potrzeby można dodać analogicznie
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