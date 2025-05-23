using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using TicketServiceApp.Data; // Dla TicketDbContext
using TicketServiceApp.Models; // Dla UserRoles

var builder = WebApplication.CreateBuilder(args);

// --- Konfiguracja serwisów w kontenerze Dependency Injection ---

// Konfiguracja CORS (Cross-Origin Resource Sharing) - tutaj z bardzo otwartą polityką.
// W środowisku produkcyjnym należy ją odpowiednio zabezpieczyć.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5235") // Adres URL frontendu głównej aplikacji
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Rejestracja kontekstu bazy danych TicketDbContext z użyciem SQLite.
// Connection string jest pobierany z konfiguracji (np. appsettings.json).
builder.Services.AddDbContext<TicketDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("TicketDbConnection")));

// Konfiguracja uwierzytelniania JWT Bearer.
// Definiuje, jak aplikacja ma walidować przychodzące tokeny JWT.
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, // Walidacja wystawcy tokenu
            ValidateAudience = true, // Walidacja odbiorcy tokenu
            ValidateLifetime = true, // Walidacja czasu życia tokenu
            ValidateIssuerSigningKey = true, // Walidacja klucza podpisującego
            ValidIssuer = builder.Configuration["Jwt:Issuer"], // Oczekiwany wystawca
            ValidAudience = builder.Configuration["Jwt:Audience"], // Oczekiwany odbiorca
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)), // Klucz podpisujący
            RoleClaimType = ClaimTypes.Role // Określenie, który claim w tokenie JWT zawiera informacje o roli
        };
    });

// Konfiguracja autoryzacji i definiowanie polityk.
builder.Services.AddAuthorization(options =>
{
    // Definicja polityki "AdminPolicy", która wymaga uwierzytelnionego użytkownika z rolą Admin.
    options.AddPolicy("AdminPolicy", policy =>
        policy.RequireAuthenticatedUser()
            .RequireRole(UserRoles.Admin)); // UserRoles.Admin powinno być stałą stringową, np. "Admin"
});

// Rejestracja kontrolerów MVC/API.
builder.Services.AddControllers();

// Konfiguracja Swagger/OpenAPI do dokumentacji API.
builder.Services.AddEndpointsApiExplorer(); // Niezbędne dla minimal APIs i nowszych wersji Swaggera.
builder.Services.AddSwaggerGen(options =>
{
    // Podstawowe informacje o API.
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "TicketService API", Version = "v1" });
    // Konfiguracja uwierzytelniania Bearer (JWT) w interfejsie Swagger UI.
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field (e.g. 'Bearer YOUR_TOKEN')",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
    {
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Reference = new Microsoft.OpenApi.Models.OpenApiReference
            {
                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        new string[] {}
    }});
});

var app = builder.Build();

// --- Konfiguracja potoku przetwarzania żądań HTTP (Middleware) ---

// Włączenie Swagger i SwaggerUI tylko w środowisku deweloperskim.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "TicketService API V1");
        // options.RoutePrefix = string.Empty; // Aby Swagger UI było dostępne pod adresem głównym aplikacji (opcjonalne)
    });
}

// Włączenie skonfigurowanej polityki CORS.
app.UseCors();

// Dodanie middleware uwierzytelniania i autoryzacji do potoku.
// Kolejność ma znaczenie: UseAuthentication przed UseAuthorization.
app.UseAuthentication();
app.UseAuthorization();

// Mapowanie żądań do endpointów zdefiniowanych w kontrolerach.
app.MapControllers();

app.Run(); // Uruchomienie aplikacji.