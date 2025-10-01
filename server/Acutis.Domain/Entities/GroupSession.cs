using Acutis.Domain.Enums;

namespace Acutis.Domain.Entities;

public class GroupSession : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public TherapyModule? Module { get; set; }
    public DateTimeOffset ScheduledAt { get; set; }
    public string Facilitator { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsClosed { get; set; }

    public ICollection<GroupSessionParticipant> Participants { get; set; } = new List<GroupSessionParticipant>();
    public ICollection<SessionNote> Notes { get; set; } = new List<SessionNote>();
}

