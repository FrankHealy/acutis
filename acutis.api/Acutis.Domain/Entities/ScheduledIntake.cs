namespace Acutis.Domain.Entities;

public sealed class ScheduledIntake
{
    public Guid Id { get; set; }
    public Guid ResidentCaseId { get; set; }
    public Guid UnitId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public Guid StatusLookupValueId { get; set; }
    public string Status { get; set; } = "scheduled";
    public Guid? AssignedStaffId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ResidentCase ResidentCase { get; set; } = null!;
    public Unit Unit { get; set; } = null!;
}
