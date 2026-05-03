namespace Acutis.Domain.Entities;

public sealed class OtRoleDefinition
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public Centre? Centre { get; set; }
    public Unit? Unit { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public OtRoleType RoleType { get; set; } = OtRoleType.Internal;
    public int? Capacity { get; set; }
    public bool RequiresTraining { get; set; }
    public Guid? StaffMemberInChargeId { get; set; }
    public bool IsOneOff { get; set; }
    public DateOnly? ScheduledDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}
