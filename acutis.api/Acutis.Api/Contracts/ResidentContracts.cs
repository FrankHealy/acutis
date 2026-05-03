namespace Acutis.Api.Contracts;

public sealed class ResidentListItemDto
{
    public int Id { get; set; }
    public Guid ResidentGuid { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public string? CentreEpisodeCode { get; set; }
    public int? EntryYear { get; set; }
    public int? EntryWeek { get; set; }
    public int? EntrySequence { get; set; }
    public string? ProgrammeType { get; set; }
    public string? ParticipationMode { get; set; }
    public string? CaseStatus { get; set; }
    public string Psn { get; set; } = string.Empty;
    public Guid? UnitGuid { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public int Age { get; set; }
    public int WeekNumber { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string? BedCode { get; set; }
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

public sealed class ResidentPreviousTreatmentDto
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string CentreName { get; set; } = string.Empty;
    public string? TreatmentType { get; set; }
    public int? StartYear { get; set; }
    public int? DurationValue { get; set; }
    public string? DurationUnit { get; set; }
    public bool? CompletedTreatment { get; set; }
    public int? SobrietyAfterwardsValue { get; set; }
    public string? SobrietyAfterwardsUnit { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class UpsertResidentPreviousTreatmentRequest
{
    public string CentreName { get; set; } = string.Empty;
    public string? TreatmentType { get; set; }
    public int? StartYear { get; set; }
    public int? DurationValue { get; set; }
    public string? DurationUnit { get; set; }
    public bool? CompletedTreatment { get; set; }
    public int? SobrietyAfterwardsValue { get; set; }
    public string? SobrietyAfterwardsUnit { get; set; }
    public string? Notes { get; set; }
}

public sealed class RecordDischargeRequest
{
    /// <summary>
    /// Client-generated idempotency key. Allows offline/RN clients to safely retry submission.
    /// </summary>
    public Guid ClientEventId { get; set; }

    /// <summary>
    /// The exit type: SelfDischarge (8), ExtendedStay (9), ClinicalDischarge (10),
    /// Completed (7), or Ejected (6).
    /// </summary>
    public int ExitType { get; set; }

    /// <summary>
    /// The date the exit actually occurred (may differ from server receipt time for offline sync).
    /// </summary>
    public DateOnly EventDate { get; set; }

    /// <summary>
    /// Optional reason. Avoid storing clinical detail here — use notes forms for that.
    /// </summary>
    public string? Reason { get; set; }
}

public sealed class RecordDischargeResponse
{
    public Guid EpisodeEventId { get; set; }
    public Guid EpisodeId { get; set; }
    public bool WasAlreadyRecorded { get; set; }
}
