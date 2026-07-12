using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Services.VideoConsultations;

public sealed record VideoConsultationContextDto(string ClientName, string PractitionerName, DateTime StartsAtUtc, DateTime EndsAtUtc, string Status);
public sealed record JoinCredentialDto(
    [property: System.Text.Json.Serialization.JsonPropertyName("server_url")] string ServerUrl,
    [property: System.Text.Json.Serialization.JsonPropertyName("participant_token")] string ParticipantToken);
public sealed record InvitationDto(string InvitationToken, DateTime ExpiresAtUtc, string JoinPath);

public interface IVideoConsultationService
{
    Task<VideoConsultationContextDto> GetPractitionerContextAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct);
    Task<JoinCredentialDto> IssuePractitionerCredentialAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct);
    Task<VideoConsultationContextDto> GetClientContextAsync(string invitationToken, CancellationToken ct);
    Task<JoinCredentialDto> IssueClientCredentialAsync(string invitationToken, string displayName, CancellationToken ct);
    Task<InvitationDto> CreateInvitationAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct);
    Task EndAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct);
}

public sealed class VideoConsultationService(
    AcutisAmbulatoryDbContext db, ILiveKitTokenService tokens, IOptions<LiveKitOptions> options,
    TimeProvider clock, ILogger<VideoConsultationService> logger) : IVideoConsultationService
{
    public async Task<VideoConsultationContextDto> GetPractitionerContextAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct)
    {
        var appointment = await AssignedAppointment(appointmentId, user, ct);
        ValidateAppointment(appointment);
        return ToContext(appointment, appointment.VideoConsultation?.Status.ToString() ?? VideoConsultationStatus.Scheduled.ToString());
    }

    public async Task<JoinCredentialDto> IssuePractitionerCredentialAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct)
    {
        var appointment = await AssignedAppointment(appointmentId, user, ct);
        ValidateAppointment(appointment);
        ValidateJoinWindow(appointment);
        var consultation = await EnsureConsultation(appointment, ct);
        ValidateConsultation(consultation);
        if (consultation.Status == VideoConsultationStatus.Scheduled) consultation.Status = VideoConsultationStatus.Open;
        consultation.StartedAtUtc ??= clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Video consultation opened; join credential issued. ConsultationId={ConsultationId} Role=Practitioner", consultation.Id);
        return Credential(consultation, "practitioner", appointment.CounsellorDisplayName);
    }

    public async Task<VideoConsultationContextDto> GetClientContextAsync(string invitationToken, CancellationToken ct)
    {
        var invitation = await ValidInvitation(invitationToken, ct);
        return ToContext(invitation.VideoConsultation.Appointment, invitation.VideoConsultation.Status.ToString());
    }

    public async Task<JoinCredentialDto> IssueClientCredentialAsync(string invitationToken, string displayName, CancellationToken ct)
    {
        var invitation = await ValidInvitation(invitationToken, ct);
        ValidateJoinWindow(invitation.VideoConsultation.Appointment);
        if (string.IsNullOrWhiteSpace(displayName) || displayName.Trim().Length > 160)
            throw new ArgumentException("Please confirm a valid display name.");
        invitation.UsedAtUtc ??= clock.GetUtcNow().UtcDateTime;
        var consultation = invitation.VideoConsultation;
        if (consultation.Status == VideoConsultationStatus.Scheduled) consultation.Status = VideoConsultationStatus.Open;
        consultation.StartedAtUtc ??= clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Join credential issued. ConsultationId={ConsultationId} Role=Client", consultation.Id);
        return Credential(consultation, "client", displayName.Trim());
    }

    public async Task<InvitationDto> CreateInvitationAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct)
    {
        var appointment = await AssignedAppointment(appointmentId, user, ct);
        ValidateAppointment(appointment);
        var consultation = await EnsureConsultation(appointment, ct);
        ValidateConsultation(consultation);
        var raw = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var expiry = appointment.EndsAtUtc.AddHours(2);
        var invitation = new VideoConsultationInvitation
        {
            Id = Guid.NewGuid(), VideoConsultationId = consultation.Id, TokenHash = Hash(raw),
            CreatedAtUtc = clock.GetUtcNow().UtcDateTime, ExpiresAtUtc = expiry
        };
        db.VideoConsultationInvitations.Add(invitation);
        await db.SaveChangesAsync(ct);
        return new(raw, expiry, $"/vc/join/{raw}");
    }

    public async Task EndAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken ct)
    {
        var appointment = await AssignedAppointment(appointmentId, user, ct);
        if (appointment.VideoConsultation is null) throw new KeyNotFoundException("Consultation not found.");
        appointment.VideoConsultation.Status = VideoConsultationStatus.Ended;
        appointment.VideoConsultation.EndedAtUtc = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Video consultation ended. ConsultationId={ConsultationId}", appointment.VideoConsultation.Id);
    }

    private async Task<AmbulatoryAppointment> AssignedAppointment(Guid id, ClaimsPrincipal user, CancellationToken ct)
    {
        var appointment = await db.Appointments.Include(x => x.Participant).Include(x => x.VideoConsultation)
            .SingleOrDefaultAsync(x => x.Id == id && x.ProgrammeType == AmbulatoryProgrammeType.Practitioner, ct)
            ?? throw new KeyNotFoundException("Appointment not found.");
        if (!string.Equals(appointment.CounsellorUserId, UserId(user), StringComparison.Ordinal))
            throw new UnauthorizedAccessException("You are not assigned to this appointment.");
        return appointment;
    }

    private async Task<VideoConsultationInvitation> ValidInvitation(string raw, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw.Length != 64) throw new KeyNotFoundException("Invitation is invalid.");
        var target = Hash(raw);
        var candidates = await db.VideoConsultationInvitations
            .Include(x => x.VideoConsultation).ThenInclude(x => x.Appointment).ThenInclude(x => x.Participant)
            .Where(x => x.RevokedAtUtc == null && x.ExpiresAtUtc > clock.GetUtcNow().UtcDateTime).ToListAsync(ct);
        var invitation = candidates.FirstOrDefault(x => x.TokenHash.Length == target.Length && CryptographicOperations.FixedTimeEquals(x.TokenHash, target))
            ?? throw new KeyNotFoundException("Invitation is expired, revoked, or invalid.");
        ValidateAppointment(invitation.VideoConsultation.Appointment);
        ValidateConsultation(invitation.VideoConsultation);
        return invitation;
    }

    private async Task<VideoConsultation> EnsureConsultation(AmbulatoryAppointment appointment, CancellationToken ct)
    {
        if (appointment.VideoConsultation is not null) return appointment.VideoConsultation;
        var consultation = new VideoConsultation { Id = Guid.NewGuid(), AppointmentId = appointment.Id, RoomName = Guid.NewGuid().ToString("N"), CreatedAtUtc = clock.GetUtcNow().UtcDateTime };
        db.VideoConsultations.Add(consultation); await db.SaveChangesAsync(ct); appointment.VideoConsultation = consultation; return consultation;
    }

    private JoinCredentialDto Credential(VideoConsultation consultation, string role, string name)
        => new(options.Value.Url, tokens.CreateParticipantToken($"vc_{role}_{Guid.NewGuid():N}", consultation.RoomName, name));

    private void ValidateJoinWindow(AmbulatoryAppointment a)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        if (now < a.StartsAtUtc.AddMinutes(-options.Value.JoinWindowMinutesBefore) || now > a.EndsAtUtc.AddMinutes(options.Value.JoinWindowMinutesAfter))
            throw new InvalidOperationException("This consultation is outside its joining window.");
    }

    private static void ValidateAppointment(AmbulatoryAppointment a)
    {
        if (!string.Equals(a.DeliveryMode, "video", StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("This is not a video appointment.");
        if (a.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase) || a.Status.Equals("ended", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"This appointment is {a.Status.ToLowerInvariant()}.");
    }
    private static void ValidateConsultation(VideoConsultation c)
    {
        if (c.Status is VideoConsultationStatus.Cancelled or VideoConsultationStatus.Ended)
            throw new InvalidOperationException($"This consultation is {c.Status.ToString().ToLowerInvariant()}.");
    }
    private static byte[] Hash(string value) => SHA256.HashData(Encoding.UTF8.GetBytes(value));
    private static string UserId(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub") ?? throw new UnauthorizedAccessException();
    private static VideoConsultationContextDto ToContext(AmbulatoryAppointment a, string status) => new(a.Participant?.PreferredName ?? a.Participant?.DisplayName ?? "Client", a.CounsellorDisplayName, a.StartsAtUtc, a.EndsAtUtc, status);
}
