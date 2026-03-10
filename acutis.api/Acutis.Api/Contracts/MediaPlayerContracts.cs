namespace Acutis.Api.Contracts;

public sealed class MediaAssetDto
{
    public Guid Id { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long LengthSeconds { get; set; }
    public DateTime? LastPlayedAtUtc { get; set; }
    public bool IsActive { get; set; }
    public string StreamUrl { get; set; } = string.Empty;
}

public sealed class MediaPlayerCatalogDto
{
    public string UnitCode { get; set; } = string.Empty;
    public List<MediaAssetDto> VoicedMeditations { get; set; } = new();
    public List<MediaAssetDto> MeditationMusic { get; set; } = new();
}

public sealed class RegisterMediaAssetRequest
{
    public string UnitCode { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long? LengthSeconds { get; set; }
    public string? Reason { get; set; }
}

public sealed class SyncMediaAssetsRequest
{
    public string UnitCode { get; set; } = string.Empty;
    public string? Reason { get; set; }
}

public sealed class MediaAssetActionRequest
{
    public string? Reason { get; set; }
}

public sealed class ImportMediaAssetsRequest
{
    public List<ImportMediaAssetItem> Assets { get; set; } = new();
    public string? Reason { get; set; }
}

public sealed class ImportMediaAssetItem
{
    public string? UnitCode { get; set; }
    public List<string> TargetUnits { get; set; } = new();
    public string AssetType { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string? PhysicalPath { get; set; }
    public string? OriginalUrl { get; set; }
    public long? LengthSeconds { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastPlayedAtUtc { get; set; }
}

public sealed class ImportMediaAssetsResult
{
    public int Requested { get; set; }
    public int Imported { get; set; }
    public int Updated { get; set; }
    public int Failed { get; set; }
    public List<string> Errors { get; set; } = new();
}
