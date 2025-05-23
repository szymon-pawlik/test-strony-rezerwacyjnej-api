using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 

namespace BackendApp.Data.Migrations
{

    public partial class UpdatedDeleteBehaviorToCascade : Migration
    {

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Apartments_ApartmentId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Users_UserId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Apartments_ApartmentId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("084e8116-e3a9-4161-a04e-d002816a5d86"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("1dbaa489-85ec-4db5-8ccb-37504e4dea31"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("8049fe47-d3a4-4a08-853f-fe440915eef4"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("834c08b7-cca5-41e5-b046-08530394a233"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("8917540c-c554-41fc-8989-ba4245289e08"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("a4f2f38a-0d40-4ef3-8485-3f09ad6ffee2"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("d0c6cb19-d9b8-4cde-8e59-43570c482f57"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("455f88a2-b36e-4eae-8f23-9c5acc2607a4"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("68543fb0-1de9-4dac-9938-6a0de311009b"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("807230cd-9bfd-4d30-9b7d-73a94e5dd444"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("d17f9a50-41c8-4402-ac75-2d40086128b3"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("098ff1a7-3231-4a55-8b75-acc6e53222a1"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("6fa712c9-9bf6-4561-9e27-e0adb5e8778c"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("7456eec9-a798-4f83-9561-6717ff348448"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("941e99ed-9fc3-4a60-8f64-f2e41b098d1e"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("957d6a4a-e58e-43b4-88d1-873faaa333d2"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("ba1fcefa-5969-49ba-99f4-65e917ed1ca4"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("cbacf7fe-8e06-4216-b187-1d9dfde24f47"));

            migrationBuilder.InsertData(
                table: "Apartments",
                columns: new[] { "Id", "Amenities", "Description", "IsAvailable", "Location", "Name", "NumberOfBathrooms", "NumberOfBedrooms", "PricePerNight" },
                values: new object[,]
                {
                    { new Guid("0ca8de27-44b4-4c8d-b403-35564510eac9"), "[\"WiFi\",\"Aneks kuchenny\",\"Prysznic\",\"Miejsce parkingowe\"]", "Urocza kawalerka po remoncie, w modnej dzielnicy Poznania, blisko parków i kawiarni.", true, "Poznań, wielkopolskie", "Przytulna Kawalerka na Jeżycach w Poznaniu", 1, 1, 1900.0 },
                    { new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"), "[\"WiFi\",\"Klimatyzacja\",\"Balkon\",\"Gara\\u017C\",\"Ochrona\"]", "Komfortowy apartament z trzema sypialniami i dużym balkonem, blisko morza.", false, "Gdańsk, pomorskie", "Nowoczesny Apartament z Balkonem w Gdańsku", 2, 3, 4100.0 },
                    { new Guid("1ecb8100-1a9a-4acf-a871-a5740ece57e9"), "[\"WiFi\",\"Kuchnia\",\"Wanna\",\"Wysokie sufity\",\"Parkowanie na podw\\u00F3rzu\"]", "Przestronne mieszkanie z oryginalnymi detalami w odnowionej łódzkiej kamienicy, blisko Piotrkowskiej.", true, "Łódź, łódzkie", "Tradycyjne Mieszkanie w Kamienicy w Łodzi", 1, 2, 2300.0 },
                    { new Guid("206dee5f-27f0-42a7-b46b-1fdd0002a024"), "[\"WiFi\",\"Kuchnia\",\"Ogrzewanie pod\\u0142ogowe\",\"Smart TV\"]", "Stylowy loft z wysokimi sufitami i antresolą sypialnianą, w odrestaurowanej fabryce.", true, "Wrocław, dolnośląskie", "Loft z Antresolą we Wrocławiu", 1, 2, 2800.0 },
                    { new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"), "[\"WiFi\",\"Kuchnia\",\"Pralka\",\"Winda\"]", "Nowoczesne i jasne studio w samym sercu Warszawy, idealne dla singla lub pary.", true, "Warszawa, mazowieckie", "Słoneczne Studio w Centrum Warszawy", 1, 1, 2500.0 },
                    { new Guid("4a05fbdf-f770-4fbe-862a-23a9f29d83ca"), "[\"WiFi\",\"Klimatyzacja\",\"Taras\",\"Sauna\",\"Si\\u0142ownia w budynku\"]", "Luksusowy apartament z dwiema sypialniami i panoramicznym widokiem na Wisłę.", false, "Toruń, kujawsko-pomorskie", "Elegancki Apartament z Widokiem na Rzekę w Toruniu", 2, 2, 4500.0 },
                    { new Guid("740da3a0-7b40-4e10-b4e9-5aa34bd2fecd"), "[\"WiFi\",\"Aneks kuchenny\",\"Biurko\",\"Szybki internet\"]", "Funkcjonalne studio w pobliżu uczelni, w pełni umeblowane i wyposażone.", true, "Lublin, lubelskie", "Kompaktowe Studio Studenckie w Lublinie", 1, 1, 1700.0 },
                    { new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"), "[\"WiFi\",\"Kuchnia\",\"Telewizor\",\"Zmywarka\",\"Widok na dziedziniec\"]", "Klimatyczne, dwupokojowe mieszkanie w zabytkowej kamienicy, kilka kroków od Rynku Głównego.", true, "Kraków, małopolskie", "Przestronne Mieszkanie na Starym Mieście w Krakowie", 1, 2, 3200.0 },
                    { new Guid("9b5fa40a-990e-41ed-b2d1-751348de3585"), "[\"WiFi\",\"Kuchnia\",\"Ogr\\u00F3d\",\"Plac zabaw w pobli\\u017Cu\",\"Piwnica\"]", "Duże, czteropokojowe mieszkanie na parterze z dostępem do prywatnego ogródka, idealne dla rodziny z dziećmi.", true, "Katowice, śląskie", "Rodzinne Mieszkanie z Ogrodem w Katowicach", 2, 4, 3500.0 },
                    { new Guid("f5361898-1672-4037-9c2d-4a0a9c3a9ac2"), "[\"WiFi\",\"Kuchnia\",\"Balkon x2\",\"Kom\\u00F3rka lokatorska\",\"Winda\"]", "Jasne i przestronne mieszkanie z dwoma balkonami, w spokojnej, zielonej okolicy.", true, "Rzeszów, podkarpackie", "Mieszkanie z Dwoma Balkonami w Rzeszowie", 1, 3, 2900.0 }
                });

            migrationBuilder.InsertData(
                table: "Bookings",
                columns: new[] { "Id", "ApartmentId", "BookingDate", "CheckInDate", "CheckOutDate", "TotalPrice", "UserId" },
                values: new object[,]
                {
                    { new Guid("04ea93e0-371c-4471-8790-1bcea0498bb1"), new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"), new DateTime(2024, 4, 1, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 7, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 7, 15, 0, 0, 0, 0, DateTimeKind.Utc), 600.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("40fc8672-0c18-428f-9c7d-a49e1ce867dd"), new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"), new DateTime(2024, 4, 16, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), 1750.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("b1593040-e290-4389-8338-49dbb1808940"), new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"), new DateTime(2024, 4, 30, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 10, 20, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 10, 23, 0, 0, 0, 0, DateTimeKind.Utc), 360.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("e057f059-8eed-4a25-ba78-213f7cbf91d9"), new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"), new DateTime(2024, 4, 26, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 9, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 9, 10, 0, 0, 0, 0, DateTimeKind.Utc), 900.0, new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") }
                });

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[] { "Id", "ApartmentId", "Comment", "Rating", "ReviewDate", "UserId" },
                values: new object[,]
                {
                    { new Guid("23261b85-bab4-4078-8b9d-fd5114aacad0"), new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"), "Wszystko zgodnie z opisem, apartament dobrze wyposażony. Kontakt z właścicielem bezproblemowy. Na pewno wrócę!", 5, new DateTime(2025, 10, 25, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("28e4ec8b-e279-432a-891b-3d2f6c7038eb"), new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"), "Lokalizacja dobra, ale czystość mogłaby być lepsza. Balkon na plus.", 3, new DateTime(2025, 9, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("c1fda026-1dab-47d0-ae5a-21205e218f5f"), new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"), "Fantastyczne studio, świetna lokalizacja i bardzo czysto. Gorąco polecam!", 5, new DateTime(2024, 4, 6, 10, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") },
                    { new Guid("c2ddddab-7cc7-4fc9-b717-f938a6493196"), new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"), "Bardzo dobre mieszkanie w świetnej okolicy. Jedyny minus to trochę głośno wieczorami od ulicy, ale poza tym super.", 4, new DateTime(2025, 8, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("0d8d8a90-9d14-4c6f-84e8-ea278e7a2311") }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Apartments_ApartmentId",
                table: "Bookings",
                column: "ApartmentId",
                principalTable: "Apartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Users_UserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Apartments_ApartmentId",
                table: "Reviews",
                column: "ApartmentId",
                principalTable: "Apartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Apartments_ApartmentId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Users_UserId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Apartments_ApartmentId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("0ca8de27-44b4-4c8d-b403-35564510eac9"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("1ecb8100-1a9a-4acf-a871-a5740ece57e9"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("206dee5f-27f0-42a7-b46b-1fdd0002a024"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("4a05fbdf-f770-4fbe-862a-23a9f29d83ca"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("740da3a0-7b40-4e10-b4e9-5aa34bd2fecd"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("9b5fa40a-990e-41ed-b2d1-751348de3585"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("f5361898-1672-4037-9c2d-4a0a9c3a9ac2"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("04ea93e0-371c-4471-8790-1bcea0498bb1"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("40fc8672-0c18-428f-9c7d-a49e1ce867dd"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("b1593040-e290-4389-8338-49dbb1808940"));

            migrationBuilder.DeleteData(
                table: "Bookings",
                keyColumn: "Id",
                keyValue: new Guid("e057f059-8eed-4a25-ba78-213f7cbf91d9"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("23261b85-bab4-4078-8b9d-fd5114aacad0"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("28e4ec8b-e279-432a-891b-3d2f6c7038eb"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("c1fda026-1dab-47d0-ae5a-21205e218f5f"));

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: new Guid("c2ddddab-7cc7-4fc9-b717-f938a6493196"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("1bd50118-b902-4cd0-b333-2915a9881a26"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("3b62427a-0f35-4046-ba3f-67dc29e4d927"));

            migrationBuilder.DeleteData(
                table: "Apartments",
                keyColumn: "Id",
                keyValue: new Guid("7cc32e35-46e8-42cb-aaf0-382b2236cb2f"));

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

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Apartments_ApartmentId",
                table: "Bookings",
                column: "ApartmentId",
                principalTable: "Apartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Users_UserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Apartments_ApartmentId",
                table: "Reviews",
                column: "ApartmentId",
                principalTable: "Apartments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
