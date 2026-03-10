using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace Acutis.Api.Services.TherapyScheduling;

public interface ITherapySchedulingService
{
    Task<IReadOnlyList<TherapyTopicDto>> GetTherapyTopicsAsync(CancellationToken cancellationToken = default);
    Task<TherapySchedulingConfigDto> GetConfigAsync(Guid centreId, Guid? unitId, CancellationToken cancellationToken = default);
    Task<TherapySchedulingConfigDto> UpsertConfigAsync(Guid centreId, UpsertTherapySchedulingConfigRequest request, CancellationToken cancellationToken = default);
    Task<WeeklyTherapyRunDto> CreateWeeklyRunAsync(Guid centreId, CreateWeeklyTherapyRunRequest request, CancellationToken cancellationToken = default);
    Task<WeeklyTherapyRunWithAssignmentsDto?> GetRunWithAssignmentsAsync(Guid centreId, Guid runId, CancellationToken cancellationToken = default);
    Task<PublishWeeklyTherapyRunResponse?> PublishRunAsync(Guid centreId, Guid runId, PublishWeeklyTherapyRunRequest request, CancellationToken cancellationToken = default);
    Task<ResidentWeeklyTherapyAssignmentDto> OverrideAssignmentAsync(Guid centreId, OverrideResidentWeeklyTherapyAssignmentRequest request, CancellationToken cancellationToken = default);
    Task<TherapyTopicCompletionDto> CreateCompletionAsync(Guid centreId, CreateTherapyTopicCompletionRequest request, CancellationToken cancellationToken = default);
    Task<TherapyProgressDto?> GetProgressAsync(Guid centreId, Guid episodeId, CancellationToken cancellationToken = default);
    Task<EpisodeEventDto?> CreateEpisodeEventAsync(Guid centreId, Guid episodeId, CreateEpisodeEventRequest request, CancellationToken cancellationToken = default);
}

public sealed class TherapySchedulingService : ITherapySchedulingService
{
    private static readonly Guid SystemActorUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TherapySchedulingService(
        AcutisDbContext dbContext,
        IAuditService auditService,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _auditService = auditService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IReadOnlyList<TherapyTopicDto>> GetTherapyTopicsAsync(CancellationToken cancellationToken = default)
    {
        var topics = await _dbContext.TherapyTopics
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);

        return topics.Select(MapTopic).ToList();
    }

    public async Task<TherapySchedulingConfigDto> GetConfigAsync(
        Guid centreId,
        Guid? unitId,
        CancellationToken cancellationToken = default)
    {
        var unitConfig = unitId.HasValue
            ? await _dbContext.TherapySchedulingConfigs
                .AsNoTracking()
                .Where(x => x.CentreId == centreId && x.UnitId == unitId)
                .OrderBy(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        var centreConfig = await _dbContext.TherapySchedulingConfigs
            .AsNoTracking()
            .Where(x => x.CentreId == centreId && x.UnitId == null)
            .OrderBy(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (unitConfig is not null)
        {
            return MapConfig(unitConfig, centreId, unitId, true, "Unit");
        }

        if (centreConfig is not null)
        {
            return MapConfig(centreConfig, centreId, unitId, true, unitId.HasValue ? "CentreFallback" : "Centre");
        }

        return new TherapySchedulingConfigDto
        {
            ConfigId = null,
            CentreId = centreId,
            UnitId = unitId,
            IsPersisted = false,
            Source = "Default"
        };
    }

    public async Task<TherapySchedulingConfigDto> UpsertConfigAsync(
        Guid centreId,
        UpsertTherapySchedulingConfigRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateConfigRequest(request);

        var intakeDay = Enum.Parse<DayOfWeek>(request.IntakeDayPreference, true);
        var existing = await _dbContext.TherapySchedulingConfigs
            .Where(x => x.CentreId == centreId && x.UnitId == request.UnitId)
            .OrderBy(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var before = existing is null ? null : new
        {
            existing.IntakeDayPreference,
            existing.ShiftIntakeIfPublicHoliday,
            existing.DetoxWeeks,
            existing.TotalWeeks,
            existing.MainProgrammeWeeks,
            existing.TopicsRequired,
            existing.TopicsRunningPerWeek,
            existing.WeekDefinition,
            existing.HolidayCalendarCode,
            existing.AllowDuplicateCompletionsInEpisode
        };

        if (existing is null)
        {
            existing = new TherapySchedulingConfig
            {
                Id = Guid.NewGuid(),
                CentreId = centreId,
                UnitId = request.UnitId
            };
            _dbContext.TherapySchedulingConfigs.Add(existing);
        }

        existing.IntakeDayPreference = intakeDay;
        existing.ShiftIntakeIfPublicHoliday = request.ShiftIntakeIfPublicHoliday;
        existing.DetoxWeeks = request.DetoxWeeks;
        existing.TotalWeeks = request.TotalWeeks;
        existing.MainProgrammeWeeks = request.MainProgrammeWeeks;
        existing.TopicsRequired = request.TopicsRequired;
        existing.TopicsRunningPerWeek = request.TopicsRunningPerWeek;
        existing.WeekDefinition = request.WeekDefinition.Trim();
        existing.HolidayCalendarCode = request.HolidayCalendar.Trim();
        existing.AllowDuplicateCompletionsInEpisode = request.AllowDuplicateCompletionsInEpisode;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var action = before is null ? "Create" : "Update";
        await _auditService.WriteAsync(
            centreId,
            request.UnitId,
            nameof(TherapySchedulingConfig),
            existing.Id.ToString(),
            action,
            before,
            new
            {
                existing.IntakeDayPreference,
                existing.ShiftIntakeIfPublicHoliday,
                existing.DetoxWeeks,
                existing.TotalWeeks,
                existing.MainProgrammeWeeks,
                existing.TopicsRequired,
                existing.TopicsRunningPerWeek,
                existing.WeekDefinition,
                existing.HolidayCalendarCode,
                existing.AllowDuplicateCompletionsInEpisode
            },
            request.Reason,
            cancellationToken);

        return MapConfig(existing, centreId, request.UnitId, true, request.UnitId.HasValue ? "Unit" : "Centre");
    }

    public async Task<WeeklyTherapyRunDto> CreateWeeklyRunAsync(
        Guid centreId,
        CreateWeeklyTherapyRunRequest request,
        CancellationToken cancellationToken = default)
    {
        var preferences = await GetPreferencesAsync(centreId, request.UnitId, cancellationToken);
        var actorUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User);
        var generatedAtUtc = DateTime.UtcNow;
        var weekEndDate = request.WeekStartDate.AddDays(6);

        var run = new WeeklyTherapyRun
        {
            Id = Guid.NewGuid(),
            CentreId = centreId,
            UnitId = request.UnitId,
            WeekStartDate = request.WeekStartDate,
            WeekEndDate = weekEndDate,
            TopicsRunningJson = JsonSerializer.Serialize(request.TopicsRunning.Distinct().ToList()),
            Status = WeeklyTherapyRunStatus.Draft,
            GeneratedAt = generatedAtUtc,
            GeneratedByUserId = actorUserId
        };

        var eligibleEpisodes = await _dbContext.ResidentProgrammeEpisodes
            .Where(x =>
                x.CentreId == centreId &&
                x.ProgrammeType == ProgrammeType.Alcohol &&
                x.ParticipationMode == ParticipationMode.FullProgramme &&
                (!request.UnitId.HasValue || x.UnitId == request.UnitId) &&
                x.StartDate <= weekEndDate &&
                (x.EndDate == null || x.EndDate >= request.WeekStartDate))
            .OrderBy(x => x.CohortId)
            .ThenBy(x => x.ResidentId)
            .ToListAsync(cancellationToken);

        var topicIds = request.TopicsRunning.Distinct().ToList();
        var detoxWarningCount = 0;
        var assignments = new List<ResidentWeeklyTherapyAssignment>();
        var topicCounts = topicIds.ToDictionary(topicId => topicId, _ => 0);
        var cohortPreferredTopic = new Dictionary<Guid, Guid>();

        var episodeIds = eligibleEpisodes.Select(x => x.Id).ToList();
        var completionRows = await _dbContext.TherapyTopicCompletions
            .Where(x => episodeIds.Contains(x.EpisodeId))
            .Select(x => new { x.EpisodeId, x.TherapyTopicId })
            .ToListAsync(cancellationToken);
        var completions = completionRows
            .GroupBy(x => x.EpisodeId)
            .ToDictionary(
                group => group.Key,
                group => group.Select(x => x.TherapyTopicId).Distinct().ToHashSet());

        foreach (var episode in eligibleEpisodes)
        {
            if (episode.CurrentWeekNumber <= preferences.DetoxWeeks)
            {
                detoxWarningCount++;
                continue;
            }

            var completedTopics = completions.TryGetValue(episode.Id, out var completedSet)
                ? completedSet
                : new HashSet<Guid>();
            var notYetCompleted = topicIds.Where(topicId => !completedTopics.Contains(topicId)).ToList();
            var candidates = notYetCompleted.Count > 0 ? notYetCompleted : topicIds;

            var selectedTopicId = SelectTopicForEpisode(episode, candidates, topicCounts, cohortPreferredTopic);

            topicCounts[selectedTopicId] = topicCounts[selectedTopicId] + 1;
            if (episode.CohortId.HasValue && !cohortPreferredTopic.ContainsKey(episode.CohortId.Value))
            {
                cohortPreferredTopic[episode.CohortId.Value] = selectedTopicId;
            }

            assignments.Add(new ResidentWeeklyTherapyAssignment
            {
                Id = Guid.NewGuid(),
                ResidentId = episode.ResidentId,
                EpisodeId = episode.Id,
                WeekStartDate = request.WeekStartDate,
                TherapyTopicId = selectedTopicId,
                AssignmentSource = AssignmentSource.Auto,
                OverrideReason = episode.CurrentWeekNumber <= preferences.DetoxWeeks
                    ? "Auto assignment during detox weeks requires override."
                    : null,
                SupersedesAssignmentId = null,
                CreatedAt = generatedAtUtc,
                CreatedByUserId = actorUserId
            });
        }

        _dbContext.WeeklyTherapyRuns.Add(run);
        _dbContext.ResidentWeeklyTherapyAssignments.AddRange(assignments);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId,
            request.UnitId,
            nameof(WeeklyTherapyRun),
            run.Id.ToString(),
            "Create",
            null,
            run,
            request.Notes,
            cancellationToken);

        foreach (var assignment in assignments)
        {
            await _auditService.WriteAsync(
                centreId,
                request.UnitId,
                nameof(ResidentWeeklyTherapyAssignment),
                assignment.Id.ToString(),
                "Create",
                null,
                assignment,
                null,
                cancellationToken);
        }

        return new WeeklyTherapyRunDto
        {
            RunId = run.Id,
            CentreId = run.CentreId,
            UnitId = run.UnitId,
            WeekStartDate = run.WeekStartDate,
            WeekEndDate = run.WeekEndDate,
            TopicsRunning = topicIds,
            Status = run.Status.ToString(),
            GeneratedAtUtc = run.GeneratedAt,
            GeneratedByUserId = run.GeneratedByUserId,
            AssignmentSummary = new AssignmentSummaryDto
            {
                EligibleResidents = eligibleEpisodes.Count,
                Assigned = assignments.Count,
                Skipped = eligibleEpisodes.Count - assignments.Count,
                Warnings = detoxWarningCount > 0
                    ? new List<GenerationWarningDto> { new() { Code = "DETOX_WEEK_AVOIDED", Count = detoxWarningCount } }
                    : new List<GenerationWarningDto>()
            }
        };
    }

    public async Task<WeeklyTherapyRunWithAssignmentsDto?> GetRunWithAssignmentsAsync(
        Guid centreId,
        Guid runId,
        CancellationToken cancellationToken = default)
    {
        var run = await _dbContext.WeeklyTherapyRuns
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == runId && x.CentreId == centreId, cancellationToken);
        if (run is null)
        {
            return null;
        }

        var episodes = _dbContext.ResidentProgrammeEpisodes
            .AsNoTracking()
            .Where(x => x.CentreId == centreId && x.ProgrammeType == ProgrammeType.Alcohol);
        if (run.UnitId.HasValue)
        {
            episodes = episodes.Where(x => x.UnitId == run.UnitId);
        }

        var episodeIds = await episodes.Select(x => x.Id).ToListAsync(cancellationToken);
        var assignments = await _dbContext.ResidentWeeklyTherapyAssignments
            .AsNoTracking()
            .Where(x => x.WeekStartDate == run.WeekStartDate && episodeIds.Contains(x.EpisodeId))
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        var supersededIds = assignments
            .Where(x => x.SupersedesAssignmentId.HasValue)
            .Select(x => x.SupersedesAssignmentId!.Value)
            .ToHashSet();
        var currentAssignments = assignments
            .Where(x => !supersededIds.Contains(x.Id))
            .ToList();

        return new WeeklyTherapyRunWithAssignmentsDto
        {
            Run = new WeeklyTherapyRunDto
            {
                RunId = run.Id,
                CentreId = run.CentreId,
                UnitId = run.UnitId,
                WeekStartDate = run.WeekStartDate,
                WeekEndDate = run.WeekEndDate,
                TopicsRunning = ParseTopicsRunning(run.TopicsRunningJson),
                Status = run.Status.ToString(),
                GeneratedAtUtc = run.GeneratedAt,
                GeneratedByUserId = run.GeneratedByUserId,
                AssignmentSummary = new AssignmentSummaryDto
                {
                    EligibleResidents = currentAssignments.Count,
                    Assigned = currentAssignments.Count,
                    Skipped = 0,
                    Warnings = new List<GenerationWarningDto>()
                }
            },
            Assignments = currentAssignments.Select(MapAssignment).ToList()
        };
    }

    public async Task<PublishWeeklyTherapyRunResponse?> PublishRunAsync(
        Guid centreId,
        Guid runId,
        PublishWeeklyTherapyRunRequest request,
        CancellationToken cancellationToken = default)
    {
        var run = await _dbContext.WeeklyTherapyRuns
            .SingleOrDefaultAsync(x => x.Id == runId && x.CentreId == centreId, cancellationToken);
        if (run is null)
        {
            return null;
        }

        var before = new
        {
            run.Status,
            run.PublishedAt,
            run.PublishedByUserId
        };

        run.Status = WeeklyTherapyRunStatus.Published;
        run.PublishedAt = DateTime.UtcNow;
        run.PublishedByUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId,
            run.UnitId,
            nameof(WeeklyTherapyRun),
            run.Id.ToString(),
            "Publish",
            before,
            new
            {
                run.Status,
                run.PublishedAt,
                run.PublishedByUserId
            },
            request.PublishComment,
            cancellationToken);

        return new PublishWeeklyTherapyRunResponse
        {
            RunId = run.Id,
            Status = run.Status.ToString(),
            PublishedAtUtc = run.PublishedAt ?? DateTime.UtcNow,
            PublishedByUserId = run.PublishedByUserId ?? SystemActorUserId
        };
    }

    public async Task<ResidentWeeklyTherapyAssignmentDto> OverrideAssignmentAsync(
        Guid centreId,
        OverrideResidentWeeklyTherapyAssignmentRequest request,
        CancellationToken cancellationToken = default)
    {
        var episode = await _dbContext.ResidentProgrammeEpisodes
            .SingleAsync(x => x.Id == request.EpisodeId && x.CentreId == centreId, cancellationToken);

        var existingAssignments = await _dbContext.ResidentWeeklyTherapyAssignments
            .Where(x =>
                x.ResidentId == request.ResidentId &&
                x.EpisodeId == request.EpisodeId &&
                x.WeekStartDate == request.WeekStartDate)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        var supersededIds = existingAssignments
            .Where(x => x.SupersedesAssignmentId.HasValue)
            .Select(x => x.SupersedesAssignmentId!.Value)
            .ToHashSet();
        var latestCurrent = existingAssignments.LastOrDefault(x => !supersededIds.Contains(x.Id));
        var actorUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User);

        var replacement = new ResidentWeeklyTherapyAssignment
        {
            Id = Guid.NewGuid(),
            ResidentId = request.ResidentId,
            EpisodeId = request.EpisodeId,
            WeekStartDate = request.WeekStartDate,
            TherapyTopicId = request.TherapyTopicId,
            AssignmentSource = AssignmentSource.ManualOverride,
            OverrideReason = request.OverrideReason,
            SupersedesAssignmentId = latestCurrent?.Id,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = actorUserId
        };

        _dbContext.ResidentWeeklyTherapyAssignments.Add(replacement);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId,
            episode.UnitId,
            nameof(ResidentWeeklyTherapyAssignment),
            replacement.Id.ToString(),
            "Override",
            latestCurrent,
            replacement,
            request.OverrideReason,
            cancellationToken);

        return MapAssignment(replacement);
    }

    public async Task<TherapyTopicCompletionDto> CreateCompletionAsync(
        Guid centreId,
        CreateTherapyTopicCompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        var episode = await _dbContext.ResidentProgrammeEpisodes
            .SingleAsync(x => x.Id == request.EpisodeId && x.CentreId == centreId, cancellationToken);
        var preferences = await GetPreferencesAsync(centreId, episode.UnitId, cancellationToken);

        if (!preferences.AllowDuplicateCompletionsInEpisode)
        {
            var duplicateExists = await _dbContext.TherapyTopicCompletions.AnyAsync(
                x => x.EpisodeId == request.EpisodeId && x.TherapyTopicId == request.TherapyTopicId,
                cancellationToken);

            if (duplicateExists)
            {
                throw new DuplicateCompletionException(request.EpisodeId, request.TherapyTopicId);
            }
        }

        var completion = new TherapyTopicCompletion
        {
            Id = Guid.NewGuid(),
            ResidentId = request.ResidentId,
            EpisodeId = request.EpisodeId,
            TherapyTopicId = request.TherapyTopicId,
            CompletedOn = request.CompletedOn,
            EvidenceNoteId = request.EvidenceNoteId,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User)
        };

        _dbContext.TherapyTopicCompletions.Add(completion);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId,
            episode.UnitId,
            nameof(TherapyTopicCompletion),
            completion.Id.ToString(),
            "Create",
            null,
            completion,
            null,
            cancellationToken);

        return new TherapyTopicCompletionDto
        {
            CompletionId = completion.Id,
            ResidentId = completion.ResidentId,
            EpisodeId = completion.EpisodeId,
            TherapyTopicId = completion.TherapyTopicId,
            CompletedOn = completion.CompletedOn,
            EvidenceNoteId = completion.EvidenceNoteId,
            CreatedAtUtc = completion.CreatedAt,
            CreatedByUserId = completion.CreatedByUserId
        };
    }

    public async Task<TherapyProgressDto?> GetProgressAsync(Guid centreId, Guid episodeId, CancellationToken cancellationToken = default)
    {
        var episode = await _dbContext.ResidentProgrammeEpisodes
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == episodeId && x.CentreId == centreId, cancellationToken);
        if (episode is null)
        {
            return null;
        }

        var preferences = await GetPreferencesAsync(centreId, episode.UnitId, cancellationToken);

        var completedTopicIds = await _dbContext.TherapyTopicCompletions
            .AsNoTracking()
            .Where(x => x.EpisodeId == episodeId)
            .Select(x => x.TherapyTopicId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var activeTopicIds = await _dbContext.TherapyTopics
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var remainingTopicIds = activeTopicIds
            .Where(topicId => !completedTopicIds.Contains(topicId))
            .Take(Math.Max(preferences.TopicsRequired - completedTopicIds.Count, 0))
            .ToList();

        return new TherapyProgressDto
        {
            EpisodeId = episodeId,
            TopicsRequired = preferences.TopicsRequired,
            TopicsCompleted = completedTopicIds.Count,
            CompletedTopicIds = completedTopicIds,
            RemainingTopicIds = remainingTopicIds,
            ParticipationMode = episode.ParticipationMode.ToString(),
            CurrentWeekNumber = episode.CurrentWeekNumber
        };
    }

    public async Task<EpisodeEventDto?> CreateEpisodeEventAsync(
        Guid centreId,
        Guid episodeId,
        CreateEpisodeEventRequest request,
        CancellationToken cancellationToken = default)
    {
        var episode = await _dbContext.ResidentProgrammeEpisodes
            .SingleOrDefaultAsync(x => x.Id == episodeId && x.CentreId == centreId, cancellationToken);
        if (episode is null)
        {
            return null;
        }

        if (!Enum.TryParse<EpisodeEventType>(request.EventType, true, out var eventType))
        {
            throw new InvalidOperationException($"Unsupported eventType '{request.EventType}'.");
        }

        var payloadJson = request.Payload.ValueKind == JsonValueKind.Undefined
            ? "{}"
            : request.Payload.GetRawText();
        var actorUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User);

        var episodeEvent = new EpisodeEvent
        {
            Id = Guid.NewGuid(),
            EpisodeId = episodeId,
            EventType = eventType,
            EventDate = request.EventDate,
            PayloadJson = payloadJson,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = actorUserId
        };

        _dbContext.EpisodeEvents.Add(episodeEvent);

        var beforeEpisode = new
        {
            episode.ParticipationMode,
            episode.CohortId,
            episode.CurrentWeekNumber,
            episode.EndDate
        };

        ApplyEpisodeDerivedState(episode, eventType, request.EventDate, request.Payload);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            centreId,
            episode.UnitId,
            nameof(EpisodeEvent),
            episodeEvent.Id.ToString(),
            "Event",
            null,
            episodeEvent,
            request.Reason,
            cancellationToken);

        await _auditService.WriteAsync(
            centreId,
            episode.UnitId,
            nameof(ResidentProgrammeEpisode),
            episode.Id.ToString(),
            "Update",
            beforeEpisode,
            new
            {
                episode.ParticipationMode,
                episode.CohortId,
                episode.CurrentWeekNumber,
                episode.EndDate
            },
            request.Reason,
            cancellationToken);

        return new EpisodeEventDto
        {
            EventId = episodeEvent.Id,
            EpisodeId = episodeEvent.EpisodeId,
            EventType = episodeEvent.EventType.ToString(),
            EventDate = episodeEvent.EventDate,
            Reason = episodeEvent.Reason,
            Payload = JsonSerializer.Deserialize<JsonElement>(episodeEvent.PayloadJson),
            CreatedAtUtc = episodeEvent.CreatedAt,
            CreatedByUserId = episodeEvent.CreatedByUserId
        };
    }

    private async Task<TherapySchedulingPreferences> GetPreferencesAsync(
        Guid centreId,
        Guid? unitId,
        CancellationToken cancellationToken)
    {
        var unitConfig = unitId.HasValue
            ? await _dbContext.TherapySchedulingConfigs
                .AsNoTracking()
                .Where(x => x.CentreId == centreId && x.UnitId == unitId)
                .OrderBy(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken)
            : null;
        var centreConfig = await _dbContext.TherapySchedulingConfigs
            .AsNoTracking()
            .Where(x => x.CentreId == centreId && x.UnitId == null)
            .OrderBy(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);
        var config = unitConfig ?? centreConfig;

        if (config is null)
        {
            return new TherapySchedulingPreferences();
        }

        return new TherapySchedulingPreferences
        {
            DetoxWeeks = config.DetoxWeeks,
            TotalWeeks = config.TotalWeeks,
            MainProgrammeWeeks = config.MainProgrammeWeeks,
            TopicsRequired = config.TopicsRequired,
            TopicsRunningPerWeek = config.TopicsRunningPerWeek,
            AllowDuplicateCompletionsInEpisode = config.AllowDuplicateCompletionsInEpisode
        };
    }

    private static TherapySchedulingConfigDto MapConfig(
        TherapySchedulingConfig config,
        Guid centreId,
        Guid? requestedUnitId,
        bool isPersisted,
        string source)
    {
        return new TherapySchedulingConfigDto
        {
            ConfigId = config.Id,
            CentreId = centreId,
            UnitId = requestedUnitId,
            IntakeDayPreference = config.IntakeDayPreference.ToString(),
            ShiftIntakeIfPublicHoliday = config.ShiftIntakeIfPublicHoliday,
            DetoxWeeks = config.DetoxWeeks,
            TotalWeeks = config.TotalWeeks,
            MainProgrammeWeeks = config.MainProgrammeWeeks,
            TopicsRequired = config.TopicsRequired,
            TopicsRunningPerWeek = config.TopicsRunningPerWeek,
            WeekDefinition = config.WeekDefinition,
            HolidayCalendar = config.HolidayCalendarCode,
            AllowDuplicateCompletionsInEpisode = config.AllowDuplicateCompletionsInEpisode,
            IsPersisted = isPersisted,
            Source = source
        };
    }

    private static void ValidateConfigRequest(UpsertTherapySchedulingConfigRequest request)
    {
        if (!Enum.TryParse<DayOfWeek>(request.IntakeDayPreference, true, out _))
        {
            throw new InvalidOperationException("intakeDayPreference must be a valid day of week.");
        }

        if (request.DetoxWeeks < 0 || request.TotalWeeks <= 0 || request.MainProgrammeWeeks <= 0 ||
            request.TopicsRequired <= 0 || request.TopicsRunningPerWeek <= 0)
        {
            throw new InvalidOperationException("Week and topic values must be positive (detoxWeeks can be zero).");
        }

        if (request.DetoxWeeks > request.TotalWeeks)
        {
            throw new InvalidOperationException("detoxWeeks cannot exceed totalWeeks.");
        }

        if (request.MainProgrammeWeeks != request.TotalWeeks - request.DetoxWeeks)
        {
            throw new InvalidOperationException("mainProgrammeWeeks must equal totalWeeks - detoxWeeks.");
        }

        if (string.IsNullOrWhiteSpace(request.WeekDefinition))
        {
            throw new InvalidOperationException("weekDefinition is required.");
        }

        if (string.IsNullOrWhiteSpace(request.HolidayCalendar))
        {
            throw new InvalidOperationException("holidayCalendar is required.");
        }
    }

    private static Guid SelectTopicForEpisode(
        ResidentProgrammeEpisode episode,
        IReadOnlyList<Guid> candidates,
        IReadOnlyDictionary<Guid, int> topicCounts,
        IReadOnlyDictionary<Guid, Guid> cohortPreferredTopic)
    {
        if (episode.CohortId.HasValue &&
            cohortPreferredTopic.TryGetValue(episode.CohortId.Value, out var preferredTopicId) &&
            candidates.Contains(preferredTopicId))
        {
            return preferredTopicId;
        }

        return candidates
            .OrderBy(topicId => topicCounts.TryGetValue(topicId, out var count) ? count : int.MaxValue)
            .ThenBy(topicId => topicId)
            .First();
    }

    private static void ApplyEpisodeDerivedState(
        ResidentProgrammeEpisode episode,
        EpisodeEventType eventType,
        DateOnly eventDate,
        JsonElement payload)
    {
        switch (eventType)
        {
            case EpisodeEventType.Paused:
                episode.ParticipationMode = ParticipationMode.Paused;
                break;
            case EpisodeEventType.Resumed:
                episode.ParticipationMode = ParticipationMode.FullProgramme;
                break;
            case EpisodeEventType.WeekRepositioned:
                if (TryGetInt(payload, "currentWeekNumber", out var weekNumber))
                {
                    episode.CurrentWeekNumber = weekNumber;
                }
                break;
            case EpisodeEventType.CohortChanged:
                if (TryGetGuid(payload, "cohortId", out var cohortId))
                {
                    episode.CohortId = cohortId;
                }
                break;
            case EpisodeEventType.ParticipationModeChanged:
                if (TryGetString(payload, "participationMode", out var mode) &&
                    Enum.TryParse<ParticipationMode>(mode, true, out var parsedMode))
                {
                    episode.ParticipationMode = parsedMode;
                }
                break;
            case EpisodeEventType.Ejected:
                episode.ParticipationMode = ParticipationMode.Removed;
                episode.EndDate = eventDate;
                break;
            case EpisodeEventType.Completed:
                episode.ParticipationMode = ParticipationMode.Removed;
                episode.EndDate = eventDate;
                break;
        }
    }

    private static bool TryGetGuid(JsonElement payload, string propertyName, out Guid value)
    {
        value = Guid.Empty;
        if (payload.ValueKind != JsonValueKind.Object || !payload.TryGetProperty(propertyName, out var property))
        {
            return false;
        }

        return Guid.TryParse(property.GetString(), out value);
    }

    private static bool TryGetInt(JsonElement payload, string propertyName, out int value)
    {
        value = 0;
        if (payload.ValueKind != JsonValueKind.Object || !payload.TryGetProperty(propertyName, out var property))
        {
            return false;
        }

        return property.TryGetInt32(out value);
    }

    private static bool TryGetString(JsonElement payload, string propertyName, out string value)
    {
        value = string.Empty;
        if (payload.ValueKind != JsonValueKind.Object || !payload.TryGetProperty(propertyName, out var property))
        {
            return false;
        }

        var candidate = property.GetString();
        if (string.IsNullOrWhiteSpace(candidate))
        {
            return false;
        }

        value = candidate;
        return true;
    }

    private static Guid ResolveActorUserId(ClaimsPrincipal? user)
    {
        if (user is null)
        {
            return SystemActorUserId;
        }

        var candidateClaims = new[] { ClaimTypes.NameIdentifier, "sub", "userid", "user_id" };
        foreach (var claimType in candidateClaims)
        {
            var claimValue = user.FindFirstValue(claimType);
            if (!string.IsNullOrWhiteSpace(claimValue) && Guid.TryParse(claimValue, out var parsed))
            {
                return parsed;
            }
        }

        return SystemActorUserId;
    }

    private static List<Guid> ParseTopicsRunning(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<Guid>();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<List<Guid>>(json);
            return parsed ?? new List<Guid>();
        }
        catch (JsonException)
        {
            return new List<Guid>();
        }
    }

    private static TherapyTopicDto MapTopic(TherapyTopic topic)
    {
        return new TherapyTopicDto
        {
            Id = topic.Id,
            Code = topic.Code,
            DefaultName = topic.DefaultName,
            IsActive = topic.IsActive
        };
    }

    private static ResidentWeeklyTherapyAssignmentDto MapAssignment(ResidentWeeklyTherapyAssignment assignment)
    {
        return new ResidentWeeklyTherapyAssignmentDto
        {
            AssignmentId = assignment.Id,
            ResidentId = assignment.ResidentId,
            EpisodeId = assignment.EpisodeId,
            WeekStartDate = assignment.WeekStartDate,
            TherapyTopicId = assignment.TherapyTopicId,
            AssignmentSource = assignment.AssignmentSource.ToString(),
            OverrideReason = assignment.OverrideReason,
            SupersedesAssignmentId = assignment.SupersedesAssignmentId,
            CreatedAtUtc = assignment.CreatedAt,
            CreatedByUserId = assignment.CreatedByUserId
        };
    }
}
