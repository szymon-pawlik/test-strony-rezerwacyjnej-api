using BackendApp.Data;
using BackendApp.Models;
using BackendApp.GraphQL.Mutations.Inputs; // Dodaj ten using
using Microsoft.EntityFrameworkCore; // Dla AnyAsync, jeśli będziesz sprawdzał unikalność emaila
using System;
using System.Threading.Tasks;
// using System.Linq; // Jeśli będziesz używał Linq np. do sprawdzania unikalności emaila

namespace BackendApp.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        // --- NOWA METODA ---
        public async Task<User?> UpdateUserProfileAsync(Guid userId, UpdateUserProfileInput input)
        {
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return null; // Użytkownik nie znaleziony
            }

            bool changed = false;

            // Aktualizuj tylko te pola, które zostały przekazane w inpucie
            if (input.Name.HasValue)
            {
                user = user with { Name = input.Name.Value };
                changed = true;
            }

            if (input.Email.HasValue)
            {
                // TODO: Dodaj walidację unikalności emaila, jeśli jest wymagana
                // np. if (await _context.Users.AnyAsync(u => u.Email == input.Email.Value && u.Id != userId))
                //     { throw new ApplicationException("Email already taken."); } // Lub zwróć błąd w inny sposób
                user = user with { Email = input.Email.Value };
                changed = true;
            }

            // Dodaj aktualizację innych pól z UpdateUserProfileInput, jeśli je zdefiniowałeś
            // np. if (input.Bio.HasValue) { user = user with { Bio = input.Bio.Value }; changed = true; }

            if (changed)
            {
                _context.Users.Update(user); // EF Core śledzi zmiany dla rekordów
                await _context.SaveChangesAsync();
            }

            return user;
        }
    }
}