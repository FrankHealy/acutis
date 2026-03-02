namespace Acutis.Domain.Entities;

public sealed class EpisodeEvent
{
    public Guid Id { get; set; }
    public Guid EpisodeId { get; set; }
    public EpisodeEventType EventType { get; set; }
    public DateOnly EventDate { get; set; }
    public string PayloadJson { get; set; } = "{}";
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }
}
