
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using UserServiceApp.Data; 
using UserServiceApp.DTOs;
using UserServiceApp.Models; 


namespace UserServiceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UsersController : ControllerBase
    {
        private readonly UserDbContext _context; 
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserDto>> GetUserById(Guid id)
        {

            var user = await _context.Users.FindAsync(id); 

            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found in GetUserById.", id);
                return NotFound(new { message = "User not found." });
            }

            return Ok(new UserDto(user.Id, user.Name, user.Email, user.Role));
        }

        [HttpGet("me")] 
        public async Task<ActionResult<UserDto>> GetMe()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out Guid authenticatedUserId))
            {
                _logger.LogWarning("GetMe: Could not parse UserId from token claims: {UserIdString}", userIdString);
                return Unauthorized(new { message = "Invalid token or user identifier missing." });
            }

            var user = await _context.Users.FindAsync(authenticatedUserId);
            if (user == null)
            {
                _logger.LogError("GetMe: Authenticated user with ID {UserId} not found in database.", authenticatedUserId);
                return NotFound(new { message = "User not found." });
            }
            _logger.LogInformation("GetMe: Successfully retrieved data for UserId {UserId}", authenticatedUserId);
            return Ok(new UserDto(user.Id, user.Name, user.Email, user.Role));
        }


        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto updateUserRoleDto)
        {
            if (updateUserRoleDto == null || string.IsNullOrWhiteSpace(updateUserRoleDto.Role))
            {
                return BadRequest(new { message = "Role is required." });
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("UpdateUserRole: User with ID {UserId} not found.", id);
                return NotFound(new { message = "User not found." });
            }

            user.Role = updateUserRoleDto.Role;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} role updated to {NewRole} by admin {AdminId}",
                user.Id, user.Role, User.FindFirstValue(ClaimTypes.NameIdentifier));

            return NoContent(); 
        }
    }

    public record UpdateUserRoleDto(string Role);
}