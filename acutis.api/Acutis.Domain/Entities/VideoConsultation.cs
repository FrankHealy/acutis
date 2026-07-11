namespace Acutis.Domain.Entities;

public enum VideoConsultationStatus
{
    Scheduled,
    Open,
    Ended,
    Cancelled
}

public sealed class VideoConsultation
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public string RoomName { get; set; } = string.Empty;
    public VideoConsultationStatus Status { get; set; } = VideoConsultationStatus.Scheduled;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }

    public AmbulatoryAppointment Appointment { get; set; } = null!;
    public ICollection<VideoConsultationInvitation> Invitations { get; set; } = new List<VideoConsultationInvitation>();
}

public sealed class VideoConsultationInvitation
{
    public Guid Id { get; set; }
    public Guid VideoConsultationId { get; set; }
    public byte[] TokenHash { get; set; } = Array.Empty<byte>();
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public DateTime? UsedAtUtc { get; set; }

    public VideoConsultation VideoConsultation { get; set; } = null!;
}