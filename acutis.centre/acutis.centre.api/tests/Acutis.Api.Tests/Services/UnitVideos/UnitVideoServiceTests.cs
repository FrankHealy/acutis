using Acutis.Api.Services.TherapyScheduling;
using Acutis.Api.Services.UnitVideos;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Xunit;

namespace Acutis.Api.Tests.Services.UnitVideos;

public sealed class UnitVideoServiceTests
{
    [Fact]
    public async Task GetVideos_UsesCuration_Exclusions_AndOrdering()
    {
        var unitId = Guid.NewGuid();
        await using var dbContext = CreateDbContext(nameof(GetVideos_UsesCuration_Exclusions_AndOrdering));
        SeedVideos(dbContext,
            ("a_key", "Alpha", true),
            ("b_key", "Beta", true),
            ("c_key", "Charlie", true));
        await dbContext.SaveChangesAsync();

        var alpha = await dbContext.Videos.SingleAsync(x => x.Key == "a_key");
        var beta = await dbContext.Videos.SingleAsync(x => x.Key == "b_key");
        var charlie = await dbContext.Videos.SingleAsync(x => x.Key == "c_key");
        dbContext.UnitVideoCurations.AddRange(
            new UnitVideoCuration { Id = Guid.NewGuid(), UnitId = unitId, VideoId = beta.Id, DisplayOrder = 2, IsExcluded = false },
            new UnitVideoCuration { Id = Guid.NewGuid(), UnitId = unitId, VideoId = alpha.Id, DisplayOrder = 1, IsExcluded = false },
            new UnitVideoCuration { Id = Guid.NewGuid(), UnitId = unitId, VideoId = charlie.Id, DisplayOrder = 0, IsExcluded = true });
        await dbContext.SaveChangesAsync();

        var service = CreateService(dbContext, Path.GetTempPath());
        var result = await service.GetVideos(unitId);

        Assert.Equal(2, result.Count);
        Assert.Equal("Alpha", result[0].Title);
        Assert.Equal("Beta", result[1].Title);
    }

    [Fact]
    public async Task GetVideos_FallsBackToGlobalActive_WhenNoCuration()
    {
        await using var dbContext = CreateDbContext(nameof(GetVideos_FallsBackToGlobalActive_WhenNoCuration));
        SeedVideos(dbContext,
            ("z_key", "Zulu", true),
            ("m_key", "Mike", true),
            ("x_key", "Xray", false));
        await dbContext.SaveChangesAsync();

        var service = CreateService(dbContext, Path.GetTempPath());
        var result = await service.GetVideos(Guid.NewGuid());

        Assert.Equal(2, result.Count);
        Assert.Equal("Mike", result[0].Title);
        Assert.Equal("Zulu", result[1].Title);
    }

    [Fact]
    public async Task GetVideos_SetsDownloaded_WhenMatchingLocalFileExists()
    {
        var tempRoot = Path.Combine(Path.GetTempPath(), $"acutis-videos-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempRoot);
        try
        {
            await using var dbContext = CreateDbContext(nameof(GetVideos_SetsDownloaded_WhenMatchingLocalFileExists));
            SeedVideos(dbContext, ("video_one", "Recovery Story", true));
            await dbContext.SaveChangesAsync();

            var filePath = Path.Combine(tempRoot, "Recovery Story [video_one].mp4");
            await File.WriteAllBytesAsync(filePath, new byte[] { 1, 2, 3 });

            var service = CreateService(dbContext, tempRoot);
            var result = await service.GetVideos(Guid.NewGuid());

            Assert.Single(result);
            Assert.True(result[0].IsDownloaded);
            Assert.Contains("/api/videos/", result[0].PlaybackUrl, StringComparison.OrdinalIgnoreCase);
        }
        finally
        {
            if (Directory.Exists(tempRoot))
            {
                Directory.Delete(tempRoot, recursive: true);
            }
        }
    }

    private static void SeedVideos(AcutisDbContext dbContext, params (string key, string title, bool isActive)[] rows)
    {
        var now = DateTime.UtcNow;
        foreach (var row in rows)
        {
            dbContext.Videos.Add(new Video
            {
                Id = Guid.NewGuid(),
                Key = row.key,
                Title = row.title,
                Url = $"https://example.com/{row.key}",
                LengthSeconds = 120,
                Description = "desc",
                Source = "source",
                Language = "en",
                TagsJson = "[]",
                IsActive = row.isActive,
                CreatedAtUtc = now,
                CreatedBy = "test",
                ModifiedAtUtc = now,
                ModifiedBy = "test"
            });
        }
    }

    private static UnitVideoService CreateService(AcutisDbContext dbContext, string videosRootPath)
    {
        var httpContextAccessor = new HttpContextAccessor();
        var auditService = new AuditService(dbContext, httpContextAccessor);
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MediaPlayer:VideosRootPath"] = videosRootPath
            })
            .Build();
        var environment = new TestWebHostEnvironment { ContentRootPath = videosRootPath };
        return new UnitVideoService(dbContext, auditService, environment, configuration);
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
