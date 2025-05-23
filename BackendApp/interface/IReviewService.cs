
using BackendApp.Models; 
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{


    public record CreateReviewDto(
        Guid ApartmentId,
        int Rating,
        string? Comment 
    );

    public interface IReviewService
    {
        Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId);

        Task<Review?> CreateReviewAsync(CreateReviewDto reviewDto, Guid authenticatedUserId);

        Task<Review?> GetReviewByIdAsync(Guid reviewId);

        Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId, string? token);

        Task<bool> DeleteReviewAsync(Guid reviewId);
    }
}