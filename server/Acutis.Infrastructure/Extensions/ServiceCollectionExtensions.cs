using Acutis.Application.Interfaces;
using Acutis.Application.Services;
using Acutis.Infrastructure.Audit;
using Acutis.Infrastructure.Persistence;
using Acutis.Infrastructure.Persistence.Seed;
using Acutis.Infrastructure.Security;
using Acutis.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;

namespace Acutis.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection("Authentication:Jwt"));
        services.Configure<ApiKeyOptions>(configuration.GetSection("Security:ApiKeys"));

        services.AddSingleton<AuditInterceptor>();

        services.AddDbContext<AcutisDbContext>((provider, options) =>
        {
            var connectionString = configuration.GetConnectionString("AcutisDatabase");
            var interceptor = provider.GetRequiredService<AuditInterceptor>();

            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                options.UseSqlServer(connectionString);
            }
            else
            {
                options.UseSqlite("Data Source=Acutis.Local.db");
            }

            options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
            options.AddInterceptors(interceptor);
        });

        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IApiKeyValidator, ApiKeyValidator>();
        services.AddScoped<IAuditTrail, AuditTrailService>();
        services.AddScoped<IResidentService, ResidentService>();
        services.AddScoped<ITherapyCatalogService, TherapyCatalogService>();
        services.AddScoped<IGroupSessionService, GroupSessionService>();

        services.AddHostedService<DatabaseSeeder>();

        return services;
    }
}
