using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Acutis.Api.Services.MediaPlayer;

public interface IMediaPlayerService
{
    Task<MediaPlayerCatalogDto> GetCatalogAsync(string unitCode, CancellationToken cancellationToken = default);
    Task<MediaAssetDto> RegisterAsync(RegisterMediaAssetRequest request, CancellationToken cancellationToken = default);
    Task<int> SyncAsync(SyncMediaAssetsRequest request, CancellationToken cancellationToken = default);
    Task<ImportMediaAssetsResult> ImportAsync(ImportMediaAssetsRequest request, CancellationToken cancellationToken = default);
    Task<MediaAssetDto?> MarkPlayedAsync(Guid assetId, string? reason, CancellationToken cancellationToken = default);
    Task<MediaAssetDto?> DeactivateAsync(Guid assetId, string? reason, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid assetId, bool deleteFile, string? reason, CancellationToken cancellationToken = default);
    Task<(string path, string contentType, string downloadName)?> ResolveStreamAsync(Guid assetId, CancellationToken cancellationToken = default);
}

public sealed class MediaPlayerService : IMediaPlayerService
{
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;
    private readonly IWebHostEnvironment _environment;
    private readonly string? _configuredRootPath;

    public MediaPlayerService(
        AcutisDbContext dbContext,
        IAuditService auditService,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _auditService = auditService;
        _environment = environment;
        _configuredRootPath = configuration["MediaPlayer:RootPath"];
    }

    public async Task<MediaPlayerCatalogDto> GetCatalogAsync(string unitCode, CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = NormalizeUnitCode(unitCode);
        var assets = await _dbContext.MediaAssets
            .AsNoTracking()
            .Where(x => x.UnitCode == normalizedUnitCode && x.IsActive)
            .OrderBy(x => x.AssetType)
            .ThenBy(x => x.ShortName)
            .ToListAsync(cancellationToken);

        return new MediaPlayerCatalogDto
        {
            UnitCode = normalizedUnitCode,
            VoicedMeditations = assets.Where(x => x.AssetType == MediaAssetType.VoicedMeditation).Select(MapDto).ToList(),
            MeditationMusic = assets.Where(x => x.AssetType == MediaAssetType.MeditationMusic).Select(MapDto).ToList()
        };
    }

    public async Task<MediaAssetDto> RegisterAsync(RegisterMediaAssetRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = NormalizeUnitCode(request.UnitCode);
        var assetType = ParseAssetType(request.AssetType);
        var fileName = request.FileName.Trim();
        var baseDirectory = GetBaseDirectory(assetType);
        var fullPath = Path.Combine(baseDirectory, fileName);

        if (!File.Exists(fullPath))
        {
            throw new InvalidOperationException($"File not found in source folder: {fileName}");
        }

        var relativePath = GetRelativePath(assetType, fileName);
        var existing = await _dbContext.MediaAssets
            .SingleOrDefaultAsync(
                x => x.UnitCode == normalizedUnitCode && x.AssetType == assetType && x.FileName == fileName,
                cancellationToken);

        var before = existing;
        var now = DateTime.UtcNow;
        if (existing is null)
        {
            existing = new MediaAsset
            {
                Id = Guid.NewGuid(),
                UnitCode = normalizedUnitCode,
                AssetType = assetType,
                CreatedAtUtc = now
            };
            _dbContext.MediaAssets.Add(existing);
        }

        existing.ShortName = string.IsNullOrWhiteSpace(request.ShortName)
            ? Path.GetFileNameWithoutExtension(fileName)
            : request.ShortName.Trim();
        existing.FileName = fileName;
        existing.RelativePath = relativePath;
        existing.LengthSeconds = request.LengthSeconds.GetValueOrDefault(0);
        existing.IsActive = true;
        existing.UpdatedAtUtc = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(MediaAsset),
            entityId: existing.Id.ToString(),
            action: before is null ? "Create" : "Update",
            before: before,
            after: existing,
            reason: request.Reason,
            cancellationToken);

        return MapDto(existing);
    }

    public async Task<int> SyncAsync(SyncMediaAssetsRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = NormalizeUnitCode(request.UnitCode);
        var now = DateTime.UtcNow;
        var added = 0;

        foreach (var (assetType, baseDirectory) in EnumerateAssetDirectories())
        {
            if (!Directory.Exists(baseDirectory))
            {
                continue;
            }

            var files = Directory.GetFiles(baseDirectory)
                .Where(IsSupportedMediaFile)
                .Select(Path.GetFileName)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Cast<string>()
                .ToList();

            foreach (var fileName in files)
            {
                var existing = await _dbContext.MediaAssets
                    .SingleOrDefaultAsync(
                        x => x.UnitCode == normalizedUnitCode && x.AssetType == assetType && x.FileName == fileName,
                        cancellationToken);

                if (existing is not null)
                {
                    continue;
                }

                var created = new MediaAsset
                {
                    Id = Guid.NewGuid(),
                    UnitCode = normalizedUnitCode,
                    AssetType = assetType,
                    ShortName = Path.GetFileNameWithoutExtension(fileName),
                    FileName = fileName,
                    RelativePath = GetRelativePath(assetType, fileName),
                    LengthSeconds = 0,
                    IsActive = true,
                    CreatedAtUtc = now,
                    UpdatedAtUtc = now
                };

                _dbContext.MediaAssets.Add(created);
                added++;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        if (added > 0)
        {
            await _auditService.WriteAsync(
                centreId: null,
                unitId: null,
                entityType: nameof(MediaAsset),
                entityId: normalizedUnitCode,
                action: "Create",
                before: null,
                after: new { Added = added, UnitCode = normalizedUnitCode },
                reason: request.Reason,
                cancellationToken);
        }

        return added;
    }

    public async Task<ImportMediaAssetsResult> ImportAsync(ImportMediaAssetsRequest request, CancellationToken cancellationToken = default)
    {
        var result = new ImportMediaAssetsResult();
        if (request.Assets.Count == 0)
        {
            return result;
        }

        foreach (var item in request.Assets)
        {
            var targetUnits = ResolveTargetUnits(item);
            if (targetUnits.Count == 0)
            {
                result.Failed++;
                result.Errors.Add($"No unitCode/targetUnits provided for '{item.ShortName}'.");
                continue;
            }

            foreach (var unitCode in targetUnits)
            {
                result.Requested++;
                try
                {
                    var changed = await UpsertImportedAssetAsync(unitCode, item, cancellationToken);
                    if (changed == "imported")
                    {
                        result.Imported++;
                    }
                    else
                    {
                        result.Updated++;
                    }
                }
                catch (Exception ex) when (ex is InvalidOperationException or IOException or UnauthorizedAccessException)
                {
                    result.Failed++;
                    result.Errors.Add($"[{unitCode}] {item.FileName}: {ex.Message}");
                }
            }
        }

        if (result.Imported > 0 || result.Updated > 0)
        {
            await _auditService.WriteAsync(
                centreId: null,
                unitId: null,
                entityType: nameof(MediaAsset),
                entityId: "bulk-import",
                action: "Import",
                before: null,
                after: new
                {
                    request.Reason,
                    result.Requested,
                    result.Imported,
                    result.Updated,
                    result.Failed
                },
                reason: request.Reason,
                cancellationToken);
        }

        return result;
    }

    public async Task<MediaAssetDto?> MarkPlayedAsync(Guid assetId, string? reason, CancellationToken cancellationToken = default)
    {
        var asset = await _dbContext.MediaAssets.SingleOrDefaultAsync(x => x.Id == assetId, cancellationToken);
        if (asset is null)
        {
            return null;
        }

        var before = asset.LastPlayedAtUtc;
        asset.LastPlayedAtUtc = DateTime.UtcNow;
        asset.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(MediaAsset),
            entityId: asset.Id.ToString(),
            action: "Event",
            before: new { LastPlayedAtUtc = before },
            after: new { asset.LastPlayedAtUtc },
            reason: reason,
            cancellationToken);

        return MapDto(asset);
    }

    public async Task<MediaAssetDto?> DeactivateAsync(Guid assetId, string? reason, CancellationToken cancellationToken = default)
    {
        var asset = await _dbContext.MediaAssets.SingleOrDefaultAsync(x => x.Id == assetId, cancellationToken);
        if (asset is null)
        {
            return null;
        }

        var before = new { asset.IsActive };
        asset.IsActive = false;
        asset.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(MediaAsset),
            entityId: asset.Id.ToString(),
            action: "Update",
            before: before,
            after: new { asset.IsActive },
            reason: reason,
            cancellationToken);

        return MapDto(asset);
    }

    public async Task<bool> DeleteAsync(Guid assetId, bool deleteFile, string? reason, CancellationToken cancellationToken = default)
    {
        var asset = await _dbContext.MediaAssets.SingleOrDefaultAsync(x => x.Id == assetId, cancellationToken);
        if (asset is null)
        {
            return false;
        }

        var before = asset;
        if (deleteFile)
        {
            var fullPath = ResolveFullPath(asset.RelativePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }

        _dbContext.MediaAssets.Remove(asset);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(MediaAsset),
            entityId: before.Id.ToString(),
            action: "Delete",
            before: before,
            after: null,
            reason: reason,
            cancellationToken);

        return true;
    }

    public async Task<(string path, string contentType, string downloadName)?> ResolveStreamAsync(
        Guid assetId,
        CancellationToken cancellationToken = default)
    {
        var asset = await _dbContext.MediaAssets
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == assetId && x.IsActive, cancellationToken);
        if (asset is null)
        {
            return null;
        }

        var fullPath = ResolveFullPath(asset.RelativePath);
        if (!File.Exists(fullPath))
        {
            return null;
        }

        return (fullPath, GetContentType(asset.FileName), asset.FileName);
    }

    private static string NormalizeUnitCode(string unitCode)
    {
        if (string.IsNullOrWhiteSpace(unitCode))
        {
            throw new InvalidOperationException("unitCode is required.");
        }

        return unitCode.Trim().ToLowerInvariant();
    }

    private static MediaAssetType ParseAssetType(string assetType)
    {
        if (!Enum.TryParse<MediaAssetType>(assetType, true, out var parsed))
        {
            throw new InvalidOperationException("assetType must be VoicedMeditation or MeditationMusic.");
        }

        return parsed;
    }

    private IEnumerable<(MediaAssetType assetType, string path)> EnumerateAssetDirectories()
    {
        yield return (MediaAssetType.VoicedMeditation, GetBaseDirectory(MediaAssetType.VoicedMeditation));
        yield return (MediaAssetType.MeditationMusic, GetBaseDirectory(MediaAssetType.MeditationMusic));
    }

    private string GetBaseDirectory(MediaAssetType assetType)
    {
        var folder = assetType == MediaAssetType.VoicedMeditation ? "meditation-text" : "meditation-music";
        return Path.Combine(GetMediaRootPath(), folder);
    }

    private static string GetRelativePath(MediaAssetType assetType, string fileName)
    {
        var folder = assetType == MediaAssetType.VoicedMeditation ? "meditation-text" : "meditation-music";
        return Path.Combine("media", folder, fileName);
    }

    private string ResolveFullPath(string relativePath)
    {
        var normalized = relativePath
            .Replace('/', Path.DirectorySeparatorChar)
            .Replace('\\', Path.DirectorySeparatorChar);

        var mediaPrefix = $"media{Path.DirectorySeparatorChar}";
        if (normalized.StartsWith(mediaPrefix, StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized[mediaPrefix.Length..];
        }

        return Path.Combine(GetMediaRootPath(), normalized.TrimStart(Path.DirectorySeparatorChar));
    }

    private string GetMediaRootPath()
    {
        if (!string.IsNullOrWhiteSpace(_configuredRootPath))
        {
            return _configuredRootPath;
        }

        var root = Path.GetPathRoot(_environment.ContentRootPath) ?? "C:\\";
        return Path.Combine(root, "Acutis", "media");
    }

    private static bool IsSupportedMediaFile(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        return extension is ".mp3" or ".wav" or ".m4a" or ".aac" or ".ogg" or ".mp4" or ".webm";
    }

    private static string GetContentType(string fileName)
    {
        return Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".aac" => "audio/aac",
            ".ogg" => "audio/ogg",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            _ => "application/octet-stream"
        };
    }

    private static MediaAssetDto MapDto(MediaAsset asset)
    {
        return new MediaAssetDto
        {
            Id = asset.Id,
            UnitCode = asset.UnitCode,
            AssetType = asset.AssetType.ToString(),
            ShortName = asset.ShortName,
            FileName = asset.FileName,
            LengthSeconds = asset.LengthSeconds,
            LastPlayedAtUtc = asset.LastPlayedAtUtc,
            IsActive = asset.IsActive,
            StreamUrl = $"/api/mediaplayer/assets/{asset.Id}/stream"
        };
    }

    private async Task<string> UpsertImportedAssetAsync(
        string unitCode,
        ImportMediaAssetItem item,
        CancellationToken cancellationToken)
    {
        var normalizedUnitCode = NormalizeUnitCode(unitCode);
        var assetType = ParseAssetType(item.AssetType);
        var fileName = string.IsNullOrWhiteSpace(item.FileName)
            ? Path.GetFileName(item.PhysicalPath ?? string.Empty)
            : item.FileName.Trim();

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new InvalidOperationException("fileName is required.");
        }

        var relativePath = ResolveRelativePath(assetType, fileName, item.PhysicalPath);
        var fullPath = ResolveFullPath(relativePath);
        if (!File.Exists(fullPath))
        {
            throw new InvalidOperationException($"File does not exist at '{fullPath}'.");
        }

        var now = DateTime.UtcNow;
        var existing = await _dbContext.MediaAssets.SingleOrDefaultAsync(
            x => x.UnitCode == normalizedUnitCode && x.AssetType == assetType && x.FileName == fileName,
            cancellationToken);

        var wasNew = existing is null;
        if (existing is null)
        {
            existing = new MediaAsset
            {
                Id = Guid.NewGuid(),
                UnitCode = normalizedUnitCode,
                AssetType = assetType,
                CreatedAtUtc = now
            };
            _dbContext.MediaAssets.Add(existing);
        }

        existing.ShortName = string.IsNullOrWhiteSpace(item.ShortName)
            ? Path.GetFileNameWithoutExtension(fileName)
            : item.ShortName.Trim();
        existing.FileName = fileName;
        existing.RelativePath = relativePath;
        existing.LengthSeconds = item.LengthSeconds.GetValueOrDefault(0);
        existing.IsActive = item.IsActive;
        existing.LastPlayedAtUtc = item.LastPlayedAtUtc;
        existing.UpdatedAtUtc = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return wasNew ? "imported" : "updated";
    }

    private List<string> ResolveTargetUnits(ImportMediaAssetItem item)
    {
        var result = new List<string>();
        if (!string.IsNullOrWhiteSpace(item.UnitCode))
        {
            result.Add(item.UnitCode);
        }

        foreach (var target in item.TargetUnits)
        {
            if (!string.IsNullOrWhiteSpace(target))
            {
                result.Add(target);
            }
        }

        return result
            .Select(NormalizeUnitCode)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private string ResolveRelativePath(MediaAssetType assetType, string fileName, string? physicalPath)
    {
        if (!string.IsNullOrWhiteSpace(physicalPath))
        {
            var fullPath = Path.GetFullPath(physicalPath);
            if (File.Exists(fullPath))
            {
                var mediaRoot = Path.GetFullPath(GetMediaRootPath())
                    .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                    + Path.DirectorySeparatorChar;
                if (fullPath.StartsWith(mediaRoot, StringComparison.OrdinalIgnoreCase))
                {
                    var relativeToRoot = fullPath[mediaRoot.Length..];
                    return Path.Combine("media", relativeToRoot);
                }
            }
        }

        return GetRelativePath(assetType, fileName);
    }
}
