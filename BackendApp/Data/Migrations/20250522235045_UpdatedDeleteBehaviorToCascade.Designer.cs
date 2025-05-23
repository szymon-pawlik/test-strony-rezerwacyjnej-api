
using System;
using BackendApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace BackendApp.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20250522235045_UpdatedDeleteBehaviorToCascade")]
    partial class UpdatedDeleteBehaviorToCascade
    {

        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.5");

            modelBuilder.Entity("BackendApp.Models.Apartment", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Amenities")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsAvailable")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("NumberOfBathrooms")
                        .HasColumnType("INTEGER");

                    b.Property<int>("NumberOfBedrooms")
                        .HasColumnType("INTEGER");

                    b.Property<double>("PricePerNight")
                        .HasColumnType("REAL");

                    b.HasKey("Id");

                    b.ToTable("Apartments");

                    b.HasData(
                        new
                        {
                            Id = new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"),
                            Amenities = "[\"WiFi\",\"Kuchnia\",\"Pralka\",\"Winda\"]",
                            Description = "Nowoczesne i jasne studio w samym sercu Warszawy, idealne dla singla lub pary.",
                            IsAvailable = true,
                            Location = "Warszawa, mazowieckie",
                            Name = "Słoneczne Studio w Centrum Warszawy",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 1,
                            PricePerNight = 2500.0
                        },
                        new
                        {
                            Id = new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"),
                            Amenities = "[\"WiFi\",\"Kuchnia\",\"Telewizor\",\"Zmywarka\",\"Widok na dziedziniec\"]",
                            Description = "Klimatyczne, dwupokojowe mieszkanie w zabytkowej kamienicy, kilka kroków od Rynku Głównego.",
                            IsAvailable = true,
                            Location = "Kraków, małopolskie",
                            Name = "Przestronne Mieszkanie na Starym Mieście w Krakowie",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 2,
                            PricePerNight = 3200.0
                        },
                        new
                        {
                            Id = new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"),
                            Amenities = "[\"WiFi\",\"Klimatyzacja\",\"Balkon\",\"Gara\\u017C\",\"Ochrona\"]",
                            Description = "Komfortowy apartament z trzema sypialniami i dużym balkonem, blisko morza.",
                            IsAvailable = false,
                            Location = "Gdańsk, pomorskie",
                            Name = "Nowoczesny Apartament z Balkonem w Gdańsku",
                            NumberOfBathrooms = 2,
                            NumberOfBedrooms = 3,
                            PricePerNight = 4100.0
                        },
                        new
                        {
                            Id = new Guid("0ca8de27-44b4-4c8d-b403-35564510eac9"),
                            Amenities = "[\"WiFi\",\"Aneks kuchenny\",\"Prysznic\",\"Miejsce parkingowe\"]",
                            Description = "Urocza kawalerka po remoncie, w modnej dzielnicy Poznania, blisko parków i kawiarni.",
                            IsAvailable = true,
                            Location = "Poznań, wielkopolskie",
                            Name = "Przytulna Kawalerka na Jeżycach w Poznaniu",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 1,
                            PricePerNight = 1900.0
                        },
                        new
                        {
                            Id = new Guid("206dee5f-27f0-42a7-b46b-1fdd0002a024"),
                            Amenities = "[\"WiFi\",\"Kuchnia\",\"Ogrzewanie pod\\u0142ogowe\",\"Smart TV\"]",
                            Description = "Stylowy loft z wysokimi sufitami i antresolą sypialnianą, w odrestaurowanej fabryce.",
                            IsAvailable = true,
                            Location = "Wrocław, dolnośląskie",
                            Name = "Loft z Antresolą we Wrocławiu",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 2,
                            PricePerNight = 2800.0
                        },
                        new
                        {
                            Id = new Guid("9b5fa40a-990e-41ed-b2d1-751348de3585"),
                            Amenities = "[\"WiFi\",\"Kuchnia\",\"Ogr\\u00F3d\",\"Plac zabaw w pobli\\u017Cu\",\"Piwnica\"]",
                            Description = "Duże, czteropokojowe mieszkanie na parterze z dostępem do prywatnego ogródka, idealne dla rodziny z dziećmi.",
                            IsAvailable = true,
                            Location = "Katowice, śląskie",
                            Name = "Rodzinne Mieszkanie z Ogrodem w Katowicach",
                            NumberOfBathrooms = 2,
                            NumberOfBedrooms = 4,
                            PricePerNight = 3500.0
                        },
                        new
                        {
                            Id = new Guid("4a05fbdf-f770-4fbe-862a-23a9f29d83ca"),
                            Amenities = "[\"WiFi\",\"Klimatyzacja\",\"Taras\",\"Sauna\",\"Si\\u0142ownia w budynku\"]",
                            Description = "Luksusowy apartament z dwiema sypialniami i panoramicznym widokiem na Wisłę.",
                            IsAvailable = false,
                            Location = "Toruń, kujawsko-pomorskie",
                            Name = "Elegancki Apartament z Widokiem na Rzekę w Toruniu",
                            NumberOfBathrooms = 2,
                            NumberOfBedrooms = 2,
                            PricePerNight = 4500.0
                        },
                        new
                        {
                            Id = new Guid("740da3a0-7b40-4e10-b4e9-5aa34bd2fecd"),
                            Amenities = "[\"WiFi\",\"Aneks kuchenny\",\"Biurko\",\"Szybki internet\"]",
                            Description = "Funkcjonalne studio w pobliżu uczelni, w pełni umeblowane i wyposażone.",
                            IsAvailable = true,
                            Location = "Lublin, lubelskie",
                            Name = "Kompaktowe Studio Studenckie w Lublinie",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 1,
                            PricePerNight = 1700.0
                        },
                        new
                        {
                            Id = new Guid("f5361898-1672-4037-9c2d-4a0a9c3a9ac2"),
                            Amenities = "[\"WiFi\",\"Kuchnia\",\"Balkon x2\",\"Kom\\u00F3rka lokatorska\",\"Winda\"]",
                            Description = "Jasne i przestronne mieszkanie z dwoma balkonami, w spokojnej, zielonej okolicy.",
                            IsAvailable = true,
                            Location = "Rzeszów, podkarpackie",
                            Name = "Mieszkanie z Dwoma Balkonami w Rzeszowie",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 3,
                            PricePerNight = 2900.0
                        },
                        new
                        {
                            Id = new Guid("1ecb8100-1a9a-4acf-a871-a5740ece57e9"),
                            Amenities = "[\"WiFi\",\"Kuchnia\",\"Wanna\",\"Wysokie sufity\",\"Parkowanie na podw\\u00F3rzu\"]",
                            Description = "Przestronne mieszkanie z oryginalnymi detalami w odnowionej łódzkiej kamienicy, blisko Piotrkowskiej.",
                            IsAvailable = true,
                            Location = "Łódź, łódzkie",
                            Name = "Tradycyjne Mieszkanie w Kamienicy w Łodzi",
                            NumberOfBathrooms = 1,
                            NumberOfBedrooms = 2,
                            PricePerNight = 2300.0
                        });
                });

            modelBuilder.Entity("BackendApp.Models.Booking", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<Guid>("ApartmentId")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("BookingDate")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CheckInDate")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("CheckOutDate")
                        .HasColumnType("TEXT");

                    b.Property<double>("TotalPrice")
                        .HasColumnType("REAL");

                    b.Property<Guid>("UserId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.HasIndex("UserId");

                    b.ToTable("Bookings");

                    b.HasData(
                        new
                        {
                            Id = new Guid("04ea93e0-371c-4471-8790-1bcea0498bb1"),
                            ApartmentId = new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"),
                            BookingDate = new DateTime(2024, 4, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                            CheckInDate = new DateTime(2025, 7, 10, 0, 0, 0, 0, DateTimeKind.Utc),
                            CheckOutDate = new DateTime(2025, 7, 15, 0, 0, 0, 0, DateTimeKind.Utc),
                            TotalPrice = 600.0,
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        },
                        new
                        {
                            Id = new Guid("40fc8672-0c18-428f-9c7d-a49e1ce867dd"),
                            ApartmentId = new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"),
                            BookingDate = new DateTime(2024, 4, 16, 10, 0, 0, 0, DateTimeKind.Utc),
                            CheckInDate = new DateTime(2025, 8, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                            CheckOutDate = new DateTime(2025, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc),
                            TotalPrice = 1750.0,
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        },
                        new
                        {
                            Id = new Guid("e057f059-8eed-4a25-ba78-213f7cbf91d9"),
                            ApartmentId = new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"),
                            BookingDate = new DateTime(2024, 4, 26, 10, 0, 0, 0, DateTimeKind.Utc),
                            CheckInDate = new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Utc),
                            CheckOutDate = new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Utc),
                            TotalPrice = 900.0,
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        },
                        new
                        {
                            Id = new Guid("b1593040-e290-4389-8338-49dbb1808940"),
                            ApartmentId = new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"),
                            BookingDate = new DateTime(2024, 4, 30, 10, 0, 0, 0, DateTimeKind.Utc),
                            CheckInDate = new DateTime(2025, 10, 20, 0, 0, 0, 0, DateTimeKind.Utc),
                            CheckOutDate = new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc),
                            TotalPrice = 360.0,
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        });
                });

            modelBuilder.Entity("BackendApp.Models.Review", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<Guid>("ApartmentId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Comment")
                        .HasColumnType("TEXT");

                    b.Property<int>("Rating")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("ReviewDate")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("UserId")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.HasIndex("UserId");

                    b.ToTable("Reviews");

                    b.HasData(
                        new
                        {
                            Id = new Guid("c1fda026-1dab-47d0-ae5a-21205e218f5f"),
                            ApartmentId = new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"),
                            Comment = "Fantastyczne studio, świetna lokalizacja i bardzo czysto. Gorąco polecam!",
                            Rating = 5,
                            ReviewDate = new DateTime(2024, 4, 6, 10, 0, 0, 0, DateTimeKind.Utc),
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        },
                        new
                        {
                            Id = new Guid("c2ddddab-7cc7-4fc9-b717-f938a6493196"),
                            ApartmentId = new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"),
                            Comment = "Bardzo dobre mieszkanie w świetnej okolicy. Jedyny minus to trochę głośno wieczorami od ulicy, ale poza tym super.",
                            Rating = 4,
                            ReviewDate = new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc),
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        },
                        new
                        {
                            Id = new Guid("23261b85-bab4-4078-8b9d-fd5114aacad0"),
                            ApartmentId = new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"),
                            Comment = "Wszystko zgodnie z opisem, apartament dobrze wyposażony. Kontakt z właścicielem bezproblemowy. Na pewno wrócę!",
                            Rating = 5,
                            ReviewDate = new DateTime(2025, 10, 25, 0, 0, 0, 0, DateTimeKind.Utc),
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        },
                        new
                        {
                            Id = new Guid("28e4ec8b-e279-432a-891b-3d2f6c7038eb"),
                            ApartmentId = new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"),
                            Comment = "Lokalizacja dobra, ale czystość mogłaby być lepsza. Balkon na plus.",
                            Rating = 3,
                            ReviewDate = new DateTime(2025, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc),
                            UserId = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311")
                        });
                });

            modelBuilder.Entity("User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            Id = new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311"),
                            Email = "jan.kowalski@example.com",
                            Name = "Jan Kowalski",
                            PasswordHash = "$2a$11$wC7o2pHNhMGQ1cLDpseDoOMy/7ZZsGLt/QzqcWCjuKwculby4dCVO",
                            Role = "Admin"
                        });
                });

            modelBuilder.Entity("BackendApp.Models.Booking", b =>
                {
                    b.HasOne("BackendApp.Models.Apartment", "Apartment")
                        .WithMany("Bookings")
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("User", "User")
                        .WithMany("Bookings")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Apartment");

                    b.Navigation("User");
                });

            modelBuilder.Entity("BackendApp.Models.Review", b =>
                {
                    b.HasOne("BackendApp.Models.Apartment", "Apartment")
                        .WithMany("Reviews")
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("User", "User")
                        .WithMany("Reviews")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Apartment");

                    b.Navigation("User");
                });

            modelBuilder.Entity("BackendApp.Models.Apartment", b =>
                {
                    b.Navigation("Bookings");

                    b.Navigation("Reviews");
                });

            modelBuilder.Entity("User", b =>
                {
                    b.Navigation("Bookings");

                    b.Navigation("Reviews");
                });
#pragma warning restore 612, 618
        }
    }
}
