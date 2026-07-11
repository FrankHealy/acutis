namespace Acutis.Domain.Entities;

public sealed class AmbulatoryAppointment
{
    public Guid Id { get; set; }
    public AmbulatoryProgrammeType ProgrammeType { get; set; }
    public Guid? ParticipantId { get; set; }
    public string CounsellorUserId { get; set; } = string.Empty;
    public string CounsellorDisplayName { get; set; } = string.Empty;
    public string AppointmentType { get; set; } = "individual-therapy";
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAtUtc { get; set; }
    public DateTime EndsAtUtc { get; set; }
    public string DeliveryMode { get; set; } = "in-person";
    public string Status { get; set; } = "scheduled";
    public string? Notes { get; set; }
    public string? AvProvider { get; set; }
    public string? AvRoomName { get; set; }
    public string? AvJoinUrl { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public AmbulatoryParticipant? Participant { get; set; }
    public VideoConsultation? VideoConsultation { get; set; }
}