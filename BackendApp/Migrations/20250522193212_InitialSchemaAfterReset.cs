using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 

namespace BackendApp.Migrations
{

    public partial class InitialSchemaAfterReset : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Apartments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Location = table.Column<string>(type: "TEXT", nullable: false),
                    NumberOfBedrooms = table.Column<int>(type: "INTEGER", nullable: false),
                    NumberOfBathrooms = table.Column<int>(type: "INTEGER", nullable: false),
                    Amenities = table.Column<string>(type: "TEXT", nullable: false),
                    IsAvailable = table.Column<bool>(type: "INTEGER", nullable: false),
                    PricePerNight = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apartments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApartmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CheckInDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CheckOutDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalPrice = table.Column<double>(type: "REAL", nullable: false),
                    BookingDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Apartments_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Apartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApartmentId = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: false),
                    Comment = table.Column<string>(type: "TEXT", nullable: true),
                    ReviewDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Apartments_ApartmentId",
                        column: x => x.ApartmentId,
                        principalTable: "Apartments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Apartments",
                columns: new[] { "Id", "Amenities", "Description", "IsAvailable", "Location", "Name", "NumberOfBathrooms", "NumberOfBedrooms", "PricePerNight" },
                values: new object[,]
                {
                    { new Guid("084e8116-e3a9-4161-a04e-d002816a5d86"), "[\"WiFi\",\"Aneks kuchenny\",\"Prysznic\",\"Miejsce parkingowe\"]", "Urocza kawalerka po remoncie, w modnej dzielnicy Poznania, blisko parków i kawiarni.", true, "Poznań, wielkopolskie", "Przytulna Kawalerka na Jeżycach w Poznaniu", 1, 1, 1900.0 },
                    { new Guid("1dbaa489-85ec-4db5-8ccb-37504e4dea31"), "[\"WiFi\",\"Kuchnia\",\"Ogrzewanie pod\\u0142ogowe\",\"Smart TV\"]", "Stylowy loft z wysokimi sufitami i antresolą sypialnianą, w odrestaurowanej fabryce.", true, "Wrocław, dolnośląskie", "Loft z Antresolą we Wrocławiu", 1, 2, 2800.0 },
                    { new Guid("8049fe47-d3a4-4a08-853f-fe440915eef4"), "[\"WiFi\",\"Klimatyzacja\",\"Taras\",\"Sauna\",\"Si\\u0142ownia w budynku\"]", "Luksusowy apartament z dwiema sypialniami i panoramicznym widokiem na Wisłę.", false, "Toruń, kujawsko-pomorskie", "Elegancki Apartament z Widokiem na Rzekę w Toruniu", 2, 2, 4500.0 },
                    { new Guid("834c08b7-cca5-41e5-b046-08530394a233"), "[\"WiFi\",\"Kuchnia\",\"Wanna\",\"Wysokie sufity\",\"Parkowanie na podw\\u00F3rzu\"]", "Przestronne mieszkanie z oryginalnymi detalami w odnowionej łódzkiej kamienicy, blisko Piotrkowskiej.", true, "Łódź, łódzkie", "Tradycyjne Mieszkanie w Kamienicy w Łodzi", 1, 2, 2300.0 },
                    { new Guid("8917540c-c554-41fc-8989-ba4245289e08"), "[\"WiFi\",\"Aneks kuchenny\",\"Biurko\",\"Szybki internet\"]", "Funkcjonalne studio w pobliżu uczelni, w pełni umeblowane i wyposażone.", true, "Lublin, lubelskie", "Kompaktowe Studio Studenckie w Lublinie", 1, 1, 1700.0 },
                    { new Guid("957d6a4a-e58e-43b4-88d1-873faaa333d2"), "[\"WiFi\",\"Klimatyzacja\",\"Balkon\",\"Gara\\u017C\",\"Ochrona\"]", "Komfortowy apartament z trzema sypialniami i dużym balkonem, blisko morza.", false, "Gdańsk, pomorskie", "Nowoczesny Apartament z Balkonem w Gdańsku", 2, 3, 4100.0 },
                    { new Guid("a4f2f38a-0d40-4ef3-8485-3f09ad6ffee2"), "[\"WiFi\",\"Kuchnia\",\"Ogr\\u00F3d\",\"Plac zabaw w pobli\\u017Cu\",\"Piwnica\"]", "Duże, czteropokojowe mieszkanie na parterze z dostępem do prywatnego ogródka, idealne dla rodziny z dziećmi.", true, "Katowice, śląskie", "Rodzinne Mieszkanie z Ogrodem w Katowicach", 2, 4, 3500.0 },
                    { new Guid("ba1fcefa-5969-49ba-99f4-65e917ed1ca4"), "[\"WiFi\",\"Kuchnia\",\"Telewizor\",\"Zmywarka\",\"Widok na dziedziniec\"]", "Klimatyczne, dwupokojowe mieszkanie w zabytkowej kamienicy, kilka kroków od Rynku Głównego.", true, "Kraków, małopolskie", "Przestronne Mieszkanie na Starym Mieście w Krakowie", 1, 2, 3200.0 },
                    { new Guid("cbacf7fe-8e06-4216-b187-1d9dfde24f47"), "[\"WiFi\",\"Kuchnia\",\"Pralka\",\"Winda\"]", "Nowoczesne i jasne studio w samym sercu Warszawy, idealne dla singla lub pary.", true, "Warszawa, mazowieckie", "Słoneczne Studio w Centrum Warszawy", 1, 1, 2500.0 },
                    { new Guid("d0c6cb19-d9b8-4cde-8e59-43570c482f57"), "[\"WiFi\",\"Kuchnia\",\"Balkon x2\",\"Kom\\u00F3rka lokatorska\",\"Winda\"]", "Jasne i przestronne mieszkanie z dwoma balkonami, w spokojnej, zielonej okolicy.", true, "Rzeszów, podkarpackie", "Mieszkanie z Dwoma Balkonami w Rzeszowie", 1, 3, 2900.0 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Name", "PasswordHash", "Role" },
                values: new object[] { new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311"), "jan.kowalski@example.com", "Jan Kowalski", "$2a$11$wC7o2pHNhMGQ1cLDpseDoOMy/7ZZsGLt/QzqcWCjuKwculby4dCVO", "Admin" });

            migrationBuilder.InsertData(
                table: "Bookings",
                columns: new[] { "Id", "ApartmentId", "BookingDate", "CheckInDate", "CheckOutDate", "TotalPrice", "UserId" },
                values: new object[,]
                {
                    { new Guid("455f88a2-b36e-4eae-8f23-9c5acc2607a4"), new Guid("957d6a4a-e58e-43b4-88d1-873faaa333d2"), new DateTime(2024, 4, 26, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Utc), 900.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("68543fb0-1de9-4dac-9938-6a0de311009b"), new Guid("cbacf7fe-8e06-4216-b187-1d9dfde24f47"), new DateTime(2024, 4, 30, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 10, 20, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 360.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("807230cd-9bfd-4d30-9b7d-73a94e5dd444"), new Guid("ba1fcefa-5969-49ba-99f4-65e917ed1ca4"), new DateTime(2024, 4, 16, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), 1750.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("d17f9a50-41c8-4402-ac75-2d40086128b3"), new Guid("cbacf7fe-8e06-4216-b187-1d9dfde24f47"), new DateTime(2024, 4, 1, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 7, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 7, 15, 0, 0, 0, 0, DateTimeKind.Utc), 600.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") }
                });

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[] { "Id", "ApartmentId", "Comment", "Rating", "ReviewDate", "UserId" },
                values: new object[,]
                {
                    { new Guid("098ff1a7-3231-4a55-8b75-acc6e53222a1"), new Guid("ba1fcefa-5969-49ba-99f4-65e917ed1ca4"), "Bardzo dobre mieszkanie w świetnej okolicy. Jedyny minus to trochę głośno wieczorami od ulicy, ale poza tym super.", 4, new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("6fa712c9-9bf6-4561-9e27-e0adb5e8778c"), new Guid("957d6a4a-e58e-43b4-88d1-873faaa333d2"), "Lokalizacja dobra, ale czystość mogłaby być lepsza. Balkon na plus.", 3, new DateTime(2025, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("7456eec9-a798-4f83-9561-6717ff348448"), new Guid("cbacf7fe-8e06-4216-b187-1d9dfde24f47"), "Wszystko zgodnie z opisem, apartament dobrze wyposażony. Kontakt z właścicielem bezproblemowy. Na pewno wrócę!", 5, new DateTime(2025, 10, 25, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("941e99ed-9fc3-4a60-8f64-f2e41b098d1e"), new Guid("cbacf7fe-8e06-4216-b187-1d9dfde24f47"), "Fantastyczne studio, świetna lokalizacja i bardzo czysto. Gorąco polecam!", 5, new DateTime(2024, 4, 6, 10, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ApartmentId",
                table: "Bookings",
                column: "ApartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ApartmentId",
                table: "Reviews",
                column: "ApartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId",
                table: "Reviews",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "Apartments");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
