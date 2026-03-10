using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace Acutis.Api.Services.UnitVideos;

public interface IUnitVideoService
{
    Task<IReadOnlyList<VideoDto>> GetVideos(Guid unitId);
}

public interface IUnitVideoAdminService
{
    Task<IReadOnlyList<VideoDto>> GetAllVideos(CancellationToken cancellationToken = default);
    Task<VideoDto> CreateVideo(CreateVideoRequest request, CancellationToken cancellationToken = default);
    Task<VideoDto?> UpdateVideo(Guid id, UpdateVideoRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteVideo(Guid id, string? reason, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UnitVideoCurationDto>> GetUnitCuration(Guid unitId, CancellationToken cancellationToken = default);
    Task<UnitVideoCurationDto> UpsertUnitCuration(Guid unitId, UpsertUnitVideoCurationRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteUnitCuration(Guid unitId, Guid curationId, string? reason, CancellationToken cancellationToken = default);
    Task<(string path, string contentType, string downloadName)?> ResolveStream(Guid videoId, CancellationToken cancellationToken = default);
}

public sealed class UnitVideoService : IUnitVideoService, IUnitVideoAdminService
{
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;
    private readonly string _videoRootPath;

    public UnitVideoService(
        AcutisDbContext dbContext,
        IAuditService auditService,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _auditService = auditService;
        _videoRootPath = ResolveVideoRootPath(environment, configuration);
    }

    public Task<IReadOnlyList<VideoDto>> GetVideos(Guid unitId)
    {
        return GetVideosInternal(unitId, CancellationToken.None);
    }

    public async Task<IReadOnlyList<VideoDto>> GetAllVideos(CancellationToken cancellationToken = default)
    {
        var videos = await _dbContext.Videos
            .AsNoTracking()
            .OrderBy(x => x.Title)
            .ToListAsync(cancellationToken);

        return videos.Select(MapVideo).ToList();
    }

    public async Task<VideoDto> CreateVideo(CreateVideoRequest request, CancellationToken cancellationToken = default)
    {
        ValidateVideoRequest(request);
        var now = DateTime.UtcNow;
        var video = new Video
        {
            Id = Guid.NewGuid(),
            Key = request.Key.Trim(),
            Title = request.Title.Trim(),
            Url = request.Url.Trim(),
            LengthSeconds = request.LengthSeconds,
            Description = request.Description?.Trim(),
            Source = request.Source?.Trim(),
            Language = request.Language.Trim(),
            TagsJson = SerializeTags(request.Tags),
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            CreatedBy = "api",
            ModifiedAtUtc = now,
            ModifiedBy = "api"
        };

        _dbContext.Videos.Add(video);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, null, nameof(Video), video.Id.ToString(), "Create", null, video, request.Reason, cancellationToken);
        return MapVideo(video);
    }

    public async Task<VideoDto?> UpdateVideo(Guid id, UpdateVideoRequest request, CancellationToken cancellationToken = default)
    {
        ValidateVideoRequest(request);
        var video = await _dbContext.Videos.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (video is null)
        {
            return null;
        }

        var before = CloneVideo(video);
        video.Key = request.Key.Trim();
        video.Title = request.Title.Trim();
        video.Url = request.Url.Trim();
        video.LengthSeconds = request.LengthSeconds;
        video.Description = request.Description?.Trim();
        video.Source = request.Source?.Trim();
        video.Language = request.Language.Trim();
        video.TagsJson = SerializeTags(request.Tags);
        video.IsActive = request.IsActive;
        video.ModifiedAtUtc = DateTime.UtcNow;
        video.ModifiedBy = "api";

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, null, nameof(Video), video.Id.ToString(), "Update", before, video, request.Reason, cancellationToken);
        return MapVideo(video);
    }

    public async Task<bool> DeleteVideo(Guid id, string? reason, CancellationToken cancellationToken = default)
    {
        var video = await _dbContext.Videos.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (video is null)
        {
            return false;
        }

        var before = CloneVideo(video);
        _dbContext.Videos.Remove(video);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, null, nameof(Video), id.ToString(), "Delete", before, null, reason, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<UnitVideoCurationDto>> GetUnitCuration(Guid unitId, CancellationToken cancellationToken = default)
    {
        var rows = await _dbContext.UnitVideoCurations
            .AsNoTracking()
            .Where(x => x.UnitId == unitId)
            .OrderBy(x => x.DisplayOrder ?? int.MaxValue)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);

        return rows.Select(MapCuration).ToList();
    }

    public async Task<UnitVideoCurationDto> UpsertUnitCuration(
        Guid unitId,
        UpsertUnitVideoCurationRequest request,
        CancellationToken cancellationToken = default)
    {
        var row = await _dbContext.UnitVideoCurations
            .SingleOrDefaultAsync(x => x.UnitId == unitId && x.VideoId == request.VideoId, cancellationToken);
        var before = row is null ? null : CloneCuration(row);
        if (row is null)
        {
            row = new UnitVideoCuration
            {
                Id = Guid.NewGuid(),
                UnitId = unitId,
                VideoId = request.VideoId
            };
            _dbContext.UnitVideoCurations.Add(row);
        }

        row.DisplayOrder = request.DisplayOrder;
        row.IsExcluded = request.IsExcluded;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(
            null,
            unitId,
            nameof(UnitVideoCuration),
            row.Id.ToString(),
            before is null ? "Create" : "Update",
            before,
            row,
            request.Reason,
            cancellationToken);
        return MapCuration(row);
    }

    public async Task<bool> DeleteUnitCuration(
        Guid unitId,
        Guid curationId,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        var row = await _dbContext.UnitVideoCurations
            .SingleOrDefaultAsync(x => x.Id == curationId && x.UnitId == unitId, cancellationToken);
        if (row is null)
        {
            return false;
        }

        var before = CloneCuration(row);
        _dbContext.UnitVideoCurations.Remove(row);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, unitId, nameof(UnitVideoCuration), row.Id.ToString(), "Delete", before, null, reason, cancellationToken);
        return true;
    }

    public async Task<(string path, string contentType, string downloadName)?> ResolveStream(Guid videoId, CancellationToken cancellationToken = default)
    {
        var video = await _dbContext.Videos.AsNoTracking().SingleOrDefaultAsync(x => x.Id == videoId && x.IsActive, cancellationToken);
        if (video is null)
        {
            return null;
        }

        var localPath = ResolveDownloadedPath(video);
        if (string.IsNullOrWhiteSpace(localPath) || !File.Exists(localPath))
        {
            return null;
        }

        return (localPath, GetContentType(localPath), Path.GetFileName(localPath));
    }

    private async Task<IReadOnlyList<VideoDto>> GetVideosInternal(Guid unitId, CancellationToken cancellationToken)
    {
        var curatedRows = await _dbContext.UnitVideoCurations
            .AsNoTracking()
            .Where(x => x.UnitId == unitId)
            .ToListAsync(cancellationToken);

        List<Video> selected;
        if (curatedRows.Count > 0)
        {
            var curatedIds = curatedRows
                .Where(x => !x.IsExcluded)
                .Select(x => x.VideoId)
                .Distinct()
                .ToList();
            if (curatedIds.Count == 0)
            {
                return Array.Empty<VideoDto>();
            }

            var videos = await _dbContext.Videos
                .AsNoTracking()
                .Where(x => curatedIds.Contains(x.Id) && x.IsActive)
                .ToListAsync(cancellationToken);

            var orderLookup = curatedRows
                .Where(x => !x.IsExcluded)
                .ToDictionary(x => x.VideoId, x => x.DisplayOrder);

            selected = videos
                .OrderBy(x => orderLookup.TryGetValue(x.Id, out var displayOrder) ? displayOrder ?? int.MaxValue : int.MaxValue)
                .ThenBy(x => x.Title)
                .ToList();
        }
        else
        {
            selected = await _dbContext.Videos
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Title)
                .ToListAsync(cancellationToken);
        }

        return selected.Select(MapVideo).ToList();
    }

    private VideoDto MapVideo(Video video)
    {
        var localPath = ResolveDownloadedPath(video);
        var isDownloaded = localPath is not null;
        return new VideoDto
        {
            Id = video.Id,
            Key = video.Key,
            Title = video.Title,
            Url = video.Url,
            PlaybackUrl = isDownloaded ? $"/api/videos/{video.Id}/stream" : video.Url,
            LengthSeconds = video.LengthSeconds,
            Description = video.Description,
            Source = video.Source,
            Language = video.Language,
            Tags = ParseTags(video.TagsJson),
            IsActive = video.IsActive,
            IsDownloaded = isDownloaded
        };
    }

    private static void ValidateVideoRequest(CreateVideoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Key))
        {
            throw new InvalidOperationException("key is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new InvalidOperationException("title is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Url))
        {
            throw new InvalidOperationException("url is required.");
        }

        if (request.LengthSeconds < 0)
        {
            throw new InvalidOperationException("lengthSeconds cannot be negative.");
        }

        if (string.IsNullOrWhiteSpace(request.Language))
        {
            throw new InvalidOperationException("language is required.");
        }
    }

    private string? ResolveDownloadedPath(Video video)
    {
        var safeTitle = SanitizeFilePart(video.Title);
        var safeKey = SanitizeFilePart(video.Key);
        var searchPattern = $"{safeTitle} [{safeKey}].*";
        var directory = _videoRootPath;
        if (!Directory.Exists(directory))
        {
            return null;
        }

        var match = Directory.EnumerateFiles(directory, searchPattern, SearchOption.TopDirectoryOnly).FirstOrDefault();
        return match;
    }

    private static string ResolveVideoRootPath(IWebHostEnvironment environment, IConfiguration configuration)
    {
        var configured = configuration["MediaPlayer:VideosRootPath"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured;
        }

        var root = Path.GetPathRoot(environment.ContentRootPath) ?? "C:\\";
        return Path.Combine(root, "Acutis", "media", "videos");
    }

    private static string SanitizeFilePart(string value)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var normalized = new string(value.Select(ch => invalid.Contains(ch) ? '_' : ch).ToArray()).Trim();
        return string.IsNullOrWhiteSpace(normalized) ? "untitled" : normalized;
    }

    private static string SerializeTags(List<string> tags)
    {
        var normalized = tags
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        return JsonSerializer.Serialize(normalized);
    }

    private static List<string> ParseTags(string tagsJson)
    {
        if (string.IsNullOrWhiteSpace(tagsJson))
        {
            return new List<string>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(tagsJson) ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }

    private static Video CloneVideo(Video source)
    {
        return new Video
        {
            Id = source.Id,
            Key = source.Key,
            Title = source.Title,
            Url = source.Url,
            LengthSeconds = source.LengthSeconds,
            Description = source.Description,
            Source = source.Source,
            Language = source.Language,
            TagsJson = source.TagsJson,
            IsActive = source.IsActive,
            CreatedAtUtc = source.CreatedAtUtc,
            CreatedBy = source.CreatedBy,
            ModifiedAtUtc = source.ModifiedAtUtc,
            ModifiedBy = source.ModifiedBy
        };
    }

    private static UnitVideoCuration CloneCuration(UnitVideoCuration source)
    {
        return new UnitVideoCuration
        {
            Id = source.Id,
            UnitId = source.UnitId,
            VideoId = source.VideoId,
            DisplayOrder = source.DisplayOrder,
            IsExcluded = source.IsExcluded
        };
    }

    private static UnitVideoCurationDto MapCuration(UnitVideoCuration source)
    {
        return new UnitVideoCurationDto
        {
            Id = source.Id,
            UnitId = source.UnitId,
            VideoId = source.VideoId,
            DisplayOrder = source.DisplayOrder,
            IsExcluded = source.IsExcluded
        };
    }

    private static string GetContentType(string filePath)
    {
        return Path.GetExtension(filePath).ToLowerInvariant() switch
        {
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mkv" => "video/x-matroska",
            ".mov" => "video/quicktime",
            ".m4v" => "video/x-m4v",
            _ => "application/octet-stream"
        };
    }
}
