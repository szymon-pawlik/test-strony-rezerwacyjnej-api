using BackendApp.Models;
// using BackendApp.Services; // PasswordHasher nie jest już tu potrzebny, jeśli hashe są zahardkodowane
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace BackendApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Apartment> Apartments { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Review> Reviews { get; set; }
        
        // Przenieś UserRoles do osobnego pliku, np. Models/UserRoles.cs, jeśli jeszcze tego nie zrobiłeś
        // public static class UserRoles 
        // {
        //     public const string Admin = "Admin";
        //     public const string User = "User";
        // }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Apartment>()
                .Property(a => a.PricePerNight)
                .HasConversion<double>();

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasConversion<double>();

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Apartment)
                .WithMany()
                .HasForeignKey(b => b.ApartmentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Apartment)
                .WithMany()
                .HasForeignKey(r => r.ApartmentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            var apartmentId1 = Guid.Parse("123e4567-e89b-12d3-a456-426614174000");
            var apartmentId2 = Guid.Parse("f47ac10b-58cc-4372-a567-0e02b2c3d479");
            var apartmentId3 = Guid.Parse("98f1b22d-6f82-4c07-9e13-29a2a20d3b41");

            var userId1 = Guid.Parse("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311"); // Jan
            var userId2 = Guid.Parse("b9c5d3b0-3d1c-4c6f-8e4d-1a2b3c4d5e6f"); // Anna

            var baseDate = new DateTime(2024, 5, 1, 10, 0, 0, DateTimeKind.Utc);

            var bookingId1 = Guid.Parse("e1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6");
            var bookingId2 = Guid.Parse("f2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7");
            var bookingId3 = Guid.Parse("a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8");

            var reviewId1 = Guid.Parse("b4c5d6e7-f8a9-b0c1-d2e3-f4a5b6c7d8e9");
            var reviewId2 = Guid.Parse("c5d6e7f8-a9b0-c1d2-e3f4-a5b6c7d8e9f0");
            var reviewId3 = Guid.Parse("d6e7f8a9-b0c1-d2e3-f4a5-b6c7d8e9f0a1");

            modelBuilder.Entity<Apartment>().HasData(
                new Apartment(apartmentId1, "Cozy Studio in Downtown", "A cozy studio apartment in the heart of the city.", "New York, NY", 1, 1, new List<string> { "WiFi", "Kitchen", "TV" }, true, 120m),
                new Apartment(apartmentId2, "Sunny Loft with River View", "Spacious and bright loft with a beautiful view of the river.", "Brooklyn, NY", 2, 2, new List<string> { "WiFi", "Air Conditioning", "Balcony", "Gym Access" }, true, 250m),
                new Apartment(apartmentId3, "Charming Cottage by the Lake", "A peaceful cottage perfect for a weekend getaway.", "Lake Placid, NY", 3, 1, new List<string> { "WiFi", "Fireplace", "Lake Access", "Pet-friendly" }, false, 180m)
            );
            
            // Użyj hashy, które ostatnio wygenerowałeś
            var janPasswordHash = "$2a$11$wC7o2pHNhMGQ1cLDpseDoOMy/7ZZsGLt/QzqcWCjuKwculby4dCVO";
            var annaPasswordHash = "$2a$11$vGyDothgKdabB30rloShAusA8AxUCtg5FMg.dxzs3Jmm.MVbfKNAW";

            modelBuilder.Entity<User>().HasData(
                new User(userId1, "Jan Kowalski", "jan.kowalski@example.com", janPasswordHash, Models.UserRoles.Admin), // Jan jako User
                new User(userId2, "Anna Nowak", "anna.nowak@example.com", annaPasswordHash, Models.UserRoles.User)  // Anna jako Admin
            );

            modelBuilder.Entity<Booking>().HasData(
                new Booking(bookingId1, apartmentId1, userId1, new DateTime(2025, 7, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 7, 15, 0, 0, 0, DateTimeKind.Utc), 600.0, baseDate.AddDays(-30)),
                new Booking(bookingId2, apartmentId2, userId2, new DateTime(2025, 8, 1, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 7, 0, 0, 0, DateTimeKind.Utc), 1500.0, baseDate.AddDays(-15)),
                new Booking(bookingId3, apartmentId1, userId2, new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 9, 10, 0, 0, 0, DateTimeKind.Utc), 600.0, baseDate.AddDays(-5))
            );

            modelBuilder.Entity<Review>().HasData(
                new Review(reviewId1, apartmentId1, userId1, 5, "Fantastic studio, great location and very clean. Highly recommended!", baseDate.AddDays(-25)),
                new Review(reviewId2, apartmentId2, userId2, 4, "Loved the view and the space. The gym was a nice bonus. A bit noisy at times.", baseDate.AddDays(-10)),
                new Review(reviewId3, apartmentId1, userId2, 4, "Good value for money, perfect for a short stay.", baseDate.AddDays(-2))
            );
        }
    }
}