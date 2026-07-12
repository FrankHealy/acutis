namespace Acutis.Domain.Entities;

public sealed class Video
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int LengthSeconds { get; set; }
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string Language { get; set; } = "en";
    public string TagsJson { get; set; } = "[]";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = "system";
    public DateTime ModifiedAtUtc { get; set; }
    public string ModifiedBy { get; set; } = "system";
}
