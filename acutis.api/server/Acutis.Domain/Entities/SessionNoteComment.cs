namespace Acutis.Domain.Entities;

public class SessionNoteComment : AuditableEntity
{
    public Guid SessionNoteId { get; set; }
    public SessionNote? SessionNote { get; set; }
    public Guid QuickCommentTemplateId { get; set; }
    public QuickCommentTemplate? QuickCommentTemplate { get; set; }
    public string? AdditionalContext { get; set; }
}

