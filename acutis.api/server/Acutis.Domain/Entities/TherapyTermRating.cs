namespace Acutis.Domain.Entities;

public class TherapyTermRating : AuditableEntity
{
    public int ExternalId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<TherapyTerm> Terms { get; set; } = new List<TherapyTerm>();
}

