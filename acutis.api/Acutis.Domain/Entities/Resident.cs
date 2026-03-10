namespace Acutis.Domain.Entities;

public sealed class Resident
{
    public Guid Id { get; set; }
    public string? Psn { get; set; }
    public Guid? UnitId { get; set; }
    public string? UnitCode { get; set; }
    public string? FirstName { get; set; }
    public string? Surname { get; set; }
    public string? Nationality { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public int WeekNumber { get; set; }
    public string? RoomNumber { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public DateTime? ExpectedCompletionDate { get; set; }
    public string? PrimaryAddiction { get; set; }
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
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
