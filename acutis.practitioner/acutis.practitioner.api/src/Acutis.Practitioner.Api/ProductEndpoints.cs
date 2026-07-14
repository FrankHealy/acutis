using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Acutis.Practitioner.Api;

public static class ProductEndpoints
{
    public static void MapPractitionerProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tenants/{tenantId:guid}");
        group.MapGet("/dashboard", Dashboard);
        group.MapGet("/clients/{clientId:guid}", ClientDetails);
        group.MapPost("/clients", CreateClient);
        group.MapPost("/clients/{clientId:guid}/assessments", CreateAssessment);
        group.MapPut("/clients/{clientId:guid}/care-plan", SaveCarePlan);
        group.MapPost("/appointments", CreateAppointment);
        group.MapPatch("/appointments/{appointmentId:guid}", UpdateAppointment);
        group.MapGet("/appointments/{appointmentId:guid}/consultation", ConsultationContext);
        group.MapPost("/appointments/{appointmentId:guid}/consultation/credentials", ConsultationCredential);
        group.MapPut("/appointments/{appointmentId:guid}/consultation/capture", SaveConsultationCapture);
        group.MapPost("/appointments/{appointmentId:guid}/consultation/end", EndConsultation);
    }

    private static async Task<IResult> Dashboard(Guid tenantId, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid();
        var membership = await db.Memberships.AsNoTracking().SingleOrDefaultAsync(x => x.TenantId == tenantId && x.ExternalSubject == subject && x.IsActive, ct); if (membership is null) return Results.Forbid();
        var practiceWide = membership.RolesJson.Contains("Manager") || membership.RolesJson.Contains("Administrator");
        var clients = await db.Clients.AsNoTracking().Where(x => x.TenantId == tenantId && (practiceWide || x.PractitionerSubject == subject)).OrderBy(x => x.DisplayName).ToListAsync(ct);
        var ids = clients.Select(x => x.Id).ToArray();
        var assessments = await db.Assessments.AsNoTracking().Where(x => x.TenantId == tenantId && ids.Contains(x.ClientId)).OrderByDescending(x => x.CompletedAtUtc).ToListAsync(ct);
        var plans = await db.CarePlans.AsNoTracking().Where(x => x.TenantId == tenantId && ids.Contains(x.ClientId)).OrderByDescending(x => x.UpdatedAtUtc).ToListAsync(ct);
        var appointments = await db.Appointments.AsNoTracking().Where(x => x.TenantId == tenantId && (practiceWide || x.PractitionerSubject == subject)).Include(x => x.Client).OrderBy(x => x.StartsAtUtc).ToListAsync(ct);
        var staff = await db.Memberships.AsNoTracking().Where(x => x.TenantId == tenantId && x.IsActive).Select(x => new { subject = x.ExternalSubject, roles = x.RolesJson }).ToListAsync(ct);
        var programmes = new[] { new { code = "CBT", name = "CBT Skills Programme", cadence = "Weekly", sessions = 8, modules = new[] { "Assessment and goals", "Thoughts, feelings and behaviours", "Unhelpful thinking", "Behavioural activation", "Problem solving", "Coping strategies", "Relapse prevention", "Review" } }, new { code = "DBT", name = "DBT Skills Programme", cadence = "Weekly", sessions = 16, modules = new[] { "Orientation", "Mindfulness", "Distress tolerance", "Emotion regulation", "Interpersonal effectiveness", "Skills consolidation" } }, new { code = "GAM", name = "Gambling Recovery Programme", cadence = "Weekly", sessions = 10, modules = new[] { "Assessment and motivation", "Understanding gambling harms", "Triggers and urges", "Gambling-related thinking", "Money and access safeguards", "Alternative activities", "Relationships and affected others", "Problem solving", "Relapse prevention", "Recovery plan" } } };
        return Results.Ok(new { clients, assessments, carePlans = plans, appointments, staff, programmes, currentRoles = membership.RolesJson, scope = practiceWide ? "practice" : "caseload" });
    }

    private static async Task<IResult> ClientDetails(Guid tenantId, Guid clientId, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid();
        var client = await db.Clients.AsNoTracking().SingleOrDefaultAsync(x => x.Id == clientId && x.TenantId == tenantId && x.PractitionerSubject == subject, ct);
        if (client is null) return Results.NotFound();
        return Results.Ok(new { client, assessments = await db.Assessments.AsNoTracking().Where(x => x.TenantId == tenantId && x.ClientId == clientId).ToListAsync(ct), carePlans = await db.CarePlans.AsNoTracking().Where(x => x.TenantId == tenantId && x.ClientId == clientId).ToListAsync(ct), appointments = await db.Appointments.AsNoTracking().Where(x => x.TenantId == tenantId && x.ClientId == clientId && x.PractitionerSubject == subject).ToListAsync(ct) });
    }

    private static async Task<IResult> CreateClient(Guid tenantId, PersonRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct)) return Results.Forbid();
        if (string.IsNullOrWhiteSpace(request.DisplayName)) return Results.BadRequest("Client name is required.");
        if (string.IsNullOrWhiteSpace(request.Surname) || request.DateOfBirth is null) return Results.BadRequest("Client surname and date of birth are required.");
        var now = DateTime.UtcNow; var client = new PractitionerClient { Id = Guid.NewGuid(), TenantId = tenantId, DisplayName = request.DisplayName.Trim(), Surname = request.Surname.Trim(), DateOfBirth = request.DateOfBirth, PreferredName = request.PreferredName?.Trim(), Phone = request.Phone?.Trim(), Email = request.Email?.Trim(), ReferralSource = request.ReferralSource?.Trim(), PractitionerSubject = subject, PractitionerDisplayName = DisplayName(user), CreatedAtUtc = now, UpdatedAtUtc = now };
        db.Clients.Add(client); Audit(db, tenantId, subject, "Create", nameof(PractitionerClient), client.Id); await db.SaveChangesAsync(ct); return Results.Created($"/api/tenants/{tenantId}/clients/{client.Id}", client);
    }

    private static async Task<IResult> CreateAssessment(Guid tenantId, Guid clientId, CaptureRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await OwnsClient(db, tenantId, clientId, subject, ct)) return Results.Forbid();
        var item = new PractitionerAssessment { Id = Guid.NewGuid(), TenantId = tenantId, ClientId = clientId, AssessmentType = request.Type, CaptureJson = request.CaptureJson, CompletedAtUtc = DateTime.UtcNow, CompletedBySubject = subject };
        db.Assessments.Add(item); Audit(db, tenantId, subject, "Create", nameof(PractitionerAssessment), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> SaveCarePlan(Guid tenantId, Guid clientId, CarePlanRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await OwnsClient(db, tenantId, clientId, subject, ct)) return Results.Forbid();
        var now = DateTime.UtcNow; var item = await db.CarePlans.OrderByDescending(x => x.UpdatedAtUtc).FirstOrDefaultAsync(x => x.TenantId == tenantId && x.ClientId == clientId, ct);
        if (item is null) { item = new PractitionerCarePlan { Id = Guid.NewGuid(), TenantId = tenantId, ClientId = clientId, CreatedAtUtc = now }; db.CarePlans.Add(item); }
        item.Status = request.Status; item.CaptureJson = request.CaptureJson; item.ReviewDate = request.ReviewDate; item.UpdatedAtUtc = now; Audit(db, tenantId, subject, "Update", nameof(PractitionerCarePlan), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> CreateAppointment(Guid tenantId, AppointmentRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (!await Member(db, tenantId, subject, ct) || request.ClientId is Guid id && !await OwnsClient(db, tenantId, id, subject, ct)) return Results.Forbid();
        var now = DateTime.UtcNow; var item = new PractitionerAppointment { Id = Guid.NewGuid(), TenantId = tenantId, ClientId = request.ClientId, PractitionerSubject = subject, PractitionerDisplayName = DisplayName(user), AppointmentType = request.AppointmentType, Title = request.Title, StartsAtUtc = request.StartsAtUtc, EndsAtUtc = request.EndsAtUtc, DeliveryMode = request.DeliveryMode, Status = request.Status, Notes = request.Notes, CreatedAtUtc = now, UpdatedAtUtc = now };
        db.Appointments.Add(item); Audit(db, tenantId, subject, "Create", nameof(PractitionerAppointment), item.Id);
        if (request.DeliveryMode == "video") {
            var consultation = new PractitionerVideoConsultation { Id = Guid.NewGuid(), TenantId = tenantId, AppointmentId = item.Id, RoomName = Guid.NewGuid().ToString("N"), Status = VideoConsultationStatus.Scheduled, CreatedAtUtc = now };
            db.VideoConsultations.Add(consultation);
        }
        await db.SaveChangesAsync(ct); return Results.Ok(new { appointment = item });
    }

    private static async Task<IResult> UpdateAppointment(Guid tenantId, Guid appointmentId, AppointmentRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); var item = await db.Appointments.SingleOrDefaultAsync(x => x.Id == appointmentId && x.TenantId == tenantId && x.PractitionerSubject == subject, ct); if (item is null) return Results.Forbid();
        item.ClientId = request.ClientId; item.AppointmentType = request.AppointmentType; item.Title = request.Title; item.StartsAtUtc = request.StartsAtUtc; item.EndsAtUtc = request.EndsAtUtc; item.DeliveryMode = request.DeliveryMode; item.Status = request.Status; item.Notes = request.Notes; item.UpdatedAtUtc = DateTime.UtcNow;
        Audit(db, tenantId, subject, "Update", nameof(PractitionerAppointment), item.Id); await db.SaveChangesAsync(ct); return Results.Ok(item);
    }

    private static async Task<IResult> ConsultationContext(Guid tenantId, Guid appointmentId, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); var appointment = await OwnedAppointment(db, tenantId, appointmentId, subject, ct); if (appointment is null) return Results.Forbid(); if (appointment.DeliveryMode != "video") return Results.Conflict("This is not a video appointment.");
        return Results.Ok(new { appointment.Id, clientName = appointment.Client?.PreferredName ?? appointment.Client?.DisplayName ?? "Client", appointment.PractitionerDisplayName, appointment.StartsAtUtc, appointment.EndsAtUtc, status = appointment.Status });
    }

    private static async Task<IResult> ConsultationCredential(Guid tenantId, Guid appointmentId, ClaimsPrincipal user, PractitionerDbContext db, LiveKitTokenService tokens, IOptions<LiveKitOptions> options, CancellationToken ct)
    {
        var subject = Subject(user); var appointment = await OwnedAppointment(db, tenantId, appointmentId, subject, ct); if (appointment is null) return Results.Forbid(); if (appointment.DeliveryMode != "video") return Results.Conflict("This is not a video appointment.");
        var consultation = await db.VideoConsultations.SingleOrDefaultAsync(x => x.TenantId == tenantId && x.AppointmentId == appointmentId, ct);
        if (consultation is null) { consultation = new PractitionerVideoConsultation { Id = Guid.NewGuid(), TenantId = tenantId, AppointmentId = appointmentId, RoomName = Guid.NewGuid().ToString("N"), Status = VideoConsultationStatus.Open, CreatedAtUtc = DateTime.UtcNow, StartedAtUtc = DateTime.UtcNow }; db.VideoConsultations.Add(consultation); Audit(db, tenantId, subject, "ConsultationCreated", nameof(PractitionerVideoConsultation), consultation.Id); }
        else { consultation.Status = VideoConsultationStatus.Open; consultation.StartedAtUtc ??= DateTime.UtcNow; }
        Audit(db, tenantId, subject, "ParticipantJoined", nameof(PractitionerVideoConsultation), consultation.Id); await db.SaveChangesAsync(ct);
        return Results.Ok(new { serverUrl = options.Value.Url, roomIdentifier = consultation.RoomName, participantIdentifier = $"practitioner_{Guid.NewGuid():N}", accessToken = tokens.Create(consultation.RoomName) });
    }

    private static async Task<IResult> SaveConsultationCapture(Guid tenantId, Guid appointmentId, ConsultationCaptureRequest request, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); var appointment = await OwnedAppointment(db, tenantId, appointmentId, subject, ct); if (appointment is null) return Results.Forbid();
        appointment.Notes = JsonSerializer.Serialize(new { notes = request.Notes?.Trim(), observations = request.Observations?.Trim(), capturedAtUtc = DateTime.UtcNow, capturedBy = subject }); appointment.UpdatedAtUtc = DateTime.UtcNow;
        Audit(db, tenantId, subject, "ConsultationCaptureSaved", nameof(PractitionerAppointment), appointment.Id); await db.SaveChangesAsync(ct); return Results.Ok(new { appointment.Notes, appointment.UpdatedAtUtc });
    }

    private static async Task<IResult> EndConsultation(Guid tenantId, Guid appointmentId, ClaimsPrincipal user, PractitionerDbContext db, CancellationToken ct)
    {
        var subject = Subject(user); if (await OwnedAppointment(db, tenantId, appointmentId, subject, ct) is null) return Results.Forbid(); var item = await db.VideoConsultations.SingleOrDefaultAsync(x => x.TenantId == tenantId && x.AppointmentId == appointmentId, ct); if (item is null) return Results.NotFound(); item.Status = VideoConsultationStatus.Ended; item.EndedAtUtc = DateTime.UtcNow; Audit(db, tenantId, subject, "ConsultationEnded", nameof(PractitionerVideoConsultation), item.Id); await db.SaveChangesAsync(ct); return Results.NoContent();
    }

    private static Task<PractitionerAppointment?> OwnedAppointment(PractitionerDbContext db, Guid tenantId, Guid id, string subject, CancellationToken ct) => db.Appointments.Include(x => x.Client).SingleOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.PractitionerSubject == subject, ct);
    private static Task<bool> OwnsClient(PractitionerDbContext db, Guid tenantId, Guid id, string subject, CancellationToken ct) => db.Clients.AnyAsync(x => x.Id == id && x.TenantId == tenantId && x.PractitionerSubject == subject, ct);
    private static Task<bool> Member(PractitionerDbContext db, Guid tenantId, string subject, CancellationToken ct) => db.Memberships.AnyAsync(x => x.TenantId == tenantId && x.ExternalSubject == subject && x.IsActive && x.RolesJson.Contains("Practitioner"), ct);
    private static string Subject(ClaimsPrincipal user) => user.FindFirstValue("acutis_subject") ?? user.FindFirstValue("preferred_username") ?? user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();
    private static string DisplayName(ClaimsPrincipal user) => user.FindFirstValue("name") ?? user.Identity?.Name ?? "Practitioner";
    private static void Audit(PractitionerDbContext db, Guid tenant, string subject, string action, string type, Guid id) => db.AuditEvents.Add(new PractitionerAuditEvent { Id = Guid.NewGuid(), TenantId = tenant, ExternalSubject = subject, Action = action, EntityType = type, EntityId = id.ToString(), OccurredAtUtc = DateTime.UtcNow });
}

public sealed record PersonRequest(string DisplayName, string Surname, DateOnly? DateOfBirth, string? PreferredName, string? Phone, string? Email, string? ReferralSource);
public sealed record CaptureRequest(string Type, string CaptureJson);
public sealed record CarePlanRequest(string Status, string CaptureJson, DateOnly? ReviewDate);
public sealed record AppointmentRequest(Guid? ClientId, string AppointmentType, string Title, DateTime StartsAtUtc, DateTime EndsAtUtc, string DeliveryMode, string Status, string? Notes);
public sealed record ConsultationCaptureRequest(string? Notes, string? Observations);
public sealed class LiveKitOptions { public string Url { get; set; } = "wss://vc.salientrecovery.com"; public string ApiKey { get; set; } = ""; public string ApiSecret { get; set; } = ""; }
public sealed class LiveKitTokenService(IOptions<LiveKitOptions> options, TimeProvider clock)
{
    public string Create(string room, string name = "Practitioner", string prefix = "practitioner", int lifetimeMinutes = 10) { var o = options.Value; Ensure(o); var now = clock.GetUtcNow(); var identity = prefix.StartsWith("guest_", StringComparison.Ordinal) ? prefix : $"{prefix}_{Guid.NewGuid():N}"; var grant = JsonSerializer.Serialize(new { roomJoin = true, room, canPublish = true, canSubscribe = true, canPublishData = false, canPublishSources = new[] { "camera", "microphone" }, roomAdmin = false, roomRecord = false }); var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, identity), new Claim("name", name), new Claim("video", grant, JsonClaimValueTypes.Json) }; return Write(o.ApiKey, o.ApiSecret, claims, now.AddMinutes(Math.Clamp(lifetimeMinutes, 1, 30)).UtcDateTime); }
    private string Write(string issuer, string secret, Claim[] claims, DateTime expires) { var now = clock.GetUtcNow(); return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(issuer, claims: claims, notBefore: now.AddSeconds(-30).UtcDateTime, expires: expires, signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)), SecurityAlgorithms.HmacSha256))); }
    private static void Ensure(LiveKitOptions o) { if (string.IsNullOrWhiteSpace(o.ApiKey) || string.IsNullOrWhiteSpace(o.ApiSecret)) throw new InvalidOperationException("LiveKit credentials are not configured."); }
}
