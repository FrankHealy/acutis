using System.Collections.ObjectModel;

namespace Acutis.Application.DTOs;

public record ModuleQuestionDto(
    Guid Id,
    string Prompt,
    bool IsComposite,
    IReadOnlyCollection<string> Parts
);
