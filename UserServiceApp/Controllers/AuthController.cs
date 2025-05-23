
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using UserServiceApp.DTOs;
using UserServiceApp.Services;
using Microsoft.AspNetCore.Authorization; // Dla [Authorize]
using System.Security.Claims; // Dla ClaimTypes

namespace UserServiceApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(CreateUserDto createUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _authService.RegisterUserAsync(createUserDto);
            if (user == null)
            {
                return Conflict(new { message = "User with this email already exists." });
            }

            var userDto = new UserDto(user.Id, user.Name, user.Email, user.Role);
            _logger.LogInformation("User registered: {Email}", user.Email);

            return CreatedAtAction(
                actionName: nameof(UsersController.GetUserById),
                routeValues: new { controller = "Users", id = user.Id },
                value: userDto
            ); 
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto loginRequestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var token = await _authService.LoginUserAsync(loginRequestDto);
            if (token == null)
            {
                _logger.LogWarning("Login failed for email: {Email}", loginRequestDto.Email);
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var userDto = await _authService.GetUserDtoByEmailAsync(loginRequestDto.Email);
            _logger.LogInformation("User logged in: {Email}", loginRequestDto.Email);
            return Ok(new LoginResponseDto(token, userDto!)); // Użyj '!' jeśli jesteś pewien, że userDto nie będzie null po pomyślnym logowaniu
        }


















    }
}