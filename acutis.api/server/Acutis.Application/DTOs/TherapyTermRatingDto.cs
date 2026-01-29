namespace Acutis.Application.DTOs;

public record TherapyTermRatingDto(
    Guid Id,
    int ExternalId,
    string Label,
    string Description,
    int TermCount
);
