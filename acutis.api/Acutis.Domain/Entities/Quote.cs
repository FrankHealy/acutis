namespace Acutis.Domain.Entities;

public sealed class Quote
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Attribution { get; set; } = string.Empty;
    public string? SourceWork { get; set; }
    public string? SourceNotes { get; set; }
    public string Language { get; set; } = "en";
    public string? PronunciationGuide { get; set; }
    public string TagsJson { get; set; } = "[]";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = "system";
    public DateTime ModifiedAt { get; set; }
    public string ModifiedBy { get; set; } = "system";
}
