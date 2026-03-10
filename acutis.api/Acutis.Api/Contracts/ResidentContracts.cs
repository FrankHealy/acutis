namespace Acutis.Api.Contracts;

public sealed class ResidentListItemDto
{
    public int Id { get; set; }
    public string Psn { get; set; } = string.Empty;
    public Guid? UnitGuid { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public int Age { get; set; }
    public int WeekNumber { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string UnitId { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? AdmissionDate { get; set; }
    public string? ExpectedCompletion { get; set; }
    public string PrimaryAddiction { get; set; } = string.Empty;
    public bool IsDrug { get; set; }
    public bool IsGambeler { get; set; }
    public bool IsPreviousResident { get; set; }
    public int DietaryNeedsCode { get; set; }
    public bool IsSnorer { get; set; }
    public bool HasCriminalHistory { get; set; }
    public bool IsOnProbation { get; set; }
    public int ArgumentativeScale { get; set; }
    public int LearningDifficultyScale { get; set; }
    public int LiteracyScale { get; set; }
}
