namespace Acutis.Domain.Entities;

public sealed class OptionItem
{
    public Guid Id { get; set; }
    public Guid OptionSetId { get; set; }
    public OptionSet OptionSet { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string LabelKey { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}
