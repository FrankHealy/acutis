namespace Acutis.Domain.Entities;

public sealed class ResidentWeeklyTherapyAssignment
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public Guid TherapyTopicId { get; set; }
    public AssignmentSource AssignmentSource { get; set; }
    public string? OverrideReason { get; set; }
    public Guid? SupersedesAssignmentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
}
