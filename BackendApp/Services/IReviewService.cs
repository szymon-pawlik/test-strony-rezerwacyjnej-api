using BackendApp.Models;
using BackendApp.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public interface IReviewService
    {
        Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId);
        Task<Review?> CreateReviewAsync(CreateReviewDtoInBackendApp reviewDto, string? userToken);
        Task<Review?> GetReviewByIdAsync(Guid reviewId, string? userToken);
        Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId, string? userToken);
        Task<bool> DeleteReviewAsync(Guid reviewId, string? adminUserToken);
    }

    public record CreateReviewDtoInBackendApp(
        Guid ApartmentId,
        int Rating,
        string? Comment
    );
}