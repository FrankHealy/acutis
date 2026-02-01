namespace Acutis.Domain.Entities;

public class QuickCommentTemplate : AuditableEntity
{
    public string Text { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<SessionNoteComment> SessionNoteComments { get; set; } = new List<SessionNoteComment>();
}

