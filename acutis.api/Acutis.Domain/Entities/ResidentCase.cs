namespace Acutis.Domain.Entities;

public sealed class ResidentCase
{
    public Guid Id { get; set; }
    public Guid? ResidentId { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public string CaseStatus { get; set; } = "referred";
    public string CasePhase { get; set; } = "intake";
    public string? IntakeSource { get; set; }
    public string? ReferralSource { get; set; }
    public string? ReferralReference { get; set; }
    public DateTime? ReferralReceivedAtUtc { get; set; }
    public DateTime? ScreeningStartedAtUtc { get; set; }
    public DateTime? ScreeningCompletedAtUtc { get; set; }
    public DateTime? AdmissionDecisionAtUtc { get; set; }
    public string? AdmissionDecisionStatus { get; set; }
    public string? AdmissionDecisionReason { get; set; }
    public DateTime? ClosedWithoutAdmissionAtUtc { get; set; }
    public bool RequiresComprehensiveAssessment { get; set; }
    public bool ComprehensiveAssessmentCompleted { get; set; }
    public DateTime OpenedAtUtc { get; set; }
    public DateTime? LastContactAtUtc { get; set; }
    public DateTime? ClosedAtUtc { get; set; }
    public string? SummaryNotes { get; set; }

    public Resident? Resident { get; set; }
    public Centre? Centre { get; set; }
    public Unit? Unit { get; set; }
    public ICollection<ResidentProgrammeEpisode> Episodes { get; set; } = new List<ResidentProgrammeEpisode>();
}
