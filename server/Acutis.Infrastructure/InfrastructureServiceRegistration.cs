using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Acutis.Application.Interfaces;
using Acutis.Infrastructure.Admissions;

namespace Acutis.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(config.GetConnectionString("DefaultConnection")));
        services.AddScoped(IoC<IResidentService>.Service, sp => new ResidentService(sp.GetRequiredService<AppDbContext>()));
        return services;
    }

    // tiny helper to keep type inference tidy
    private static class IoC<T> { public static readonly Type Service = typeof(T); }
}
