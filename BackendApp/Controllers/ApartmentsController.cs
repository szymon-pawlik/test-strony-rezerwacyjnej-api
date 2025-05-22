// Controllers/ApartmentsController.cs
using BackendApp.DTOs;
using BackendApp.Models;
using BackendApp.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BackendApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // /api/apartments
    public class ApartmentsController : ControllerBase
    {
        private readonly IApartmentService _apartmentService;
        private readonly IValidator<ApartmentDTO> _apartmentValidator;

        public ApartmentsController(IApartmentService apartmentService, IValidator<ApartmentDTO> apartmentValidator)
        {
            _apartmentService = apartmentService;
            _apartmentValidator = apartmentValidator;
        }

        [HttpGet] // GET /api/apartments
        [Authorize] // Zgodnie z oryginałem
        public async Task<IActionResult> GetAllApartments()
        {
            var apartments = await _apartmentService.GetAllApartmentsAsync();
            return Ok(apartments);
        }

        [HttpGet("{id:guid}")] // GET /api/apartments/{id}
        // [Authorize] // Dodaj, jeśli wymagane (w oryginale nie było na tym endpointcie)
        public async Task<IActionResult> GetApartmentById(Guid id)
        {
            var apartment = await _apartmentService.GetApartmentByIdAsync(id);
            if (apartment == null)
            {
                return NotFound();
            }
            return Ok(apartment);
        }

        [HttpPost] // POST /api/apartments
        [Authorize(Policy = "AdminPolicy")] // Tylko admin może tworzyć
        public async Task<IActionResult> CreateApartment([FromBody] ApartmentDTO apartmentDto)
        {
            var validationResult = await _apartmentValidator.ValidateAsync(apartmentDto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ToDictionary());
            }

            var apartment = new Apartment(
                Guid.NewGuid(),
                apartmentDto.Name,
                apartmentDto.Description,
                apartmentDto.Location,
                apartmentDto.NumberOfBedrooms,
                apartmentDto.NumberOfBathrooms,
                apartmentDto.Amenities,
                apartmentDto.IsAvailable,
                apartmentDto.PricePerNight
            );

            var createdApartment = await _apartmentService.CreateApartmentAsync(apartment);
            return CreatedAtAction(nameof(GetApartmentById), new { id = createdApartment.Id }, createdApartment);
        }
    }
}