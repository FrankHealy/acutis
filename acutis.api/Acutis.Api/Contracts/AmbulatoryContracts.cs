using Acutis.Domain.Entities;

namespace Acutis.Api.Contracts;

public sealed class AmbulatoryDashboardDto
{
    public AmbulatoryProgrammeType ProgrammeType { get; set; }
    public string ProgrammeName { get; set; } = string.Empty;
    public string CounsellorUserId { get; set; } = string.Empty;
    public IReadOnlyList<AmbulatoryParticipantDto> Participants { get; set; } = Array.Empty<AmbulatoryParticipantDto>();
    public IReadOnlyList<AmbulatoryAppointmentDto> Appointments { get; set; } = Array.Empty<AmbulatoryAppointmentDto>();
    public IReadOnlyList<AmbulatoryProgrammeOfferingDto> ProgrammeOfferings { get; set; } = Array.Empty<AmbulatoryProgrammeOfferingDto>();
}

public sealed class AmbulatoryProgrammeOfferingDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Cadence { get; set; } = string.Empty;
    public string Facilitator { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SuitableFor { get; set; } = string.Empty;
    public string NextSessionLabel { get; set; } = string.Empty;
}

public sealed class AmbulatoryParticipantDto
{
    public Guid Id { get; set; }
    public AmbulatoryProgrammeType ProgrammeType { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? PreferredName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? ReferralSource { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CounsellorUserId { get; set; } = string.Empty;
    public string CounsellorDisplayName { get; set; } = string.Empty;
    public AmbulatoryCarePlanDto? CurrentCarePlan { get; set; }
    public IReadOnlyList<AmbulatoryAssessmentDto> Assessments { get; set; } = Array.Empty<AmbulatoryAssessmentDto>();
}

public sealed class AmbulatoryAssessmentDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public string AssessmentType { get; set; } = string.Empty;
    public string PresentingNeeds { get; set; } = string.Empty;
    public string RiskSummary { get; set; } = string.Empty;
    public string Strengths { get; set; } = string.Empty;
    public string SubstanceOrBehaviourSummary { get; set; } = string.Empty;
    public string GoalsDiscussed { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public DateTime CompletedAtUtc { get; set; }
}

public sealed class AmbulatoryCarePlanDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Needs { get; set; } = string.Empty;
    public string Strengths { get; set; } = string.Empty;
    public string Risks { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
    public string Actions { get; set; } = string.Empty;
    public string ReviewNotes { get; set; } = string.Empty;
    public DateOnly? ReviewDate { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class AmbulatoryAppointmentDto
{
    public Guid Id { get; set; }
    public AmbulatoryProgrammeType ProgrammeType { get; set; }
    public Guid? ParticipantId { get; set; }
    public string? ParticipantName { get; set; }
    public string CounsellorUserId { get; set; } = string.Empty;
    public string CounsellorDisplayName { get; set; } = string.Empty;
    public string AppointmentType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAtUtc { get; set; }
    public DateTime EndsAtUtc { get; set; }
    public string DeliveryMode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? AvProvider { get; set; }
    public string? AvRoomName { get; set; }
    public string? AvJoinUrl { get; set; }
    public bool IsFixed { get; set; }
}

public sealed class CreateAmbulatoryParticipantRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string? PreferredName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? ReferralSource { get; set; }
}

public sealed class UpsertAmbulatoryAssessmentRequest
{
    public string AssessmentType { get; set; } = "initial";
    public string PresentingNeeds { get; set; } = string.Empty;
    public string RiskSummary { get; set; } = string.Empty;
    public string Strengths { get; set; } = string.Empty;
    public string SubstanceOrBehaviourSummary { get; set; } = string.Empty;
    public string GoalsDiscussed { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
}

public sealed class UpsertAmbulatoryCarePlanRequest
{
    public string Status { get; set; } = "active";
    public string Needs { get; set; } = string.Empty;
    public string Strengths { get; set; } = string.Empty;
    public string Risks { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
    public string Actions { get; set; } = string.Empty;
    public string ReviewNotes { get; set; } = string.Empty;
    public DateOnly? ReviewDate { get; set; }
}

public sealed class UpsertAmbulatoryAppointmentRequest
{
    public Guid? ParticipantId { get; set; }
    public string AppointmentType { get; set; } = "individual-therapy";
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAtUtc { get; set; }
    public DateTime EndsAtUtc { get; set; }
    public string DeliveryMode { get; set; } = "in-person";
    public string? Notes { get; set; }
}
