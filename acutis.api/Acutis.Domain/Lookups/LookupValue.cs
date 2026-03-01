namespace Acutis.Domain.Lookups;

public sealed class LookupValue
{
    public Guid LookupValueId { get; set; }
    public Guid LookupTypeId { get; set; }
    public LookupType LookupType { get; set; } = null!;

    public Guid? UnitId { get; set; }
    public string Code { get; set; } = null!;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<LookupValueLabel> Labels { get; set; } = new List<LookupValueLabel>();
}
