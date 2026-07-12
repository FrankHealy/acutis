using Acutis.Api.Contracts;
using Acutis.Api.Services.MediaPlayer;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Xunit;

namespace Acutis.Api.Tests.Services.MediaPlayer;

public sealed class MediaPlayerServiceTests
{
    [Fact]
    public async Task SyncAndPlay_IndexesMediaAndUpdatesLastPlayed()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), $"acutis-media-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempRoot);
        Directory.CreateDirectory(Path.Combine(tempRoot, "meditation-text"));
        Directory.CreateDirectory(Path.Combine(tempRoot, "meditation-music"));
        await File.WriteAllBytesAsync(Path.Combine(tempRoot, "meditation-text", "guided-session.mp3"), new byte[] { 1, 2, 3, 4 });
        await File.WriteAllBytesAsync(Path.Combine(tempRoot, "meditation-music", "calm-loop.mp3"), new byte[] { 5, 6, 7, 8 });

        try
        {
            await using var dbContext = CreateDbContext(nameof(SyncAndPlay_IndexesMediaAndUpdatesLastPlayed));
            var httpContextAccessor = new HttpContextAccessor();
            var auditService = new AuditService(dbContext, httpContextAccessor);
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["MediaPlayer:RootPath"] = tempRoot
                })
                .Build();
            var environment = new TestWebHostEnvironment { ContentRootPath = tempRoot };
            var service = new MediaPlayerService(dbContext, auditService, environment, configuration);

            var added = await service.SyncAsync(new SyncMediaAssetsRequest
            {
                UnitCode = "alcohol",
                Reason = "test sync"
            });

            Assert.Equal(2, added);

            var catalog = await service.GetCatalogAsync("alcohol");
            Assert.Single(catalog.VoicedMeditations);
            Assert.Single(catalog.MeditationMusic);

            var meditation = catalog.VoicedMeditations[0];
            Assert.Null(meditation.LastPlayedAtUtc);

            var played = await service.MarkPlayedAsync(meditation.Id, "test play");
            Assert.NotNull(played);
            Assert.NotNull(played!.LastPlayedAtUtc);

            var auditCount = await dbContext.AuditLogs.CountAsync();
            Assert.True(auditCount >= 2);
        }
        finally
        {
            if (Directory.Exists(tempRoot))
            {
                Directory.Delete(tempRoot, recursive: true);
            }
        }
    }

    private static AcutisDbContext CreateDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        return new AcutisDbContext(options);
    }

    private sealed class TestWebHostEnvironment : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Development";
        public string ApplicationName { get; set; } = "Acutis.Api.Tests";
        public string WebRootPath { get; set; } = string.Empty;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
