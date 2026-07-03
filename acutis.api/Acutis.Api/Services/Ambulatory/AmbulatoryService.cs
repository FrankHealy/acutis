using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Acutis.Api.Services.TherapyScheduling;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Acutis.Api.Services.Ambulatory;

public interface IAmbulatoryService
{
    Task<AmbulatoryDashboardDto> GetDashboardAsync(AmbulatoryProgrammeType programmeType, ClaimsPrincipal user, CancellationToken cancellationToken = default);
    Task<AmbulatoryParticipantDto> CreateParticipantAsync(AmbulatoryProgrammeType programmeType, CreateAmbulatoryParticipantRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default);
    Task<AmbulatoryAssessmentDto> AddAssessmentAsync(AmbulatoryProgrammeType programmeType, Guid participantId, UpsertAmbulatoryAssessmentRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default);
    Task<AmbulatoryCarePlanDto> UpsertCarePlanAsync(AmbulatoryProgrammeType programmeType, Guid participantId, UpsertAmbulatoryCarePlanRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default);
    Task<AmbulatoryAppointmentDto> CreateAppointmentAsync(AmbulatoryProgrammeType programmeType, UpsertAmbulatoryAppointmentRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default);
    Task<AmbulatoryAppointmentDto> UpdateAppointmentAsync(AmbulatoryProgrammeType programmeType, Guid appointmentId, UpsertAmbulatoryAppointmentRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default);
}

public sealed class AmbulatoryService : IAmbulatoryService
{
    private static readonly SemaphoreSlim EnsureCreatedLock = new(1, 1);
    private static bool _databaseReady;
    private readonly AcutisAmbulatoryDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly IAuditService _auditService;

    public AmbulatoryService(AcutisAmbulatoryDbContext dbContext, IConfiguration configuration, IAuditService auditService)
    {
        _dbContext = dbContext;
        _configuration = configuration;
        _auditService = auditService;
    }

    public async Task<AmbulatoryDashboardDto> GetDashboardAsync(AmbulatoryProgrammeType programmeType, ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        await EnsureDatabaseReadyAsync(cancellationToken);
        var userId = GetUserId(user);
        await SeedCounsellorWorkspaceAsync(programmeType, user, cancellationToken);

        var participants = await _dbContext.Participants
            .AsNoTracking()
            .Where(x => x.ProgrammeType == programmeType && x.CounsellorUserId == userId)
            .Include(x => x.Assessments)
            .Include(x => x.CarePlans)
            .OrderBy(x => x.DisplayName)
            .ToListAsync(cancellationToken);

        var from = DateTime.UtcNow.Date.AddDays(-7);
        var to = DateTime.UtcNow.Date.AddDays(28);
        var appointments = await _dbContext.Appointments
            .AsNoTracking()
            .Where(x => x.ProgrammeType == programmeType && x.CounsellorUserId == userId && x.StartsAtUtc >= from && x.StartsAtUtc <= to)
            .Include(x => x.Participant)
            .OrderBy(x => x.StartsAtUtc)
            .ToListAsync(cancellationToken);

        await _auditService.WriteAsync(
            null,
            null,
            "AmbulatoryDashboard",
            $"{programmeType}:{userId}",
            "Viewed",
            null,
            new { programmeType, participantCount = participants.Count, appointmentCount = appointments.Count },
            null,
            cancellationToken);

        return new AmbulatoryDashboardDto
        {
            ProgrammeType = programmeType,
            ProgrammeName = programmeType == AmbulatoryProgrammeType.Community ? "Acutis Community" : "Acutis Practitioner",
            CounsellorUserId = userId,
            Participants = participants.Select((participant, index) => MapParticipant(participant, BuildInternalIdentifier(participant, index + 1))).ToList(),
            Appointments = appointments.Select(MapAppointment).ToList(),
            ProgrammeOfferings = BuildProgrammeOfferings(programmeType)
        };
    }

    public async Task<AmbulatoryParticipantDto> CreateParticipantAsync(AmbulatoryProgrammeType programmeType, CreateAmbulatoryParticipantRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        await EnsureDatabaseReadyAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException("Participant name is required.");
        }

        var now = DateTime.UtcNow;
        var participant = new AmbulatoryParticipant
        {
            Id = Guid.NewGuid(),
            ProgrammeType = programmeType,
            DisplayName = request.DisplayName.Trim(),
            PreferredName = Clean(request.PreferredName),
            Phone = Clean(request.Phone),
            Email = Clean(request.Email),
            ReferralSource = Clean(request.ReferralSource),
            CounsellorUserId = GetUserId(user),
            CounsellorDisplayName = GetDisplayName(user),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.Participants.Add(participant);
        await _dbContext.SaveChangesAsync(cancellationToken);
        var sequence = await _dbContext.Participants
            .CountAsync(x => x.ProgrammeType == programmeType && x.CounsellorUserId == participant.CounsellorUserId, cancellationToken);
        return MapParticipant(participant, BuildInternalIdentifier(participant, sequence));
    }

    public async Task<AmbulatoryAssessmentDto> AddAssessmentAsync(AmbulatoryProgrammeType programmeType, Guid participantId, UpsertAmbulatoryAssessmentRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        await EnsureDatabaseReadyAsync(cancellationToken);
        var participant = await GetOwnedParticipantAsync(programmeType, participantId, user, cancellationToken);
        var assessment = new AmbulatoryAssessment
        {
            Id = Guid.NewGuid(),
            ParticipantId = participant.Id,
            AssessmentType = NormalizeAssessmentType(request.AssessmentType),
            PresentingNeeds = request.PresentingNeeds.Trim(),
            RiskSummary = request.RiskSummary.Trim(),
            Strengths = request.Strengths.Trim(),
            SubstanceOrBehaviourSummary = request.SubstanceOrBehaviourSummary.Trim(),
            GoalsDiscussed = request.GoalsDiscussed.Trim(),
            Outcome = request.Outcome.Trim(),
            CompletedAtUtc = DateTime.UtcNow,
            CompletedByUserId = GetUserId(user)
        };

        participant.UpdatedAtUtc = DateTime.UtcNow;
        _dbContext.Assessments.Add(assessment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapAssessment(assessment);
    }

    public async Task<AmbulatoryCarePlanDto> UpsertCarePlanAsync(AmbulatoryProgrammeType programmeType, Guid participantId, UpsertAmbulatoryCarePlanRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        await EnsureDatabaseReadyAsync(cancellationToken);
        var participant = await GetOwnedParticipantAsync(programmeType, participantId, user, cancellationToken);
        var existing = await _dbContext.CarePlans
            .Where(x => x.ParticipantId == participant.Id)
            .OrderByDescending(x => x.UpdatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        var now = DateTime.UtcNow;
        if (existing is null)
        {
            existing = new AmbulatoryCarePlan
            {
                Id = Guid.NewGuid(),
                ParticipantId = participant.Id,
                CreatedAtUtc = now,
                CreatedByUserId = GetUserId(user)
            };
            _dbContext.CarePlans.Add(existing);
        }

        existing.Status = string.IsNullOrWhiteSpace(request.Status) ? "active" : request.Status.Trim();
        existing.Needs = request.Needs.Trim();
        existing.Strengths = request.Strengths.Trim();
        existing.Risks = request.Risks.Trim();
        existing.Goals = request.Goals.Trim();
        existing.Actions = request.Actions.Trim();
        existing.ReviewNotes = request.ReviewNotes.Trim();
        existing.ReviewDate = request.ReviewDate;
        existing.UpdatedAtUtc = now;
        existing.UpdatedByUserId = GetUserId(user);
        participant.UpdatedAtUtc = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapCarePlan(existing);
    }

    public async Task<AmbulatoryAppointmentDto> CreateAppointmentAsync(AmbulatoryProgrammeType programmeType, UpsertAmbulatoryAppointmentRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        await EnsureDatabaseReadyAsync(cancellationToken);
        if (request.EndsAtUtc <= request.StartsAtUtc)
        {
            throw new ArgumentException("Appointment end time must be after start time.");
        }

        AmbulatoryParticipant? participant = null;
        if (request.ParticipantId.HasValue)
        {
            participant = await GetOwnedParticipantAsync(programmeType, request.ParticipantId.Value, user, cancellationToken);
        }

        var now = DateTime.UtcNow;
        var isVideo = request.DeliveryMode.Equals("video", StringComparison.OrdinalIgnoreCase);
        var appointment = new AmbulatoryAppointment
        {
            Id = Guid.NewGuid(),
            ProgrammeType = programmeType,
            ParticipantId = participant?.Id,
            CounsellorUserId = GetUserId(user),
            CounsellorDisplayName = GetDisplayName(user),
            AppointmentType = string.IsNullOrWhiteSpace(request.AppointmentType) ? "individual-therapy" : request.AppointmentType.Trim(),
            Title = string.IsNullOrWhiteSpace(request.Title) ? BuildAppointmentTitle(request.AppointmentType, participant) : request.Title.Trim(),
            StartsAtUtc = request.StartsAtUtc,
            EndsAtUtc = request.EndsAtUtc,
            DeliveryMode = isVideo ? "video" : "in-person",
            Status = string.IsNullOrWhiteSpace(request.Status) ? "scheduled" : request.Status.Trim(),
            Notes = Clean(request.Notes),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        if (isVideo)
        {
            appointment.AvProvider = "jitsi";
            appointment.AvRoomName = BuildRoomName(programmeType, appointment.Id);
            appointment.AvJoinUrl = BuildJitsiUrl(appointment.AvRoomName);
        }

        _dbContext.Appointments.Add(appointment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        appointment.Participant = participant;
        return MapAppointment(appointment);
    }

    public async Task<AmbulatoryAppointmentDto> UpdateAppointmentAsync(AmbulatoryProgrammeType programmeType, Guid appointmentId, UpsertAmbulatoryAppointmentRequest request, ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        await EnsureDatabaseReadyAsync(cancellationToken);
        if (request.EndsAtUtc <= request.StartsAtUtc)
        {
            throw new ArgumentException("Appointment end time must be after start time.");
        }

        var userId = GetUserId(user);
        var appointment = await _dbContext.Appointments
            .Include(x => x.Participant)
            .SingleAsync(x => x.Id == appointmentId && x.ProgrammeType == programmeType && x.CounsellorUserId == userId, cancellationToken);

        if (IsFixedAppointment(appointment))
        {
            throw new InvalidOperationException("This appointment is fixed and requires administrator rights to change.");
        }

        AmbulatoryParticipant? participant = null;
        if (request.ParticipantId.HasValue)
        {
            participant = await GetOwnedParticipantAsync(programmeType, request.ParticipantId.Value, user, cancellationToken);
        }

        var isVideo = request.DeliveryMode.Equals("video", StringComparison.OrdinalIgnoreCase);
        appointment.ParticipantId = participant?.Id;
        appointment.Participant = participant;
        appointment.AppointmentType = string.IsNullOrWhiteSpace(request.AppointmentType) ? appointment.AppointmentType : request.AppointmentType.Trim();
        appointment.Title = string.IsNullOrWhiteSpace(request.Title) ? BuildAppointmentTitle(appointment.AppointmentType, participant) : request.Title.Trim();
        appointment.StartsAtUtc = request.StartsAtUtc;
        appointment.EndsAtUtc = request.EndsAtUtc;
        appointment.DeliveryMode = isVideo ? "video" : "in-person";
        appointment.Status = string.IsNullOrWhiteSpace(request.Status) ? appointment.Status : request.Status.Trim();
        appointment.Notes = Clean(request.Notes);
        appointment.UpdatedAtUtc = DateTime.UtcNow;

        if (isVideo && string.IsNullOrWhiteSpace(appointment.AvRoomName))
        {
            appointment.AvProvider = "jitsi";
            appointment.AvRoomName = BuildRoomName(programmeType, appointment.Id);
            appointment.AvJoinUrl = BuildJitsiUrl(appointment.AvRoomName);
        }
        if (!isVideo)
        {
            appointment.AvProvider = null;
            appointment.AvRoomName = null;
            appointment.AvJoinUrl = null;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapAppointment(appointment);
    }

    private async Task EnsureDatabaseReadyAsync(CancellationToken cancellationToken)
    {
        if (_databaseReady)
        {
            return;
        }

        await EnsureCreatedLock.WaitAsync(cancellationToken);
        try
        {
            if (_databaseReady)
            {
                return;
            }

            await _dbContext.Database.EnsureCreatedAsync(cancellationToken);
            _databaseReady = true;
        }
        finally
        {
            EnsureCreatedLock.Release();
        }
    }

    private async Task SeedCounsellorWorkspaceAsync(AmbulatoryProgrammeType programmeType, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        var hasParticipants = await _dbContext.Participants
            .AnyAsync(x => x.ProgrammeType == programmeType && x.CounsellorUserId == userId, cancellationToken);
        if (hasParticipants)
        {
            var existingParticipants = await _dbContext.Participants
                .Where(x => x.ProgrammeType == programmeType && x.CounsellorUserId == userId)
                .OrderBy(x => x.DisplayName)
                .Take(4)
                .ToListAsync(cancellationToken);
            await SeedTodayScheduleAsync(programmeType, existingParticipants, userId, GetDisplayName(user), cancellationToken);
            return;
        }

        var now = DateTime.UtcNow;
        var counsellorName = GetDisplayName(user);
        var sampleNames = programmeType == AmbulatoryProgrammeType.Community
            ? new[] { "Aoife Ryan", "Michael Byrne", "Sana Khan", "Thomas Walsh" }
            : new[] { "Participant A", "Participant B", "Participant C" };

        var participants = sampleNames.Select((name, index) => new AmbulatoryParticipant
        {
            Id = Guid.NewGuid(),
            ProgrammeType = programmeType,
            DisplayName = name,
            PreferredName = name.Split(' ')[0],
            Phone = index % 2 == 0 ? "087 000 10" + index : null,
            Email = index % 2 == 1 ? $"participant{index + 1}@example.local" : null,
            ReferralSource = index % 2 == 0 ? "Self referral" : "GP referral",
            Status = "active",
            CounsellorUserId = userId,
            CounsellorDisplayName = counsellorName,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        }).ToList();

        _dbContext.Participants.AddRange(participants);

        foreach (var participant in participants)
        {
            _dbContext.CarePlans.Add(new AmbulatoryCarePlan
            {
                Id = Guid.NewGuid(),
                ParticipantId = participant.Id,
                Status = "active",
                Needs = "Stabilise weekly recovery routine and strengthen appointment attendance.",
                Strengths = "Engaged, reflective and willing to use structured supports.",
                Risks = "Isolation, missed appointments and high-risk social settings.",
                Goals = "Maintain recovery goals, attend one to one sessions, and join a suitable group programme.",
                Actions = "Weekly counselling, programme referral, relapse prevention planning and review of triggers.",
                ReviewNotes = "Review engagement and programme fit at next care-plan review.",
                ReviewDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(21)),
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
                CreatedByUserId = userId,
                UpdatedByUserId = userId
            });
        }

        _dbContext.Assessments.Add(new AmbulatoryAssessment
        {
            Id = Guid.NewGuid(),
            ParticipantId = participants[0].Id,
            AssessmentType = "initial",
            PresentingNeeds = "Community-based recovery support and weekly counselling.",
            RiskSummary = "No immediate acute risk disclosed; monitor isolation and cravings.",
            Strengths = "Stable accommodation and good motivation.",
            SubstanceOrBehaviourSummary = "Alcohol and gambling triggers discussed.",
            GoalsDiscussed = "Weekly structure, CBT group, and relapse prevention.",
            Outcome = "Proceed with full assessment and start CBT Recovery Skills.",
            CompletedAtUtc = now.AddDays(-2),
            CompletedByUserId = userId
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        await SeedTodayScheduleAsync(programmeType, participants, userId, counsellorName, cancellationToken);
    }

    private async Task SeedTodayScheduleAsync(
        AmbulatoryProgrammeType programmeType,
        IReadOnlyList<AmbulatoryParticipant> participants,
        string userId,
        string counsellorName,
        CancellationToken cancellationToken)
    {
        if (participants.Count == 0)
        {
            return;
        }

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var hasTodayScenario = await _dbContext.Appointments
            .AnyAsync(x =>
                x.ProgrammeType == programmeType &&
                x.CounsellorUserId == userId &&
                x.StartsAtUtc >= today &&
                x.StartsAtUtc < tomorrow &&
                x.Title == "Evening case review meeting",
                cancellationToken);
        if (hasTodayScenario)
        {
            return;
        }

        var p0 = participants[0];
        var p1 = participants.Count > 1 ? participants[1] : participants[0];
        var p2 = participants.Count > 2 ? participants[2] : participants[0];
        var p3 = participants.Count > 3 ? participants[3] : participants[0];

        var appointments = new List<AmbulatoryAppointment>
        {
            BuildSeedAppointment(programmeType, p0, userId, counsellorName, "initial-assessment", "Screening", today.AddHours(9), 60, "in-person", "Location: Community office. Use transcription to draft the initial assessment."),
            BuildSeedAppointment(programmeType, p1, userId, counsellorName, "individual-therapy", "One to one session", today.AddHours(11), 50, "in-person", "Location: Community office. Focus: relapse prevention and care-plan actions."),
            BuildSeedAppointment(programmeType, p2, userId, counsellorName, "individual-therapy", "One to one session", today.AddHours(14), 50, "in-person", "Location: Community office. Focus: CBT recovery skills referral."),
            BuildSeedAppointment(programmeType, p3, userId, counsellorName, "individual-therapy", "Outreach one to one", today.AddHours(16), 50, "in-person", "Location: Homeless shelter. Outreach visit; complete progress note before evening meeting."),
            BuildSeedAppointment(programmeType, null, userId, counsellorName, "group-meeting", "Evening case review meeting", today.AddHours(18), 60, "video", "Report due: prepare counsellor summary from today's sessions and care-plan updates.")
        };

        _dbContext.Appointments.AddRange(appointments);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private AmbulatoryAppointment BuildSeedAppointment(
        AmbulatoryProgrammeType programmeType,
        AmbulatoryParticipant? participant,
        string userId,
        string counsellorName,
        string appointmentType,
        string title,
        DateTime startsAtUtc,
        int durationMinutes,
        string deliveryMode,
        string? notes = null)
    {
        var appointment = new AmbulatoryAppointment
        {
            Id = Guid.NewGuid(),
            ProgrammeType = programmeType,
            ParticipantId = participant?.Id,
            CounsellorUserId = userId,
            CounsellorDisplayName = counsellorName,
            AppointmentType = appointmentType,
            Title = participant is null ? title : $"{title}: {participant.DisplayName}",
            StartsAtUtc = DateTime.SpecifyKind(startsAtUtc, DateTimeKind.Utc),
            EndsAtUtc = DateTime.SpecifyKind(startsAtUtc.AddMinutes(durationMinutes), DateTimeKind.Utc),
            DeliveryMode = deliveryMode,
            Status = "scheduled",
            Notes = notes ?? (deliveryMode == "video" ? "Transcript capture available during remote session." : null),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        if (deliveryMode == "video")
        {
            appointment.AvProvider = "jitsi";
            appointment.AvRoomName = BuildRoomName(programmeType, appointment.Id);
            appointment.AvJoinUrl = BuildJitsiUrl(appointment.AvRoomName);
        }

        return appointment;
    }

    private static IReadOnlyList<AmbulatoryProgrammeOfferingDto> BuildProgrammeOfferings(AmbulatoryProgrammeType programmeType)
    {
        return new[]
        {
            new AmbulatoryProgrammeOfferingDto
            {
                Code = "cbt-recovery-skills",
                Name = "CBT Recovery Skills",
                Category = "CBT",
                Cadence = "Twice weekly",
                Facilitator = "Centre counsellor",
                Description = "Structured CBT group focused on triggers, cravings, thinking patterns and relapse prevention.",
                SuitableFor = "Clients ready for skills-based recovery work",
                NextSessionLabel = "Wed 14:00"
            },
            new AmbulatoryProgrammeOfferingDto
            {
                Code = "dual-addiction",
                Name = "Dual Addiction Group",
                Category = "Group",
                Cadence = "Weekly",
                Facilitator = "Senior counsellor",
                Description = "Group pathway for clients presenting with more than one addiction pattern, including gambling and substances.",
                SuitableFor = "Cross-addiction formulation and care-plan support",
                NextSessionLabel = "Thu 11:00"
            },
            new AmbulatoryProgrammeOfferingDto
            {
                Code = "adhd-addiction",
                Name = "ADHD and Addiction Skills",
                Category = "Dual diagnosis",
                Cadence = "Weekly",
                Facilitator = "Counsellor/life coach",
                Description = "Practical structure, psychoeducation, coaching and CBT-informed supports for ADHD and addiction overlap.",
                SuitableFor = "Clients needing routine, adherence and impulse-control supports",
                NextSessionLabel = programmeType == AmbulatoryProgrammeType.Practitioner ? "Remote Fri 12:00" : "Fri 12:00"
            },
            new AmbulatoryProgrammeOfferingDto
            {
                Code = "life-coaching",
                Name = "Recovery Life Coaching",
                Category = "Coaching",
                Cadence = "Fortnightly",
                Facilitator = "Life coach",
                Description = "Goal setting, employment readiness, daily structure, accountability and community reconnection.",
                SuitableFor = "Stabilisation and reintegration goals",
                NextSessionLabel = "Mon 10:30"
            }
        };
    }

    private async Task<AmbulatoryParticipant> GetOwnedParticipantAsync(AmbulatoryProgrammeType programmeType, Guid participantId, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var userId = GetUserId(user);
        return await _dbContext.Participants
            .SingleAsync(x => x.Id == participantId && x.ProgrammeType == programmeType && x.CounsellorUserId == userId, cancellationToken);
    }

    private string BuildJitsiUrl(string roomName)
    {
        var baseUrl = _configuration["Ambulatory:Av:JitsiBaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            baseUrl = "https://meet.acutis.local";
        }

        return $"{baseUrl.TrimEnd('/')}/{Uri.EscapeDataString(roomName)}";
    }

    private static string BuildRoomName(AmbulatoryProgrammeType programmeType, Guid appointmentId)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes($"{programmeType}:{appointmentId:N}"));
        return $"acutis-{programmeType.ToString().ToLowerInvariant()}-{Convert.ToHexString(hash)[..16].ToLowerInvariant()}";
    }

    private static string BuildAppointmentTitle(string appointmentType, AmbulatoryParticipant? participant)
    {
        var prefix = appointmentType switch
        {
            "group-meeting" => "Group meeting",
            "initial-assessment" => "Initial assessment",
            "full-assessment" => "Full assessment",
            _ => "One to one therapy"
        };
        return participant is null ? prefix : $"{prefix}: {participant.DisplayName}";
    }

    private static string NormalizeAssessmentType(string value)
    {
        return value.Equals("full", StringComparison.OrdinalIgnoreCase) ||
               value.Equals("full-assessment", StringComparison.OrdinalIgnoreCase)
            ? "full"
            : "initial";
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static bool IsFixedAppointment(AmbulatoryAppointment appointment)
    {
        return appointment.AppointmentType == "group-meeting" &&
               (appointment.ParticipantId is null ||
                appointment.Title.Contains("CBT", StringComparison.OrdinalIgnoreCase) ||
                appointment.Title.Contains("Dual", StringComparison.OrdinalIgnoreCase));
    }

    private static string GetUserId(ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub")
            ?? user.FindFirstValue(ClaimTypes.Email)
            ?? user.Identity?.Name
            ?? "development-user";
    }

    private static string GetDisplayName(ClaimsPrincipal user)
    {
        return user.FindFirstValue(ClaimTypes.Name)
            ?? user.FindFirstValue("preferred_username")
            ?? user.FindFirstValue(ClaimTypes.Email)
            ?? user.Identity?.Name
            ?? "Counsellor";
    }

    private string BuildInternalIdentifier(AmbulatoryParticipant participant, int sequence)
    {
        var prefix = _configuration["Acutis:InternalIdentifierPrefix"];
        if (string.IsNullOrWhiteSpace(prefix))
        {
            prefix = _configuration["Centre:InternalIdentifierPrefix"];
        }

        prefix = string.IsNullOrWhiteSpace(prefix) ? "AH" : prefix.Trim().ToUpperInvariant();
        var createdAt = participant.CreatedAtUtc == default ? DateTime.UtcNow : participant.CreatedAtUtc;
        var year = ISOWeek.GetYear(createdAt);
        var week = ISOWeek.GetWeekOfYear(createdAt);
        return $"{prefix}-{year}W{week:00}-{sequence:000}";
    }

    private static string BuildPhotoUrl(AmbulatoryParticipant participant)
    {
        var seed = Uri.EscapeDataString($"{participant.ProgrammeType}-{participant.Id:N}");
        return $"https://i.pravatar.cc/160?u={seed}";
    }

    private static AmbulatoryParticipantDto MapParticipant(AmbulatoryParticipant participant, string internalIdentifier)
    {
        var carePlans = participant.CarePlans.OrderByDescending(x => x.UpdatedAtUtc).Select(MapCarePlan).ToList();
        return new AmbulatoryParticipantDto
        {
            Id = participant.Id,
            InternalIdentifier = internalIdentifier,
            ProgrammeType = participant.ProgrammeType,
            DisplayName = participant.DisplayName,
            PreferredName = participant.PreferredName,
            Phone = participant.Phone,
            Email = participant.Email,
            PhotoUrl = BuildPhotoUrl(participant),
            ReferralSource = participant.ReferralSource,
            Status = participant.Status,
            CounsellorUserId = participant.CounsellorUserId,
            CounsellorDisplayName = participant.CounsellorDisplayName,
            StartDateUtc = participant.CreatedAtUtc,
            Assessments = participant.Assessments.OrderByDescending(x => x.CompletedAtUtc).Select(MapAssessment).ToList(),
            CarePlans = carePlans,
            CurrentCarePlan = carePlans.FirstOrDefault()
        };
    }

    private static AmbulatoryAssessmentDto MapAssessment(AmbulatoryAssessment assessment)
    {
        return new AmbulatoryAssessmentDto
        {
            Id = assessment.Id,
            ParticipantId = assessment.ParticipantId,
            AssessmentType = assessment.AssessmentType,
            PresentingNeeds = assessment.PresentingNeeds,
            RiskSummary = assessment.RiskSummary,
            Strengths = assessment.Strengths,
            SubstanceOrBehaviourSummary = assessment.SubstanceOrBehaviourSummary,
            GoalsDiscussed = assessment.GoalsDiscussed,
            Outcome = assessment.Outcome,
            CompletedAtUtc = assessment.CompletedAtUtc
        };
    }

    private static AmbulatoryCarePlanDto MapCarePlan(AmbulatoryCarePlan carePlan)
    {
        return new AmbulatoryCarePlanDto
        {
            Id = carePlan.Id,
            ParticipantId = carePlan.ParticipantId,
            Status = carePlan.Status,
            Needs = carePlan.Needs,
            Strengths = carePlan.Strengths,
            Risks = carePlan.Risks,
            Goals = carePlan.Goals,
            Actions = carePlan.Actions,
            ReviewNotes = carePlan.ReviewNotes,
            ReviewDate = carePlan.ReviewDate,
            UpdatedAtUtc = carePlan.UpdatedAtUtc
        };
    }

    private static AmbulatoryAppointmentDto MapAppointment(AmbulatoryAppointment appointment)
    {
        return new AmbulatoryAppointmentDto
        {
            Id = appointment.Id,
            ProgrammeType = appointment.ProgrammeType,
            ParticipantId = appointment.ParticipantId,
            ParticipantName = appointment.Participant?.DisplayName,
            CounsellorUserId = appointment.CounsellorUserId,
            CounsellorDisplayName = appointment.CounsellorDisplayName,
            AppointmentType = appointment.AppointmentType,
            Title = appointment.Title,
            StartsAtUtc = appointment.StartsAtUtc,
            EndsAtUtc = appointment.EndsAtUtc,
            DeliveryMode = appointment.DeliveryMode,
            Status = appointment.Status,
            Notes = appointment.Notes,
            AvProvider = appointment.AvProvider,
            AvRoomName = appointment.AvRoomName,
            AvJoinUrl = appointment.AvJoinUrl,
            IsFixed = IsFixedAppointment(appointment)
        };
    }
}
