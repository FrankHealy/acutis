using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Acutis.Infrastructure.Admissions;     // for ResidentService
using Acutis.Application.Interfaces;       // for IResidentService
using Acutis.Infrastructure.Persistence;   // for AppDbContext

namespace Acutis.Infrastructure.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection not found");

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            // Register services
            services.AddScoped<IResidentService, ResidentService>();

            return services;
        }
    }
}
