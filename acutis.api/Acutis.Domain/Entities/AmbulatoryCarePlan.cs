namespace Acutis.Domain.Entities;

public sealed class AmbulatoryCarePlan
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public string Status { get; set; } = "draft";
    public string Needs { get; set; } = string.Empty;
    public string Strengths { get; set; } = string.Empty;
    public string Risks { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
    public string Actions { get; set; } = string.Empty;
    public string ReviewNotes { get; set; } = string.Empty;
    public DateOnly? ReviewDate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;
    public string UpdatedByUserId { get; set; } = string.Empty;

    public AmbulatoryParticipant Participant { get; set; } = null!;
}
