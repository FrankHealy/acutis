namespace Acutis.Domain.Entities;

public sealed class TherapyTopicCompletion
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public Guid TherapyTopicId { get; set; }
    public DateOnly CompletedOn { get; set; }
    public Guid? EvidenceNoteId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
}
