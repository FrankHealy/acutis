namespace Acutis.Application.DTOs;

public record SessionNoteDto(
    Guid ParticipantId,
    Guid ResidentId,
    string ResidentName,
    string Body,
    IReadOnlyCollection<string> QuickComments,
    DateTimeOffset LastUpdated
);
