using BackendApp.Data;
using BackendApp.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public class ApartmentService : IApartmentService
    {
        private readonly AppDbContext _context;

        public ApartmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Apartment?> GetApartmentByIdAsync(Guid id)
        {
            return await _context.Apartments.FindAsync(id);
        }

        public async Task<IEnumerable<Apartment>> GetAllApartmentsAsync()
        {
            return await _context.Apartments.ToListAsync();
        }

        public async Task<Apartment> CreateApartmentAsync(Apartment apartment)
        {
            _context.Apartments.Add(apartment);
            await _context.SaveChangesAsync();
            return apartment;
        }

        public async Task<Apartment?> UpdateApartmentAsync(Guid id, Apartment apartment)
        {
            var existingApartment = await _context.Apartments.FindAsync(id);
            if (existingApartment == null)
            {
                return null;
            }

            // Aktualizujemy wartości z 'apartment' do 'existingApartment'
            // Używając 'with' expression dla rekordów, jeśli chcemy stworzyć nową instancję
            // lub bezpośrednio modyfikując, jeśli EF Core śledzi zmiany.
            // Dla uproszczenia i śledzenia przez EF Core, użyjemy SetValues.
            // Upewnij się, że apartment.Id jest takie samo jak id, lub obsłuż to inaczej.
            // Rekordy są niemutowalne, więc musimy stworzyć nowy lub użyć EF Core do śledzenia.
            // _context.Entry(existingApartment).CurrentValues.SetValues(apartment);
            // Powyższe może nie działać idealnie z rekordami init-only, jeśli EF Core nie jest skonfigurowany.

            // Bezpieczniejsza metoda dla rekordów, jeśli nie chcemy polegać na SetValues
            // lub jeśli niektóre pola nie powinny być kopiowane (np. ID)
            var updatedApartment = existingApartment with
            {
                Name = apartment.Name,
                Description = apartment.Description,
                Location = apartment.Location,
                NumberOfBedrooms = apartment.NumberOfBedrooms,
                NumberOfBathrooms = apartment.NumberOfBathrooms,
                Amenities = apartment.Amenities, // Uwaga: to przypisuje referencję listy
                IsAvailable = apartment.IsAvailable,
                PricePerNight = apartment.PricePerNight
            };
            // Jeśli EF Core nie śledzi 'updatedApartment' jako tej samej encji co 'existingApartment',
            // może być potrzebne bardziej zaawansowane podejście.
            // Najprościej:
            _context.Entry(existingApartment).State = EntityState.Detached; // Przestań śledzić stary
            updatedApartment = updatedApartment with { Id = id }; // Upewnij się, że ID jest poprawne
            _context.Apartments.Update(updatedApartment); // Zacznij śledzić nowy jako zaktualizowany


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Apartments.AnyAsync(e => e.Id == id))
                {
                    return null;
                }
                else
                {
                    throw;
                }
            }
            return updatedApartment; // Zwracamy zaktualizowany rekord
        }

        public async Task<bool> DeleteApartmentAsync(Guid id)
        {
            var apartment = await _context.Apartments.FindAsync(id);
            if (apartment == null)
            {
                return false;
            }

            _context.Apartments.Remove(apartment);
            await _context.SaveChangesAsync();
            return true;
        }

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