namespace Acutis.Api.Contracts;

public sealed class ScreeningControlDto
{
    public required string UnitCode { get; set; }
    public required string UnitName { get; set; }
    public int UnitCapacity { get; set; }
    public int CurrentOccupancy { get; set; }
    public int CapacityWarningThreshold { get; set; }
    public int CallLogsCacheSeconds { get; set; }
    public int EvaluationQueueCacheSeconds { get; set; }
    public int LocalizationCacheSeconds { get; set; }
    public bool EnableClientCacheOverride { get; set; }
    public DateTime UpdatedAt { get; set; }
}
