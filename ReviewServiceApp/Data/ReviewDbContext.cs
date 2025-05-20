using Microsoft.EntityFrameworkCore;
using ReviewServiceApp.Models;

namespace ReviewServiceApp.Data
{
    public class ReviewDbContext : DbContext
    {
        public ReviewDbContext(DbContextOptions<ReviewDbContext> options) : base(options)
        {
        }

        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Tutaj możesz dodać konfiguracje specyficzne dla modelu Review,
            // np. indeksy, ograniczenia, dane początkowe (seed data) dla recenzji.
            // Na przykład, dane początkowe:
            /*
            var reviewId1 = Guid.NewGuid();
            modelBuilder.Entity<Review>().HasData(
                new Review
                {
                    Id = reviewId1,
                    ApartmentId = Guid.Parse("123e4567-e89b-12d3-a456-426614174000"), // Przykładowe ID mieszkania
                    UserId = Guid.Parse("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311"),    // Przykładowe ID użytkownika
                    Rating = 5,
                    Comment = "Seed review from ReviewServiceApp!",
                    ReviewDate = new DateTime(2024, 1, 15, 0,0,0, DateTimeKind.Utc)
                }
            );
            */
        }
    }
}