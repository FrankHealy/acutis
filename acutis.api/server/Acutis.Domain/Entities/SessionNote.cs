namespace Acutis.Domain.Entities;

public class SessionNote : AuditableEntity
{
    public Guid SessionId { get; set; }
    public Guid ParticipantId { get; set; }
    public GroupSessionParticipant? Participant { get; set; }
    public string Body { get; set; } = string.Empty;

    public ICollection<SessionNoteComment> Comments { get; set; } = new List<SessionNoteComment>();
}

