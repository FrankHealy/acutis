namespace Acutis.Api.Contracts;

public sealed class ElementLibraryResponseDto
{
    public List<ElementGroupDto> Groups { get; set; } = new();
}

public sealed class ElementGroupDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SourceDocumentReference { get; set; }
    public int Version { get; set; }
    public string Status { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<ElementDefinitionDto> Definitions { get; set; } = new();
}

public sealed class ElementDefinitionDto
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
    public int Version { get; set; }
    public string Status { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public ElementFieldConfigDto FieldConfig { get; set; } = new();
}

public sealed class ElementFieldConfigDto
{
    public bool Required { get; set; }
    public string? Placeholder { get; set; }
    public string? DefaultValue { get; set; }
    public ElementValidationDto? Validation { get; set; }
    public List<ElementOptionDto> Options { get; set; } = new();
}

public sealed class ElementValidationDto
{
    public int? Min { get; set; }
    public int? Max { get; set; }
    public string? Pattern { get; set; }
    public string? CustomMessage { get; set; }
}

public sealed class ElementOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}
