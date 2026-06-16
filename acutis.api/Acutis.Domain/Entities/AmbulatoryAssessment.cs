namespace Acutis.Domain.Entities;

public sealed class AmbulatoryAssessment
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public string AssessmentType { get; set; } = "initial";
    public string PresentingNeeds { get; set; } = string.Empty;
    public string RiskSummary { get; set; } = string.Empty;
    public string Strengths { get; set; } = string.Empty;
    public string SubstanceOrBehaviourSummary { get; set; } = string.Empty;
    public string GoalsDiscussed { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public DateTime CompletedAtUtc { get; set; }
    public string CompletedByUserId { get; set; } = string.Empty;

    public AmbulatoryParticipant Participant { get; set; } = null!;
}
