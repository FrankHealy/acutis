namespace Acutis.Domain.Entities;

public class TherapyTerm : AuditableEntity
{
    public int ExternalId { get; set; }
    public string Term { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string OwnerId { get; set; } = "default";

    public Guid RatingId { get; set; }
    public TherapyTermRating? Rating { get; set; }
}

