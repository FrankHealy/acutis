using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Acutis.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Acutis.Practitioner.Api;

public sealed class VideoMeetingOptions
{
    public int JoinBeforeMinutes { get; set; } = 15;
    public int JoinAfterMinutes { get; set; } = 30;
    public int InvitationExpiryAfterMinutes { get; set; } = 120;
    public int LiveKitTokenLifetimeMinutes { get; set; } = 10;
    public int MaximumIdentityAttempts { get; set; } = 5;
    public int IdentityLockoutMinutes { get; set; } = 15;
    public string TimeZone { get; set; } = "Europe/London";
    public string PublicUrl { get; set; } = "http://localhost:3010";
}

public sealed record CreateVideoInvitationRequest(string? RecipientEmail, string? Locale);
public sealed record VerifyVideoInvitationRequest(string Token, string Surname, DateOnly DateOfBirth);
public sealed record VideoMeetingTokenRequest(string VerificationToken);
public sealed record EmailTestRequest(string Destination);

public static class VideoInvitationEndpoints
{
    public static void MapVideoInvitationEndpoints(this WebApplication app)
    {
        var secured = app.MapGroup("/api/tenants/{organisationId:guid}");
        secured.MapPost("/appointments/{appointmentId:guid}/video-invitations", Create);
        secured.MapPost("/video-invitations/{invitationId:guid}/resend", Resend);
        secured.MapPost("/video-invitations/{invitationId:guid}/revoke", Revoke);
        app.MapGet("/api/video-invitations/resolve", Resolve).AllowAnonymous().RequireRateLimiting("video-recipient");
        app.MapPost("/api/video-invitations/verify", Verify).AllowAnonymous().RequireRateLimiting("video-recipient");
        app.MapPost("/api/video-invitations/livekit-token", LiveKitToken).AllowAnonymous().RequireRateLimiting("video-recipient");
        app.MapPost("/api/admin/email/test", TestEmail);
        app.MapGet("/api/admin/email/health", EmailHealth);
    }

    private static async Task<IResult> Create(Guid organisationId, Guid appointmentId, CreateVideoInvitationRequest request, ClaimsPrincipal user, PractitionerDbContext db, IEmailSender sender, IOptions<VideoMeetingOptions> meetingOptions, IOptions<EmailOptions> emailOptions, CancellationToken ct)
    {
        var subject = Subject(user);
        var appointment = await AuthorisedAppointment(db, organisationId, appointmentId, subject, ct);
        var invalid = ValidateAppointment(appointment, meetingOptions.Value, now: DateTime.UtcNow);
        if (invalid is not null) return invalid;
        var recipient = string.IsNullOrWhiteSpace(request.RecipientEmail) ? appointment!.Client!.Email : request.RecipientEmail.Trim();
        if (!MailboxAddress.TryParse(recipient, out _)) return Results.BadRequest(new { message = "A valid recipient email address is required." });

        var now = DateTime.UtcNow;
        var consultation = await EnsureConsultation(db, appointment!, now, ct);
        var rawToken = InvitationTokens.Create();
        var invitation = NewInvitation(organisationId, appointment!, consultation, recipient!, rawToken, subject, meetingOptions.Value, now);
        var existing = await db.VideoInvitations.Where(x => x.OrganisationId == organisationId && x.AppointmentId == appointmentId && x.RevokedAtUtc == null).ToListAsync(ct);
        foreach (var prior in existing) { prior.RevokedAtUtc = now; prior.RevokedByUserId = subject; prior.ReplacedByInvitationId = invitation.Id; prior.VerificationTokenHash = null; prior.VerificationExpiresAtUtc = null; }
        db.VideoInvitations.Add(invitation);
        Audit(db, organisationId, subject, "VideoInvitationCreated", invitation.Id);
        await db.SaveChangesAsync(ct); // Persist the invitation and hash before any external delivery.
        await Deliver(invitation, rawToken, appointment!, request.Locale, sender, meetingOptions.Value, emailOptions.Value, db, ct);
        return Results.Ok(ToStaffResult(invitation));
    }

    private static async Task<IResult> Resend(Guid organisationId, Guid invitationId, CreateVideoInvitationRequest request, ClaimsPrincipal user, PractitionerDbContext db, IEmailSender sender, IOptions<VideoMeetingOptions> meetingOptions, IOptions<EmailOptions> emailOptions, CancellationToken ct)
    {
        var subject = Subject(user);
        var previous = await db.VideoInvitations.Include(x => x.Appointment).ThenInclude(x => x.Client).SingleOrDefaultAsync(x => x.Id == invitationId && x.OrganisationId == organisationId, ct);
        if (previous is null || await AuthorisedAppointment(db, organisationId, previous.AppointmentId, subject, ct) is null) return Results.Forbid();
        var invalid = ValidateAppointment(previous.Appointment, meetingOptions.Value, now: DateTime.UtcNow);
        if (invalid is not null) return invalid;
        var recipient = string.IsNullOrWhiteSpace(request.RecipientEmail) ? previous.RecipientEmail : request.RecipientEmail.Trim();
        if (!MailboxAddress.TryParse(recipient, out _)) return Results.BadRequest(new { message = "A valid recipient email address is required." });

        var now = DateTime.UtcNow;
        var consultation = await EnsureConsultation(db, previous.Appointment, now, ct);
        var rawToken = InvitationTokens.Create();
        var replacement = NewInvitation(organisationId, previous.Appointment, consultation, recipient!, rawToken, subject, meetingOptions.Value, now);
        previous.RevokedAtUtc ??= now;
        previous.RevokedByUserId ??= subject;
        previous.ReplacedByInvitationId = replacement.Id;
        previous.VerificationTokenHash = null;
        previous.VerificationExpiresAtUtc = null;
        db.VideoInvitations.Add(replacement);
        Audit(db, organisationId, subject, "VideoInvitationReplaced", previous.Id, new { replacementInvitationId = replacement.Id });
        await db.SaveChangesAsync(ct);
        await Deliver(replacement, rawToken, previous.Appointment, request.Locale, sender, meetingOptions.Value, emailOptions.Value, db, ct);
        return Results.Ok(ToStaffResult(replacement));
    }

    private static async Task<IResult> Revoke(Guid organisationId, Guid invitationId, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user);
        var invitation = await db.VideoInvitations.SingleOrDefaultAsync(x => x.Id == invitationId && x.OrganisationId == organisationId, ct);
        if (invitation is null || await AuthorisedAppointment(db, organisationId, invitation.AppointmentId, subject, ct) is null) return Results.Forbid();
        invitation.RevokedAtUtc ??= DateTime.UtcNow;
        invitation.RevokedByUserId ??= subject;
        invitation.VerificationTokenHash = null;
        invitation.VerificationExpiresAtUtc = null;
        Audit(db, organisationId, subject, "VideoInvitationRevoked", invitation.Id);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> Resolve(string token, PractitionerDbContext db, IOptions<VideoMeetingOptions> configured, IOptions<EmailOptions> email, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var invitation = await FindByRawToken(db, token, now, ct);
        if (invitation is null) return Opaque("unavailable", email.Value.SupportAddress);
        invitation.FirstOpenedAtUtc ??= now;
        invitation.LastOpenedAtUtc = now;
        Audit(db, invitation.OrganisationId, "recipient", "VideoInvitationOpened", invitation.Id);
        await db.SaveChangesAsync(ct);
        var state = State(invitation, now, configured.Value);
        if (state is "revoked" or "expired" or "cancelled") return Opaque("unavailable", email.Value.SupportAddress);
        return Results.Ok(new { status = state, practitionerName = invitation.Appointment.PractitionerDisplayName, appointmentDateTimeUtc = invitation.Appointment.StartsAtUtc, timeZone = configured.Value.TimeZone, supportAddress = email.Value.SupportAddress });
    }

    private static async Task<IResult> Verify(VerifyVideoInvitationRequest request, HttpContext context, PractitionerDbContext db, IOptions<VideoMeetingOptions> configured, IOptions<EmailOptions> email, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var invitation = await FindByRawToken(db, request.Token, now, ct);
        if (invitation is null) return GenericVerificationFailure(email.Value.SupportAddress);
        var options = configured.Value;
        if (State(invitation, now, options) != "ready" || invitation.IdentityLockedUntilUtc > now) return GenericVerificationFailure(email.Value.SupportAddress);
        var sourceKey = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(context.Connection.RemoteIpAddress?.ToString() ?? "unknown")));
        var submittedSurnameHash = SHA256.HashData(Encoding.UTF8.GetBytes(Normalise(request.Surname)));
        var expectedSurnameHash = SHA256.HashData(Encoding.UTF8.GetBytes(Normalise(invitation.Client.Surname)));
        var surnameMatches = CryptographicOperations.FixedTimeEquals(submittedSurnameHash, expectedSurnameHash);
        var verified = surnameMatches && invitation.Client.DateOfBirth == request.DateOfBirth;
        if (!verified)
        {
            invitation.FailedIdentityAttemptCount++;
            if (invitation.FailedIdentityAttemptCount >= Math.Max(1, options.MaximumIdentityAttempts)) invitation.IdentityLockedUntilUtc = now.AddMinutes(Math.Max(1, options.IdentityLockoutMinutes));
            Audit(db, invitation.OrganisationId, "recipient", "VideoInvitationIdentityFailed", invitation.Id, new { source = sourceKey[..16], locked = invitation.IdentityLockedUntilUtc > now });
            await db.SaveChangesAsync(ct);
            return GenericVerificationFailure(email.Value.SupportAddress);
        }

        var verificationToken = InvitationTokens.Create();
        invitation.IdentityVerifiedAtUtc = now;
        invitation.FailedIdentityAttemptCount = 0;
        invitation.IdentityLockedUntilUtc = null;
        invitation.VerificationTokenHash = InvitationTokens.Hash(verificationToken);
        invitation.VerificationExpiresAtUtc = now.AddMinutes(Math.Clamp(options.LiveKitTokenLifetimeMinutes, 1, 30));
        Audit(db, invitation.OrganisationId, "recipient", "VideoInvitationIdentityVerified", invitation.Id);
        await db.SaveChangesAsync(ct);
        return Results.Ok(new { verificationToken, expiresAtUtc = invitation.VerificationExpiresAtUtc });
    }

    private static async Task<IResult> LiveKitToken(VideoMeetingTokenRequest request, PractitionerDbContext db, LiveKitTokenService liveKit, IOptions<LiveKitOptions> liveKitOptions, IOptions<VideoMeetingOptions> configured, IOptions<EmailOptions> email, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var hash = InvitationTokens.Hash(request.VerificationToken);
        var candidates = await db.VideoInvitations.Include(x => x.Appointment).Include(x => x.Client).Where(x => x.VerificationExpiresAtUtc > now && x.RevokedAtUtc == null).ToListAsync(ct);
        var invitation = candidates.FirstOrDefault(x => x.VerificationTokenHash is { Length: 32 } stored && CryptographicOperations.FixedTimeEquals(hash, stored));
        if (invitation is null || State(invitation, now, configured.Value) != "ready" || invitation.IdentityVerifiedAtUtc is null) return GenericVerificationFailure(email.Value.SupportAddress);
        var consultation = await db.VideoConsultations.SingleOrDefaultAsync(x => x.Id == invitation.VideoConsultationId && x.TenantId == invitation.OrganisationId, ct);
        if (consultation is null || consultation.Status is VideoConsultationStatus.Cancelled or VideoConsultationStatus.Ended) return GenericVerificationFailure(email.Value.SupportAddress);
        invitation.VerificationTokenHash = null; // A verification ticket is single use; the LiveKit token is independently short-lived.
        invitation.VerificationExpiresAtUtc = null;
        Audit(db, invitation.OrganisationId, "recipient", "VideoParticipantTokenIssued", invitation.Id);
        await db.SaveChangesAsync(ct);
        var opaqueIdentity = $"guest_{Guid.NewGuid():N}";
        return Results.Ok(new { serverUrl = liveKitOptions.Value.Url, roomIdentifier = consultation.RoomName, participantIdentifier = opaqueIdentity, participantName = "Guest", accessToken = liveKit.Create(consultation.RoomName, "Guest", opaqueIdentity, configured.Value.LiveKitTokenLifetimeMinutes) });
    }

    private static async Task<IResult> TestEmail(EmailTestRequest request, ClaimsPrincipal user, IWebHostEnvironment environment, PractitionerDbContext db, IEmailSender sender, CancellationToken ct)
    {
        if (!MailboxAddress.TryParse(request.Destination, out _)) return Results.BadRequest(new { message = "A valid destination is required." });
        var subject = Subject(user);
        var memberships = await db.Memberships.AsNoTracking().Where(x => x.ExternalSubject == subject && x.IsActive).Select(x => x.RolesJson).ToListAsync(ct);
        if (memberships.Count == 0 || !environment.IsDevelopment() && !memberships.Any(x => x.Contains("Administrator"))) return Results.Forbid();
        var result = await sender.SendAsync(new(request.Destination.Trim(), "Acutis Practitioner email test", "This is a harmless delivery test from Acutis Practitioner.", "<p>This is a harmless delivery test from <strong>Acutis Practitioner</strong>.</p>"), ct);
        return Results.Ok(new { result.Succeeded, failureCategory = result.FailureCategory.ToString(), result.SanitisedFailureReason, result.ProviderMessageId });
    }

    private static async Task<IResult> EmailHealth(ClaimsPrincipal user, PractitionerDbContext db, IEmailHealthProbe probe, CancellationToken ct)
    {
        var subject = Subject(user);
        if (!await db.Memberships.AnyAsync(x => x.ExternalSubject == subject && x.IsActive && x.RolesJson.Contains("Administrator"), ct)) return Results.Forbid();
        var result = await probe.CheckAsync(ct);
        return Results.Ok(new { result.Healthy, failureCategory = result.FailureCategory.ToString(), result.Status });
    }

    private static async Task Deliver(PractitionerVideoInvitation invitation, string rawToken, PractitionerAppointment appointment, string? locale, IEmailSender sender, VideoMeetingOptions meeting, EmailOptions email, PractitionerDbContext db, CancellationToken ct)
    {
        var joinUrl = $"{meeting.PublicUrl.TrimEnd('/')}/meetings/join/{Uri.EscapeDataString(rawToken)}";
        var message = VideoInvitationTemplate.Create(locale, appointment.PractitionerDisplayName, appointment.StartsAtUtc, meeting.TimeZone, joinUrl, email.SupportAddress);
        invitation.SendAttemptCount++;
        var result = await sender.SendAsync(new(invitation.RecipientEmail, message.Subject, message.Text, message.Html), ct);
        invitation.LastSentAtUtc = DateTime.UtcNow;
        invitation.SendStatus = result.Succeeded ? "Sent" : "Failed";
        invitation.SendFailureCategory = result.Succeeded ? null : result.FailureCategory.ToString();
        invitation.SanitisedSendFailureReason = result.SanitisedFailureReason;
        invitation.ProviderMessageId = result.ProviderMessageId;
        Audit(db, invitation.OrganisationId, invitation.CreatedByUserId, result.Succeeded ? "VideoInvitationSent" : "VideoInvitationSendFailed", invitation.Id, new { category = invitation.SendFailureCategory });
        await db.SaveChangesAsync(ct);
    }

    private static PractitionerVideoInvitation NewInvitation(Guid organisationId, PractitionerAppointment appointment, PractitionerVideoConsultation consultation, string recipient, string token, string subject, VideoMeetingOptions options, DateTime now) => new()
    {
        Id = Guid.NewGuid(), OrganisationId = organisationId, AppointmentId = appointment.Id, VideoConsultationId = consultation.Id, ClientId = appointment.ClientId!.Value,
        RecipientEmail = recipient, TokenHash = InvitationTokens.Hash(token), CreatedAtUtc = now, CreatedByUserId = subject,
        ExpiresAtUtc = appointment.EndsAtUtc.AddMinutes(Math.Max(1, options.InvitationExpiryAfterMinutes)), SendStatus = "Pending"
    };

    private static async Task<PractitionerVideoConsultation> EnsureConsultation(PractitionerDbContext db, PractitionerAppointment appointment, DateTime now, CancellationToken ct)
    {
        var consultation = await db.VideoConsultations.SingleOrDefaultAsync(x => x.TenantId == appointment.TenantId && x.AppointmentId == appointment.Id, ct);
        if (consultation is not null) return consultation;
        consultation = new() { Id = Guid.NewGuid(), TenantId = appointment.TenantId, AppointmentId = appointment.Id, RoomName = Guid.NewGuid().ToString("N"), Status = VideoConsultationStatus.Scheduled, CreatedAtUtc = now };
        db.VideoConsultations.Add(consultation);
        return consultation;
    }

    private static IResult? ValidateAppointment(PractitionerAppointment? appointment, VideoMeetingOptions options, DateTime now)
    {
        if (appointment is null) return Results.Forbid();
        if (!string.Equals(appointment.DeliveryMode, "video", StringComparison.OrdinalIgnoreCase)) return Results.Conflict(new { message = "Invitations are only available for video appointments." });
        if (appointment.Status.Contains("cancel", StringComparison.OrdinalIgnoreCase)) return Results.Conflict(new { message = "This appointment has been cancelled." });
        if (now > appointment.EndsAtUtc.AddMinutes(Math.Max(0, options.JoinAfterMinutes))) return Results.Conflict(new { message = "The joining window for this appointment has closed." });
        if (appointment.ClientId is null || appointment.Client is null || string.IsNullOrWhiteSpace(appointment.Client.Surname) || appointment.Client.DateOfBirth is null) return Results.Conflict(new { message = "The client must have a surname and date of birth before an invitation can be sent." });
        return null;
    }

    private static async Task<PractitionerAppointment?> AuthorisedAppointment(PractitionerDbContext db, Guid organisationId, Guid appointmentId, string subject, CancellationToken ct)
    {
        var membership = await db.Memberships.AsNoTracking().SingleOrDefaultAsync(x => x.TenantId == organisationId && x.ExternalSubject == subject && x.IsActive, ct);
        if (membership is null || !HasClinicalOrAdminRole(membership.RolesJson)) return null;
        var leadership = membership.RolesJson.Contains("Manager") || membership.RolesJson.Contains("Administrator");
        return await db.Appointments.Include(x => x.Client).SingleOrDefaultAsync(x => x.Id == appointmentId && x.TenantId == organisationId && (leadership || x.PractitionerSubject == subject), ct);
    }

    private static async Task<PractitionerVideoInvitation?> FindByRawToken(PractitionerDbContext db, string rawToken, DateTime now, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(rawToken) || rawToken.Length > 256) return null;
        var hash = InvitationTokens.Hash(rawToken);
        var candidates = await db.VideoInvitations.Include(x => x.Appointment).Include(x => x.Client).Where(x => x.ExpiresAtUtc > now.AddDays(-1)).ToListAsync(ct);
        return candidates.FirstOrDefault(x => x.TokenHash.Length == hash.Length && CryptographicOperations.FixedTimeEquals(hash, x.TokenHash));
    }

    private static string State(PractitionerVideoInvitation invitation, DateTime now, VideoMeetingOptions options)
    {
        if (invitation.RevokedAtUtc is not null || invitation.ReplacedByInvitationId is not null) return "revoked";
        if (invitation.Appointment.Status.Contains("cancel", StringComparison.OrdinalIgnoreCase)) return "cancelled";
        if (now >= invitation.ExpiresAtUtc) return "expired";
        if (now < invitation.Appointment.StartsAtUtc.AddMinutes(-Math.Max(0, options.JoinBeforeMinutes))) return "too-early";
        if (now > invitation.Appointment.EndsAtUtc.AddMinutes(Math.Max(0, options.JoinAfterMinutes))) return "closed";
        return "ready";
    }

    private static IResult Opaque(string status, string support) => Results.Ok(new { status, supportAddress = support });
    private static IResult GenericVerificationFailure(string support) => Results.Json(new { message = "We could not confirm the invitation details. Check the information or contact support.", supportAddress = support }, statusCode: StatusCodes.Status400BadRequest);
    private static object ToStaffResult(PractitionerVideoInvitation x) => new { x.Id, x.AppointmentId, x.RecipientEmail, x.ExpiresAtUtc, x.LastSentAtUtc, x.SendAttemptCount, x.SendStatus, x.SendFailureCategory, x.SanitisedSendFailureReason, x.ProviderMessageId, x.RevokedAtUtc, x.ReplacedByInvitationId };
    private static bool HasClinicalOrAdminRole(string roles) => roles.Contains("Practitioner") || roles.Contains("Councillor") || roles.Contains("Counsellor") || roles.Contains("Manager") || roles.Contains("Administrator");
    private static string Subject(ClaimsPrincipal user) => user.FindFirstValue("acutis_subject") ?? user.FindFirstValue("preferred_username") ?? user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private static string Normalise(string value) => value.Normalize(NormalizationForm.FormKC).Trim().ToUpperInvariant();
    private static void Audit(PractitionerDbContext db, Guid organisationId, string subject, string action, Guid id, object? metadata = null) => db.AuditEvents.Add(new() { Id = Guid.NewGuid(), TenantId = organisationId, ExternalSubject = subject, Action = action, EntityType = nameof(PractitionerVideoInvitation), EntityId = id.ToString(), OccurredAtUtc = DateTime.UtcNow, MetadataJson = metadata is null ? "{}" : JsonSerializer.Serialize(metadata) });
}

internal static class InvitationTokens
{
    public static string Create() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    public static byte[] Hash(string value) => SHA256.HashData(Encoding.UTF8.GetBytes(value));
}

internal sealed record InvitationEmailContent(string Subject, string Text, string Html);
internal static class VideoInvitationTemplate
{
    public static InvitationEmailContent Create(string? requestedLocale, string practitioner, DateTime startsUtc, string timeZoneId, string joinUrl, string support)
    {
        var locale = requestedLocale?.StartsWith("ar", StringComparison.OrdinalIgnoreCase) == true ? "ar" : requestedLocale?.StartsWith("ga", StringComparison.OrdinalIgnoreCase) == true ? "ga" : "en";
        var culture = CultureInfo.GetCultureInfo(locale == "ga" ? "ga-IE" : locale == "ar" ? "ar" : "en-IE");
        var zone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        var local = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(startsUtc, DateTimeKind.Utc), zone);
        var date = local.ToString("f", culture);
        var encodedPractitioner = WebUtility.HtmlEncode(practitioner);
        var encodedDate = WebUtility.HtmlEncode(date);
        var encodedZone = WebUtility.HtmlEncode(timeZoneId);
        var encodedUrl = WebUtility.HtmlEncode(joinUrl);
        var encodedSupport = WebUtility.HtmlEncode(support);
        var rtl = locale == "ar";
        var strings = locale switch
        {
            "ga" => (Subject: "Cuireadh chuig do choinne físe Acutis", Heading: "Do choinne físe", With: "Cleachtóir", When: "Dáta agus am", Join: "Oscail an coinne", Notice: "Is don fhaighteoir beartaithe amháin an cuireadh seo. Ná cuir ar aghaidh é.", Help: "Má theastaíonn cabhair uait, déan teagmháil le"),
            "ar" => (Subject: "دعوة إلى موعد الفيديو الخاص بك على Acutis", Heading: "موعد الفيديو الخاص بك", With: "الممارس", When: "التاريخ والوقت", Join: "فتح الموعد", Notice: "هذه الدعوة مخصصة للمستلم المقصود فقط. يُرجى عدم إعادة توجيهها.", Help: "للمساعدة، تواصل مع"),
            _ => (Subject: "Invitation to your Acutis video appointment", Heading: "Your video appointment", With: "Practitioner", When: "Date and time", Join: "Open appointment", Notice: "This invitation is for the intended recipient only. Please do not forward it.", Help: "For help, contact")
        };
        var text = $"{strings.Heading}\n\n{strings.With}: {practitioner}\n{strings.When}: {date} ({timeZoneId})\n\n{strings.Join}: {joinUrl}\n\n{strings.Notice}\n{strings.Help}: {support}";
        var html = $"<!doctype html><html lang=\"{locale}\" dir=\"{(rtl ? "rtl" : "ltr")}\"><body style=\"margin:0;background:#f3f7f6;font-family:Arial,sans-serif;color:#172a29\"><table role=\"presentation\" width=\"100%\"><tr><td align=\"center\" style=\"padding:32px 16px\"><table role=\"presentation\" width=\"600\" style=\"max-width:100%;background:#fff;border-radius:16px;overflow:hidden\"><tr><td style=\"background:#0e665b;color:#fff;padding:24px 30px;font-size:22px;font-weight:bold\">Acutis Practitioner</td></tr><tr><td style=\"padding:30px\"><h1 style=\"font-size:26px\">{strings.Heading}</h1><p><strong>{strings.With}:</strong> {encodedPractitioner}</p><p><strong>{strings.When}:</strong> {encodedDate} ({encodedZone})</p><p style=\"margin:28px 0\"><a href=\"{encodedUrl}\" style=\"background:#0e665b;color:#fff;text-decoration:none;padding:14px 20px;border-radius:8px;display:inline-block\">{strings.Join}</a></p><p style=\"word-break:break-all;font-size:13px\">{encodedUrl}</p><p>{strings.Notice}</p><p>{strings.Help}: <a href=\"mailto:{encodedSupport}\">{encodedSupport}</a></p></td></tr></table></td></tr></table></body></html>";
        return new(strings.Subject, text, html);
    }
}
