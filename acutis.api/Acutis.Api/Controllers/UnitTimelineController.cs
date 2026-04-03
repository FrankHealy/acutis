using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/units/{unitCode}/timeline")]
[Authorize]
public sealed class UnitTimelineController : ControllerBase
{
    private readonly AcutisDbContext _dbContext;

    public UnitTimelineController(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UnitTimelineItemDto>>> GetTimeline(
        string unitCode,
        [FromQuery] DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var unit = await _dbContext.Units
            .AsNoTracking()
            .Include(x => x.Centre)
            .FirstOrDefaultAsync(x => x.Code == normalizedUnitCode && x.IsActive, cancellationToken);

        if (unit is null)
        {
            return NotFound($"Unit '{unitCode}' was not found.");
        }

        var targetDate = date ?? DateOnly.FromDateTime(DateTime.Today);

        var rawOccurrences = await _dbContext.ScheduleOccurrences
            .AsNoTracking()
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
            .Where(x => x.Status != Acutis.Domain.Entities.ScheduleOccurrenceStatus.Cancelled)
            .Select(MapOccurrence)
            .ToList();

        if (targetDate.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            return Ok(visibleOccurrences);
        }

        var templates = await _dbContext.ScheduleTemplates
            .AsNoTracking()
            .Where(x =>
                x.CentreId == unit.CentreId &&
                x.IsActive &&
                (x.UnitId == null || x.UnitId == unit.Id) &&
                (x.RecurrenceType == Acutis.Domain.Entities.ScheduleRecurrenceType.Daily ||
                 (x.RecurrenceType == Acutis.Domain.Entities.ScheduleRecurrenceType.Weekly &&
                  x.WeeklyDayOfWeek == targetDate.DayOfWeek)))
            .OrderBy(x => x.StartTime)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        var derivedItems = templates
            .Where(x => !explicitTemplateIds.Contains(x.Id))
            .Select(MapTemplate)
            .ToList();

        var items = visibleOccurrences
            .Concat(derivedItems)
            .OrderBy(x => x.TimeMinutes)
            .ThenBy(x => x.Title)
            .ToList();

        return Ok(items);
    }

    private static UnitTimelineItemDto MapOccurrence(Acutis.Domain.Entities.ScheduleOccurrence occurrence)
    {
        var startTime = occurrence.StartTime ?? TimeSpan.Zero;
        return new UnitTimelineItemDto
        {
            Key = occurrence.Id.ToString(),
            Title = occurrence.Title,
            Description = occurrence.Description,
            Category = occurrence.Category ?? string.Empty,
            Time = startTime.ToString(@"hh\:mm"),
            TimeMinutes = startTime.Hours * 60 + startTime.Minutes,
            EndTime = occurrence.EndTime?.ToString(@"hh\:mm") ?? string.Empty,
            Source = "occurrence"
        };
    }

    private static UnitTimelineItemDto MapTemplate(Acutis.Domain.Entities.ScheduleTemplate template)
    {
        var startTime = template.StartTime ?? TimeSpan.Zero;
        return new UnitTimelineItemDto
        {
            Key = template.Id.ToString(),
            Title = template.Name,
            Description = template.Description,
            Category = template.Category ?? string.Empty,
            Time = startTime.ToString(@"hh\:mm"),
            TimeMinutes = startTime.Hours * 60 + startTime.Minutes,
            EndTime = template.EndTime?.ToString(@"hh\:mm") ?? string.Empty,
            Source = "template"
        };
    }
}

public sealed class UnitTimelineItemDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public int TimeMinutes { get; set; }
    public string EndTime { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
}
