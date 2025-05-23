using BackendApp.Data;
using BackendApp.Models;
using Microsoft.EntityFrameworkCore; // Dla metod EF Core jak Where, OrderByDescending, ToListAsync, FindAsync, AnyAsync
using Microsoft.Extensions.Logging;  // Dla ILogger
using System;
using System.Collections.Generic;
using System.Linq; // Dla metod LINQ
using System.Threading.Tasks;

namespace BackendApp.Services
{
    /// <summary>
    /// Serwis odpowiedzialny za logikę biznesową związaną z recenzjami.
    /// Implementuje interfejs IReviewService.
    /// </summary>
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context; // Kontekst bazy danych
        private readonly ILogger<ReviewService> _logger; // Logger

        // Konstruktor wstrzykujący zależności.
        public ReviewService(AppDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Pobiera wszystkie recenzje dla danego mieszkania.
        /// </summary>
        public async Task<IEnumerable<Review>> GetReviewsByApartmentIdAsync(Guid apartmentId)
        {
            _logger.LogInformation("Fetching reviews for apartment {ApartmentId} directly from AppDbContext", apartmentId);
            try
            {
                var reviews = await _context.Reviews
                                            .Where(r => r.ApartmentId == apartmentId)
                                            .OrderByDescending(r => r.ReviewDate) // Sortuje od najnowszych
                                            .ToListAsync();
                _logger.LogInformation("Successfully fetched {Count} reviews for ApartmentId {ApartmentId} from AppDbContext.",
                    reviews?.Count ?? 0, apartmentId);
                return reviews ?? new List<Review>(); // Zwraca pustą listę, jeśli reviews jest null
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching reviews from AppDbContext for apartment {ApartmentId}", apartmentId);
                throw; // Rzuca wyjątek dalej, aby obsłużyć go na wyższym poziomie
            }
        }

        /// <summary>
        /// Tworzy nową recenzję dla mieszkania przez zalogowanego użytkownika.
        /// </summary>
        public async Task<Review?> CreateReviewAsync(CreateReviewDto reviewDto, Guid authenticatedUserId)
        {
            // Podstawowa walidacja DTO.
            if (reviewDto == null)
            {
                _logger.LogWarning("CreateReviewAsync called with null reviewDto for user {UserId}.", authenticatedUserId);
                throw new ArgumentNullException(nameof(reviewDto));
            }
            if (reviewDto.ApartmentId == Guid.Empty || reviewDto.Rating < 1 || reviewDto.Rating > 5)
            {
                _logger.LogWarning("Invalid review data. ApartmentId: {ApartmentId}, Rating: {Rating}, UserId: {UserId}",
                    reviewDto.ApartmentId, reviewDto.Rating, authenticatedUserId);
                return null; // Zwraca null, jeśli dane są nieprawidłowe.
            }
            _logger.LogInformation("Attempting to create review in AppDbContext for apartment {ApartmentId} by user {UserId}",
                reviewDto.ApartmentId, authenticatedUserId);
            try
            {
                // Sprawdzenie, czy mieszkanie, którego dotyczy recenzja, istnieje.
                var apartmentExists = await _context.Apartments.AnyAsync(a => a.Id == reviewDto.ApartmentId);
                if (!apartmentExists)
                {
                    _logger.LogWarning("Apartment with ID {ApartmentId} not found. Cannot create review for user {UserId}.",
                        reviewDto.ApartmentId, authenticatedUserId);
                    return null; // Mieszkanie nie istnieje.
                }

                // Tworzenie nowej encji recenzji.
                var review = new Review
                {
                    Id = Guid.NewGuid(), // Nowe ID dla recenzji
                    ApartmentId = reviewDto.ApartmentId,
                    UserId = authenticatedUserId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment,
                    ReviewDate = DateTime.UtcNow // Data utworzenia recenzji
                };
                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Review created successfully in AppDbContext with ID {ReviewId} for ApartmentId {ApartmentId} by User {UserId}",
                    review.Id, review.ApartmentId, authenticatedUserId);
                return review; // Zwraca utworzoną recenzję.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while creating review in AppDbContext for apartment {ApartmentId} by user {UserId}",
                    reviewDto.ApartmentId, authenticatedUserId);
                throw;
            }
        }

        /// <summary>
        /// Pobiera recenzję na podstawie jej ID.
        /// </summary>
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

        /// <summary>
        /// Pobiera wszystkie recenzje napisane przez danego użytkownika.
        /// </summary>
        public async Task<IEnumerable<Review>> GetReviewsByUserIdAsync(Guid userId, string? token) // Parametr 'token' jest obecnie nieużywany w tej metodzie.
        {
            _logger.LogInformation("Fetching reviews for user {UserId} directly from AppDbContext. Token presence: {HasToken}", userId, !string.IsNullOrEmpty(token));
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

        /// <summary>
        /// Usuwa recenzję o podanym ID.
        /// </summary>
        public async Task<bool> DeleteReviewAsync(Guid reviewId)
        {
            _logger.LogInformation("Attempting to delete review {ReviewId} from AppDbContext", reviewId);
            try
            {
                var review = await _context.Reviews.FindAsync(reviewId);
                if (review == null)
                {
                    _logger.LogWarning("Review {ReviewId} not found in AppDbContext for deletion.", reviewId);
                    return false; // Recenzja nie znaleziona.
                }
                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Review {ReviewId} deleted successfully from AppDbContext.", reviewId);
                return true; // Pomyślnie usunięto.
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while deleting review {ReviewId} from AppDbContext", reviewId);
                throw;
            }
        }
    }
}