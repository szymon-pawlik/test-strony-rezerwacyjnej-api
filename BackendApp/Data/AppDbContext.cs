using BackendApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Apartment> Apartments { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Apartment>()
            .Property(a => a.PricePerNight)
            .HasConversion<double>();

        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalPrice)
            .HasConversion<double>();

        // Seed data
        modelBuilder.Entity<Apartment>().HasData(
            new Apartment(
                Guid.Parse("123e4567-e89b-12d3-a456-426614174000"),
                "Cozy Studio in Downtown",
                "A cozy studio apartment in the heart of the city.",
                "New York, NY",
                120,
                1,
                1,
                new List<string> { "WiFi", "Kitchen", "TV" },
                true)
        );
    }
}