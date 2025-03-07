using BackendApp.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendApp.Data;

public class AppDbContext : DbContext
{
    public DbSet<Apartment> Apartments { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Configure SQLite as the database provider
        optionsBuilder.UseSqlite("Data Source=BackendApp.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal properties
        modelBuilder.Entity<Apartment>()
            .Property(a => a.PricePerNight)
            .HasConversion<double>(); // SQLite doesn't support decimal natively

        modelBuilder.Entity<Booking>()
            .Property(b => b.TotalPrice)
            .HasConversion<double>(); // SQLite doesn't support decimal natively

        // Seed initial data with static values
        modelBuilder.Entity<Apartment>().HasData(
            new Apartment(
                Guid.Parse("12345678-1234-1234-1234-123456789012"), // Static GUID
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