using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Acutis.Api.Services.GroupTherapy;

public interface IGroupTherapyService
{
    Task<GroupTherapyProgramResponse?> GetProgramAsync(
        string unitCode,
        string programCode,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<GroupTherapyResidentRemarkDto>> GetRemarksAsync(
        string unitCode,
        string programCode,
        string moduleKey,
        CancellationToken cancellationToken = default);

    Task<GroupTherapyResidentRemarkDto> UpsertRemarkAsync(
        UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<GroupTherapyResidentObservationDto>> GetObservationsAsync(
        string unitCode,
        string programCode,
        string moduleKey,
        int sessionNumber,
        CancellationToken cancellationToken = default);

    Task<GroupTherapyFacilitationOptionsDto> GetFacilitationOptionsAsync(
        string unitCode,
        string programCode,
        CancellationToken cancellationToken = default);

    Task<GroupTherapyResidentObservationDto> UpsertObservationAsync(
        UpsertGroupTherapyResidentObservationRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);
}

public sealed class GroupTherapyService : IGroupTherapyService
{
    private readonly AcutisDbContext _dbContext;

    public GroupTherapyService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GroupTherapyProgramResponse?> GetProgramAsync(
        string unitCode,
        string programCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = programCode.Trim().ToLowerInvariant();

        var subjects = await _dbContext.GroupTherapySubjectTemplates
            .AsNoTracking()
            .Include(subject => subject.DailyQuestions)
            .Where(subject =>
                subject.IsActive &&
                subject.UnitCode.ToLower() == normalizedUnitCode &&
                subject.ProgramCode.ToLower() == normalizedProgramCode)
            .OrderBy(subject => subject.WeekNumber)
            .ToListAsync(cancellationToken);

        if (subjects.Count == 0)
        {
            return null;
        }

        return new GroupTherapyProgramResponse
        {
            UnitCode = subjects[0].UnitCode,
            ProgramCode = subjects[0].ProgramCode,
            Weeks = subjects.Select(subject => new GroupTherapyWeekDto
            {
                WeekNumber = subject.WeekNumber,
                Topic = subject.Topic,
                IntroText = subject.IntroText,
                Days = subject.DailyQuestions
                    .Where(question => question.IsActive)
                    .GroupBy(question => question.DayNumber)
                    .OrderBy(group => group.Key)
                    .Select(group => new GroupTherapyDayDto
                    {
                        DayNumber = group.Key,
                        Questions = group
                            .OrderBy(question => question.SortOrder)
                            .Select(question => question.QuestionText)
                            .ToList()
                    })
                    .ToList()
            }).ToList()
        };
    }

    public async Task<IReadOnlyList<GroupTherapyResidentRemarkDto>> GetRemarksAsync(
        string unitCode,
        string programCode,
        string moduleKey,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = programCode.Trim().ToLowerInvariant();
        var normalizedModuleKey = moduleKey.Trim().ToLowerInvariant();

        var remarks = await _dbContext.GroupTherapyResidentRemarks
            .AsNoTracking()
            .Where(remark =>
                remark.UnitCode.ToLower() == normalizedUnitCode &&
                remark.ProgramCode.ToLower() == normalizedProgramCode &&
                remark.ModuleKey.ToLower() == normalizedModuleKey)
            .OrderBy(remark => remark.ResidentId)
            .ToListAsync(cancellationToken);

        return remarks.Select(MapRemark).ToList();
    }

    public async Task<GroupTherapyResidentRemarkDto> UpsertRemarkAsync(
        UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = request.UnitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = request.ProgramCode.Trim().ToLowerInvariant();
        var normalizedModuleKey = request.ModuleKey.Trim().ToLowerInvariant();
        var sanitizedNoteLines = request.NoteLines
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        var sanitizedFreeText = request.FreeText.Trim();
        var nowUtc = DateTime.UtcNow;

        var existing = await _dbContext.GroupTherapyResidentRemarks
            .SingleOrDefaultAsync(
                remark =>
                    remark.UnitCode == normalizedUnitCode &&
                    remark.ProgramCode == normalizedProgramCode &&
                    remark.ModuleKey == normalizedModuleKey &&
                    remark.ResidentId == request.ResidentId,
                cancellationToken);

        if (existing is null)
        {
            existing = new GroupTherapyResidentRemark
            {
                Id = Guid.NewGuid(),
                UnitCode = normalizedUnitCode,
                ProgramCode = normalizedProgramCode,
                ModuleKey = normalizedModuleKey,
                ResidentId = request.ResidentId,
                CreatedAtUtc = nowUtc
            };
            _dbContext.GroupTherapyResidentRemarks.Add(existing);
        }

        existing.NoteLinesJson = JsonSerializer.Serialize(sanitizedNoteLines);
        existing.FreeText = sanitizedFreeText;
        existing.UpdatedAtUtc = nowUtc;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapRemark(existing);
    }

    public async Task<IReadOnlyList<GroupTherapyResidentObservationDto>> GetObservationsAsync(
        string unitCode,
        string programCode,
        string moduleKey,
        int sessionNumber,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = programCode.Trim().ToLowerInvariant();
        var normalizedModuleKey = moduleKey.Trim().ToLowerInvariant();

        var observations = await _dbContext.GroupTherapyResidentObservations
            .AsNoTracking()
            .Include(observation => observation.ConversationThemes)
                .ThenInclude(link => link.ConversationTheme)
            .Where(observation =>
                observation.UnitCode.ToLower() == normalizedUnitCode &&
                observation.ProgramCode.ToLower() == normalizedProgramCode &&
                observation.ModuleKey.ToLower() == normalizedModuleKey &&
                observation.SessionNumber == sessionNumber)
            .OrderBy(observation => observation.ObservedAtUtc)
            .ThenBy(observation => observation.ResidentId)
            .ToListAsync(cancellationToken);

        return observations.Select(MapObservation).ToList();
    }

    public async Task<GroupTherapyFacilitationOptionsDto> GetFacilitationOptionsAsync(
        string unitCode,
        string programCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = programCode.Trim().ToLowerInvariant();

        var themes = await _dbContext.GroupTherapyConversationThemes
            .AsNoTracking()
            .Where(theme =>
                theme.IsActive &&
                (theme.ProgramCode == null || theme.ProgramCode.ToLower() == normalizedProgramCode) &&
                (theme.UnitCode == null || theme.UnitCode.ToLower() == normalizedUnitCode))
            .OrderBy(theme => theme.UnitCode == null ? 0 : 1)
            .ThenBy(theme => theme.SortOrder)
            .ThenBy(theme => theme.Label)
            .ToListAsync(cancellationToken);

        var configs = await _dbContext.GroupTherapyFacilitationConfigs
            .AsNoTracking()
            .Where(config =>
                config.IsActive &&
                config.ProgramCode.ToLower() == normalizedProgramCode &&
                (config.UnitCode == null || config.UnitCode.ToLower() == normalizedUnitCode))
            .OrderBy(config => config.UnitCode == null ? 0 : 1)
            .ThenBy(config => config.SortOrder)
            .ThenBy(config => config.CounsellorStyle)
            .ToListAsync(cancellationToken);

        return new GroupTherapyFacilitationOptionsDto
        {
            UnitCode = normalizedUnitCode,
            ProgramCode = normalizedProgramCode,
            ConversationThemes = themes.Select(MapConversationTheme).ToList(),
            Configs = configs.Select(MapFacilitationConfig).ToList()
        };
    }

    public async Task<GroupTherapyResidentObservationDto> UpsertObservationAsync(
        UpsertGroupTherapyResidentObservationRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = request.UnitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = request.ProgramCode.Trim().ToLowerInvariant();
        var normalizedModuleKey = request.ModuleKey.Trim().ToLowerInvariant();
        var selectedTerms = request.SelectedTerms
            .Select(term => term.Trim())
            .Where(term => !string.IsNullOrWhiteSpace(term))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        var selectedThemeIds = request.ConversationThemeIds
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        var nowUtc = DateTime.UtcNow;
        var notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await ValidateObservationRequestAsync(request, cancellationToken);
        var observerUserId = await ResolveObserverUserIdAsync(actorUserId, cancellationToken);

        var existing = await _dbContext.GroupTherapyResidentObservations
            .SingleOrDefaultAsync(
                observation =>
                    observation.UnitCode == normalizedUnitCode &&
                    observation.ProgramCode == normalizedProgramCode &&
                    observation.ModuleKey == normalizedModuleKey &&
                    observation.SessionNumber == request.SessionNumber &&
                    observation.ResidentId == request.ResidentId,
                cancellationToken);

        if (existing is null)
        {
            existing = new GroupTherapyResidentObservation
            {
                Id = Guid.NewGuid(),
                UnitCode = normalizedUnitCode,
                ProgramCode = normalizedProgramCode,
                ModuleKey = normalizedModuleKey,
                SessionNumber = request.SessionNumber,
                ResidentId = request.ResidentId,
                CreatedAtUtc = nowUtc
            };
            _dbContext.GroupTherapyResidentObservations.Add(existing);
        }

        existing.ResidentCaseId = request.ResidentCaseId;
        existing.EpisodeId = request.EpisodeId;
        existing.EpisodeEventId = request.EpisodeEventId;
        existing.ObserverUserId = observerUserId;
        existing.ObservedAtUtc = request.ObservedAtUtc;
        existing.SelectedTermsJson = JsonSerializer.Serialize(selectedTerms);
        existing.Notes = notes;
        existing.UpdatedAtUtc = nowUtc;

        await _dbContext.SaveChangesAsync(cancellationToken);
        var selectedThemes = await ReplaceObservationThemesAsync(
            existing.Id,
            selectedThemeIds,
            normalizedUnitCode,
            normalizedProgramCode,
            nowUtc,
            cancellationToken);
        var response = MapObservation(existing);
        response.ConversationThemes = selectedThemes;
        return response;
    }

    private static GroupTherapyResidentRemarkDto MapRemark(GroupTherapyResidentRemark remark)
    {
        List<string>? noteLines = null;

        if (!string.IsNullOrWhiteSpace(remark.NoteLinesJson))
        {
            try
            {
                noteLines = JsonSerializer.Deserialize<List<string>>(remark.NoteLinesJson);
            }
            catch (JsonException)
            {
                noteLines = null;
            }
        }

        return new GroupTherapyResidentRemarkDto
        {
            Id = remark.Id,
            ResidentId = remark.ResidentId,
            ModuleKey = remark.ModuleKey,
            NoteLines = noteLines ?? new List<string>(),
            FreeText = remark.FreeText,
            CreatedAtUtc = remark.CreatedAtUtc,
            UpdatedAtUtc = remark.UpdatedAtUtc
        };
    }

    private static GroupTherapyResidentObservationDto MapObservation(GroupTherapyResidentObservation observation)
    {
        List<string>? selectedTerms = null;

        if (!string.IsNullOrWhiteSpace(observation.SelectedTermsJson))
        {
            try
            {
                selectedTerms = JsonSerializer.Deserialize<List<string>>(observation.SelectedTermsJson);
            }
            catch (JsonException)
            {
                selectedTerms = null;
            }
        }

        return new GroupTherapyResidentObservationDto
        {
            Id = observation.Id,
            ResidentId = observation.ResidentId,
            ResidentCaseId = observation.ResidentCaseId,
            EpisodeId = observation.EpisodeId,
            EpisodeEventId = observation.EpisodeEventId,
            ObserverUserId = observation.ObserverUserId,
            ModuleKey = observation.ModuleKey,
            SessionNumber = observation.SessionNumber,
            ObservedAtUtc = observation.ObservedAtUtc,
            SelectedTerms = selectedTerms ?? new List<string>(),
            ConversationThemes = observation.ConversationThemes
                .Where(link => link.ConversationTheme is not null)
                .OrderBy(link => link.ConversationTheme.SortOrder)
                .Select(link => MapConversationTheme(link.ConversationTheme))
                .ToList(),
            Notes = observation.Notes,
            CreatedAtUtc = observation.CreatedAtUtc,
            UpdatedAtUtc = observation.UpdatedAtUtc
        };
    }

    private static GroupTherapyConversationThemeDto MapConversationTheme(GroupTherapyConversationTheme theme)
    {
        return new GroupTherapyConversationThemeDto
        {
            Id = theme.Id,
            Code = theme.Code,
            Label = theme.Label,
            Description = theme.Description,
            SortOrder = theme.SortOrder
        };
    }

    private static GroupTherapyFacilitationConfigDto MapFacilitationConfig(GroupTherapyFacilitationConfig config)
    {
        return new GroupTherapyFacilitationConfigDto
        {
            Id = config.Id,
            CounsellorStyle = config.CounsellorStyle,
            IsTimingEnabled = config.IsTimingEnabled,
            SessionDurationMinutes = config.SessionDurationMinutes,
            ResidentDurationMinutes = config.ResidentDurationMinutes,
            ResidentTimeMultiplier = config.ResidentTimeMultiplier,
            SortOrder = config.SortOrder
        };
    }

    private async Task<List<GroupTherapyConversationThemeDto>> ReplaceObservationThemesAsync(
        Guid observationId,
        IReadOnlyCollection<Guid> selectedThemeIds,
        string unitCode,
        string programCode,
        DateTime nowUtc,
        CancellationToken cancellationToken)
    {
        var existingLinks = await _dbContext.GroupTherapyObservationConversationThemes
            .Where(link => link.ObservationId == observationId)
            .ToListAsync(cancellationToken);

        if (existingLinks.Count > 0)
        {
            _dbContext.GroupTherapyObservationConversationThemes.RemoveRange(existingLinks);
        }

        var selectedThemes = new List<GroupTherapyConversationTheme>();
        if (selectedThemeIds.Count > 0)
        {
            selectedThemes = await _dbContext.GroupTherapyConversationThemes
                .AsNoTracking()
                .Where(theme =>
                    theme.IsActive &&
                    selectedThemeIds.Contains(theme.Id) &&
                    (theme.ProgramCode == null || theme.ProgramCode.ToLower() == programCode) &&
                    (theme.UnitCode == null || theme.UnitCode.ToLower() == unitCode))
                .ToListAsync(cancellationToken);

            _dbContext.GroupTherapyObservationConversationThemes.AddRange(selectedThemes.Select(theme =>
                new GroupTherapyObservationConversationTheme
                {
                    ObservationId = observationId,
                    ConversationThemeId = theme.Id,
                    CreatedAtUtc = nowUtc
                }));
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return selectedThemes
            .OrderBy(theme => theme.SortOrder)
            .ThenBy(theme => theme.Label)
            .Select(MapConversationTheme)
            .ToList();
    }

    private async Task ValidateObservationRequestAsync(
        UpsertGroupTherapyResidentObservationRequest request,
        CancellationToken cancellationToken)
    {
        var residentExists = await _dbContext.Residents
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.ResidentId, cancellationToken);
        if (!residentExists)
        {
            throw new InvalidOperationException($"Resident '{request.ResidentId}' was not found.");
        }

        if (request.ResidentCaseId.HasValue)
        {
            var caseExists = await _dbContext.ResidentCases
                .AsNoTracking()
                .AnyAsync(x => x.Id == request.ResidentCaseId.Value, cancellationToken);
            if (!caseExists)
            {
                throw new InvalidOperationException($"ResidentCase '{request.ResidentCaseId}' was not found.");
            }
        }

        if (request.EpisodeId.HasValue)
        {
            var episodeExists = await _dbContext.ResidentProgrammeEpisodes
                .AsNoTracking()
                .AnyAsync(x => x.Id == request.EpisodeId.Value && x.ResidentId == request.ResidentId, cancellationToken);
            if (!episodeExists)
            {
                throw new InvalidOperationException($"Episode '{request.EpisodeId}' was not found for resident '{request.ResidentId}'.");
            }
        }

        if (request.EpisodeEventId.HasValue)
        {
            var eventExists = await _dbContext.EpisodeEvents
                .AsNoTracking()
                .AnyAsync(
                    x => x.Id == request.EpisodeEventId.Value &&
                         (!request.EpisodeId.HasValue || x.EpisodeId == request.EpisodeId.Value),
                    cancellationToken);
            if (!eventExists)
            {
                throw new InvalidOperationException($"EpisodeEvent '{request.EpisodeEventId}' was not found.");
            }
        }
    }

    private async Task<Guid> ResolveObserverUserIdAsync(Guid actorUserId, CancellationToken cancellationToken)
    {
        if (actorUserId != Guid.Empty)
        {
            var actorExists = await _dbContext.AppUsers
                .AsNoTracking()
                .AnyAsync(x => x.Id == actorUserId, cancellationToken);

            if (actorExists)
            {
                return actorUserId;
            }
        }

        var existingUserId = await _dbContext.AppUsers
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.CreatedAtUtc)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingUserId.HasValue)
        {
            return existingUserId.Value;
        }

        var systemUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var now = DateTime.UtcNow;

        _dbContext.AppUsers.Add(new AppUser
        {
            Id = systemUserId,
            ExternalSubject = "system",
            UserName = "system",
            DisplayName = "System",
            Email = "system@local.invalid",
            IsActive = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return systemUserId;
    }
}
