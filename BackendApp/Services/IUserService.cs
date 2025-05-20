using BackendApp.Models;
using BackendApp.GraphQL.Mutations.Inputs; // Dodaj ten using dla UpdateUserProfileInput
using System;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(Guid id);

        // --- NOWA METODA ---
        Task<User?> UpdateUserProfileAsync(Guid userId, UpdateUserProfileInput input);
        // --- KONIEC NOWEJ METODY ---
    }
}