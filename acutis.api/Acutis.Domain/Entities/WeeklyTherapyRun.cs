namespace Acutis.Domain.Entities;

public sealed class WeeklyTherapyRun
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public DateOnly WeekEndDate { get; set; }
    public string TopicsRunningJson { get; set; } = "[]";
    public WeeklyTherapyRunStatus Status { get; set; } = WeeklyTherapyRunStatus.Draft;
    public DateTime GeneratedAt { get; set; }
    public Guid GeneratedByUserId { get; set; }
    public DateTime? PublishedAt { get; set; }
    public Guid? PublishedByUserId { get; set; }
}
