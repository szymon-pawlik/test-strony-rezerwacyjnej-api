using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReviewServiceApp.Data;
using ReviewServiceApp.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; // Upewnij się, że ten using jest obecny

namespace ReviewServiceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewDbContext _context;
        private readonly ILogger<ReviewsController> _logger; // Deklaracja pola

        public ReviewsController(ReviewDbContext context, ILogger<ReviewsController> logger) // Wstrzyknięcie loggera
        {
            _context = context;
            _logger = logger; // Przypisanie do pola
        }

        [HttpGet("apartment/{apartmentId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsForApartment(Guid apartmentId)
        {
            if (apartmentId == Guid.Empty)
            {
                return BadRequest("Apartment ID cannot be empty.");
            }
            _logger.LogInformation("Fetching reviews for ApartmentId: {ApartmentId}", apartmentId);
            var reviews = await _context.Reviews
                                        .Where(r => r.ApartmentId == apartmentId)
                                        .OrderByDescending(r => r.ReviewDate)
                                        .ToListAsync();
            if (reviews == null || !reviews.Any())
            {
                _logger.LogInformation("No reviews found for ApartmentId: {ApartmentId}", apartmentId);
                return Ok(new List<Review>());
            }
            return Ok(reviews);
        }

        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Review>>> GetReviewsForUser(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return BadRequest("User ID cannot be empty.");
            }
            _logger.LogInformation("Fetching reviews for UserId: {UserId}", userId);
            var reviews = await _context.Reviews
                                        .Where(r => r.UserId == userId)
                                        .OrderByDescending(r => r.ReviewDate)
                                        .ToListAsync();
            if (reviews == null || !reviews.Any())
            {
                _logger.LogInformation("No reviews found for UserId: {UserId}", userId);
                return Ok(new List<Review>());
            }
            return Ok(reviews);
        }

        public record CreateReviewDto(
            Guid ApartmentId,
            int Rating,
            string? Comment
        );

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Review>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            if (createReviewDto == null)
            {
                return BadRequest("Review data is null.");
            }
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                return Unauthorized("Invalid user identifier in token.");
            }
            if (createReviewDto.ApartmentId == Guid.Empty)
            {
                return BadRequest("ApartmentId is required.");
            }
            if (createReviewDto.Rating < 1 || createReviewDto.Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5.");
            }
            var review = new Review
            {
                Id = Guid.NewGuid(),
                ApartmentId = createReviewDto.ApartmentId,
                UserId = authenticatedUserId,
                Rating = createReviewDto.Rating,
                Comment = createReviewDto.Comment,
                ReviewDate = DateTime.UtcNow
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Created new review with Id: {ReviewId} for ApartmentId: {ApartmentId}", review.Id, review.ApartmentId);
            return CreatedAtAction(nameof(GetReviewById), new { id = review.Id }, review);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Review>> GetReviewById(Guid id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }
            return Ok(review);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            _logger.LogInformation("Admin attempting to delete review with ID: {ReviewId}", id);
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                _logger.LogWarning("Admin delete failed. Review with ID {ReviewId} not found.", id);
                return NotFound(new { Message = "Review not found." });
            }
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Review with ID {ReviewId} deleted successfully by admin.", id);
            return NoContent();
        }
    }
}