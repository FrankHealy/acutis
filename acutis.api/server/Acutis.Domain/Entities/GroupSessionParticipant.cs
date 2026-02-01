using Acutis.Domain.Enums;

namespace Acutis.Domain.Entities;

public class GroupSessionParticipant : AuditableEntity
{
    public Guid SessionId { get; set; }
    public GroupSession? Session { get; set; }
    public Guid ResidentId { get; set; }
    public Resident? Resident { get; set; }
    public AttendanceStatus AttendanceStatus { get; set; } = AttendanceStatus.Unknown;
    public bool HasSpoken { get; set; }

    public SessionNote? Note { get; set; }
}

