namespace Acutis.Domain.Entities;

public sealed class FormDefinition
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public int Version { get; set; }
    public string Status { get; set; } = "draft";
    public string TitleKey { get; set; } = string.Empty;
    public string? DescriptionKey { get; set; }
    public string SchemaJson { get; set; } = "{}";
    public string UiJson { get; set; } = "{}";
    public string RulesJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
}
