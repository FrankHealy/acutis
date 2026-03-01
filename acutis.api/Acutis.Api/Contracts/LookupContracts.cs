namespace Acutis.Api.Contracts;

public sealed class LookupItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public sealed class LookupSetResponseDto
{
    public Guid UnitId { get; set; }
    public string Locale { get; set; } = "en-IE";
    public Dictionary<string, List<LookupItemDto>> Lookups { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

public sealed class LookupVersionsResponseDto
{
    public Guid UnitId { get; set; }
    public Dictionary<string, int> Versions { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
