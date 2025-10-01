using Acutis.Application.DTOs;
using Acutis.Domain.Enums;

namespace Acutis.Application.DTOs;

public record GroupSessionParticipantDto(
    Guid ParticipantId,
    Guid ResidentId,
    string ResidentName,
    AttendanceStatus AttendanceStatus,
    bool HasSpoken
);

public record GroupSessionDto(
    Guid Id,
    Guid ModuleId,
    string ModuleTitle,
    DateTimeOffset ScheduledAt,
    string Facilitator,
    string Location,
    bool IsClosed,
    IReadOnlyCollection<GroupSessionParticipantDto> Participants,
    IReadOnlyCollection<SessionNoteDto> Notes
);
