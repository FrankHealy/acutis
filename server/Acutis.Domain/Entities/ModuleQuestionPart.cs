namespace Acutis.Domain.Entities;

public class ModuleQuestionPart : AuditableEntity
{
    public Guid QuestionId { get; set; }
    public ModuleQuestion? Question { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

