namespace Acutis.Domain.Entities;

public sealed class ScheduleOccurrence
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public Guid? ProgrammeDefinitionId { get; set; }
    public Guid? TemplateId { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? ResidentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Category { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public ScheduleAudienceType AudienceType { get; set; } = ScheduleAudienceType.UnitResidents;
    public Guid? CohortId { get; set; }
    public ScheduleFacilitatorType FacilitatorType { get; set; } = ScheduleFacilitatorType.None;
    public string? FacilitatorRole { get; set; }
    public string? ExternalResourceName { get; set; }
    public ScheduleOccurrenceStatus Status { get; set; } = ScheduleOccurrenceStatus.Scheduled;
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public Centre? Centre { get; set; }
    public Unit? Unit { get; set; }
    public ProgrammeDefinition? ProgrammeDefinition { get; set; }
    public ScheduleTemplate? Template { get; set; }
    public ResidentProgrammeEpisode? Episode { get; set; }
    public Resident? Resident { get; set; }
}
