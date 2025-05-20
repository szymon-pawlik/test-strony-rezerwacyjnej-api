using BackendApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IApartmentService
    {
        Task<Apartment?> GetApartmentByIdAsync(Guid id);
        Task<IEnumerable<Apartment>> GetAllApartmentsAsync();
        Task<Apartment> CreateApartmentAsync(Apartment apartment);
        Task<Apartment?> UpdateApartmentAsync(Guid id, Apartment apartment);
        Task<bool> DeleteApartmentAsync(Guid id);
    }
}