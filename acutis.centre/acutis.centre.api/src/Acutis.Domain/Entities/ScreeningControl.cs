namespace Acutis.Domain.Entities;

public sealed class ScreeningControl
{
    public Guid Id { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string UnitName { get; set; } = string.Empty;
    public int UnitCapacity { get; set; }
    public int CurrentOccupancy { get; set; }
    public int CapacityWarningThreshold { get; set; }
    public int CallLogsCacheSeconds { get; set; }
    public int EvaluationQueueCacheSeconds { get; set; }
    public int LocalizationCacheSeconds { get; set; }
    public bool EnableClientCacheOverride { get; set; }
    public DateTime UpdatedAt { get; set; }
}
