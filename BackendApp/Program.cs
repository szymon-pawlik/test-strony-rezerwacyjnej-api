
using BackendApp.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAppCors(); 
builder.Services.AddApplicationServices(builder.Configuration); 
builder.Services.AddControllers();

builder.Services.AddJwtAuthentication(builder.Configuration); 
builder.Services.AddAppAuthorization();
builder.Services.AddSwaggerAndApiExplorer(); 
builder.Services.AddAppGraphQL(builder.Environment.IsDevelopment()); 

var app = builder.Build();


app.ConfigureMiddlewarePipeline(app.Environment.IsDevelopment());

app.MapControllers();
app.MapGraphQL();


app.Run();