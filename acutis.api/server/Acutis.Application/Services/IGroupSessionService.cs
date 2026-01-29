using Acutis.Application.DTOs;

namespace Acutis.Application.Services;

public interface IGroupSessionService
{
    Task<GroupSessionDto?> GetSessionAsync(Guid id, CancellationToken cancellationToken = default);
    Task<GroupSessionDto> ScheduleSessionAsync(Guid moduleId, DateTimeOffset scheduledAt, string facilitator, string location, IEnumerable<Guid> residentIds, CancellationToken cancellationToken = default);
    Task CloseSessionAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task<SessionNoteDto> UpsertSessionNoteAsync(Guid participantId, string body, IEnumerable<Guid> quickCommentTemplateIds, CancellationToken cancellationToken = default);
}
