namespace Acutis.Application.DTOs;

public sealed record CallLogQuery(
    DateTimeOffset? From,
    DateTimeOffset? To,
    string? Unit,
    string? CallerType,
    string? ConcernType,
    string? Status,
    string? Urgency,
    int Page = 1,
    int PageSize = 50);
