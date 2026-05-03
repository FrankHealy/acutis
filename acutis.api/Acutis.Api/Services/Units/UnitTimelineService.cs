using System.Security.Claims;
using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Units;

public interface IUnitTimelineService
{
    Task<IReadOnlyList<UnitTimelineItemDto>> GetTimelineAsync(string unitCode, DateOnly? date = null, CancellationToken cancellationToken = default);
    Task<UnitTimelineItemDto> TakeEventAsync(string unitCode, TakeUnitTimelineEventRequest request, CancellationToken cancellationToken = default);
    Task<Guid?> ResolveCurrentAppUserIdAsync(CancellationToken cancellationToken = default);
}

public sealed class UnitTimelineService : IUnitTimelineService
{
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UnitTimelineService(
        AcutisDbContext dbContext,
        IAuditService auditService,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _auditService = auditService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IReadOnlyList<UnitTimelineItemDto>> GetTimelineAsync(
        string unitCode,
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.Today);
        return await LoadTimelineItemsAsync(unit, targetDate, cancellationToken);
    }

    public async Task<UnitTimelineItemDto> TakeEventAsync(
        string unitCode,
        TakeUnitTimelineEventRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Key))
        {
            throw new InvalidOperationException("Timeline item key is required.");
        }

        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var currentAppUserId = await ResolveCurrentAppUserIdAsync(cancellationToken);
        if (!currentAppUserId.HasValue)
        {
            throw new InvalidOperationException("Your signed-in account is not mapped to an application user.");
        }

        var currentUser = await _dbContext.AppUsers
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == currentAppUserId.Value && x.IsActive, cancellationToken)
            ?? throw new InvalidOperationException("Your application user record is not active.");

        var source = request.Source.Trim().ToLowerInvariant();
        ScheduleOccurrence occurrence;

        if (source == "occurrence")
        {
            if (!Guid.TryParse(request.Key, out var occurrenceId))
            {
                throw new InvalidOperationException("Timeline occurrence key is invalid.");
            }

            occurrence = await _dbContext.ScheduleOccurrences
                .Include(x => x.AssignedFacilitatorUser)
                .SingleOrDefaultAsync(x =>
                    x.Id == occurrenceId &&
                    x.CentreId == unit.CentreId &&
                    x.ScheduledDate == request.ScheduledDate &&
                    (x.UnitId == null || x.UnitId == unit.Id) &&
                    x.Status != ScheduleOccurrenceStatus.Cancelled,
                    cancellationToken)
                ?? throw new InvalidOperationException("Timeline event was not found.");
        }
        else if (source == "template")
        {
            if (!Guid.TryParse(request.Key, out var templateId))
            {
                throw new InvalidOperationException("Timeline template key is invalid.");
            }

            occurrence = await MaterializeOccurrenceFromTemplateAsync(unit, templateId, request.ScheduledDate, cancellationToken);
        }
        else
        {
            throw new InvalidOperationException($"Unsupported timeline source '{request.Source}'.");
        }

        if (!RequiresFacilitatorAssignment(occurrence.Title, occurrence.Category, occurrence.FacilitatorType))
        {
            throw new InvalidOperationException("This timeline event does not accept a facilitator claim.");
        }

        var before = new
        {
            occurrence.Id,
            occurrence.Title,
            AssignedFacilitatorUserId = occurrence.AssignedFacilitatorUserId,
            AssignedFacilitatorName = occurrence.AssignedFacilitatorUser?.DisplayName
        };

        occurrence.AssignedFacilitatorUserId = currentUser.Id;
        occurrence.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var after = new
        {
            occurrence.Id,
            occurrence.Title,
            AssignedFacilitatorUserId = currentUser.Id,
            AssignedFacilitatorName = currentUser.DisplayName
        };

        await _auditService.WriteAsync(
            unit.CentreId,
            unit.Id,
            nameof(ScheduleOccurrence),
            occurrence.Id.ToString(),
            "TakeEvent",
            before,
            after,
            "Timeline event claimed by facilitator.",
            cancellationToken);

        occurrence.AssignedFacilitatorUser = currentUser;
        return MapOccurrence(occurrence);
    }

    public async Task<Guid?> ResolveCurrentAppUserIdAsync(CancellationToken cancellationToken = default)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user is null)
        {
            return null;
        }

        var subjectClaims = new[]
        {
            user.FindFirstValue("sub"),
            user.FindFirstValue(ClaimTypes.NameIdentifier)
        }.Where(value => !string.IsNullOrWhiteSpace(value)).Cast<string>().Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        if (subjectClaims.Count > 0)
        {
            var bySubject = await _dbContext.AppUsers
                .AsNoTracking()
                .Where(x => x.IsActive && subjectClaims.Contains(x.ExternalSubject))
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);
            if (bySubject != Guid.Empty)
            {
                return bySubject;
            }
        }

        foreach (var subject in subjectClaims)
        {
            if (Guid.TryParse(subject, out var userId))
            {
                var exists = await _dbContext.AppUsers.AsNoTracking().AnyAsync(x => x.Id == userId && x.IsActive, cancellationToken);
                if (exists)
                {
                    return userId;
                }
            }
        }

        return null;
    }

    private async Task<IReadOnlyList<UnitTimelineItemDto>> LoadTimelineItemsAsync(
        Domain.Entities.Unit unit,
        DateOnly targetDate,
        CancellationToken cancellationToken)
    {
        var rawOccurrences = await _dbContext.ScheduleOccurrences
            .AsNoTracking()
            .Include(x => x.AssignedFacilitatorUser)
            .Where(x =>
                x.CentreId == unit.CentreId &&
                x.ScheduledDate == targetDate &&
                (x.UnitId == null || x.UnitId == unit.Id))
            .OrderBy(x => x.StartTime)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);

        var explicitTemplateIds = rawOccurrences
            .Where(x => x.TemplateId.HasValue)
            .Select(x => x.TemplateId!.Value)
            .ToHashSet();

        var visibleOccurrences = rawOccurrences
            .Where(x => x.Status != ScheduleOccurrenceStatus.Cancelled)
            .Select(MapOccurrence)
            .ToList();

        var activeTemplates = await _dbContext.ScheduleTemplates
            .AsNoTracking()
            .Where(x =>
                x.CentreId == unit.CentreId &&
                x.IsActive &&
                (x.UnitId == null || x.UnitId == unit.Id))
            .OrderBy(x => x.StartTime)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        var templates = activeTemplates
            .Where(x => MatchesRecurrence(x, targetDate))
            .ToList();

        var derivedItems = templates
            .Where(x => !explicitTemplateIds.Contains(x.Id))
            .Select(template => MapTemplate(template, targetDate))
            .ToList();

        return visibleOccurrences
            .Concat(derivedItems)
            .OrderBy(x => x.TimeMinutes)
            .ThenBy(x => x.Title)
            .ToList();
    }

    private async Task<ScheduleOccurrence> MaterializeOccurrenceFromTemplateAsync(
        Domain.Entities.Unit unit,
        Guid templateId,
        DateOnly scheduledDate,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.ScheduleOccurrences
            .Include(x => x.AssignedFacilitatorUser)
            .SingleOrDefaultAsync(x =>
                x.TemplateId == templateId &&
                x.CentreId == unit.CentreId &&
                x.ScheduledDate == scheduledDate &&
                (x.UnitId == null || x.UnitId == unit.Id),
                cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var template = await _dbContext.ScheduleTemplates
            .AsNoTracking()
            .SingleOrDefaultAsync(x =>
                x.Id == templateId &&
                x.CentreId == unit.CentreId &&
                x.IsActive &&
                (x.UnitId == null || x.UnitId == unit.Id),
                cancellationToken)
            ?? throw new InvalidOperationException("Timeline template was not found.");

        var now = DateTime.UtcNow;
        var occurrence = new ScheduleOccurrence
        {
            Id = Guid.NewGuid(),
            CentreId = unit.CentreId,
            UnitId = template.UnitId ?? unit.Id,
            ProgrammeDefinitionId = template.ProgrammeDefinitionId,
            TemplateId = template.Id,
            Title = template.Name,
            Description = template.Description,
            Category = template.Category,
            ScheduledDate = scheduledDate,
            StartTime = template.StartTime,
            EndTime = template.EndTime,
            AudienceType = template.AudienceType,
            FacilitatorType = template.FacilitatorType,
            FacilitatorRole = template.FacilitatorRole,
            ExternalResourceName = template.ExternalResourceName,
            Status = ScheduleOccurrenceStatus.Scheduled,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.ScheduleOccurrences.Add(occurrence);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return occurrence;
    }

    private async Task<Domain.Entities.Unit> GetUnitAsync(string unitCode, CancellationToken cancellationToken)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        return await _dbContext.Units
            .AsNoTracking()
            .Include(x => x.Centre)
            .FirstOrDefaultAsync(x => x.Code == normalizedUnitCode && x.IsActive, cancellationToken)
            ?? throw new InvalidOperationException($"Unit '{unitCode}' was not found.");
    }

    private static UnitTimelineItemDto MapOccurrence(ScheduleOccurrence occurrence)
    {
        var startTime = occurrence.StartTime ?? TimeSpan.Zero;
        var requiresFacilitator = RequiresFacilitatorAssignment(occurrence.Title, occurrence.Category, occurrence.FacilitatorType);
        return new UnitTimelineItemDto
        {
            Key = occurrence.Id.ToString(),
            Title = occurrence.Title,
            Description = occurrence.Description,
            Category = occurrence.Category ?? string.Empty,
            Time = startTime.ToString(@"hh\:mm"),
            TimeMinutes = startTime.Hours * 60 + startTime.Minutes,
            EndTime = occurrence.EndTime?.ToString(@"hh\:mm") ?? string.Empty,
            Source = "occurrence",
            ScheduledDate = occurrence.ScheduledDate.ToString("yyyy-MM-dd"),
            RequiresFacilitator = requiresFacilitator,
            CanTakeEvent = requiresFacilitator,
            AssignedFacilitatorUserId = occurrence.AssignedFacilitatorUserId,
            AssignedFacilitatorName = occurrence.AssignedFacilitatorUser?.DisplayName ?? string.Empty
        };
    }

    private static UnitTimelineItemDto MapTemplate(ScheduleTemplate template, DateOnly scheduledDate)
    {
        var startTime = template.StartTime ?? TimeSpan.Zero;
        var requiresFacilitator = RequiresFacilitatorAssignment(template.Name, template.Category, template.FacilitatorType);
        return new UnitTimelineItemDto
        {
            Key = template.Id.ToString(),
            Title = template.Name,
            Description = template.Description,
            Category = template.Category ?? string.Empty,
            Time = startTime.ToString(@"hh\:mm"),
            TimeMinutes = startTime.Hours * 60 + startTime.Minutes,
            EndTime = template.EndTime?.ToString(@"hh\:mm") ?? string.Empty,
            Source = "template",
            ScheduledDate = scheduledDate.ToString("yyyy-MM-dd"),
            RequiresFacilitator = requiresFacilitator,
            CanTakeEvent = requiresFacilitator,
            AssignedFacilitatorUserId = null,
            AssignedFacilitatorName = string.Empty
        };
    }

    private static bool RequiresFacilitatorAssignment(
        string title,
        string? category,
        ScheduleFacilitatorType facilitatorType)
    {
        if (facilitatorType == ScheduleFacilitatorType.Staff)
        {
            return true;
        }

        var normalizedTitle = title.Trim().ToLowerInvariant();
        var normalizedCategory = category?.Trim().ToLowerInvariant() ?? string.Empty;

        return normalizedTitle.Contains("roll call", StringComparison.Ordinal) ||
               normalizedTitle.Contains("meditation", StringComparison.Ordinal) ||
               normalizedTitle.Contains("ot meeting", StringComparison.Ordinal) ||
               normalizedTitle.Contains("focus", StringComparison.Ordinal) ||
               normalizedTitle.Contains("group", StringComparison.Ordinal) ||
               normalizedCategory.Contains("focus", StringComparison.Ordinal) ||
               normalizedCategory.Contains("group", StringComparison.Ordinal);
    }

    private static bool MatchesRecurrence(ScheduleTemplate template, DateOnly targetDate)
    {
        return template.RecurrenceType switch
        {
            ScheduleRecurrenceType.Daily => true,
            ScheduleRecurrenceType.Weekly => template.WeeklyDayOfWeek == targetDate.DayOfWeek,
            ScheduleRecurrenceType.Monthly => MatchesMonthly(template, targetDate, 1),
            ScheduleRecurrenceType.BiMonthly => MatchesMonthly(template, targetDate, 2),
            _ => false
        };
    }

    private static bool MatchesMonthly(ScheduleTemplate template, DateOnly targetDate, int monthInterval)
    {
        if (!template.MonthlyDayOfMonth.HasValue || !template.RecurrenceStartDate.HasValue)
        {
            return false;
        }

        var startDate = template.RecurrenceStartDate.Value;
        if (targetDate < startDate)
        {
            return false;
        }

        var expectedDay = Math.Min(template.MonthlyDayOfMonth.Value, DateTime.DaysInMonth(targetDate.Year, targetDate.Month));
        if (targetDate.Day != expectedDay)
        {
            return false;
        }

        var monthsDifference = ((targetDate.Year - startDate.Year) * 12) + (targetDate.Month - startDate.Month);
        return monthsDifference >= 0 && monthsDifference % monthInterval == 0;
    }
}
