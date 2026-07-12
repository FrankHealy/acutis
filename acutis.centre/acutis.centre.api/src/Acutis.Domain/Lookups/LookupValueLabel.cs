namespace Acutis.Domain.Lookups;

public sealed class LookupValueLabel
{
    public Guid LookupValueId { get; set; }
    public LookupValue LookupValue { get; set; } = null!;

    public string Locale { get; set; } = null!;
    public string Label { get; set; } = null!;
}
