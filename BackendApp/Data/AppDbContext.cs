using BackendApp.Models;
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
        
        // Zakładam, że UserRoles jest zdefiniowane w BackendApp.Models.UserRoles
        // Jeśli jest zdefiniowane jako klasa zagnieżdżona tutaj, zmień na:
        // public static class UserRoles ...

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
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.ApartmentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Apartment)
                .WithMany(a => a.Reviews) // Jeśli Review nie ma kolekcji Reviews
                .HasForeignKey(r => r.ApartmentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews) // Jeśli Review nie ma kolekcji Reviews
                .HasForeignKey(r => r.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            var apartmentId1 = Guid.NewGuid();
            var apartmentId2 = Guid.NewGuid();
            var apartmentId3 = Guid.NewGuid();
            var apartmentId4 = Guid.NewGuid();
            var apartmentId5 = Guid.NewGuid();
            var apartmentId6 = Guid.NewGuid();
            var apartmentId7 = Guid.NewGuid();
            var apartmentId8 = Guid.NewGuid();
            var apartmentId9 = Guid.NewGuid();
            var apartmentId10 = Guid.NewGuid();


            var userId1 = Guid.Parse("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311"); // Jan

            var baseDate = new DateTime(2024, 5, 1, 10, 0, 0, DateTimeKind.Utc);

            var bookingId1 = Guid.NewGuid();
            var bookingId2 = Guid.NewGuid();
            var bookingId3 = Guid.NewGuid();
            var bookingId4 = Guid.NewGuid();

            var reviewId1 = Guid.NewGuid();
            var reviewId2 = Guid.NewGuid();
            var reviewId3 = Guid.NewGuid();
            var reviewId4 = Guid.NewGuid();

modelBuilder.Entity<Apartment>().HasData(
    new Apartment(apartmentId1, "Słoneczne Studio w Centrum Warszawy", "Nowoczesne i jasne studio w samym sercu Warszawy, idealne dla singla lub pary.", "Warszawa, mazowieckie", 1, 1, new List<string> { "WiFi", "Kuchnia", "Pralka", "Winda" }, true, 2500m),
    new Apartment(apartmentId2, "Przestronne Mieszkanie na Starym Mieście w Krakowie", "Klimatyczne, dwupokojowe mieszkanie w zabytkowej kamienicy, kilka kroków od Rynku Głównego.", "Kraków, małopolskie", 2, 1, new List<string> { "WiFi", "Kuchnia", "Telewizor", "Zmywarka", "Widok na dziedziniec" }, true, 3200m),
    new Apartment(apartmentId3, "Nowoczesny Apartament z Balkonem w Gdańsku", "Komfortowy apartament z trzema sypialniami i dużym balkonem, blisko morza.", "Gdańsk, pomorskie", 3, 2, new List<string> { "WiFi", "Klimatyzacja", "Balkon", "Garaż", "Ochrona" }, false, 4100m),
    new Apartment(apartmentId4, "Przytulna Kawalerka na Jeżycach w Poznaniu", "Urocza kawalerka po remoncie, w modnej dzielnicy Poznania, blisko parków i kawiarni.", "Poznań, wielkopolskie", 1, 1, new List<string> { "WiFi", "Aneks kuchenny", "Prysznic", "Miejsce parkingowe" }, true, 1900m),
    new Apartment(apartmentId5, "Loft z Antresolą we Wrocławiu", "Stylowy loft z wysokimi sufitami i antresolą sypialnianą, w odrestaurowanej fabryce.", "Wrocław, dolnośląskie", 2, 1, new List<string> { "WiFi", "Kuchnia", "Ogrzewanie podłogowe", "Smart TV" }, true, 2800m),
    new Apartment(apartmentId6, "Rodzinne Mieszkanie z Ogrodem w Katowicach", "Duże, czteropokojowe mieszkanie na parterze z dostępem do prywatnego ogródka, idealne dla rodziny z dziećmi.", "Katowice, śląskie", 4, 2, new List<string> { "WiFi", "Kuchnia", "Ogród", "Plac zabaw w pobliżu", "Piwnica" }, true, 3500m),
    new Apartment(apartmentId7, "Elegancki Apartament z Widokiem na Rzekę w Toruniu", "Luksusowy apartament z dwiema sypialniami i panoramicznym widokiem na Wisłę.", "Toruń, kujawsko-pomorskie", 2, 2, new List<string> { "WiFi", "Klimatyzacja", "Taras", "Sauna", "Siłownia w budynku" }, false, 4500m),
    new Apartment(apartmentId8, "Kompaktowe Studio Studenckie w Lublinie", "Funkcjonalne studio w pobliżu uczelni, w pełni umeblowane i wyposażone.", "Lublin, lubelskie", 1, 1, new List<string> { "WiFi", "Aneks kuchenny", "Biurko", "Szybki internet" }, true, 1700m),
    new Apartment(apartmentId9, "Mieszkanie z Dwoma Balkonami w Rzeszowie", "Jasne i przestronne mieszkanie z dwoma balkonami, w spokojnej, zielonej okolicy.", "Rzeszów, podkarpackie", 3, 1, new List<string> { "WiFi", "Kuchnia", "Balkon x2", "Komórka lokatorska", "Winda" }, true, 2900m),
    new Apartment(apartmentId10, "Tradycyjne Mieszkanie w Kamienicy w Łodzi", "Przestronne mieszkanie z oryginalnymi detalami w odnowionej łódzkiej kamienicy, blisko Piotrkowskiej.", "Łódź, łódzkie", 2, 1, new List<string> { "WiFi", "Kuchnia", "Wanna", "Wysokie sufity", "Parkowanie na podwórzu" }, true, 2300m)
);
            
            var janPasswordHash = "$2a$11$wC7o2pHNhMGQ1cLDpseDoOMy/7ZZsGLt/QzqcWCjuKwculby4dCVO";

            modelBuilder.Entity<User>().HasData(
                new User(userId1, "Jan Kowalski", "jan.kowalski@example.com", janPasswordHash, Models.UserRoles.Admin) // Jan jako User
            );
            
            modelBuilder.Entity<Booking>().HasData(
                new Booking
                {
                    Id = bookingId1,
                    ApartmentId = apartmentId1,
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 7, 10, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 7, 15, 0, 0, 0, DateTimeKind.Utc), // 5 nocy
                    TotalPrice = 600.0m, // np. 120 za noc
                    BookingDate = baseDate.AddDays(-30) // Rezerwacja zrobiona 30 dni przed baseDate
                },
                new Booking
                {
                    Id = bookingId2,
                    ApartmentId = apartmentId2,
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 8, 0, 0, 0, DateTimeKind.Utc), // 7 nocy
                    TotalPrice = 1750.0m, // np. 250 za noc
                    BookingDate = baseDate.AddDays(-15) // Rezerwacja zrobiona 15 dni przed baseDate
                },
                new Booking
                {
                    Id = bookingId3,
                    ApartmentId = apartmentId3,
                    UserId = userId1, // Ten sam użytkownik co w pierwszej rezerwacji, ale inny apartament
                    CheckInDate = new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 9, 10, 0, 0, 0, DateTimeKind.Utc), // 5 nocy
                    TotalPrice = 900.0m, // np. 180 za noc
                    BookingDate = baseDate.AddDays(-5) // Rezerwacja zrobiona 5 dni przed baseDate
                },
                new Booking
                {
                    Id = bookingId4,
                    ApartmentId = apartmentId1, // Ten sam apartament co w pierwszej, ale inny użytkownik i daty
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 10, 20, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 10, 23, 0, 0, 0, DateTimeKind.Utc), // 3 noce
                    TotalPrice = 360.0m, // np. 120 za noc
                    BookingDate = baseDate.AddDays(-1) // Rezerwacja zrobiona 1 dzień przed baseDate
                }
            );

modelBuilder.Entity<Review>().HasData(
    new Review
    {
        Id = reviewId1,
        ApartmentId = apartmentId1, // Recenzja dla Słonecznego Studia w Centrum Warszawy
        UserId = userId1,           // Użytkownik, który dokonał rezerwacji bookingId1
        Rating = 5,
        Comment = "Fantastyczne studio, świetna lokalizacja i bardzo czysto. Gorąco polecam!",
        ReviewDate = baseDate.AddDays(-25) // Data recenzji, np. po pobycie (booking1 kończył się 15.07.2025, baseDate to 01.06.2025)
                                           // Jeśli booking był w lipcu, to data recenzji powinna być po dacie wymeldowania.
                                           // Dla przykładu, powiążmy z bookingiem1 (CheckOutDate = 2025, 7, 15)
                                           // ReviewDate = new DateTime(2025, 7, 20, 0,0,0, DateTimeKind.Utc)
    },
    new Review
    {
        Id = reviewId2,
        ApartmentId = apartmentId2, // Recenzja dla Przestronnego Mieszkania na Starym Mieście w Krakowie
        UserId = userId1,           // Inny użytkownik
        Rating = 4,
        Comment = "Bardzo dobre mieszkanie w świetnej okolicy. Jedyny minus to trochę głośno wieczorami od ulicy, ale poza tym super.",
        // Zakładając, że rezerwacja tego użytkownika (np. bookingId2) zakończyła się 08.08.2025
        ReviewDate = new DateTime(2025, 8, 10, 0,0,0, DateTimeKind.Utc)
    },
    new Review
    {
        Id = reviewId3,
        ApartmentId = apartmentId1, // Kolejna recenzja dla Słonecznego Studia w Warszawie, ale od innego użytkownika
        UserId = userId1,
        Rating = 5,
        Comment = "Wszystko zgodnie z opisem, apartament dobrze wyposażony. Kontakt z właścicielem bezproblemowy. Na pewno wrócę!",
        // Zakładając, że rezerwacja tego użytkownika (np. bookingId4) zakończyła się 23.10.2025
        ReviewDate = new DateTime(2025, 10, 25, 0,0,0, DateTimeKind.Utc)
    },
    new Review
    {
        Id = reviewId4,
        ApartmentId = apartmentId3, // Recenzja dla Nowoczesnego Apartamentu z Balkonem w Gdańsku
        UserId = userId1,           // Ten sam użytkownik co w reviewId1, ale ocenia inny apartament
        Rating = 3,
        Comment = "Lokalizacja dobra, ale czystość mogłaby być lepsza. Balkon na plus.",
        // Zakładając, że rezerwacja tego użytkownika (np. bookingId3) zakończyła się 10.09.2025
        ReviewDate = new DateTime(2025, 9, 12, 0,0,0, DateTimeKind.Utc)
    }
);
        }
    }
}