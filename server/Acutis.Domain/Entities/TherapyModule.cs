namespace Acutis.Domain.Entities;

public class TherapyModule : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;

    public ICollection<ModuleQuestion> Questions { get; set; } = new List<ModuleQuestion>();
    public ICollection<GroupSession> Sessions { get; set; } = new List<GroupSession>();
}

