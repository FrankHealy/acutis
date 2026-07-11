using System.Security.Claims;
using System.Security.Cryptography;
using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Services.VideoConsultations;

public sealed class VideoConsultationService
{
    private readonly AcutisAmbulatoryDbContext _db;
    private readonly ILiveKitTokenService _tokens;
    private readonly IAuditService _audit;
    private readonly LiveKitOptions _options;

    public VideoConsultationService(
        AcutisAmbulatoryDbContext db,
        IConfiguration configuration,
        IAuditService audit)
    {
        _db = db;
        _audit = audit;
        _options = configuration.GetSection(LiveKitOptions.SectionName).Get<LiveKitOptions>() ?? new LiveKitOptions();
        _tokens = new LiveKitTokenService(Options.Create(_options));
    }

    public async Task<PractitionerVideoConsultationContextDto> GetPractitionerContextAsync(
        Guid appointmentId,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var appointment = await GetOwnedAppointmentAsync(appointmentId, user, cancellationToken);
        var reason = GetJoinBlockedReason(appointment, DateTime.UtcNow);
        return new PractitionerVideoConsultationContextDto
        {
            AppointmentId = appointment.Id,
            ClientName = appointment.Participant?.DisplayName ?? "Client",
            PractitionerName = appointment.CounsellorDisplayName,
            StartsAtUtc = appointment.StartsAtUtc,
            EndsAtUtc = appointment.EndsAtUtc,
            Status = appointment.VideoConsultation?.Status.ToString() ?? VideoConsultationStatus.Scheduled.ToString(),
            CanJoin = reason is null,
            JoinBlockedReason = reason
        };
    }

    public async Task<LiveKitJoinCredentialDto> CreatePractitionerCredentialAsync(
        Guid appointmentId,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var appointment = await GetOwnedAppointmentAsync(appointmentId, user, cancellationToken);
        EnsureJoinAllowed(appointment);
        var consultation = await GetOrCreateConsultationAsync(appointment, cancellationToken);
        OpenConsultation(consultation);
        await _db.SaveChangesAsync(cancellationToken);

        var identity = $"practitioner-{consultation.Id:N}-{RandomSuffix()}";
        var credential = CreateCredential(consultation.RoomName, identity);
        await WriteAuditAsync(consultation, "JoinCredentialIssued", "practitioner", cancellationToken);
        return credential;
    }

    public async Task<CreateVideoConsultationInvitationResponse> CreateInvitationAsync(
        Guid appointmentId,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var appointment = await GetOwnedAppointmentAsync(appointmentId, user, cancellationToken);
        EnsureAppointmentIsVideoOneToOne(appointment);
        var consultation = await GetOrCreateConsultationAsync(appointment, cancellationToken);

        var rawBytes = RandomNumberGenerator.GetBytes(32);
        var rawToken = WebEncoders.Base64UrlEncode(rawBytes);
        var now = DateTime.UtcNow;
        var invitation = new VideoConsultationInvitation
        {
            Id = Guid.NewGuid(),
            VideoConsultationId = consultation.Id,
            TokenHash = SHA256.HashData(rawBytes),
            CreatedAtUtc = now,
            ExpiresAtUtc = now.AddHours(Math.Max(1, _options.InvitationLifetimeHours))
        };
        _db.VideoConsultationInvitations.Add(invitation);
        await _db.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(consultation, "InvitationIssued", null, cancellationToken);

        return new CreateVideoConsultationInvitationResponse
        {
            InvitationToken = rawToken,
            ExpiresAtUtc = invitation.ExpiresAtUtc
        };
    }

    public async Task<ExternalVideoConsultationContextDto> GetExternalContextAsync(
        string invitationToken,
        CancellationToken cancellationToken)
    {
        var invitation = await ResolveInvitationAsync(invitationToken, cancellationToken);
        var consultation = invitation.VideoConsultation;
        var appointment = consultation.Appointment;
        EnsureExternalJoinAllowed(invitation, appointment, consultation);

        return new ExternalVideoConsultationContextDto
        {
            ClientName = appointment.Participant?.PreferredName ?? appointment.Participant?.DisplayName ?? "Client",
            PractitionerName = appointment.CounsellorDisplayName,
            StartsAtUtc = appointment.StartsAtUtc,
            EndsAtUtc = appointment.EndsAtUtc,
            Status = consultation.Status.ToString()
        };
    }

    public async Task<LiveKitJoinCredentialDto> CreateExternalCredentialAsync(
        string invitationToken,
        string displayName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(displayName) || displayName.Trim().Length > 100)
        {
            throw new ArgumentException("A valid display name is required.");
        }

        var invitation = await ResolveInvitationAsync(invitationToken, cancellationToken);
        var consultation = invitation.VideoConsultation;
        EnsureExternalJoinAllowed(invitation, consultation.Appointment, consultation);
        OpenConsultation(consultation);
        invitation.UsedAtUtc ??= DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        var identity = $"client-{consultation.Id:N}-{RandomSuffix()}";
        var credential = CreateCredential(consultation.RoomName, identity);
        await WriteAuditAsync(consultation, "JoinCredentialIssued", "client", cancellationToken);
        return credential;
    }

    public async Task EndAsync(Guid appointmentId, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var appointment = await GetOwnedAppointmentAsync(appointmentId, user, cancellationToken);
        var consultation = appointment.VideoConsultation;
        if (consultation is null || consultation.Status == VideoConsultationStatus.Ended)
        {
            return;
        }

        consultation.Status = VideoConsultationStatus.Ended;
        consultation.EndedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(consultation, "Ended", null, cancellationToken);
    }

    private async Task<AmbulatoryAppointment> GetOwnedAppointmentAsync(
        Guid appointmentId,
        ClaimsPrincipal user,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        var appointment = await _db.Appointments
            .Include(x => x.Participant)
            .Include(x => x.VideoConsultation)
            .SingleOrDefaultAsync(x => x.Id == appointmentId && x.ProgrammeType == AmbulatoryProgrammeType.Practitioner, cancellationToken)
            ?? throw new KeyNotFoundException("Appointment not found.");

        if (!string.Equals(appointment.CounsellorUserId, userId, StringComparison.Ordinal))
        {
            throw new UnauthorizedAccessException("You are not assigned to this appointment.");
        }

        return appointment;
    }

    private async Task<VideoConsultation> GetOrCreateConsultationAsync(
        AmbulatoryAppointment appointment,
        CancellationToken cancellationToken)
    {
        if (appointment.VideoConsultation is not null)
        {
            return appointment.VideoConsultation;
        }

        var consultation = new VideoConsultation
        {
            Id = Guid.NewGuid(),
            AppointmentId = appointment.Id,
            RoomName = $"vc-{Guid.NewGuid():N}",
            Status = VideoConsultationStatus.Scheduled,
            CreatedAtUtc = DateTime.UtcNow
        };
        _db.VideoConsultations.Add(consultation);
        appointment.VideoConsultation = consultation;
        appointment.AvProvider = "livekit";
        appointment.AvRoomName = null;
        appointment.AvJoinUrl = null;
        await _db.SaveChangesAsync(cancellationToken);
        await WriteAuditAsync(consultation, "Opened", null, cancellationToken);
        return consultation;
    }

    private async Task<VideoConsultationInvitation> ResolveInvitationAsync(
        string invitationToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(invitationToken))
        {
            throw new KeyNotFoundException("Invitation not found.");
        }

        byte[] raw;
        try
        {
            raw = WebEncoders.Base64UrlDecode(invitationToken.Trim());
        }
        catch (FormatException)
        {
            throw new KeyNotFoundException("Invitation not found.");
        }

        var expectedHash = SHA256.HashData(raw);
        var candidates = await _db.VideoConsultationInvitations
            .Include(x => x.VideoConsultation)
                .ThenInclude(x => x.Appointment)
                    .ThenInclude(x => x.Participant)
            .Where(x => x.ExpiresAtUtc > DateTime.UtcNow.AddDays(-1))
            .ToListAsync(cancellationToken);

        return candidates.FirstOrDefault(x =>
                   x.TokenHash.Length == expectedHash.Length &&
                   CryptographicOperations.FixedTimeEquals(x.TokenHash, expectedHash))
               ?? throw new KeyNotFoundException("Invitation not found.");
    }

    private void EnsureJoinAllowed(AmbulatoryAppointment appointment)
    {
        var reason = GetJoinBlockedReason(appointment, DateTime.UtcNow);
        if (reason is not null)
        {
            throw new InvalidOperationException(reason);
        }
    }

    private string? GetJoinBlockedReason(AmbulatoryAppointment appointment, DateTime now)
    {
        EnsureAppointmentIsVideoOneToOne(appointment);
        var consultation = appointment.VideoConsultation;
        if (consultation?.Status == VideoConsultationStatus.Cancelled || appointment.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase))
            return "This consultation has been cancelled.";
        if (consultation?.Status == VideoConsultationStatus.Ended || appointment.Status.Equals("ended", StringComparison.OrdinalIgnoreCase))
            return "This consultation has ended.";
        if (now < appointment.StartsAtUtc.AddMinutes(-Math.Max(0, _options.JoinWindowMinutesBefore)))
            return "The consultation is not open yet.";
        if (now > appointment.EndsAtUtc.AddMinutes(Math.Max(0, _options.JoinWindowMinutesAfter)))
            return "The consultation join window has closed.";
        return null;
    }

    private static void EnsureAppointmentIsVideoOneToOne(AmbulatoryAppointment appointment)
    {
        if (!appointment.DeliveryMode.Equals("video", StringComparison.OrdinalIgnoreCase) ||
            appointment.AppointmentType.Equals("group-meeting", StringComparison.OrdinalIgnoreCase) ||
            appointment.ParticipantId is null)
        {
            throw new InvalidOperationException("This appointment is not an eligible one-to-one video consultation.");
        }
    }

    private static void EnsureExternalJoinAllowed(
        VideoConsultationInvitation invitation,
        AmbulatoryAppointment appointment,
        VideoConsultation consultation)
    {
        var now = DateTime.UtcNow;
        if (invitation.RevokedAtUtc is not null) throw new InvalidOperationException("This invitation has been revoked.");
        if (invitation.ExpiresAtUtc <= now) throw new InvalidOperationException("This invitation has expired.");
        if (consultation.Status == VideoConsultationStatus.Cancelled || appointment.Status.Equals("cancelled", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("This consultation has been cancelled.");
        if (consultation.Status == VideoConsultationStatus.Ended || appointment.Status.Equals("ended", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("This consultation has ended.");
    }

    private LiveKitJoinCredentialDto CreateCredential(string roomName, string identity) => new()
    {
        ServerUrl = _options.Url,
        ParticipantToken = _tokens.CreateParticipantToken(roomName, identity)
    };

    private static void OpenConsultation(VideoConsultation consultation)
    {
        if (consultation.Status == VideoConsultationStatus.Scheduled)
        {
            consultation.Status = VideoConsultationStatus.Open;
            consultation.StartedAtUtc = DateTime.UtcNow;
        }
    }

    private Task WriteAuditAsync(VideoConsultation consultation, string action, string? role, CancellationToken cancellationToken) =>
        _audit.WriteAsync(null, null, "VideoConsultation", consultation.Id.ToString("N"), action, null,
            role is null ? null : new { participantRole = role }, null, cancellationToken);

    private static string RandomSuffix() => WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(9));

    private static string GetUserId(ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? user.FindFirstValue("sub")
        ?? user.FindFirstValue(ClaimTypes.Email)
        ?? user.Identity?.Name
        ?? throw new UnauthorizedAccessException("Authenticated user identity is missing.");
}
