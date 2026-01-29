namespace Acutis.Application.DTOs;

public record TherapyModuleDto(
    Guid Id,
    string Title,
    string Body,
    IReadOnlyCollection<ModuleQuestionDto> Questions
);
