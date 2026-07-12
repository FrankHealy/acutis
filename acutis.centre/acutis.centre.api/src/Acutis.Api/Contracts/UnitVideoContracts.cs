namespace Acutis.Api.Contracts;

public sealed class VideoDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string PlaybackUrl { get; set; } = string.Empty;
    public int LengthSeconds { get; set; }
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string Language { get; set; } = "en";
    public List<string> Tags { get; set; } = new();
    public bool IsActive { get; set; }
    public bool IsDownloaded { get; set; }
}

public class CreateVideoRequest
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int LengthSeconds { get; set; }
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string Language { get; set; } = "en";
    public List<string> Tags { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public string? Reason { get; set; }
}

public sealed class UpdateVideoRequest : CreateVideoRequest
{
}

public sealed class UnitVideoCurationDto
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public Guid VideoId { get; set; }
    public int? DisplayOrder { get; set; }
    public bool IsExcluded { get; set; }
}

public sealed class UpsertUnitVideoCurationRequest
{
    public Guid VideoId { get; set; }
    public int? DisplayOrder { get; set; }
    public bool IsExcluded { get; set; }
    public string? Reason { get; set; }
}
