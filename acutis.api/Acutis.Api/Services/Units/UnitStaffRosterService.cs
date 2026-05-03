using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Units;

public interface IUnitStaffRosterService
{
    Task<UnitStaffRosterBoardDto> GetBoardAsync(string unitCode, DateOnly? date = null, CancellationToken cancellationToken = default);
    Task<UnitStaffRosterBoardDto> AssignShiftAsync(string unitCode, AssignUnitStaffRosterShiftRequest request, CancellationToken cancellationToken = default);
}

public sealed class UnitStaffRosterService : IUnitStaffRosterService
{
    private sealed record ShiftDefinition(StaffRosterShiftType ShiftType, string Label, TimeSpan StartTime, TimeSpan EndTime);

    private static readonly ShiftDefinition[] ShiftDefinitions =
    [
        new(StaffRosterShiftType.CouncillorOnDutyMorning, "COD AM", new TimeSpan(7, 0, 0), new TimeSpan(14, 30, 0)),
        new(StaffRosterShiftType.CouncillorOnDutyEvening, "COD PM", new TimeSpan(14, 30, 0), new TimeSpan(22, 0, 0)),
        new(StaffRosterShiftType.NurseDay, "Nurse Day", new TimeSpan(7, 0, 0), new TimeSpan(19, 0, 0)),
        new(StaffRosterShiftType.NurseNight, "Nurse Night", new TimeSpan(19, 0, 0), new TimeSpan(7, 0, 0)),
        new(StaffRosterShiftType.NightStaffOne, "Night Staff 1", new TimeSpan(22, 0, 0), new TimeSpan(7, 0, 0)),
        new(StaffRosterShiftType.NightStaffTwo, "Night Staff 2", new TimeSpan(22, 0, 0), new TimeSpan(7, 0, 0))
    ];

    private readonly AcutisDbContext _dbContext;
    private readonly IUnitTimelineService _unitTimelineService;
    private readonly IAuditService _auditService;

    public UnitStaffRosterService(
        AcutisDbContext dbContext,
        IUnitTimelineService unitTimelineService,
        IAuditService auditService)
    {
        _dbContext = dbContext;
        _unitTimelineService = unitTimelineService;
        _auditService = auditService;
    }

    public async Task<UnitStaffRosterBoardDto> GetBoardAsync(
        string unitCode,
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.Today);
        return await BuildBoardAsync(unit, targetDate, cancellationToken);
    }

    public async Task<UnitStaffRosterBoardDto> AssignShiftAsync(
        string unitCode,
        AssignUnitStaffRosterShiftRequest request,
        CancellationToken cancellationToken = default)
    {
        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var shiftType = ParseShiftType(request.ShiftType);

        if (request.AppUserId.HasValue)
        {
            var isEligible = await _dbContext.AppUserRoleAssignments
                .AsNoTracking()
                .Include(x => x.AppUser)
                .AnyAsync(x =>
                    x.AppUserId == request.AppUserId.Value &&
                    x.AppUser.IsActive &&
                    x.IsActive &&
                    x.CentreId == unit.CentreId &&
                    (!x.UnitId.HasValue || x.UnitId == unit.Id),
                    cancellationToken);
            if (!isEligible)
            {
                throw new InvalidOperationException("Selected staff member is not available for this unit.");
            }
        }

        var assignment = await _dbContext.UnitStaffRosterAssignments
            .Include(x => x.AssignedAppUser)
            .SingleOrDefaultAsync(x =>
                x.UnitId == unit.Id &&
                x.ScheduledDate == request.ScheduledDate &&
                x.ShiftType == shiftType,
                cancellationToken);

        var before = assignment is null
            ? null
            : new
            {
                assignment.Id,
                assignment.ShiftType,
                assignment.AssignedAppUserId,
                AssignedStaffName = assignment.AssignedAppUser?.DisplayName,
                assignment.Notes
            };

        var now = DateTime.UtcNow;
        if (assignment is null)
        {
            assignment = new UnitStaffRosterAssignment
            {
                Id = Guid.NewGuid(),
                UnitId = unit.Id,
                ScheduledDate = request.ScheduledDate,
                ShiftType = shiftType,
                AssignedAppUserId = request.AppUserId,
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };
            _dbContext.UnitStaffRosterAssignments.Add(assignment);
        }
        else
        {
            assignment.AssignedAppUserId = request.AppUserId;
            assignment.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
            assignment.UpdatedAtUtc = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var assignedStaffName = request.AppUserId.HasValue
            ? await _dbContext.AppUsers
                .AsNoTracking()
                .Where(x => x.Id == request.AppUserId.Value)
                .Select(x => x.DisplayName)
                .FirstOrDefaultAsync(cancellationToken)
            : string.Empty;

        await _auditService.WriteAsync(
            unit.CentreId,
            unit.Id,
            nameof(UnitStaffRosterAssignment),
            assignment.Id.ToString(),
            "AssignShift",
            before,
            new
            {
                assignment.Id,
                assignment.ShiftType,
                assignment.AssignedAppUserId,
                AssignedStaffName = assignedStaffName,
                assignment.Notes
            },
            "Roster shift assignment changed.",
            cancellationToken);

        return await BuildBoardAsync(unit, request.ScheduledDate, cancellationToken);
    }

    private async Task<UnitStaffRosterBoardDto> BuildBoardAsync(
        Domain.Entities.Unit unit,
        DateOnly targetDate,
        CancellationToken cancellationToken)
    {
        var eligibleAssignments = await _dbContext.AppUserRoleAssignments
            .AsNoTracking()
            .Include(x => x.AppUser)
            .Where(x =>
                x.IsActive &&
                x.AppUser.IsActive &&
                x.CentreId == unit.CentreId &&
                (!x.UnitId.HasValue || x.UnitId == unit.Id))
            .ToListAsync(cancellationToken);

        var staff = eligibleAssignments
            .GroupBy(x => x.AppUserId)
            .Select(group => group.First().AppUser)
            .OrderBy(x => x.DisplayName)
            .Select(x => new UnitStaffRosterStaffDto
            {
                AppUserId = x.Id,
                DisplayName = x.DisplayName,
                Email = x.Email
            })
            .ToList();

        var assignments = await _dbContext.UnitStaffRosterAssignments
            .AsNoTracking()
            .Include(x => x.AssignedAppUser)
            .Where(x => x.UnitId == unit.Id && x.ScheduledDate == targetDate)
            .ToListAsync(cancellationToken);

        var assignmentByShift = assignments.ToDictionary(x => x.ShiftType);
        var shifts = ShiftDefinitions
            .Select(definition =>
            {
                assignmentByShift.TryGetValue(definition.ShiftType, out var assignment);
                var endMinutes = definition.EndTime.Hours * 60 + definition.EndTime.Minutes;
                if (endMinutes <= definition.StartTime.Hours * 60 + definition.StartTime.Minutes)
                {
                    endMinutes += 24 * 60;
                }

                return new UnitStaffRosterShiftDto
                {
                    ShiftType = definition.ShiftType.ToString(),
                    Label = definition.Label,
                    StartTime = definition.StartTime.ToString(@"hh\:mm"),
                    EndTime = definition.EndTime.ToString(@"hh\:mm"),
                    StartMinutes = definition.StartTime.Hours * 60 + definition.StartTime.Minutes,
                    EndMinutes = endMinutes,
                    AssignedAppUserId = assignment?.AssignedAppUserId,
                    AssignedStaffName = assignment?.AssignedAppUser?.DisplayName ?? string.Empty,
                    Notes = assignment?.Notes ?? string.Empty,
                    IsFilled = assignment?.AssignedAppUserId.HasValue == true
                };
            })
            .ToList();

        var events = (await _unitTimelineService.GetTimelineAsync(unit.Code, targetDate, cancellationToken))
            .Where(x => x.RequiresFacilitator)
            .ToList();

        var currentAppUserId = await _unitTimelineService.ResolveCurrentAppUserIdAsync(cancellationToken);
        var issues = BuildIssues(shifts, events);

        return new UnitStaffRosterBoardDto
        {
            UnitCode = unit.Code,
            UnitName = unit.Name,
            ScheduledDate = targetDate.ToString("yyyy-MM-dd"),
            CurrentAppUserId = currentAppUserId,
            Staff = staff,
            Shifts = shifts,
            Events = events,
            Issues = issues
        };
    }

    private static IReadOnlyList<UnitStaffRosterIssueDto> BuildIssues(
        IReadOnlyList<UnitStaffRosterShiftDto> shifts,
        IReadOnlyList<UnitTimelineItemDto> events)
    {
        var issues = new List<UnitStaffRosterIssueDto>();

        foreach (var shift in shifts.Where(x => !x.IsFilled))
        {
            issues.Add(new UnitStaffRosterIssueDto
            {
                Code = $"shift:{shift.ShiftType}",
                Message = $"{shift.Label} is not assigned."
            });
        }

        foreach (var eventItem in events.Where(x => string.IsNullOrWhiteSpace(x.AssignedFacilitatorName)))
        {
            issues.Add(new UnitStaffRosterIssueDto
            {
                Code = $"event:{eventItem.Key}",
                Message = $"{eventItem.Title} at {eventItem.Time} has no assigned facilitator."
            });
        }

        return issues;
    }

    private async Task<Domain.Entities.Unit> GetUnitAsync(string unitCode, CancellationToken cancellationToken)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        return await _dbContext.Units
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == normalizedUnitCode && x.IsActive, cancellationToken)
            ?? throw new InvalidOperationException($"Unit '{unitCode}' was not found.");
    }

    private static StaffRosterShiftType ParseShiftType(string value)
    {
        if (Enum.TryParse<StaffRosterShiftType>(value?.Trim(), true, out var parsed))
        {
            return parsed;
        }

        throw new InvalidOperationException($"Unsupported shift type '{value}'.");
    }
}
