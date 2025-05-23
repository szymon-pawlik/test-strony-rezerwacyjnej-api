using BackendApp.Models; // Import modeli encji (Apartment, User, Booking, Review)
using Microsoft.EntityFrameworkCore; // Import podstawowych klas Entity Framework Core
using System;
using System.Collections.Generic; // Dla List<string> używanej w Amenities

namespace BackendApp.Data
{
    /// <summary>
    /// Główny kontekst bazy danych aplikacji, dziedziczący po DbContext z Entity Framework Core.
    /// Odpowiada za konfigurację połączenia z bazą danych oraz mapowanie modeli na tabele.
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Konstruktor kontekstu bazy danych.
        /// </summary>
        /// <param name="options">Opcje konfiguracyjne dla DbContext, wstrzykiwane przez system DI.</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Definicje DbSet dla każdej encji, które mają być mapowane na tabele w bazie danych.
        // Każdy DbSet reprezentuje tabelę.
        public DbSet<Apartment> Apartments { get; set; } // Tabela dla mieszkań
        public DbSet<User> Users { get; set; }           // Tabela dla użytkowników
        public DbSet<Booking> Bookings { get; set; }       // Tabela dla rezerwacji
        public DbSet<Review> Reviews { get; set; }         // Tabela dla recenzji

        // Metoda OnModelCreating jest wywoływana podczas inicjalizacji modelu.
        // Służy do konfiguracji modeli za pomocą Fluent API oraz do inicjalizacji danych (seeding).
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Wywołanie implementacji bazowej

            // --- Konfiguracja typów danych dla właściwości ---

            // Konfiguracja konwersji właściwości PricePerNight (typu decimal w modelu) na typ double w bazie danych.
            // Może być użyteczne dla niektórych dostawców baz danych lub specyficznych wymagań.
            modelBuilder.Entity<Apartment>()
                .Property(a => a.PricePerNight)
                .HasConversion<double>();

            // Konfiguracja konwersji właściwości TotalPrice (typu decimal) na typ double w bazie danych.
            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasConversion<double>();

            // --- Konfiguracja relacji między encjami ---

            // Relacja: Booking (wiele) - Apartment (jeden)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Apartment)          // Booking ma jedno mieszkanie
                .WithMany(u => u.Bookings)         // Mieszkanie może mieć wiele rezerwacji
                .HasForeignKey(b => b.ApartmentId) // Klucz obcy w tabeli Bookings
                .IsRequired()                      // Klucz obcy jest wymagany (nie może być null)
                .OnDelete(DeleteBehavior.Cascade); // Kaskadowe usuwanie: usunięcie mieszkania spowoduje usunięcie powiązanych rezerwacji

            // Relacja: Booking (wiele) - User (jeden)
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)               // Booking ma jednego użytkownika
                .WithMany(u => u.Bookings)         // Użytkownik może mieć wiele rezerwacji
                .HasForeignKey(b => b.UserId)      // Klucz obcy
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade); // Kaskadowe usuwanie: usunięcie użytkownika spowoduje usunięcie jego rezerwacji

            // Relacja: Review (wiele) - Apartment (jeden)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Apartment)          // Recenzja dotyczy jednego mieszkania
                .WithMany(a => a.Reviews)          // Mieszkanie może mieć wiele recenzji
                .HasForeignKey(r => r.ApartmentId) // Klucz obcy
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade); // Kaskadowe usuwanie

            // Relacja: Review (wiele) - User (jeden)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)               // Recenzja jest napisana przez jednego użytkownika
                .WithMany(u => u.Reviews)          // Użytkownik może napisać wiele recenzji
                .HasForeignKey(r => r.UserId)      // Klucz obcy
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade); // Kaskadowe usuwanie

            // --- Inicjalizacja danych (Data Seeding) ---
            // Tworzenie przykładowych danych, które zostaną dodane do bazy podczas migracji.

            // Generowanie unikalnych identyfikatorów (GUID) dla mieszkań
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

            // Predefiniowane ID dla użytkownika testowego (administratora)
            var userId1 = Guid.Parse("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311");

            // Bazowa data dla dat rezerwacji i recenzji
            var baseDate = new DateTime(2024, 5, 1, 10, 0, 0, DateTimeKind.Utc);

            // Generowanie ID dla rezerwacji
            var bookingId1 = Guid.NewGuid();
            var bookingId2 = Guid.NewGuid();
            var bookingId3 = Guid.NewGuid();
            var bookingId4 = Guid.NewGuid();

            // Generowanie ID dla recenzji
            var reviewId1 = Guid.NewGuid();
            var reviewId2 = Guid.NewGuid();
            var reviewId3 = Guid.NewGuid();
            var reviewId4 = Guid.NewGuid();

            // Dodawanie przykładowych mieszkań
            modelBuilder.Entity<Apartment>().HasData(
                new Apartment(apartmentId1, "Słoneczne Studio w Centrum Warszawy", "Nowoczesne i jasne studio w samym sercu Warszawy, idealne dla singla lub pary.", "Warszawa, mazowieckie", 1, 1, new List<string> { "WiFi", "Kuchnia", "Pralka", "Winda" }, true, 250.00m), // Zmieniono cenę z 2500m na 250.00m dla realizmu ceny za noc
                new Apartment(apartmentId2, "Przestronne Mieszkanie na Starym Mieście w Krakowie", "Klimatyczne, dwupokojowe mieszkanie w zabytkowej kamienicy, kilka kroków od Rynku Głównego.", "Kraków, małopolskie", 2, 1, new List<string> { "WiFi", "Kuchnia", "Telewizor", "Zmywarka", "Widok na dziedziniec" }, true, 320.00m),
                new Apartment(apartmentId3, "Nowoczesny Apartament z Balkonem w Gdańsku", "Komfortowy apartament z trzema sypialniami i dużym balkonem, blisko morza.", "Gdańsk, pomorskie", 3, 2, new List<string> { "WiFi", "Klimatyzacja", "Balkon", "Garaż", "Ochrona" }, false, 410.00m),
                new Apartment(apartmentId4, "Przytulna Kawalerka na Jeżycach w Poznaniu", "Urocza kawalerka po remoncie, w modnej dzielnicy Poznania, blisko parków i kawiarni.", "Poznań, wielkopolskie", 1, 1, new List<string> { "WiFi", "Aneks kuchenny", "Prysznic", "Miejsce parkingowe" }, true, 190.00m),
                new Apartment(apartmentId5, "Loft z Antresolą we Wrocławiu", "Stylowy loft z wysokimi sufitami i antresolą sypialnianą, w odrestaurowanej fabryce.", "Wrocław, dolnośląskie", 2, 1, new List<string> { "WiFi", "Kuchnia", "Ogrzewanie podłogowe", "Smart TV" }, true, 280.00m),
                new Apartment(apartmentId6, "Rodzinne Mieszkanie z Ogrodem w Katowicach", "Duże, czteropokojowe mieszkanie na parterze z dostępem do prywatnego ogródka, idealne dla rodziny z dziećmi.", "Katowice, śląskie", 4, 2, new List<string> { "WiFi", "Kuchnia", "Ogród", "Plac zabaw w pobliżu", "Piwnica" }, true, 350.00m),
                new Apartment(apartmentId7, "Elegancki Apartament z Widokiem na Rzekę w Toruniu", "Luksusowy apartament z dwiema sypialniami i panoramicznym widokiem na Wisłę.", "Toruń, kujawsko-pomorskie", 2, 2, new List<string> { "WiFi", "Klimatyzacja", "Taras", "Sauna", "Siłownia w budynku" }, false, 450.00m),
                new Apartment(apartmentId8, "Kompaktowe Studio Studenckie w Lublinie", "Funkcjonalne studio w pobliżu uczelni, w pełni umeblowane i wyposażone.", "Lublin, lubelskie", 1, 1, new List<string> { "WiFi", "Aneks kuchenny", "Biurko", "Szybki internet" }, true, 170.00m),
                new Apartment(apartmentId9, "Mieszkanie z Dwoma Balkonami w Rzeszowie", "Jasne i przestronne mieszkanie z dwoma balkonami, w spokojnej, zielonej okolicy.", "Rzeszów, podkarpackie", 3, 1, new List<string> { "WiFi", "Kuchnia", "Balkon x2", "Komórka lokatorska", "Winda" }, true, 290.00m),
                new Apartment(apartmentId10, "Tradycyjne Mieszkanie w Kamienicy w Łodzi", "Przestronne mieszkanie z oryginalnymi detalami w odnowionej łódzkiej kamienicy, blisko Piotrkowskiej.", "Łódź, łódzkie", 2, 1, new List<string> { "WiFi", "Kuchnia", "Wanna", "Wysokie sufity", "Parkowanie na podwórzu" }, true, 230.00m)
            );

            // Przykładowy hash hasła dla użytkownika "Jan Kowalski" (hasło: "PasswordJan123!")
            // Ten hash powinien być wygenerowany za pomocą tej samej metody, co przy rejestracji użytkownika.
            var janPasswordHash = "$2a$11$wC7o2pHNhMGQ1cLDpseDoOMy/7ZZsGLt/QzqcWCjuKwculby4dCVO"; // Przykładowy hash bcrypt

            // Dodawanie przykładowego użytkownika (administratora)
            modelBuilder.Entity<User>().HasData(
                new User(userId1, "Jan Kowalski", "jan.kowalski@example.com", janPasswordHash, Models.UserRoles.Admin) // Zakładając, że UserRoles.Admin jest zdefiniowane
            );

            // Dodawanie przykładowych rezerwacji
            modelBuilder.Entity<Booking>().HasData(
                new Booking
                {
                    Id = bookingId1,
                    ApartmentId = apartmentId1,
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 7, 10, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 7, 15, 0, 0, 0, DateTimeKind.Utc), // 5 nocy
                    TotalPrice = 5 * 250.00m, // Cena = liczba nocy * cena za noc mieszkania apartmentId1
                    BookingDate = baseDate.AddDays(-30)
                },
                new Booking
                {
                    Id = bookingId2,
                    ApartmentId = apartmentId2,
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 8, 8, 0, 0, 0, DateTimeKind.Utc), // 7 nocy
                    TotalPrice = 7 * 320.00m,
                    BookingDate = baseDate.AddDays(-15)
                },
                new Booking
                {
                    Id = bookingId3,
                    ApartmentId = apartmentId3, // To mieszkanie jest oznaczone jako IsAvailable = false
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 9, 5, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 9, 10, 0, 0, 0, DateTimeKind.Utc), // 5 nocy
                    TotalPrice = 5 * 410.00m, // Cena mimo że mieszkanie jest niedostępne (dane testowe)
                    BookingDate = baseDate.AddDays(-5)
                },
                new Booking
                {
                    Id = bookingId4,
                    ApartmentId = apartmentId1, // Ten sam apartament co w bookingId1
                    UserId = userId1,
                    CheckInDate = new DateTime(2025, 10, 20, 0, 0, 0, DateTimeKind.Utc),
                    CheckOutDate = new DateTime(2025, 10, 23, 0, 0, 0, DateTimeKind.Utc), // 3 noce
                    TotalPrice = 3 * 250.00m,
                    BookingDate = baseDate.AddDays(-1)
                }
            );

            // Dodawanie przykładowych recenzji
            modelBuilder.Entity<Review>().HasData(
                new Review
                {
                    Id = reviewId1,
                    ApartmentId = apartmentId1,
                    UserId = userId1,
                    Rating = 5,
                    Comment = "Fantastyczne studio, świetna lokalizacja i bardzo czysto. Gorąco polecam!",
                    ReviewDate = new DateTime(2025, 7, 16, 0, 0, 0, DateTimeKind.Utc) // Data po zakończeniu rezerwacji bookingId1
                },
                new Review
                {
                    Id = reviewId2,
                    ApartmentId = apartmentId2,
                    UserId = userId1,
                    Rating = 4,
                    Comment = "Bardzo dobre mieszkanie w świetnej okolicy. Jedyny minus to trochę głośno wieczorami od ulicy, ale poza tym super.",
                    ReviewDate = new DateTime(2025, 8, 10, 0,0,0, DateTimeKind.Utc) // Data po zakończeniu rezerwacji bookingId2
                },
                new Review
                {
                    Id = reviewId3,
                    ApartmentId = apartmentId1,
                    UserId = userId1, // Ten sam użytkownik, recenzja dla tej samej kwatery po innej rezerwacji
                    Rating = 5,
                    Comment = "Wszystko zgodnie z opisem, apartament dobrze wyposażony. Kontakt z właścicielem bezproblemowy. Na pewno wrócę!",
                    ReviewDate = new DateTime(2025, 10, 25, 0,0,0, DateTimeKind.Utc) // Data po zakończeniu rezerwacji bookingId4
                },
                new Review
                {
                    Id = reviewId4,
                    ApartmentId = apartmentId3,
                    UserId = userId1,
                    Rating = 3,
                    Comment = "Lokalizacja dobra, ale czystość mogłaby być lepsza. Balkon na plus.",
                    ReviewDate = new DateTime(2025, 9, 12, 0,0,0, DateTimeKind.Utc) // Data po zakończeniu rezerwacji bookingId3
                }
            );
        }
    }
}