namespace Acutis.Domain.Entities;

public sealed class GroupTherapyFacilitationConfig
{
    public Guid Id { get; set; }
    public string? UnitCode { get; set; }
    public string ProgramCode { get; set; } = string.Empty;
    public string CounsellorStyle { get; set; } = "Balanced";
    public bool IsTimingEnabled { get; set; } = true;
    public int? SessionDurationMinutes { get; set; }
    public int? ResidentDurationMinutes { get; set; }
    public decimal ResidentTimeMultiplier { get; set; } = 1.0m;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
