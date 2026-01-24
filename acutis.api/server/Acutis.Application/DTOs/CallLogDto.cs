namespace Acutis.Application.DTOs;

public sealed record CallLogDto(
    Guid Id,
    string FirstName,
    string Surname,
    string CallerType,
    string ConcernType,
    string Unit,
    string Location,
    string PhoneNumber,
    DateTimeOffset TimestampUtc,
    string Notes,
    string Status,
    string Urgency,
    string CreatedBy,
    DateTimeOffset CreatedAtUtc,
    string? UpdatedBy,
    DateTimeOffset? UpdatedAtUtc);
