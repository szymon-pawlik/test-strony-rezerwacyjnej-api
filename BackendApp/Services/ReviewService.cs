// Plik: BackendApp/Services/ReviewService.cs
using BackendApp.Data;     // Dla AppDbContext
using BackendApp.Models;   // Dla Review
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendApp.Services
{
    public class ReviewService : IReviewService // Implementuje IReviewService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(AppDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId)
        {
            _logger.LogInformation("Fetching reviews for apartment {ApartmentId} directly from AppDbContext", apartmentId);
            try
            {
                var reviews = await _context.Reviews
                                            .Where(r => r.ApartmentId == apartmentId)
                                            .OrderByDescending(r => r.ReviewDate)
                                            .ToListAsync();
                _logger.LogInformation("Successfully fetched {Count} reviews for ApartmentId {ApartmentId} from AppDbContext.",
                    reviews?.Count ?? 0, apartmentId);
                return reviews ?? new List<Review>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching reviews from AppDbContext for apartment {ApartmentId}", apartmentId);
                throw;
            }
        }

        public async Task<Review?> CreateReviewAsync(CreateReviewDto reviewDto, Guid authenticatedUserId)
        {
            if (reviewDto == null)
            {
                _logger.LogWarning("CreateReviewAsync called with null reviewDto for user {UserId}.", authenticatedUserId);
                throw new ArgumentNullException(nameof(reviewDto));
            }
            if (reviewDto.ApartmentId == Guid.Empty || reviewDto.Rating < 1 || reviewDto.Rating > 5)
            {
                _logger.LogWarning("Invalid review data. ApartmentId: {ApartmentId}, Rating: {Rating}, UserId: {UserId}",
                    reviewDto.ApartmentId, reviewDto.Rating, authenticatedUserId);
                return null;
            }
            _logger.LogInformation("Attempting to create review in AppDbContext for apartment {ApartmentId} by user {UserId}",
                reviewDto.ApartmentId, authenticatedUserId);
            try
            {
                var apartmentExists = await _context.Apartments.AnyAsync(a => a.Id == reviewDto.ApartmentId);
                if (!apartmentExists)
                {
                    _logger.LogWarning("Apartment with ID {ApartmentId} not found. Cannot create review for user {UserId}.",
                        reviewDto.ApartmentId, authenticatedUserId);
                    return null;
                }
                var review = new Review
                {
                    Id = Guid.NewGuid(),
                    ApartmentId = reviewDto.ApartmentId,
                    UserId = authenticatedUserId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment,
                    ReviewDate = DateTime.UtcNow
                };
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Review created successfully in AppDbContext with ID {ReviewId} for ApartmentId {ApartmentId} by User {UserId}",
                    review.Id, review.ApartmentId, authenticatedUserId);
                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while creating review in AppDbContext for apartment {ApartmentId} by user {UserId}",
                    reviewDto.ApartmentId, authenticatedUserId);
                throw;
            }
        }

        public async Task<Review?> GetReviewByIdAsync(Guid reviewId)
        {
            _logger.LogInformation("Fetching review {ReviewId} directly from AppDbContext", reviewId);
            try
            {
                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);
                if (review == null)
                {
                    _logger.LogInformation("Review {ReviewId} not found in AppDbContext.", reviewId);
                }
                return review;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching review {ReviewId} from AppDbContext", reviewId);
                throw;
            }
        }

        public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId, string? token)
        {
            _logger.LogInformation("Fetching reviews for user {UserId} directly from AppDbContext", userId);
            try
            {
                var reviews = await _context.Reviews
                                            .Where(r => r.UserId == userId)
                                            .OrderByDescending(r => r.ReviewDate)
                                            .ToListAsync();
                _logger.LogInformation("Successfully fetched {Count} reviews for UserId {UserId} from AppDbContext.",
                    reviews?.Count ?? 0, userId);
                return reviews ?? new List<Review>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching reviews for user {UserId} from AppDbContext", userId);
                throw;
            }
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId)
        {
            _logger.LogInformation("Attempting to delete review {ReviewId} from AppDbContext", reviewId);
            try
            {
                var review = await _context.Reviews.FindAsync(reviewId);
                if (review == null)
                {
                    _logger.LogWarning("Review {ReviewId} not found in AppDbContext for deletion.", reviewId);
                    return false;
                }
                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Review {ReviewId} deleted successfully from AppDbContext.", reviewId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while deleting review {ReviewId} from AppDbContext", reviewId);
                throw;
            }
        }
    }
}