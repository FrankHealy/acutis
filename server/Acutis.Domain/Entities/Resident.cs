namespace Acutis.Domain.Entities;

public class Resident : AuditableEntity
{
    public string Psn { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public int? WeekNumber { get; set; }
    public string RoomNumber { get; set; } = "-";
    public string? PhotoUrl { get; set; }
    public string PrimaryAddiction { get; set; } = string.Empty;
    public bool IsDrug { get; set; }
    public bool IsGambeler { get; set; }
    public bool IsSnorer { get; set; }
    public int DietaryNeedsCode { get; set; }
    public bool HasCriminalHistory { get; set; }
    public bool IsOnProbation { get; set; }
    public int ArgumentativeScale { get; set; }
    public int LearningDifficultyScale { get; set; }
    public int LiteracyScale { get; set; }
    public bool IsPreviousResident { get; set; }
    public ICollection<GroupSessionParticipant> Sessions { get; set; } = new List<GroupSessionParticipant>();
}

