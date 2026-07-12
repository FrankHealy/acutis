namespace Acutis.Domain.Entities;

public sealed class ElementGroup
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SourceDocumentReference { get; set; }
    public int Version { get; set; } = 1;
    public string Status { get; set; } = "published";
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<ElementDefinition> Definitions { get; set; } = new List<ElementDefinition>();
}
