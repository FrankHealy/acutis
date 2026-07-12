namespace Acutis.Domain.Entities;

public sealed class ProgrammeDefinition
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int TotalDurationValue { get; set; }
    public ProgrammeDurationUnit TotalDurationUnit { get; set; } = ProgrammeDurationUnit.Weeks;
    public int? DetoxPhaseDurationValue { get; set; }
    public ProgrammeDurationUnit? DetoxPhaseDurationUnit { get; set; }
    public int? MainPhaseDurationValue { get; set; }
    public ProgrammeDurationUnit? MainPhaseDurationUnit { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public Centre? Centre { get; set; }
    public ICollection<Unit> Units { get; set; } = new List<Unit>();
    public ICollection<ScheduleTemplate> ScheduleTemplates { get; set; } = new List<ScheduleTemplate>();
    public ICollection<ScheduleOccurrence> ScheduleOccurrences { get; set; } = new List<ScheduleOccurrence>();
}
