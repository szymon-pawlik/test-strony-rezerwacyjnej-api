using BackendApp.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IReviewService
    {
        Task<Review?> GetReviewByIdAsync(Guid id);
        Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId);
        Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId);
        Task<Review> CreateReviewAsync(Review review);
    }
}