using Acutis.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Acutis.Infrastructure.Persistence.Seed;

public class DatabaseSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(IServiceProvider serviceProvider, ILogger<DatabaseSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AcutisDbContext>();
        var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
        var dataLogger = loggerFactory.CreateLogger("SeedData");
        await SeedData.EnsureSeedDataAsync(context, dataLogger, cancellationToken);
        _logger.LogInformation("Database seeding completed");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
