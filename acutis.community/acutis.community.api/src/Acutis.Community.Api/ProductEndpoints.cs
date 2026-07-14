using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace Acutis.Community.Api;

public static class ProductEndpoints
{
    public static void MapCommunityProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tenants/{tenantId:guid}");
        group.MapGet("/dashboard", Dashboard);
        group.MapGet("/service-users/{participantId:guid}", Details);
        group.MapPost("/service-users", Create);
        group.MapPost("/service-users/{participantId:guid}/assessments", Assessment);
        group.MapPut("/service-users/{participantId:guid}/care-plan", CarePlan);
        group.MapPost("/appointments", Appointment);
        group.MapPatch("/appointments/{appointmentId:guid}", UpdateAppointment);
        group.MapPost("/appointments/{appointmentId:guid}/consultation/credentials", ConsultationCredential);
        group.MapPost("/appointments/{appointmentId:guid}/consultation/invitation", CreateInvitation);
        group.MapPut("/appointments/{appointmentId:guid}/consultation/capture", SaveConsultationCapture);
        app.MapPost("/api/consultations/guest-credentials", GuestCredential).AllowAnonymous();
    }

    private static async Task<IResult> Dashboard(Guid tenantId, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid();
        var people = await db.Participants.AsNoTracking().Where(x => x.TenantId == tenantId).OrderBy(x => x.DisplayName).ToListAsync(ct); var ids = people.Select(x => x.Id).ToArray();
        var membership = await db.Memberships.AsNoTracking().SingleAsync(x => x.TenantId == tenantId && x.ExternalSubject == subject && x.IsActive, ct);
        var staff = await db.Memberships.AsNoTracking().Where(x => x.TenantId == tenantId && x.IsActive).Select(x => new { subject = x.ExternalSubject, roles = x.RolesJson }).ToListAsync(ct);
        var programmes = new[] { new { code = "CBT", name = "Community CBT Skills", cadence = "Weekly", sessions = 8, modules = new[] { "Goals", "Thought patterns", "Behavioural activation", "Problem solving", "Coping", "Staying well" } }, new { code = "DBT", name = "Community DBT Skills", cadence = "Weekly", sessions = 16, modules = new[] { "Mindfulness", "Distress tolerance", "Emotion regulation", "Interpersonal effectiveness" } }, new { code = "GAM", name = "Community Gambling Recovery", cadence = "Weekly", sessions = 10, modules = new[] { "Engagement and motivation", "Gambling harms", "Triggers and urges", "Thinking patterns", "Financial safeguards", "Community supports", "Affected others", "Relapse prevention" } } };
        return Results.Ok(new { serviceUsers = people, assessments = await db.Assessments.AsNoTracking().Where(x => x.TenantId == tenantId && ids.Contains(x.ParticipantId)).OrderByDescending(x => x.CompletedAtUtc).ToListAsync(ct), carePlans = await db.CarePlans.AsNoTracking().Where(x => x.TenantId == tenantId && ids.Contains(x.ParticipantId)).OrderByDescending(x => x.UpdatedAtUtc).ToListAsync(ct), appointments = await db.Appointments.AsNoTracking().Where(x => x.TenantId == tenantId).Include(x => x.Participant).OrderBy(x => x.StartsAtUtc).ToListAsync(ct), staff, programmes, currentRoles = membership.RolesJson });
    }

    private static async Task<IResult> Details(Guid tenantId, Guid participantId, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid(); var person = await db.Participants.AsNoTracking().SingleOrDefaultAsync(x => x.Id == participantId && x.TenantId == tenantId, ct); if (person is null) return Results.NotFound();
        return Results.Ok(new { serviceUser = person, assessments = await db.Assessments.AsNoTracking().Where(x => x.TenantId == tenantId && x.ParticipantId == participantId).ToListAsync(ct), carePlans = await db.CarePlans.AsNoTracking().Where(x => x.TenantId == tenantId && x.ParticipantId == participantId).ToListAsync(ct), appointments = await db.Appointments.AsNoTracking().Where(x => x.TenantId == tenantId && x.ParticipantId == participantId).ToListAsync(ct) });
    }

    private static async Task<IResult> Create(Guid tenantId, CommunityPersonRequest request, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid(); if (string.IsNullOrWhiteSpace(request.DisplayName)) return Results.BadRequest("Service user name is required."); var now = DateTime.UtcNow;
        var item = new CommunityParticipant { Id = Guid.NewGuid(), TenantId = tenantId, DisplayName = request.DisplayName.Trim(), PreferredName = request.PreferredName?.Trim(), Phone = request.Phone?.Trim(), Email = request.Email?.Trim(), ReferralSource = request.ReferralSource?.Trim(), StaffSubject = subject, StaffDisplayName = DisplayName(user), CreatedAtUtc = now, UpdatedAtUtc = now }; db.Participants.Add(item); Audit(db, tenantId, subject, "Create", nameof(CommunityParticipant), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> Assessment(Guid tenantId, Guid participantId, CommunityCaptureRequest request, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Access(db, tenantId, participantId, subject, ct)) return Results.Forbid(); var item = new CommunityAssessment { Id = Guid.NewGuid(), TenantId = tenantId, ParticipantId = participantId, AssessmentType = request.Type, CaptureJson = request.CaptureJson, CompletedAtUtc = DateTime.UtcNow, CompletedBySubject = subject }; db.Assessments.Add(item); Audit(db, tenantId, subject, "Create", nameof(CommunityAssessment), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> CarePlan(Guid tenantId, Guid participantId, CommunityCarePlanRequest request, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Access(db, tenantId, participantId, subject, ct)) return Results.Forbid(); var now = DateTime.UtcNow; var item = await db.CarePlans.OrderByDescending(x => x.UpdatedAtUtc).FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ParticipantId == participantId, ct); if (item is null) { item = new CommunityCarePlan { Id = Guid.NewGuid(), TenantId = tenantId, ParticipantId = participantId, CreatedAtUtc = now }; db.CarePlans.Add(item); } item.Status = request.Status; item.CaptureJson = request.CaptureJson; item.ReviewDate = request.ReviewDate; item.UpdatedAtUtc = now; Audit(db, tenantId, subject, "Update", nameof(CommunityCarePlan), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> Appointment(Guid tenantId, CommunityAppointmentRequest request, ClaimsPrincipal user, CommunityDbContext db, CommunityLiveKitTokenService tokens, IConfiguration configuration, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct) || request.ParticipantId is Guid id && !await Access(db, tenantId, id, subject, ct)) return Results.Forbid(); var now = DateTime.UtcNow; var item = new CommunityAppointment { Id = Guid.NewGuid(), TenantId = tenantId, ParticipantId = request.ParticipantId, StaffSubject = subject, StaffDisplayName = DisplayName(user), AppointmentType = request.AppointmentType, Title = request.Title, StartsAtUtc = request.StartsAtUtc, EndsAtUtc = request.EndsAtUtc, DeliveryMode = request.DeliveryMode, Status = request.Status, Notes = request.Notes, CreatedAtUtc = now, UpdatedAtUtc = now }; db.Appointments.Add(item); Audit(db, tenantId, subject, "Create", nameof(CommunityAppointment), item.Id);
        string? joinUrl = null; DateTime? invitationExpiresAtUtc = null;
        if (request.DeliveryMode == "video") { var guestName = request.ParticipantId is Guid participantId ? await db.Participants.Where(x => x.Id == participantId && x.TenantId == tenantId).Select(x => x.PreferredName ?? x.DisplayName).SingleAsync(ct) : "Guest"; var room = $"community_{item.Id:N}"; var expires = request.EndsAtUtc.AddHours(2) > now.AddMinutes(30) ? request.EndsAtUtc.AddHours(2) : now.AddHours(2); var invitationToken = tokens.CreateInvitation(tenantId, item.Id, room, guestName, expires); joinUrl = $"{(configuration["WebOrigin"] ?? "http://localhost:3020").TrimEnd('/')}/join?token={Uri.EscapeDataString(invitationToken)}"; invitationExpiresAtUtc = expires; }
        await db.SaveChangesAsync(ct); return Results.Ok(new { appointment = item, joinUrl, invitationExpiresAtUtc });
    }

    private static async Task<IResult> UpdateAppointment(Guid tenantId, Guid appointmentId, CommunityAppointmentRequest request, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid(); var item = await db.Appointments.SingleOrDefaultAsync(x => x.Id == appointmentId && x.TenantId == tenantId, ct); if (item is null) return Results.NotFound(); item.ParticipantId = request.ParticipantId; item.AppointmentType = request.AppointmentType; item.Title = request.Title; item.StartsAtUtc = request.StartsAtUtc; item.EndsAtUtc = request.EndsAtUtc; item.DeliveryMode = request.DeliveryMode; item.Status = request.Status; item.Notes = request.Notes; item.UpdatedAtUtc = DateTime.UtcNow; Audit(db, tenantId, subject, "Update", nameof(CommunityAppointment), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> ConsultationCredential(Guid tenantId, Guid appointmentId, ClaimsPrincipal user, CommunityDbContext db, CommunityLiveKitTokenService tokens, IOptions<CommunityLiveKitOptions> options, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid(); var appointment = await db.Appointments.SingleOrDefaultAsync(x => x.Id == appointmentId && x.TenantId == tenantId, ct); if (appointment is null) return Results.NotFound(); if (appointment.DeliveryMode != "video") return Results.Conflict("This is not a video appointment."); Audit(db, tenantId, subject, "ParticipantJoined", nameof(CommunityAppointment), appointment.Id); await db.SaveChangesAsync(ct); var room = $"community_{appointment.Id:N}"; return Results.Ok(new { serverUrl = options.Value.Url, roomIdentifier = room, participantIdentifier = $"community_{Guid.NewGuid():N}", accessToken = tokens.Create(room) });
    }

    private static async Task<IResult> CreateInvitation(Guid tenantId, Guid appointmentId, CommunityGuestInvitationRequest request, ClaimsPrincipal user, CommunityDbContext db, CommunityLiveKitTokenService tokens, IConfiguration configuration, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid(); var appointment = await db.Appointments.Include(x => x.Participant).SingleOrDefaultAsync(x => x.Id == appointmentId && x.TenantId == tenantId, ct); if (appointment is null) return Results.NotFound(); if (appointment.DeliveryMode != "video") return Results.Conflict("This is not a video appointment.");
        var guestName = string.IsNullOrWhiteSpace(request.GuestName) ? appointment.Participant?.PreferredName ?? appointment.Participant?.DisplayName ?? "Guest" : request.GuestName.Trim(); var room = $"community_{appointment.Id:N}"; var expires = appointment.EndsAtUtc.AddHours(2) > DateTime.UtcNow.AddMinutes(30) ? appointment.EndsAtUtc.AddHours(2) : DateTime.UtcNow.AddHours(2);
        var invitationToken = tokens.CreateInvitation(tenantId, appointmentId, room, guestName, expires); Audit(db, tenantId, subject, "InvitationCreated", nameof(CommunityAppointment), appointment.Id); await db.SaveChangesAsync(ct); var origin = configuration["WebOrigin"] ?? "http://localhost:3020";
        return Results.Ok(new { joinUrl = $"{origin.TrimEnd('/')}/join?token={Uri.EscapeDataString(invitationToken)}", expiresAtUtc = expires, guestName });
    }

    private static async Task<IResult> GuestCredential(CommunityGuestCredentialRequest request, CommunityDbContext db, CommunityLiveKitTokenService tokens, IOptions<CommunityLiveKitOptions> options, CancellationToken ct)
    {
        var invitation = tokens.ReadInvitation(request.InvitationToken); if (invitation is null || !await db.Appointments.AnyAsync(x => x.Id == invitation.AppointmentId && x.TenantId == invitation.TenantId && x.DeliveryMode == "video", ct)) return Results.Unauthorized();
        return Results.Ok(new { serverUrl = options.Value.Url, roomIdentifier = invitation.Room, participantIdentifier = $"guest_{Guid.NewGuid():N}", participantName = invitation.GuestName, accessToken = tokens.Create(invitation.Room, invitation.GuestName, "guest") });
    }

    private static async Task<IResult> SaveConsultationCapture(Guid tenantId, Guid appointmentId, CommunityConsultationCaptureRequest request, ClaimsPrincipal user, CommunityDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid(); var appointment = await db.Appointments.SingleOrDefaultAsync(x => x.Id == appointmentId && x.TenantId == tenantId, ct); if (appointment is null) return Results.NotFound(); appointment.Notes = JsonSerializer.Serialize(new { notes = request.Notes?.Trim(), observations = request.Observations?.Trim(), capturedAtUtc = DateTime.UtcNow, capturedBy = subject }); appointment.UpdatedAtUtc = DateTime.UtcNow; Audit(db, tenantId, subject, "ConsultationCaptureSaved", nameof(CommunityAppointment), appointment.Id); await db.SaveChangesAsync(ct); return Results.Ok(new { appointment.Notes, appointment.UpdatedAtUtc });
    }

    private static async Task<bool> Access(CommunityDbContext db, Guid tenantId, Guid id, string subject, CancellationToken ct) => await Member(db, tenantId, subject, ct) && await db.Participants.AnyAsync(x => x.Id == id && x.TenantId == tenantId, ct);
    private static Task<bool> Member(CommunityDbContext db, Guid tenantId, string subject, CancellationToken ct) => db.Memberships.AnyAsync(x => x.TenantId == tenantId && x.ExternalSubject == subject && x.IsActive && (x.RolesJson.Contains("CommunityManager") || x.RolesJson.Contains("CommunityStaff")), ct);
    private static string Subject(ClaimsPrincipal user) => user.FindFirstValue("acutis_subject") ?? user.FindFirstValue("preferred_username") ?? user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private static string DisplayName(ClaimsPrincipal user) => user.FindFirstValue("name") ?? user.Identity?.Name ?? "Community staff";
    private static void Audit(CommunityDbContext db, Guid tenant, string subject, string action, string type, Guid id) => db.AuditEvents.Add(new CommunityAuditEvent { Id = Guid.NewGuid(), TenantId = tenant, ExternalSubject = subject, Action = action, EntityType = type, EntityId = id.ToString(), OccurredAtUtc = DateTime.UtcNow });
}

public sealed record CommunityPersonRequest(string DisplayName, string? PreferredName, string? Phone, string? Email, string? ReferralSource);
public sealed record CommunityCaptureRequest(string Type, string CaptureJson);
public sealed record CommunityCarePlanRequest(string Status, string CaptureJson, DateOnly? ReviewDate);
public sealed record CommunityAppointmentRequest(Guid? ParticipantId, string AppointmentType, string Title, DateTime StartsAtUtc, DateTime EndsAtUtc, string DeliveryMode, string Status, string? Notes);
public sealed record CommunityGuestInvitationRequest(string? GuestName);
public sealed record CommunityGuestCredentialRequest(string InvitationToken);
public sealed record CommunityConsultationCaptureRequest(string? Notes, string? Observations);
public sealed class CommunityLiveKitOptions { public string Url { get; set; } = "wss://vc.salientrecovery.com"; public string ApiKey { get; set; } = ""; public string ApiSecret { get; set; } = ""; }
public sealed record CommunityGuestInvitation(Guid TenantId, Guid AppointmentId, string Room, string GuestName);
public sealed class CommunityLiveKitTokenService(IOptions<CommunityLiveKitOptions> options, TimeProvider clock)
{
    public string Create(string room, string name="Community participant", string prefix="community") { var o=options.Value;Ensure(o);var now=clock.GetUtcNow();var grant=JsonSerializer.Serialize(new{roomJoin=true,room,canPublish=true,canSubscribe=true,canPublishData=false,canPublishSources=new[]{"camera","microphone"},roomAdmin=false,roomRecord=false});var claims=new[]{new Claim(JwtRegisteredClaimNames.Sub,$"{prefix}_{Guid.NewGuid():N}"),new Claim("name",name),new Claim("video",grant,JsonClaimValueTypes.Json)};return Write(o.ApiKey,o.ApiSecret,claims,now.AddMinutes(30).UtcDateTime); }
    public string CreateInvitation(Guid tenantId,Guid appointmentId,string room,string guestName,DateTime expires){var o=options.Value;Ensure(o);return Write("acutis-consultation",o.ApiSecret,new[]{new Claim("kind","acutis-video-invitation"),new Claim("tenant",tenantId.ToString()),new Claim("appointment",appointmentId.ToString()),new Claim("room",room),new Claim("guest_name",guestName)},expires);}
    public CommunityGuestInvitation? ReadInvitation(string value){try{var o=options.Value;Ensure(o);var principal=new JwtSecurityTokenHandler().ValidateToken(value,new TokenValidationParameters{ValidateIssuer=true,ValidIssuer="acutis-consultation",ValidateAudience=false,ValidateLifetime=true,IssuerSigningKey=new SymmetricSecurityKey(Encoding.UTF8.GetBytes(o.ApiSecret)),ValidateIssuerSigningKey=true,ClockSkew=TimeSpan.FromMinutes(1)},out _);if(principal.FindFirstValue("kind")!="acutis-video-invitation")return null;return new CommunityGuestInvitation(Guid.Parse(principal.FindFirstValue("tenant")!),Guid.Parse(principal.FindFirstValue("appointment")!),principal.FindFirstValue("room")!,principal.FindFirstValue("guest_name")??"Guest");}catch{return null;}}
    private string Write(string issuer,string secret,Claim[] claims,DateTime expires){var now=clock.GetUtcNow();return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(issuer,claims:claims,notBefore:now.AddSeconds(-30).UtcDateTime,expires:expires,signingCredentials:new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),SecurityAlgorithms.HmacSha256)));}
    private static void Ensure(CommunityLiveKitOptions o){if(string.IsNullOrWhiteSpace(o.ApiKey)||string.IsNullOrWhiteSpace(o.ApiSecret))throw new InvalidOperationException("LiveKit credentials are not configured.");}
}
