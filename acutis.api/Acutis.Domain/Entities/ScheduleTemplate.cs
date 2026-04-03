namespace Acutis.Domain.Entities;

public sealed class ScheduleTemplate
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public Guid? ProgrammeDefinitionId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public ScheduleRecurrenceType RecurrenceType { get; set; } = ScheduleRecurrenceType.OnceOff;
    public DayOfWeek? WeeklyDayOfWeek { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public ScheduleAudienceType AudienceType { get; set; } = ScheduleAudienceType.UnitResidents;
    public Guid? CohortId { get; set; }
    public Guid? ResidentId { get; set; }
    public ScheduleFacilitatorType FacilitatorType { get; set; } = ScheduleFacilitatorType.None;
    public string? FacilitatorRole { get; set; }
    public string? ExternalResourceName { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public Centre? Centre { get; set; }
    public Unit? Unit { get; set; }
    public ProgrammeDefinition? ProgrammeDefinition { get; set; }
    public Resident? Resident { get; set; }
    public ICollection<ScheduleOccurrence> Occurrences { get; set; } = new List<ScheduleOccurrence>();
}
