using Acutis.Application;
using Acutis.Application.Validators;
using Acutis.Infrastructure;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("HELLO FROM ACUTIS STARTUP");

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ==========================================
// AUTHENTICATION - Choose one approach:
// ==========================================

// OPTION 1: Simple JWT for local development (Quick start)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyForDevelopmentOnly_MinimumLength32Chars!"))
        };
    });

// OPTION 2: Azure AD (Recommended for production - uncomment when ready)
// Install: Microsoft.Identity.Web
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//     .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// ==========================================
// AUTHORIZATION POLICIES
// ==========================================
builder.Services.AddAuthorization(options =>
{
    // Call Logging policies
    options.AddPolicy("CallLogging.Read", policy =>
    {
        policy.RequireAuthenticatedUser();
        // For JWT approach, check claims
        policy.RequireClaim("permissions", "CallLogging.Read");
    });

    options.AddPolicy("CallLogging.Write", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permissions", "CallLogging.Write");
    });

    // ACUTIS Healthcare-specific policies
    options.AddPolicy("Patient.Read", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permissions", "Patient.Read");
    });

    options.AddPolicy("Patient.Write", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permissions", "Patient.Write");
    });

    options.AddPolicy("Admissions.Manage", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permissions", "Admissions.Manage");
    });

    options.AddPolicy("GroupTherapy.Manage", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permissions", "GroupTherapy.Manage");
    });

    options.AddPolicy("Reports.Read", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("permissions", "Reports.Read");
    });

    options.AddPolicy("Admin.Full", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("role", "Admin");
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddValidatorsFromAssemblyContaining<CreateResidentRequestValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateResidentRequestValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Acutis", cors => cors
        .WithOrigins("http://localhost:3000", "https://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials() // only if you need cookies/auth
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Acutis");

// ==========================================
// CRITICAL: Authentication MUST come before Authorization
// ==========================================
app.UseAuthentication();  // <-- Added this - MUST be before UseAuthorization()
app.UseAuthorization();

app.MapControllers();

app.MapGet("/debug/db", (IConfiguration cfg) =>
{
    var cs = cfg.GetConnectionString("PostgresConnection");
    if (string.IsNullOrWhiteSpace(cs))
        return Results.Problem("ConnectionStrings:PostgresConnection is missing");
    var b = new Npgsql.NpgsqlConnectionStringBuilder(cs);
    return Results.Ok(new
    {
        Host = b.Host,
        Port = b.Port,
        Username = b.Username,
        Database = b.Database,
        SslMode = b.SslMode.ToString()
    });
});

app.MapGet("/health/db", async (AppDbContext db) =>
{
    await db.Database.OpenConnectionAsync();
    return Results.Ok("Ok");
});

app.Run();