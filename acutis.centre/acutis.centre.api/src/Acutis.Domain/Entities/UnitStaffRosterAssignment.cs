namespace Acutis.Domain.Entities;

public sealed class UnitStaffRosterAssignment
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public StaffRosterShiftType ShiftType { get; set; }
    public Guid? AssignedAppUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public Unit Unit { get; set; } = null!;
    public AppUser? AssignedAppUser { get; set; }
}
