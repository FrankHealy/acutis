namespace Acutis.Application.DTOs;

public record TherapyTermDto(
    Guid Id,
    int ExternalId,
    string Term,
    string Description,
    string RatingLabel,
    string RatingDescription
);
