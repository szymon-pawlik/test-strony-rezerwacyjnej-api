using Microsoft.AspNetCore.Mvc;
using TicketServiceApp.Data;     // Dla TicketDbContext
using TicketServiceApp.Models;   // Dla Ticket, TicketReply, TicketStatus, UserRoles
using TicketServiceApp.DTOs;     // Dla CreateTicketDto, TicketDetailDto, TicketReplyDto, CreateTicketReplyDto
using System;
using System.Collections.Generic;
using System.Linq;               // Dla metod LINQ (Where, OrderBy, Skip, Take, etc.)
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // Dla metod EF Core (Include, AsNoTracking, FirstOrDefaultAsync, CountAsync, ToListAsync)
using Microsoft.AspNetCore.Authorization; // Dla atrybutów [Authorize], [AllowAnonymous]
using System.Security.Claims;    // Dla ClaimTypes do odczytu ID i emaila użytkownika
using Microsoft.Extensions.Logging;  // Dla ILogger
// using System.IO; // Nieużywane w tym pliku
using Microsoft.AspNetCore.Http; // Dla StatusCodes

namespace TicketServiceApp.Controllers
{
    /// <summary>
    /// Kontroler API do zarządzania zgłoszeniami (ticketami).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Bazowa trasa to "api/tickets"
    public class TicketsController : ControllerBase
    {
        private readonly TicketDbContext _context; // Kontekst bazy danych dla zgłoszeń
        private readonly ILogger<TicketsController> _logger; // Logger

        // Konstruktor wstrzykujący zależności.
        public TicketsController(TicketDbContext context, ILogger<TicketsController> logger )
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Tworzy nowe zgłoszenie (ticket). Wymaga autoryzacji.
        /// </summary>
        [HttpPost]
        [Authorize] // Dostęp tylko dla zalogowanych użytkowników
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto ticketDto)
        {
            // Pobranie ID i emaila zalogowanego użytkownika z tokenu JWT.
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                _logger.LogWarning("CreateTicket: Unauthorized attempt - could not parse UserId from token.");
                return Unauthorized(new { Message = "Invalid token or missing user ID in token." });
            }
            userEmail ??= "unknown@example.com"; // Domyślny email, jeśli nie ma go w tokenie.

            if (!ModelState.IsValid) // Walidacja DTO (np. atrybutami DataAnnotations)
            {
                return BadRequest(ModelState);
            }

            // Tworzenie nowej encji zgłoszenia.
            var ticketEntity = new Ticket
            {
                Id = Guid.NewGuid(),
                UserId = authenticatedUserId,
                UserEmail = userEmail,
                Subject = ticketDto.Subject,
                Description = ticketDto.Description,
                Status = TicketStatus.Open, // Domyślny status nowego zgłoszenia
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };

            try
            {
                _context.Tickets.Add(ticketEntity);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Ticket {TicketId} created for user {UserId} ({UserEmail})", ticketEntity.Id, ticketEntity.UserId, ticketEntity.UserEmail);

                // Mapowanie na DTO odpowiedzi.
                var ticketResponseDto = new TicketDetailDto
                {
                    Id = ticketEntity.Id,
                    UserId = ticketEntity.UserId,
                    UserEmail = ticketEntity.UserEmail,
                    Subject = ticketEntity.Subject,
                    Description = ticketEntity.Description,
                    Status = ticketEntity.Status,
                    CreatedAt = ticketEntity.CreatedAt,
                    LastUpdatedAt = ticketEntity.LastUpdatedAt,
                    Replies = new List<TicketReplyDto>() // Nowy ticket nie ma jeszcze odpowiedzi
                };
                // Zwrócenie statusu 201 Created z lokalizacją nowego zasobu i samym zasobem.
                return CreatedAtAction(nameof(GetTicketById), new { id = ticketResponseDto.Id }, ticketResponseDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ticket for user {UserId}", authenticatedUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An internal server error occurred while creating the ticket." });
            }
        }

        /// <summary>
        /// Pobiera szczegóły zgłoszenia o podanym ID. Wymaga autoryzacji.
        /// Dostępne dla właściciela zgłoszenia lub administratora.
        /// </summary>
        [HttpGet("{id:guid}", Name = "GetTicketById")]
        [Authorize]
        public async Task<IActionResult> GetTicketById(Guid id)
        {
            _logger.LogInformation("GetTicketById: Attempting to fetch ticket with ID: {TicketId}", id);
            // Pobranie zgłoszenia wraz z odpowiedziami. AsNoTracking() dla operacji tylko do odczytu.
            var ticketEntity = await _context.Tickets
                                       .Include(t => t.Replies) // Dołączenie powiązanych odpowiedzi
                                       .AsNoTracking()
                                       .FirstOrDefaultAsync(t => t.Id == id);
            if (ticketEntity == null)
            {
                _logger.LogWarning("GetTicketById: Ticket with ID {TicketId} not found.", id);
                return NotFound(new { Message = $"Ticket with ID {id} not found." });
            }

            // Sprawdzenie uprawnień do odczytu zgłoszenia.
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out Guid authenticatedUserId);
            bool isAdmin = User.IsInRole(UserRoles.Admin); // Zakładając, że UserRoles.Admin jest zdefiniowane

            _logger.LogInformation("GetTicketById - Checking access for User: {AuthenticatedUserId}, IsAdmin: {IsAdmin}, TicketOwner: {TicketOwnerId}", authenticatedUserId, isAdmin, ticketEntity.UserId);
            if (ticketEntity.UserId != authenticatedUserId && !isAdmin)
            {
                _logger.LogWarning("GetTicketById: User {AuthenticatedUserId} (Admin: {IsAdmin}) attempted to access ticket {TicketId} owned by user {TicketOwnerId}. Access denied.", authenticatedUserId, isAdmin, id, ticketEntity.UserId);
                return Forbid(); // Zwraca 403 Forbidden, jeśli użytkownik nie ma uprawnień.
            }

            // Mapowanie na DTO odpowiedzi.
            var ticketDetailDto = new TicketDetailDto
            {
                Id = ticketEntity.Id,
                UserId = ticketEntity.UserId,
                UserEmail = ticketEntity.UserEmail,
                Subject = ticketEntity.Subject,
                Description = ticketEntity.Description,
                Status = ticketEntity.Status,
                CreatedAt = ticketEntity.CreatedAt,
                LastUpdatedAt = ticketEntity.LastUpdatedAt,
                Replies = ticketEntity.Replies?.Select(reply => new TicketReplyDto
                {
                    Id = reply.Id,
                    TicketId = reply.TicketId,
                    ReplierUserId = reply.ReplierUserId,
                    ReplierUserEmail = reply.ReplierUserEmail,
                    Message = reply.Message,
                    RepliedAt = reply.RepliedAt
                }).OrderBy(r => r.RepliedAt).ToList() ?? new List<TicketReplyDto>() // Sortowanie odpowiedzi
            };
            _logger.LogInformation("GetTicketById: Ticket {TicketId} details retrieved successfully for user {AuthenticatedUserId}.", id, authenticatedUserId);
            return Ok(ticketDetailDto);
        }

        /// <summary>
        /// Pobiera wszystkie zgłoszenia (dla administratora) z opcjami filtrowania, sortowania i paginacji.
        /// Wymaga polityki "AdminPolicy".
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "AdminPolicy")] // Dostęp tylko dla użytkowników spełniających politykę "AdminPolicy"
        public async Task<IActionResult> GetAllTicketsForAdmin(
            [FromQuery] string? status,    // Filtr statusu
            [FromQuery] string? sortBy,    // Pole do sortowania
            [FromQuery] bool ascending = true, // Kierunek sortowania
            [FromQuery] int pageNumber = 1,   // Numer strony
            [FromQuery] int pageSize = 10)    // Rozmiar strony
        {
            _logger.LogInformation("GetAllTicketsForAdmin: Admin fetching all tickets. StatusFilter: {Status}, SortBy: {SortBy}, Ascending: {Ascending}, Page: {PageNumber}, PageSize: {PageSize}", status, sortBy, ascending, pageNumber, pageSize);

            IQueryable<Ticket> query = _context.Tickets.AsQueryable();

            // Filtrowanie po statusie.
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<TicketStatus>(status, true, out var ticketStatus))
            {
                query = query.Where(t => t.Status == ticketStatus);
            }

            // Sortowanie.
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLowerInvariant())
                {
                    case "date":
                        query = ascending ? query.OrderBy(t => t.CreatedAt) : query.OrderByDescending(t => t.CreatedAt);
                        break;
                    case "status":
                        query = ascending ? query.OrderBy(t => t.Status) : query.OrderByDescending(t => t.Status);
                        break;
                    default: // Domyślne sortowanie, jeśli sortBy nie jest rozpoznane
                        query = query.OrderByDescending(t => t.CreatedAt);
                        break;
                }
            }
            else
            {
                // Domyślne sortowanie po dacie ostatniej aktualizacji lub utworzenia.
                query = query.OrderByDescending(t => t.LastUpdatedAt ?? t.CreatedAt);
            }

            // Paginacja.
            var totalItems = await query.CountAsync();
            var ticketEntities = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking() // Operacja tylko do odczytu.
                .ToListAsync();

            // Mapowanie na DTO, skracanie opisu.
            var ticketDtos = ticketEntities.Select(ticketEntity => new TicketDetailDto
            {
                Id = ticketEntity.Id,
                UserId = ticketEntity.UserId,
                UserEmail = ticketEntity.UserEmail,
                Subject = ticketEntity.Subject,
                Description = ticketEntity.Description.Length > 100 ? ticketEntity.Description.Substring(0, 100) + "..." : ticketEntity.Description,
                Status = ticketEntity.Status,
                CreatedAt = ticketEntity.CreatedAt,
                LastUpdatedAt = ticketEntity.LastUpdatedAt,
                Replies = null // Nie dołączamy odpowiedzi w liście ogólnej dla wydajności.
            }).ToList();

            _logger.LogInformation("GetAllTicketsForAdmin: Retrieved {TicketCount} tickets out of {TotalItems}.", ticketDtos.Count, totalItems);
            // Zwrócenie wyników wraz z informacjami o paginacji.
            return Ok(new { Items = ticketDtos, TotalCount = totalItems, PageNumber = pageNumber, PageSize = pageSize });
        }

        /// <summary>
        /// Dodaje odpowiedź do istniejącego zgłoszenia. Wymaga autoryzacji.
        /// Dostępne dla właściciela zgłoszenia lub administratora.
        /// </summary>
        [HttpPost("{ticketId:guid}/replies")]
        [Authorize]
        public async Task<IActionResult> AddReplyToTicket(Guid ticketId, [FromBody] CreateTicketReplyDto replyDto)
        {
            // Pobranie danych zalogowanego użytkownika.
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid replierUserId))
            {
                _logger.LogWarning("AddReplyToTicket: Unauthorized attempt - could not parse UserId from token for ticket {TicketId}.", ticketId);
                return Unauthorized(new { Message = "Invalid token or missing user ID in token." });
            }
            userEmail ??= "Użytkownik systemowy"; // Domyślny email.

            var ticket = await _context.Tickets.FindAsync(ticketId); // Znajdź zgłoszenie.
            if (ticket == null)
            {
                _logger.LogWarning("AddReplyToTicket: Ticket with ID {TicketId} not found.", ticketId);
                return NotFound(new { Message = $"Ticket o ID {ticketId} nie został znaleziony." });
            }

            // Sprawdzenie uprawnień do dodania odpowiedzi.
            bool isAdmin = User.IsInRole(UserRoles.Admin);
            if (ticket.UserId != replierUserId && !isAdmin)
            {
                _logger.LogWarning("AddReplyToTicket: User {ReplierUserId} attempted to add reply to ticket {TicketId} they do not own and is not an admin.", replierUserId, ticketId);
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Tworzenie nowej encji odpowiedzi.
            var ticketReplyEntity = new TicketReply
            {
                Id = Guid.NewGuid(),
                TicketId = ticketId,
                ReplierUserId = replierUserId,
                ReplierUserEmail = userEmail,
                Message = replyDto.Message,
                RepliedAt = DateTime.UtcNow
            };

            // Aktualizacja statusu zgłoszenia i daty ostatniej modyfikacji.
            ticket.LastUpdatedAt = DateTime.UtcNow;
            if (isAdmin && ticket.UserId != replierUserId && (ticket.Status == TicketStatus.Open || ticket.Status == TicketStatus.CustomerReply))
            {
                 ticket.Status = TicketStatus.InProgress; // Admin odpowiada -> InProgress
            } else if (!isAdmin && ticket.UserId == replierUserId && ticket.Status == TicketStatus.InProgress) {
                 ticket.Status = TicketStatus.CustomerReply; // Klient odpowiada na odpowiedź admina -> CustomerReply
            }

            try
            {
                _context.TicketReplies.Add(ticketReplyEntity);
                _context.Tickets.Update(ticket); // Zaktualizuj encję ticketu (status, LastUpdatedAt)
                await _context.SaveChangesAsync();
                _logger.LogInformation("Reply {ReplyId} added to ticket {TicketId} by user {ReplierUserId}", ticketReplyEntity.Id, ticketId, replierUserId);

                // Mapowanie na DTO odpowiedzi.
                var replyResponseDto = new TicketReplyDto
                {
                    Id = ticketReplyEntity.Id,
                    TicketId = ticketReplyEntity.TicketId,
                    ReplierUserId = ticketReplyEntity.ReplierUserId,
                    ReplierUserEmail = ticketReplyEntity.ReplierUserEmail,
                    Message = ticketReplyEntity.Message,
                    RepliedAt = ticketReplyEntity.RepliedAt
                };

                return StatusCode(StatusCodes.Status201Created, replyResponseDto); // Zwrócenie 201 Created z danymi odpowiedzi.
            }
            catch (DbUpdateException ex) // Obsługa błędów bazy danych.
            {
                _logger.LogError(ex, "DbUpdateException while adding reply to ticket {TicketId} by user {ReplierUserId}", ticketId, replierUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "A database error occurred while adding the reply."});
            }
            catch (Exception ex) // Obsługa innych błędów serwera.
            {
                _logger.LogError(ex, "Error adding reply to ticket {TicketId} by user {ReplierUserId}", ticketId, replierUserId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An internal server error occurred while adding the reply." });
            }
        }

        /// <summary>
        /// Pobiera zgłoszenia dla aktualnie zalogowanego użytkownika z paginacją.
        /// Wymaga autoryzacji.
        /// </summary>
        [HttpGet("my-tickets")]
        [Authorize]
        public async Task<IActionResult> GetMyTickets(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            // Pobranie ID zalogowanego użytkownika.
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                return Unauthorized(new { Message = "Użytkownik nie jest poprawnie zautoryzowany." });
            }

            _logger.LogInformation("GetMyTickets: User {UserId} fetching their tickets. Page: {PageNumber}, PageSize: {PageSize}", authenticatedUserId, pageNumber, pageSize);

            // Zapytanie do bazy o zgłoszenia danego użytkownika.
            IQueryable<Ticket> query = _context.Tickets
                                           .Where(t => t.UserId == authenticatedUserId)
                                           .OrderByDescending(t => t.LastUpdatedAt ?? t.CreatedAt); // Sortowanie.

            // Paginacja.
            var totalItems = await query.CountAsync();
            var ticketEntities = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            // Mapowanie na DTO.
            var ticketDtos = ticketEntities.Select(ticketEntity => new TicketDetailDto
            {
                Id = ticketEntity.Id,
                UserId = ticketEntity.UserId,
                UserEmail = ticketEntity.UserEmail,
                Subject = ticketEntity.Subject,
                Description = ticketEntity.Description.Length > 100 ? ticketEntity.Description.Substring(0, 100) + "..." : ticketEntity.Description,
                Status = ticketEntity.Status,
                CreatedAt = ticketEntity.CreatedAt,
                LastUpdatedAt = ticketEntity.LastUpdatedAt,
                Replies = null // Nie dołączamy odpowiedzi w liście.
            }).ToList();

            // Zwrócenie wyników z informacjami o paginacji.
            return Ok(new { Items = ticketDtos, TotalCount = totalItems, PageNumber = pageNumber, PageSize = pageSize });
        }
    }
}