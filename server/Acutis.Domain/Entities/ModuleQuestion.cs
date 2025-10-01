namespace Acutis.Domain.Entities;

public class ModuleQuestion : AuditableEntity
{
    public Guid ModuleId { get; set; }
    public TherapyModule? Module { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsComposite { get; set; }

    public ICollection<ModuleQuestionPart> Parts { get; set; } = new List<ModuleQuestionPart>();
}

