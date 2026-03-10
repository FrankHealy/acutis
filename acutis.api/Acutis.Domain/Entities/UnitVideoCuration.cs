namespace Acutis.Domain.Entities;

public sealed class UnitVideoCuration
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public Guid VideoId { get; set; }
    public int? DisplayOrder { get; set; }
    public bool IsExcluded { get; set; }
}
