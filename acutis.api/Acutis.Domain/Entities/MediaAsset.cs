namespace Acutis.Domain.Entities;

public enum MediaAssetType
{
    VoicedMeditation = 1,
    MeditationMusic = 2
}

public sealed class MediaAsset
{
    public Guid Id { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public MediaAssetType AssetType { get; set; }
    public string ShortName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public long LengthSeconds { get; set; }
    public DateTime? LastPlayedAtUtc { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
