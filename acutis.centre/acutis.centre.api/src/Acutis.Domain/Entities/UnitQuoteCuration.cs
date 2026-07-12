namespace Acutis.Domain.Entities;

public sealed class UnitQuoteCuration
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public Guid QuoteId { get; set; }
    public int? Weight { get; set; }
    public int? DisplayOrder { get; set; }
    public DateOnly? PinnedFrom { get; set; }
    public DateOnly? PinnedTo { get; set; }
    public bool IsExcluded { get; set; }
}
