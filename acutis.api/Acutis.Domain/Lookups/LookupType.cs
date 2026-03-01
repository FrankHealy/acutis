namespace Acutis.Domain.Lookups;

public sealed class LookupType
{
    public Guid LookupTypeId { get; set; }
    public string Key { get; set; } = null!;
    public string DefaultLocale { get; set; } = "en-IE";
    public bool IsActive { get; set; } = true;
    public int Version { get; set; } = 1;

    public ICollection<LookupValue> Values { get; set; } = new List<LookupValue>();
}
