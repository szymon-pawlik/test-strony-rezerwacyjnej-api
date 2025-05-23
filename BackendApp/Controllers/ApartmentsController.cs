using BackendApp.DTOs; // Importowanie Data Transfer Objects (DTO)
using BackendApp.Models; // Importowanie modeli encji
using BackendApp.Services; // Importowanie serwisów (logika biznesowa)
using FluentValidation; // Importowanie biblioteki FluentValidation do walidacji
using Microsoft.AspNetCore.Authorization; // Importowanie atrybutów autoryzacji
using Microsoft.AspNetCore.Mvc; // Importowanie podstawowych klas ASP.NET Core MVC
using System;
using System.Threading.Tasks;

namespace BackendApp.Controllers
{
    /// <summary>
    /// Kontroler API do zarządzania mieszkaniami.
    /// </summary>
    [ApiController] // Oznacza, że ta klasa jest kontrolerem API (wprowadza pewne konwencje)
    [Route("api/[controller]")] // Definiuje szablon trasy dla tego kontrolera, np. "api/apartments"
    public class ApartmentsController : ControllerBase
    {
        private readonly IApartmentService _apartmentService; // Serwis odpowiedzialny za logikę biznesową mieszkań
        private readonly IValidator<ApartmentDTO> _apartmentValidator; // Walidator dla DTO mieszkania

        /// <summary>
        /// Konstruktor kontrolera ApartmentsController.
        /// Wstrzykuje zależności serwisu mieszkań i walidatora.
        /// </summary>
        /// <param name="apartmentService">Serwis do operacji na mieszkaniach.</param>
        /// <param name="apartmentValidator">Walidator dla ApartmentDTO.</param>
        public ApartmentsController(IApartmentService apartmentService, IValidator<ApartmentDTO> apartmentValidator)
        {
            _apartmentService = apartmentService;
            _apartmentValidator = apartmentValidator;
        }

        /// <summary>
        /// Pobiera listę wszystkich mieszkań.
        /// Wymaga autoryzacji.
        /// </summary>
        /// <returns>Lista wszystkich mieszkań.</returns>
        [HttpGet] // Obsługuje żądania HTTP GET na trasie bazowej kontrolera (np. api/apartments)
        [Authorize] // Wskazuje, że dostęp do tej metody wymaga autoryzowanego użytkownika
        public async Task<IActionResult> GetAllApartments()
        {
            var apartments = await _apartmentService.GetAllApartmentsAsync();
            return Ok(apartments); // Zwraca status 200 OK wraz z listą mieszkań
        }

        /// <summary>
        /// Pobiera mieszkanie o podanym identyfikatorze.
        /// </summary>
        /// <param name="id">Identyfikator GUID mieszkania.</param>
        /// <returns>Dane mieszkania lub status 404 Not Found, jeśli nie znaleziono.</returns>
        [HttpGet("{id:guid}")] // Obsługuje żądania HTTP GET na trasie np. api/apartments/{guid}
                               // Ograniczenie ":guid" zapewnia, że ID jest poprawnym GUIDem
        public async Task<IActionResult> GetApartmentById(Guid id)
        {
            var apartment = await _apartmentService.GetApartmentByIdAsync(id);
            if (apartment == null)
            {
                return NotFound(); // Zwraca status 404 Not Found, jeśli mieszkanie nie istnieje
            }
            return Ok(apartment); // Zwraca status 200 OK wraz z danymi mieszkania
        }

        /// <summary>
        /// Tworzy nowe mieszkanie.
        /// Wymaga autoryzacji oraz uprawnień zdefiniowanych w polisie "AdminPolicy".
        /// </summary>
        /// <param name="apartmentDto">Dane nowego mieszkania przekazane w ciele żądania.</param>
        /// <returns>Status 201 Created wraz z utworzonym mieszkaniem lub błędy walidacji.</returns>
        [HttpPost] // Obsługuje żądania HTTP POST na trasie bazowej kontrolera
        [Authorize(Policy = "AdminPolicy")] // Wymaga autoryzacji i spełnienia polityki "AdminPolicy" (np. rola Admina)
        public async Task<IActionResult> CreateApartment([FromBody] ApartmentDTO apartmentDto)
        {
            // Walidacja danych wejściowych DTO za pomocą FluentValidation
            var validationResult = await _apartmentValidator.ValidateAsync(apartmentDto);
            if (!validationResult.IsValid)
            {
                // Jeśli walidacja nie powiodła się, zwróć status 400 BadRequest z błędami walidacji
                return BadRequest(validationResult.ToDictionary());
            }

            // Mapowanie z DTO na model encji Apartment
            var apartment = new Apartment(
                Guid.NewGuid(), // Generowanie nowego, unikalnego ID dla mieszkania
                apartmentDto.Name,
                apartmentDto.Description,
                apartmentDto.Location,
                apartmentDto.NumberOfBedrooms,
                apartmentDto.NumberOfBathrooms,
                apartmentDto.Amenities,
                apartmentDto.IsAvailable,
                apartmentDto.PricePerNight
            );

            // Utworzenie mieszkania za pomocą serwisu
            var createdApartment = await _apartmentService.CreateApartmentAsync(apartment);

            // Zwrócenie statusu 201 Created wraz z lokalizacją nowo utworzonego zasobu
            // oraz samym utworzonym zasobem w ciele odpowiedzi.
            // nameof(GetApartmentById) odnosi się do metody, która pozwala pobrać ten zasób.
            return CreatedAtAction(nameof(GetApartmentById), new { id = createdApartment.Id }, createdApartment);
        }
    }
}