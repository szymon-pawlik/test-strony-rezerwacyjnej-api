
using Microsoft.AspNetCore.Authentication.JwtBearer; // Dodaj
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens; // Dodaj
using System.Text; // Dodaj
using UserServiceApp.Data;
using UserServiceApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("UserServiceConnection")));

builder.Services.AddScoped<IAuthService, AuthService>(); // Zarejestrowany serwis

var jwtKey = builder.Configuration["JwtSettings:Key"];
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];

if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
{

    Console.Error.WriteLine("FATAL ERROR: JWT Settings (Key, Issuer, Audience) are not fully configured in UserServiceApp.");

}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)) // Użyj '!' jeśli jesteś pewien, że nie jest null po sprawdzeniu wyżej
    };
});

builder.Services.AddAuthorization(); // Dodaj obsługę autoryzacji

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Możesz dodać konfigurację Swaggera do obsługi JWT

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage(); // Lepsze komunikaty o błędach na dev
}


app.UseRouting(); // Ważne: UseRouting przed UseAuthentication/UseAuthorization

app.UseAuthentication(); // WAŻNE: Dodaj middleware autentykacji
app.UseAuthorization();  // WAŻNE: Dodaj middleware autoryzacji

app.MapControllers();

app.Run();