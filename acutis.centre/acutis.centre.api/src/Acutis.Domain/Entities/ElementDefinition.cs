namespace Acutis.Domain.Entities;

public sealed class ElementDefinition
{
    public Guid Id { get; set; }
    public Guid? GroupId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? HelpText { get; set; }
    public string ElementType { get; set; } = string.Empty;
    public string SourceKind { get; set; } = string.Empty;
    public string? CanonicalFieldKey { get; set; }
    public string? OptionSetKey { get; set; }
    public string? SourceDocumentReference { get; set; }
    public string FieldConfigJson { get; set; } = "{}";
    public int Version { get; set; } = 1;
    public string Status { get; set; } = "published";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ElementGroup? Group { get; set; }
}
