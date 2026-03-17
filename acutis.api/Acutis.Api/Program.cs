using Acutis.Api.Security;
using Acutis.Api.Services.Configuration;
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
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;

DotEnvLoader.LoadForCurrentEnvironment();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AcutisDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ICallRepository, CallRepository>();
builder.Services.AddScoped<ICallService, CallService>();
builder.Services.AddScoped<IFormService, FormService>();
builder.Services.AddScoped<IOptionService, OptionService>();
builder.Services.AddScoped<ITranslationService, TranslationService>();
builder.Services.AddScoped<ISubmissionService, SubmissionService>();
builder.Services.AddScoped<IFormValidationService, FormValidationService>();
builder.Services.AddScoped<IScreeningControlService, ScreeningControlService>();
builder.Services.AddScoped<IGlobalConfigurationService, GlobalConfigurationService>();
builder.Services.AddScoped<IFormConfigurationService, FormConfigurationService>();
builder.Services.AddScoped<IElementLibraryService, ElementLibraryService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<IGroupTherapyService, GroupTherapyService>();
builder.Services.AddScoped<IIncidentService, IncidentService>();
builder.Services.AddScoped<IResidentService, ResidentService>();
builder.Services.AddScoped<IUnitOperationsService, UnitOperationsService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ITherapySchedulingService, TherapySchedulingService>();
builder.Services.AddScoped<IMediaPlayerService, MediaPlayerService>();
builder.Services.AddScoped<IQuoteService, QuoteService>();
builder.Services.AddScoped<IUnitVideoService, UnitVideoService>();
builder.Services.AddScoped<IUnitVideoAdminService, UnitVideoService>();
builder.Services.AddScoped<IUnitIdentityService, UnitIdentityService>();
builder.Services.AddSingleton<IApplicationAccessService, ApplicationAccessService>();
builder.Services.Configure<OfflineWindowPolicyOptions>(builder.Configuration.GetSection("OfflineWindowPolicy"));
builder.Services.Configure<AuthorizationOptions>(builder.Configuration.GetSection(AuthorizationOptions.SectionName));
builder.Services.AddSingleton<IOfflineWindowPolicyService, OfflineWindowPolicyService>();
builder.Services.AddHttpContextAccessor();

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
    var jwtAudience = jwtSection["Audience"];

    if (string.IsNullOrWhiteSpace(jwtIssuer))
    {
        throw new InvalidOperationException("Jwt:Issuer or Jwt:Authority is required for Keycloak.");
    }

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.Authority = jwtIssuer;
            options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = jwtIssuer,
                ValidAudiences = new[] { jwtAudience }
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<RequestCorrelationMiddleware>();
app.UseCors("WebApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
