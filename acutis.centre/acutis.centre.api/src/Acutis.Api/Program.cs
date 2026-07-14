using System.IdentityModel.Tokens.Jwt;
using Acutis.Api.Middleware;
using Acutis.Api.Security;
using Acutis.Api.Services.Configuration;
using Acutis.Api.Services.Ambulatory;
using Acutis.Api.Services.Forms;
using Acutis.Api.Services.GroupTherapy;
using Acutis.Api.Services.Incidents;
using Acutis.Api.Services.Lookups;
using Acutis.Api.Services.MediaPlayer;
using Acutis.Api.Services.Policy;
using Acutis.Api.Services.Quotes;
using Acutis.Api.Services.Residents;
using Acutis.Api.Services.Screening;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Api.Services.Units;
using Acutis.Api.Services.UnitVideos;
using Acutis.Application.Interfaces;
using Acutis.Application.Services;
using Acutis.Infrastructure.Data;
using Acutis.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using Acutis.Api.Services.VideoConsultations;
using System.Threading.RateLimiting;

DotEnvLoader.LoadForCurrentEnvironment();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = HttpLoggingFields.RequestMethod |
                            HttpLoggingFields.RequestPath |
                            HttpLoggingFields.RequestQuery |
                            HttpLoggingFields.ResponseStatusCode |
                            HttpLoggingFields.Duration;
});

builder.Services.AddDbContext<AcutisDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure()));

var defaultConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");
var ambulatoryConnectionString = builder.Configuration.GetConnectionString("AmbulatoryConnection")
    ?? defaultConnectionString.Replace("Database=bruree-cm-db;", "Database=bruree-cm-ambulatory-db;", StringComparison.OrdinalIgnoreCase)
        .Replace("Database=Acutis_CuanMhuire_IE_Dev;", "Database=Acutis_Ambulatory_IE_Dev;", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<AcutisAmbulatoryDbContext>(options =>
    options.UseSqlServer(ambulatoryConnectionString, sql => sql.EnableRetryOnFailure()));

builder.Services.AddScoped<ICallRepository, CallRepository>();
builder.Services.AddScoped<ICallService, CallService>();
builder.Services.AddScoped<IFormService, FormService>();
builder.Services.AddScoped<IOptionService, OptionService>();
builder.Services.AddScoped<ITranslationService, TranslationService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();
builder.Services.AddScoped<IAdmissionCompletionService, AdmissionCompletionService>();
builder.Services.AddScoped<IFormValidationService, FormValidationService>();
builder.Services.AddScoped<CanonicalHseFormSeeder>();
builder.Services.AddScoped<IScreeningControlService, ScreeningControlService>();
builder.Services.AddScoped<IGlobalConfigurationService, GlobalConfigurationService>();
builder.Services.AddScoped<IFormConfigurationService, FormConfigurationService>();
builder.Services.AddScoped<IElementLibraryService, ElementLibraryService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<IGroupTherapyService, GroupTherapyService>();
builder.Services.AddScoped<IIncidentService, IncidentService>();
builder.Services.AddScoped<IResidentService, ResidentService>();
builder.Services.AddScoped<IUnitOperationsService, UnitOperationsService>();
builder.Services.AddScoped<IUnitTimelineService, UnitTimelineService>();
builder.Services.AddScoped<IUnitStaffRosterService, UnitStaffRosterService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ITherapySchedulingService, TherapySchedulingService>();
builder.Services.AddScoped<IMediaPlayerService, MediaPlayerService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();
builder.Services.AddScoped<IUnitVideoService, UnitVideoService>();
builder.Services.AddScoped<IUnitVideoAdminService, UnitVideoService>();
builder.Services.AddScoped<IUnitIdentityService, UnitIdentityService>();
builder.Services.AddScoped<IAmbulatoryService, AmbulatoryService>();
builder.Services.Configure<LiveKitOptions>(builder.Configuration.GetSection(LiveKitOptions.SectionName));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ILiveKitTokenService, LiveKitTokenService>();
builder.Services.AddScoped<IVideoConsultationService, VideoConsultationService>();
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("video-consultation-tokens", context => RateLimitPartition.GetFixedWindowLimiter(
        context.User.FindFirst("sub")?.Value ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 12, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});
builder.Services.AddHttpLoggingInterceptor<SensitivePathHttpLoggingInterceptor>();
builder.Services.AddSingleton<IApplicationAccessService, ApplicationAccessService>();
builder.Services.Configure<OfflineWindowPolicyOptions>(builder.Configuration.GetSection("OfflineWindowPolicy"));
builder.Services.Configure<AuthorizationOptions>(builder.Configuration.GetSection(AuthorizationOptions.SectionName));
builder.Services.Configure<KeycloakAdminOptions>(builder.Configuration.GetSection(KeycloakAdminOptions.SectionName));
builder.Services.AddSingleton<IOfflineWindowPolicyService, OfflineWindowPolicyService>();
builder.Services.AddHttpContextAccessor();

var keycloakAdminOptions = builder.Configuration
    .GetSection(KeycloakAdminOptions.SectionName)
    .Get<KeycloakAdminOptions>() ?? new KeycloakAdminOptions();
if (keycloakAdminOptions.Enabled)
{
    builder.Services.AddHttpClient<IKeycloakAdminService, KeycloakAdminService>(client =>
    {
        var baseUrl = keycloakAdminOptions.BaseUrl.Trim().TrimEnd('/');
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException("KeycloakAdmin:BaseUrl is required when Keycloak admin integration is enabled.");
        }

        client.BaseAddress = new Uri($"{baseUrl}/");
    });
}
else
{
    builder.Services.AddSingleton<IKeycloakAdminService, DisabledKeycloakAdminService>();
}

var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
var defaultDevelopmentCorsOrigins = new[]
{
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000"
};
var allowedCorsOrigins = corsOrigins.Length > 0
    ? corsOrigins
    : builder.Environment.IsDevelopment()
        ? defaultDevelopmentCorsOrigins
        : Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("WebApp", policy =>
    {
        if (allowedCorsOrigins.Length == 0)
        {
            // Last-resort local dev fallback when no explicit origins are configured.
            policy.SetIsOriginAllowed(origin =>
                origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("https://localhost:", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("http://127.0.0.1:", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("https://127.0.0.1:", StringComparison.OrdinalIgnoreCase))
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        policy.WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var authorizationOptions = builder.Configuration
    .GetSection(AuthorizationOptions.SectionName)
    .Get<AuthorizationOptions>() ?? new AuthorizationOptions();

if (!authorizationOptions.Disabled)
{
    var jwtSection = builder.Configuration.GetSection("Jwt");
    var jwtIssuer = jwtSection["Issuer"] ?? jwtSection["Authority"];
    var jwtAuthority = jwtSection["Authority"] ?? jwtIssuer;
    var jwtAudience = jwtSection["Audience"];
    var ambulatoryJwtIssuer = jwtSection["AmbulatoryIssuer"] ?? jwtSection["AmbulatoryAuthority"];
    var ambulatoryJwtAuthority = jwtSection["AmbulatoryAuthority"] ?? ambulatoryJwtIssuer;
    var ambulatoryJwtAudience = jwtSection["AmbulatoryAudience"] ?? jwtAudience;

    if (string.IsNullOrWhiteSpace(jwtIssuer))
    {
        throw new InvalidOperationException("Jwt:Issuer or Jwt:Authority is required for Keycloak.");
    }

    if (string.IsNullOrWhiteSpace(jwtAuthority))
    {
        throw new InvalidOperationException("Jwt:Authority is required for Keycloak metadata.");
    }

    if (string.IsNullOrWhiteSpace(ambulatoryJwtIssuer) || string.IsNullOrWhiteSpace(ambulatoryJwtAuthority))
    {
        throw new InvalidOperationException("Jwt:AmbulatoryIssuer or Jwt:AmbulatoryAuthority is required for ambulatory Keycloak.");
    }

    const string acutisKeycloakScheme = "AcutisKeycloak";
    const string ambulatoryKeycloakScheme = "AmbulatoryKeycloak";
    var tokenHandler = new JwtSecurityTokenHandler();

    builder.Services
        .AddAuthentication(options =>
        {
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddPolicyScheme(JwtBearerDefaults.AuthenticationScheme, "Keycloak realm selector", options =>
        {
            options.ForwardDefaultSelector = context =>
            {
                var authorization = context.Request.Headers.Authorization.ToString();
                if (!authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    return acutisKeycloakScheme;
                }

                var token = authorization["Bearer ".Length..].Trim();
                if (!tokenHandler.CanReadToken(token))
                {
                    return acutisKeycloakScheme;
                }

                var jwtToken = tokenHandler.ReadJwtToken(token);
                return string.Equals(jwtToken.Issuer, ambulatoryJwtIssuer, StringComparison.OrdinalIgnoreCase)
                    ? ambulatoryKeycloakScheme
                    : acutisKeycloakScheme;
            };
        })
        .AddJwtBearer(acutisKeycloakScheme, options =>
        {
            options.Authority = jwtAuthority;
            options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = jwtIssuer,
                ValidAudiences = new[] { jwtAudience }
            };
        })
        .AddJwtBearer(ambulatoryKeycloakScheme, options =>
        {
            options.Authority = ambulatoryJwtAuthority;
            options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = ambulatoryJwtIssuer,
                ValidAudiences = new[] { ambulatoryJwtAudience }
            };
        });

    builder.Services.AddScoped<IClaimsTransformation, KeycloakClientRoleClaimsTransformation>();
}
else
{
    builder.Services
        .AddAuthentication(DevelopmentAuthenticationHandler.SchemeName)
        .AddScheme<AuthenticationSchemeOptions, DevelopmentAuthenticationHandler>(
            DevelopmentAuthenticationHandler.SchemeName,
            _ => { });
}

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy(
        ApplicationPolicies.ConfigurationManage,
        policy =>
        {
            if (authorizationOptions.Disabled)
            {
                policy.RequireAssertion(_ => true);
                return;
            }

            policy.RequireAssertion(context =>
                context.User.HasClaim(ApplicationClaimTypes.Permission, ApplicationPermissions.ConfigurationManage) &&
                ApplicationRoles.SuperAdminAliases.Any(context.User.IsInRole));
        });
});

var app = builder.Build();

var applyMigrationsOnStartup = builder.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup");
if (applyMigrationsOnStartup)
{
    var startupRetryCount = Math.Max(1, builder.Configuration.GetValue<int>("Database:StartupRetryCount", 10));
    var startupRetryDelaySeconds = Math.Max(1, builder.Configuration.GetValue<int>("Database:StartupRetryDelaySeconds", 5));
    Exception? lastException = null;

    for (var attempt = 1; attempt <= startupRetryCount; attempt++)
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AcutisDbContext>();
            var ambulatoryDbContext = scope.ServiceProvider.GetRequiredService<AcutisAmbulatoryDbContext>();
            await dbContext.Database.MigrateAsync();
            await ambulatoryDbContext.Database.MigrateAsync();
            lastException = null;
            break;
        }
        catch (Exception ex)
        {
            lastException = ex;
            if (attempt == startupRetryCount)
            {
                break;
            }

            await Task.Delay(TimeSpan.FromSeconds(startupRetryDelaySeconds));
        }
    }

    if (lastException is not null)
    {
        throw new InvalidOperationException("Failed to apply database migrations during startup.", lastException);
    }
}

{
    using var scope = app.Services.CreateScope();
    var hseFormSeeder = scope.ServiceProvider.GetRequiredService<CanonicalHseFormSeeder>();
    await hseFormSeeder.EnsureSeededAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpLogging();
app.UseMiddleware<FileRequestLoggingMiddleware>();
if (!builder.Configuration.GetValue<bool>("Hosting:DisableHttpsRedirection", false))
{
    app.UseHttpsRedirection();
}
app.UseMiddleware<RequestCorrelationMiddleware>();
app.UseWhen(context => context.Request.Path.StartsWithSegments("/api/video-consultations"), branch =>
    branch.Use(async (context, next) =>
    {
        context.Response.Headers.CacheControl = "no-store, no-cache, max-age=0";
        context.Response.Headers.Pragma = "no-cache";
        await next();
    }));
app.UseCors("WebApp");
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();

app.Run();
