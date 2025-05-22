// UserServiceApp/Data/UserDbContext.cs
using Microsoft.EntityFrameworkCore;
using UserServiceApp.Models;
using System;

namespace UserServiceApp.Data
{
    public class UserDbContext : DbContext
    {
        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            var adminId = Guid.Parse("DEB7A6B0-09A3-464E-8F5A-4D8543E6A0C4");
            var adminRoleName = "Admin";

            // Wygeneruj ten hash RAZ i wklej go tutaj jako stały string
            // Np. uruchom Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("StrongP@ssw0rd!")); i skopiuj wynik
            string adminPasswordHash = "$2a$11$XTJItk/.FRV4F9ECIFSXne16zGuSvZUQxCw3O8B9DILW7XCBV/skO"; // <<< ZASTĄP PRAWDZIWYM HASHEM

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminId,
                    Name = "Default Admin",
                    Email = "admin@example.com",
                    PasswordHash = adminPasswordHash, // Użyj stałego, pre-generowanego hashu
                    Role = adminRoleName
                }
            );
        }
    }
}


