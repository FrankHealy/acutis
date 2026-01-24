using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Acutis.Application.Interfaces;
using Acutis.Application.Services;
using Acutis.Infrastructure.Admissions;
using Acutis.Infrastructure.Services;


namespace Acutis.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var provider = (config["DbProvider"] ?? "SqlServer").Trim().ToLowerInvariant();

        services.AddDbContext<AppDbContext>(opt =>
        {
            if (provider is "postgres" or "postgresql")
            {
                var cs = config.GetConnectionString("PostgresConnection");
                if (string.IsNullOrWhiteSpace(cs))
                    throw new InvalidOperationException("PostgresConnection is missing");
                var ncs = config.GetConnectionString("PostgresConnection");
                Console.WriteLine($"POSTGRES CS = {ncs}");

                var b = new Npgsql.NpgsqlConnectionStringBuilder(cs);
                Console.WriteLine($"POSTGRES HOST = {b.Host}  PORT = {b.Port}");

                opt.UseNpgsql(cs);
            }
            else if (provider is "sqlserver" or "mssql")
            {
                var cs = config.GetConnectionString("Default");
                if (string.IsNullOrWhiteSpace(cs))
                    throw new InvalidOperationException("ConnectionStrings:DefaultConnection is missing");

                opt.UseSqlServer(cs);
            }
            else
            {
                throw new InvalidOperationException($"Unknown DbProvider: '{config["DbProvider"]}'");
            }
        });

        services.AddScoped(IoC<IResidentService>.Service, sp =>
            new ResidentService(sp.GetRequiredService<AppDbContext>()));
        services.AddScoped<ICallLoggingService, CallLoggingService>();

        return services;
    }

    private static class IoC<T> { public static readonly Type Service = typeof(T); }
}
