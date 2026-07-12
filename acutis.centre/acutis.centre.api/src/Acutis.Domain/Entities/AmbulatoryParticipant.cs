namespace Acutis.Domain.Entities;

public sealed class AmbulatoryParticipant
{
    public Guid Id { get; set; }
    public AmbulatoryProgrammeType ProgrammeType { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? PreferredName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? ReferralSource { get; set; }
    public string Status { get; set; } = "active";
    public string CounsellorUserId { get; set; } = string.Empty;
    public string CounsellorDisplayName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<AmbulatoryAssessment> Assessments { get; set; } = new List<AmbulatoryAssessment>();
    public ICollection<AmbulatoryCarePlan> CarePlans { get; set; } = new List<AmbulatoryCarePlan>();
    public ICollection<AmbulatoryAppointment> Appointments { get; set; } = new List<AmbulatoryAppointment>();
}
