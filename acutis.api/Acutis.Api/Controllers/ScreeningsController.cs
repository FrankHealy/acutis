using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ScreeningsController : ControllerBase
{
    public sealed record EvaluationQueueItemDto(
        Guid CallId,
        Guid? CaseId,
        string Surname,
        string Name,
        string PhoneNumber,
        string QueueType,
        string IntakeSource,
        int NumCalls,
        DateTimeOffset LastCallDate,
        bool HasEvaluationStarted,
        string Status
    );

    public sealed record EvaluateeDto(
        Guid CaseId,
        Guid? ResidentId,
        string Surname,
        string Name,
        string Unit,
        string IntakeSource,
        int NumCalls,
        DateTimeOffset LastCallDate,
        string Status,
        bool HasScreeningStarted
    );

    public sealed record BeginEvaluationResponseDto(
        Guid CallId,
        Guid CaseId,
        bool Created
    );

    public sealed record ScreeningSchedulingAwaitingItemDto(
        Guid CaseId,
        Guid? CallId,
        string Surname,
        string Name,
        string PhoneNumber,
        string QueueType,
        DateTimeOffset CompletedAt
    );

    public sealed record ScreeningSchedulingAssignmentDto(
        Guid ScheduledIntakeId,
        Guid CaseId,
        Guid? CallId,
        string Surname,
        string Name,
        string PhoneNumber,
        string QueueType,
        string Status
    );

    public sealed record ScreeningSchedulingSlotDto(
        Guid SlotId,
        DateOnly ScheduledDate,
        string DisplayLabel,
        int AssignmentCount,
        IReadOnlyList<ScreeningSchedulingAssignmentDto> Assignments
    );

    public sealed record ScreeningSchedulingBoardDto(
        Guid CentreId,
        Guid UnitId,
        string UnitCode,
        string UnitName,
        IReadOnlyList<ScreeningSchedulingAwaitingItemDto> Awaiting,
        IReadOnlyList<ScreeningSchedulingSlotDto> Slots
    );

    public sealed record UpsertScreeningScheduleSlotRequest(
        string UnitCode,
        DateOnly ScheduledDate,
        bool Force = false
    );

    public sealed record AssignScreeningScheduleSlotRequest(
        Guid CaseId,
        string? Notes
    );

    public sealed record UnscheduleScreeningAssignmentResponseDto(
        Guid ScheduledIntakeId,
        Guid CaseId,
        string Status
    );

    private readonly ICallService _callService;
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;

    public ScreeningsController(ICallService callService, AcutisDbContext dbContext, IAuditService auditService)
    {
        _callService = callService;
        _dbContext = dbContext;
        _auditService = auditService;
    }

    [HttpGet("calls")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<Call>>> GetCalls([FromQuery] int? lastDays, CancellationToken cancellationToken)
    {
        if (lastDays.HasValue)
        {
            var filteredCalls = await _callService.GetLastNDaysCallsAsync(lastDays.Value, cancellationToken);
            return Ok(filteredCalls);
        }

        var calls = await _callService.GetCallsAsync(cancellationToken);
        return Ok(calls);
    }

    [HttpGet("calls/last/{numDays:int}")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<Call>>> GetLastNDaysCalls(int numDays, CancellationToken cancellationToken)
    {
        var calls = await _callService.GetLastNDaysCallsAsync(numDays, cancellationToken);
        return Ok(calls);
    }

    [HttpGet("evaluees")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<EvaluateeDto>>> GetEvaluees(CancellationToken cancellationToken)
    {
        const string screeningFormCode = "alcohol_screening_call";
        const string admissionSubjectType = "admission";

        var cases = await _dbContext.ResidentCases
            .AsNoTracking()
            .Where(residentCase =>
                residentCase.ResidentId != null &&
                residentCase.ClosedAtUtc == null &&
                residentCase.CaseStatus != "closed_without_admission" &&
                residentCase.CaseStatus != "declined")
            .Select(residentCase => new
            {
                residentCase.Id,
                residentCase.ResidentId,
                residentCase.CaseStatus,
                residentCase.AdmissionDecisionStatus,
                residentCase.IntakeSource,
                residentCase.ReferralReceivedAtUtc,
                residentCase.OpenedAtUtc,
                residentCase.LastContactAtUtc,
                residentCase.ScreeningStartedAtUtc,
                residentCase.ScreeningCompletedAtUtc,
                ResidentFirstName = residentCase.Resident != null ? residentCase.Resident.FirstName : null,
                ResidentSurname = residentCase.Resident != null ? residentCase.Resident.Surname : null,
                UnitName = residentCase.Unit != null ? residentCase.Unit.Name : null,
                CentreName = residentCase.Centre != null ? residentCase.Centre.Name : null
            })
            .OrderBy(residentCase => residentCase.ResidentSurname)
            .ThenBy(residentCase => residentCase.ResidentFirstName)
            .ToListAsync(cancellationToken);

        var caseIds = cases
            .Select(residentCase => residentCase.Id.ToString())
            .ToList();

        var screeningSubmissionStats = await _dbContext.FormSubmissions
            .AsNoTracking()
            .Where(submission =>
                submission.FormCode == screeningFormCode &&
                submission.SubjectType == admissionSubjectType &&
                submission.SubjectId != null &&
                caseIds.Contains(submission.SubjectId))
            .GroupBy(submission => submission.SubjectId!)
            .Select(group => new
            {
                SubjectId = group.Key,
                Count = group.Count(),
                LastUpdatedAt = group.Max(submission => submission.UpdatedAt)
            })
            .ToDictionaryAsync(group => group.SubjectId, cancellationToken);

        var evaluatees = cases
            .Select(residentCase =>
            {
                var subjectId = residentCase.Id.ToString();
                var hasSubmission = screeningSubmissionStats.TryGetValue(subjectId, out var submissionStats);
                var status = ResolveScreeningStatus(
                    residentCase.CaseStatus,
                    residentCase.AdmissionDecisionStatus,
                    residentCase.ScreeningStartedAtUtc,
                    residentCase.ScreeningCompletedAtUtc,
                    hasSubmission);
                var lastActivity = new[]
                    {
                        residentCase.ScreeningCompletedAtUtc,
                        residentCase.ScreeningStartedAtUtc,
                        residentCase.LastContactAtUtc,
                        residentCase.ReferralReceivedAtUtc,
                        residentCase.OpenedAtUtc
                    }
                    .Where(value => value.HasValue)
                    .Select(value => value!.Value)
                    .Append(submissionStats?.LastUpdatedAt ?? residentCase.OpenedAtUtc)
                    .Max();

                return new EvaluateeDto(
                    CaseId: residentCase.Id,
                    ResidentId: residentCase.ResidentId,
                    Surname: string.IsNullOrWhiteSpace(residentCase.ResidentSurname) ? "Unknown" : residentCase.ResidentSurname,
                    Name: string.IsNullOrWhiteSpace(residentCase.ResidentFirstName) ? "Unknown" : residentCase.ResidentFirstName,
                    Unit: residentCase.UnitName ?? residentCase.CentreName ?? "Unassigned",
                    IntakeSource: string.IsNullOrWhiteSpace(residentCase.IntakeSource) ? "screening_call" : residentCase.IntakeSource,
                    NumCalls: submissionStats?.Count ?? 0,
                    LastCallDate: new DateTimeOffset(DateTime.SpecifyKind(lastActivity, DateTimeKind.Utc)),
                    Status: status,
                    HasScreeningStarted: residentCase.ScreeningStartedAtUtc.HasValue || hasSubmission
                );
            })
            .ToList();

        return Ok(evaluatees);
    }

    [HttpPost("calls")]
    [Authorize]
    public async Task<ActionResult<Call>> LogCall([FromBody] Call call, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(call.PhoneNumber))
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(Call.PhoneNumber)] = ["Phone number is required."]
            })
            {
                Title = "One or more validation errors occurred."
            });
        }

        var created = await _callService.LogCallAsync(call, cancellationToken);
        return CreatedAtAction(nameof(GetLastNDaysCalls), new { numDays = 1 }, created);
    }

    [HttpGet("evaluation-queue")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<EvaluationQueueItemDto>>> GetEvaluationQueue(CancellationToken cancellationToken)
    {
        var calls = await _dbContext.Calls
            .AsNoTracking()
            .OrderByDescending(call => call.CallTimeUtc)
            .ToListAsync(cancellationToken);

        if (calls.Count == 0)
        {
            return Ok(Array.Empty<EvaluationQueueItemDto>());
        }

        var callReferenceIds = calls.Select(call => call.Id.ToString()).ToList();

        var linkedCases = await _dbContext.ResidentCases
            .AsNoTracking()
            .Where(residentCase =>
                residentCase.ReferralReference != null &&
                callReferenceIds.Contains(residentCase.ReferralReference))
            .Select(residentCase => new
            {
                residentCase.Id,
                residentCase.ReferralReference,
                residentCase.ResidentId,
                residentCase.ScreeningStartedAtUtc,
                residentCase.ScreeningCompletedAtUtc,
                residentCase.CaseStatus,
                residentCase.AdmissionDecisionStatus
            })
            .ToListAsync(cancellationToken);

        var linkedCaseLookup = linkedCases
            .GroupBy(residentCase => residentCase.ReferralReference!, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => group
                    .OrderByDescending(item => item.ScreeningStartedAtUtc ?? DateTime.MinValue)
                    .ThenByDescending(item => item.Id)
                    .First(),
                StringComparer.OrdinalIgnoreCase);

        var linkedCaseIds = linkedCases.Select(item => item.Id).ToList();
        var scheduledCaseIds = new HashSet<Guid>();
        if (linkedCaseIds.Count > 0)
        {
            var scheduledCaseIdList = await _dbContext.ScheduledIntakes
                .AsNoTracking()
                .Where(scheduledIntake =>
                    linkedCaseIds.Contains(scheduledIntake.ResidentCaseId) &&
                    scheduledIntake.Status == "scheduled")
                .Select(scheduledIntake => scheduledIntake.ResidentCaseId)
                .ToListAsync(cancellationToken);
            scheduledCaseIds = scheduledCaseIdList.ToHashSet();
        }

        var queue = calls.Select(call =>
        {
            var linkedCase = linkedCaseLookup.GetValueOrDefault(call.Id.ToString());
            var (firstName, surname) = SplitCallerName(call.Caller);

            return new EvaluationQueueItemDto(
                CallId: call.Id,
                CaseId: linkedCase?.Id,
                Surname: string.IsNullOrWhiteSpace(surname) ? "Unknown" : surname,
                Name: string.IsNullOrWhiteSpace(firstName) ? "Unknown" : firstName,
                PhoneNumber: call.PhoneNumber ?? string.Empty,
                QueueType: NormalizeQueueType(call.Source),
                IntakeSource: "screening_call",
                NumCalls: 1,
                LastCallDate: call.CallTimeUtc,
                HasEvaluationStarted: linkedCase is not null &&
                    (linkedCase.ScreeningStartedAtUtc.HasValue ||
                     string.Equals(linkedCase.CaseStatus, "screening_in_progress", StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(linkedCase.CaseStatus, "screening_completed", StringComparison.OrdinalIgnoreCase)),
                Status: ResolveEvaluationQueueStatus(
                    linkedCase?.ResidentId,
                    linkedCase?.ScreeningStartedAtUtc,
                    linkedCase?.ScreeningCompletedAtUtc,
                    linkedCase?.CaseStatus,
                    linkedCase?.AdmissionDecisionStatus,
                    linkedCase is not null && scheduledCaseIds.Contains(linkedCase.Id))
            );
        }).ToList();

        return Ok(queue);
    }

    [HttpPost("calls/{callId:guid}/begin-evaluation")]
    [Authorize]
    public async Task<ActionResult<BeginEvaluationResponseDto>> BeginEvaluation(Guid callId, CancellationToken cancellationToken)
    {
        var call = await _dbContext.Calls.FirstOrDefaultAsync(entity => entity.Id == callId, cancellationToken);
        if (call is null)
        {
            return NotFound();
        }

        var referralReference = callId.ToString();
        var existingCase = await _dbContext.ResidentCases
            .FirstOrDefaultAsync(
                residentCase => residentCase.ReferralReference == referralReference,
                cancellationToken);

        if (existingCase is not null)
        {
            if (!existingCase.ScreeningStartedAtUtc.HasValue)
            {
                existingCase.ScreeningStartedAtUtc = DateTime.UtcNow;
            }

            if (string.Equals(existingCase.CaseStatus, "referred", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(existingCase.CaseStatus, "referral_received", StringComparison.OrdinalIgnoreCase))
            {
                existingCase.CaseStatus = "screening_in_progress";
            }

            if (string.Equals(existingCase.CasePhase, "intake", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(existingCase.CasePhase, "referral", StringComparison.OrdinalIgnoreCase))
            {
                existingCase.CasePhase = "screening";
            }

            existingCase.LastContactAtUtc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return Ok(new BeginEvaluationResponseDto(call.Id, existingCase.Id, Created: false));
        }

        var normalizedQueueType = NormalizeQueueType(call.Source);
        var unit = await ResolveUnitAsync(normalizedQueueType, cancellationToken);
        var centreId = unit?.CentreId ?? await _dbContext.Centres
            .AsNoTracking()
            .OrderBy(centre => centre.DisplayOrder)
            .Select(centre => centre.Id)
            .FirstAsync(cancellationToken);

        var now = DateTime.UtcNow;
        var residentCase = new ResidentCase
        {
            Id = Guid.NewGuid(),
            ResidentId = null,
            CentreId = centreId,
            UnitId = unit?.Id,
            CaseStatus = "screening_in_progress",
            CasePhase = "screening",
            IntakeSource = "screening_call",
            ReferralSource = normalizedQueueType,
            ReferralReference = referralReference,
            ReferralReceivedAtUtc = call.CallTimeUtc.UtcDateTime,
            ScreeningStartedAtUtc = now,
            OpenedAtUtc = now,
            LastContactAtUtc = now,
            SummaryNotes = call.Notes
        };

        _dbContext.ResidentCases.Add(residentCase);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new BeginEvaluationResponseDto(call.Id, residentCase.Id, Created: true));
    }

    [HttpGet("scheduling-board")]
    [Authorize]
    public async Task<ActionResult<ScreeningSchedulingBoardDto>> GetSchedulingBoard(
        [FromQuery] string unitId = "alcohol",
        CancellationToken cancellationToken = default)
    {
        var unit = await ResolveSchedulingUnitAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        await EnsureUpcomingScheduleSlotsAsync(unit.CentreId, unit.Id, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var slots = await _dbContext.ScreeningScheduleSlots
            .AsNoTracking()
            .Where(slot => slot.UnitId == unit.Id && slot.CentreId == unit.CentreId && slot.ScheduledDate >= today)
            .OrderBy(slot => slot.ScheduledDate)
            .Take(3)
            .ToListAsync(cancellationToken);

        var slotDateLookup = slots.ToDictionary(slot => slot.Id, slot => slot.ScheduledDate);
        var slotDateSet = slots.Select(slot => slot.ScheduledDate).ToHashSet();

        var scheduledIntakes = slotDateSet.Count == 0
            ? new List<ScheduledIntake>()
            : await _dbContext.ScheduledIntakes
                .AsNoTracking()
                .Where(scheduledIntake =>
                    scheduledIntake.UnitId == unit.Id &&
                    scheduledIntake.Status == "scheduled" &&
                    slotDateSet.Contains(scheduledIntake.ScheduledDate))
                .Include(scheduledIntake => scheduledIntake.ResidentCase)
                .ThenInclude(residentCase => residentCase.Resident)
                .ToListAsync(cancellationToken);

        var caseIds = scheduledIntakes.Select(item => item.ResidentCaseId).ToList();
        var callIds = new List<Guid>();
        foreach (var residentCase in scheduledIntakes.Select(item => item.ResidentCase))
        {
            if (TryParseReferralCallId(residentCase.ReferralReference, out var callId))
            {
                callIds.Add(callId);
            }
        }

        var eligibleCases = await _dbContext.ResidentCases
            .AsNoTracking()
            .Where(residentCase =>
                residentCase.CentreId == unit.CentreId &&
                residentCase.UnitId == unit.Id &&
                residentCase.ResidentId == null &&
                residentCase.ClosedAtUtc == null &&
                residentCase.ScreeningCompletedAtUtc != null &&
                residentCase.AdmissionDecisionStatus != "rejected" &&
                residentCase.AdmissionDecisionStatus != "admitted" &&
                residentCase.CaseStatus != "declined" &&
                residentCase.CaseStatus != "closed_without_admission")
            .ToListAsync(cancellationToken);

        foreach (var residentCase in eligibleCases)
        {
            if (TryParseReferralCallId(residentCase.ReferralReference, out var callId))
            {
                callIds.Add(callId);
            }
        }

        var distinctCallIds = callIds.Distinct().ToList();
        var calls = distinctCallIds.Count == 0
            ? new Dictionary<Guid, Call>()
            : await _dbContext.Calls
                .AsNoTracking()
                .Where(call => distinctCallIds.Contains(call.Id))
                .ToDictionaryAsync(call => call.Id, cancellationToken);

        var activeScheduledCaseIds = scheduledIntakes.Select(item => item.ResidentCaseId).ToHashSet();
        var awaiting = eligibleCases
            .Where(residentCase => !activeScheduledCaseIds.Contains(residentCase.Id))
            .OrderByDescending(residentCase => residentCase.ScreeningCompletedAtUtc ?? residentCase.LastContactAtUtc ?? residentCase.OpenedAtUtc)
            .Select(residentCase => MapAwaitingSchedulingItem(residentCase, calls))
            .ToList();

        var assignmentsByDate = scheduledIntakes
            .GroupBy(item => item.ScheduledDate)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<ScreeningSchedulingAssignmentDto>)group
                    .OrderBy(item => item.ResidentCase.ScreeningCompletedAtUtc ?? item.UpdatedAtUtc)
                    .Select(item => MapSchedulingAssignment(item, calls))
                    .ToList());

        var slotDtos = slots.Select(slot => new ScreeningSchedulingSlotDto(
            SlotId: slot.Id,
            ScheduledDate: slot.ScheduledDate,
            DisplayLabel: slot.ScheduledDate.ToString("ddd dd MMM yyyy"),
            AssignmentCount: assignmentsByDate.GetValueOrDefault(slot.ScheduledDate)?.Count ?? 0,
            Assignments: assignmentsByDate.GetValueOrDefault(slot.ScheduledDate) ?? Array.Empty<ScreeningSchedulingAssignmentDto>()))
            .ToList();

        return Ok(new ScreeningSchedulingBoardDto(
            CentreId: unit.CentreId,
            UnitId: unit.Id,
            UnitCode: unit.Code,
            UnitName: unit.Name,
            Awaiting: awaiting,
            Slots: slotDtos));
    }

    [HttpPost("scheduling-slots")]
    [Authorize]
    public async Task<ActionResult<ScreeningSchedulingSlotDto>> CreateSchedulingSlot(
        [FromBody] UpsertScreeningScheduleSlotRequest request,
        CancellationToken cancellationToken = default)
    {
        var unit = await ResolveSchedulingUnitAsync(request.UnitCode, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        var validationError = ValidateScreeningScheduleDate(request.ScheduledDate);
        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var existing = await _dbContext.ScreeningScheduleSlots
            .AsNoTracking()
            .AnyAsync(slot => slot.UnitId == unit.Id && slot.ScheduledDate == request.ScheduledDate, cancellationToken);
        if (existing)
        {
            return Conflict(new { message = "That admission date already exists." });
        }

        var slot = new ScreeningScheduleSlot
        {
            Id = Guid.NewGuid(),
            CentreId = unit.CentreId,
            UnitId = unit.Id,
            ScheduledDate = request.ScheduledDate,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _dbContext.ScreeningScheduleSlots.Add(slot);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            unit.CentreId,
            unit.Id,
            nameof(ScreeningScheduleSlot),
            slot.Id.ToString(),
            "Create",
            null,
            new { slot.Id, slot.UnitId, slot.ScheduledDate },
            "Screening admission date created.",
            cancellationToken);

        return Ok(new ScreeningSchedulingSlotDto(
            slot.Id,
            slot.ScheduledDate,
            slot.ScheduledDate.ToString("ddd dd MMM yyyy"),
            0,
            Array.Empty<ScreeningSchedulingAssignmentDto>()));
    }

    [HttpPut("scheduling-slots/{slotId:guid}")]
    [Authorize]
    public async Task<ActionResult<ScreeningSchedulingSlotDto>> UpdateSchedulingSlot(
        Guid slotId,
        [FromBody] UpsertScreeningScheduleSlotRequest request,
        CancellationToken cancellationToken = default)
    {
        var slot = await _dbContext.ScreeningScheduleSlots
            .SingleOrDefaultAsync(entity => entity.Id == slotId, cancellationToken);
        if (slot is null)
        {
            return NotFound();
        }

        var validationError = ValidateScreeningScheduleDate(request.ScheduledDate);
        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var assignments = await _dbContext.ScheduledIntakes
            .Where(item => item.UnitId == slot.UnitId && item.Status == "scheduled" && item.ScheduledDate == slot.ScheduledDate)
            .ToListAsync(cancellationToken);

        if (assignments.Count > 0 && !request.Force)
        {
            return Conflict(new { message = "This date already has assigned entities.", requiresConfirmation = true, assignmentCount = assignments.Count });
        }

        var duplicate = await _dbContext.ScreeningScheduleSlots
            .AsNoTracking()
            .AnyAsync(entity => entity.Id != slotId && entity.UnitId == slot.UnitId && entity.ScheduledDate == request.ScheduledDate, cancellationToken);
        if (duplicate)
        {
            return Conflict(new { message = "That admission date already exists." });
        }

        var before = new { slot.Id, slot.UnitId, slot.ScheduledDate };
        var previousDate = slot.ScheduledDate;
        slot.ScheduledDate = request.ScheduledDate;
        slot.UpdatedAtUtc = DateTime.UtcNow;

        foreach (var assignment in assignments)
        {
            var assignmentBefore = new { assignment.Id, assignment.ScheduledDate, assignment.Status };
            assignment.ScheduledDate = request.ScheduledDate;
            assignment.UpdatedAtUtc = DateTime.UtcNow;
            await _auditService.WriteAsync(
                slot.CentreId,
                slot.UnitId,
                nameof(ScheduledIntake),
                assignment.Id.ToString(),
                "Reschedule",
                assignmentBefore,
                new { assignment.Id, assignment.ScheduledDate, assignment.Status },
                $"Screening admission date moved from {previousDate:yyyy-MM-dd} to {request.ScheduledDate:yyyy-MM-dd}.",
                cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            slot.CentreId,
            slot.UnitId,
            nameof(ScreeningScheduleSlot),
            slot.Id.ToString(),
            "Update",
            before,
            new { slot.Id, slot.UnitId, slot.ScheduledDate },
            assignments.Count > 0 ? "Screening admission date updated with assigned entities." : "Screening admission date updated.",
            cancellationToken);

        return Ok(new ScreeningSchedulingSlotDto(
            slot.Id,
            slot.ScheduledDate,
            slot.ScheduledDate.ToString("ddd dd MMM yyyy"),
            assignments.Count,
            Array.Empty<ScreeningSchedulingAssignmentDto>()));
    }

    [HttpDelete("scheduling-slots/{slotId:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteSchedulingSlot(
        Guid slotId,
        [FromQuery] bool force = false,
        CancellationToken cancellationToken = default)
    {
        var slot = await _dbContext.ScreeningScheduleSlots
            .SingleOrDefaultAsync(entity => entity.Id == slotId, cancellationToken);
        if (slot is null)
        {
            return NotFound();
        }

        var assignments = await _dbContext.ScheduledIntakes
            .Where(item => item.UnitId == slot.UnitId && item.Status == "scheduled" && item.ScheduledDate == slot.ScheduledDate)
            .ToListAsync(cancellationToken);

        if (assignments.Count > 0 && !force)
        {
            return Conflict(new { message = "This date already has assigned entities.", requiresConfirmation = true, assignmentCount = assignments.Count });
        }

        var before = new { slot.Id, slot.UnitId, slot.ScheduledDate };
        foreach (var assignment in assignments)
        {
            var assignmentBefore = new { assignment.Id, assignment.ScheduledDate, assignment.Status };
            assignment.Status = "cancelled";
            assignment.UpdatedAtUtc = DateTime.UtcNow;
            await _auditService.WriteAsync(
                slot.CentreId,
                slot.UnitId,
                nameof(ScheduledIntake),
                assignment.Id.ToString(),
                "Unschedule",
                assignmentBefore,
                new { assignment.Id, assignment.ScheduledDate, assignment.Status },
                $"Screening admission date {slot.ScheduledDate:yyyy-MM-dd} deleted.",
                cancellationToken);
        }

        _dbContext.ScreeningScheduleSlots.Remove(slot);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            slot.CentreId,
            slot.UnitId,
            nameof(ScreeningScheduleSlot),
            slot.Id.ToString(),
            "Delete",
            before,
            null,
            assignments.Count > 0 ? "Screening admission date deleted and assignments returned to awaiting scheduling." : "Screening admission date deleted.",
            cancellationToken);

        return NoContent();
    }

    [HttpPost("scheduling-slots/{slotId:guid}/assign")]
    [Authorize]
    public async Task<ActionResult<ScreeningSchedulingAssignmentDto>> AssignToSchedulingSlot(
        Guid slotId,
        [FromBody] AssignScreeningScheduleSlotRequest request,
        CancellationToken cancellationToken = default)
    {
        var slot = await _dbContext.ScreeningScheduleSlots
            .SingleOrDefaultAsync(entity => entity.Id == slotId, cancellationToken);
        if (slot is null)
        {
            return NotFound();
        }

        var residentCase = await _dbContext.ResidentCases
            .Include(entity => entity.Resident)
            .SingleOrDefaultAsync(entity => entity.Id == request.CaseId, cancellationToken);
        if (residentCase is null ||
            residentCase.UnitId != slot.UnitId ||
            residentCase.CentreId != slot.CentreId ||
            residentCase.ResidentId != null ||
            residentCase.ScreeningCompletedAtUtc is null ||
            string.Equals(residentCase.AdmissionDecisionStatus, "rejected", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(residentCase.AdmissionDecisionStatus, "admitted", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Resident case is not eligible for screening scheduling." });
        }

        var existing = await _dbContext.ScheduledIntakes
            .Include(item => item.ResidentCase)
            .ThenInclude(entity => entity.Resident)
            .SingleOrDefaultAsync(item => item.ResidentCaseId == request.CaseId, cancellationToken);

        var before = existing is null
            ? null
            : new { existing.Id, existing.ScheduledDate, existing.Status, existing.Notes };

        if (existing is null)
        {
            existing = new ScheduledIntake
            {
                Id = Guid.NewGuid(),
                ResidentCaseId = request.CaseId,
                CreatedAtUtc = DateTime.UtcNow
            };
            _dbContext.ScheduledIntakes.Add(existing);
        }

        existing.UnitId = slot.UnitId;
        existing.ScheduledDate = slot.ScheduledDate;
        existing.Status = "scheduled";
        existing.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            slot.CentreId,
            slot.UnitId,
            nameof(ScheduledIntake),
            existing.Id.ToString(),
            before is null ? "Assign" : "Reassign",
            before,
            new { existing.Id, existing.ScheduledDate, existing.Status, existing.Notes, existing.ResidentCaseId },
            $"Assigned screening case to {slot.ScheduledDate:yyyy-MM-dd}.",
            cancellationToken);

        var calls = new Dictionary<Guid, Call>();
        if (TryParseReferralCallId(residentCase.ReferralReference, out var callId))
        {
            var call = await _dbContext.Calls.AsNoTracking().SingleOrDefaultAsync(item => item.Id == callId, cancellationToken);
            if (call is not null)
            {
                calls[call.Id] = call;
            }
        }

        return Ok(MapSchedulingAssignment(existing, calls));
    }

    [HttpPost("scheduling-assignments/{scheduledIntakeId:guid}/unschedule")]
    [Authorize]
    public async Task<ActionResult<UnscheduleScreeningAssignmentResponseDto>> UnscheduleAssignment(
        Guid scheduledIntakeId,
        CancellationToken cancellationToken = default)
    {
        var scheduledIntake = await _dbContext.ScheduledIntakes
            .Include(item => item.ResidentCase)
            .SingleOrDefaultAsync(item => item.Id == scheduledIntakeId, cancellationToken);

        if (scheduledIntake is null)
        {
            return NotFound();
        }

        var before = new
        {
            scheduledIntake.Id,
            scheduledIntake.ResidentCaseId,
            scheduledIntake.ScheduledDate,
            scheduledIntake.Status
        };

        scheduledIntake.Status = "cancelled";
        scheduledIntake.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _auditService.WriteAsync(
            scheduledIntake.ResidentCase.CentreId,
            scheduledIntake.UnitId,
            nameof(ScheduledIntake),
            scheduledIntake.Id.ToString(),
            "Unschedule",
            before,
            new
            {
                scheduledIntake.Id,
                scheduledIntake.ResidentCaseId,
                scheduledIntake.ScheduledDate,
                scheduledIntake.Status
            },
            "Screening assignment returned to awaiting scheduling.",
            cancellationToken);

        return Ok(new UnscheduleScreeningAssignmentResponseDto(
            scheduledIntake.Id,
            scheduledIntake.ResidentCaseId,
            scheduledIntake.Status));
    }

    private static string ResolveScreeningStatus(
        string caseStatus,
        string? admissionDecisionStatus,
        DateTime? screeningStartedAtUtc,
        DateTime? screeningCompletedAtUtc,
        bool hasSubmission)
    {
        if (screeningCompletedAtUtc.HasValue || string.Equals(caseStatus, "screening_completed", StringComparison.OrdinalIgnoreCase))
        {
            return "completed";
        }

        if (screeningStartedAtUtc.HasValue || hasSubmission || string.Equals(caseStatus, "screening_in_progress", StringComparison.OrdinalIgnoreCase))
        {
            return "in-progress";
        }

        if (string.Equals(caseStatus, "waitlisted", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(caseStatus, "deferred", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(admissionDecisionStatus, "waitlisted", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(admissionDecisionStatus, "deferred", StringComparison.OrdinalIgnoreCase))
        {
            return "scheduled";
        }

        return "pending";
    }

    private static string ResolveEvaluationQueueStatus(
        Guid? residentId,
        DateTime? screeningStartedAtUtc,
        DateTime? screeningCompletedAtUtc,
        string? caseStatus,
        string? admissionDecisionStatus,
        bool hasScheduledIntake)
    {
        var isCompleted =
            screeningCompletedAtUtc.HasValue ||
            string.Equals(caseStatus, "screening_completed", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(admissionDecisionStatus, "rejected", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(admissionDecisionStatus, "approved", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(admissionDecisionStatus, "admitted", StringComparison.OrdinalIgnoreCase);

        if (isCompleted && hasScheduledIntake)
        {
            return "scheduled";
        }

        if (isCompleted && residentId is null)
        {
            return "entity_missing";
        }

        if (screeningStartedAtUtc.HasValue || string.Equals(caseStatus, "screening_in_progress", StringComparison.OrdinalIgnoreCase))
        {
            return "in_progress";
        }

        return "awaiting";
    }

    private async Task<Unit?> ResolveSchedulingUnitAsync(string unitCode, CancellationToken cancellationToken)
    {
        return await _dbContext.Units
            .AsNoTracking()
            .Where(unit => unit.IsActive && unit.Code == unitCode)
            .OrderBy(unit => unit.DisplayOrder)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task EnsureUpcomingScheduleSlotsAsync(Guid centreId, Guid unitId, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var existingDates = await _dbContext.ScreeningScheduleSlots
            .Where(slot => slot.CentreId == centreId && slot.UnitId == unitId && slot.ScheduledDate >= today)
            .OrderBy(slot => slot.ScheduledDate)
            .Select(slot => slot.ScheduledDate)
            .ToListAsync(cancellationToken);

        if (existingDates.Count >= 3)
        {
            return;
        }

        var candidateDates = BuildUpcomingScreeningScheduleDates(today, 6);
        foreach (var candidateDate in candidateDates)
        {
            if (existingDates.Contains(candidateDate))
            {
                continue;
            }

            var slot = new ScreeningScheduleSlot
            {
                Id = Guid.NewGuid(),
                CentreId = centreId,
                UnitId = unitId,
                ScheduledDate = candidateDate,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _dbContext.ScreeningScheduleSlots.Add(slot);
            existingDates.Add(candidateDate);
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _auditService.WriteAsync(
                centreId,
                unitId,
                nameof(ScreeningScheduleSlot),
                slot.Id.ToString(),
                "AutoCreate",
                null,
                new { slot.Id, slot.UnitId, slot.ScheduledDate },
                "System generated upcoming screening admission date.",
                cancellationToken);

            if (existingDates.Count >= 3)
            {
                break;
            }
        }
    }

    private static IReadOnlyList<DateOnly> BuildUpcomingScreeningScheduleDates(DateOnly fromDate, int count)
    {
        var results = new List<DateOnly>();
        var cursor = fromDate;

        while (results.Count < count)
        {
            cursor = cursor.AddDays(1);
            if (cursor.DayOfWeek != DayOfWeek.Monday || IsIrishBankHoliday(cursor))
            {
                continue;
            }

            results.Add(cursor);
        }

        return results;
    }

    private static string? ValidateScreeningScheduleDate(DateOnly scheduledDate)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (scheduledDate < today)
        {
            return "Admission date cannot be in the past.";
        }

        if (scheduledDate.DayOfWeek != DayOfWeek.Monday)
        {
            return "Admission date must be a Monday.";
        }

        if (IsIrishBankHoliday(scheduledDate))
        {
            return "Admission date cannot fall on an Irish bank holiday.";
        }

        return null;
    }

    private static bool IsIrishBankHoliday(DateOnly date)
    {
        return GetIrishBankHolidays(date.Year).Contains(date);
    }

    private static HashSet<DateOnly> GetIrishBankHolidays(int year)
    {
        var holidays = new HashSet<DateOnly>();

        AddObservedHoliday(holidays, new DateOnly(year, 1, 1));
        holidays.Add(GetFirstMondayOfMonth(year, 2));
        holidays.Add(new DateOnly(year, 3, 17));
        holidays.Add(GetEasterMonday(year));
        holidays.Add(GetFirstMondayOfMonth(year, 5));
        holidays.Add(GetFirstMondayOfMonth(year, 6));
        holidays.Add(GetFirstMondayOfMonth(year, 8));
        holidays.Add(GetLastMondayOfMonth(year, 10));
        AddObservedHoliday(holidays, new DateOnly(year, 12, 25));
        AddObservedHoliday(holidays, new DateOnly(year, 12, 26));

        return holidays;
    }

    private static void AddObservedHoliday(HashSet<DateOnly> holidays, DateOnly date)
    {
        holidays.Add(date.DayOfWeek switch
        {
            DayOfWeek.Saturday => date.AddDays(2),
            DayOfWeek.Sunday => date.AddDays(1),
            _ => date
        });
    }

    private static DateOnly GetFirstMondayOfMonth(int year, int month)
    {
        var date = new DateOnly(year, month, 1);
        while (date.DayOfWeek != DayOfWeek.Monday)
        {
            date = date.AddDays(1);
        }

        return date;
    }

    private static DateOnly GetLastMondayOfMonth(int year, int month)
    {
        var date = new DateOnly(year, month, DateTime.DaysInMonth(year, month));
        while (date.DayOfWeek != DayOfWeek.Monday)
        {
            date = date.AddDays(-1);
        }

        return date;
    }

    private static DateOnly GetEasterMonday(int year)
    {
        var a = year % 19;
        var b = year / 100;
        var c = year % 100;
        var d = b / 4;
        var e = b % 4;
        var f = (b + 8) / 25;
        var g = (b - f + 1) / 3;
        var h = (19 * a + b - d - g + 15) % 30;
        var i = c / 4;
        var k = c % 4;
        var l = (32 + 2 * e + 2 * i - h - k) % 7;
        var m = (a + 11 * h + 22 * l) / 451;
        var month = (h + l - 7 * m + 114) / 31;
        var day = ((h + l - 7 * m + 114) % 31) + 1;
        return new DateOnly(year, month, day).AddDays(1);
    }

    private static ScreeningSchedulingAwaitingItemDto MapAwaitingSchedulingItem(
        ResidentCase residentCase,
        IReadOnlyDictionary<Guid, Call> calls)
    {
        var call = ResolveLinkedCall(residentCase, calls);
        var (firstName, surname) = call is null ? (string.Empty, string.Empty) : SplitCallerName(call.Caller);
        var resolvedName = string.IsNullOrWhiteSpace(firstName) ? "Unknown" : firstName;
        var resolvedSurname = string.IsNullOrWhiteSpace(surname) ? "Unknown" : surname;

        return new ScreeningSchedulingAwaitingItemDto(
            CaseId: residentCase.Id,
            CallId: call?.Id,
            Surname: resolvedSurname,
            Name: resolvedName,
            PhoneNumber: call?.PhoneNumber ?? string.Empty,
            QueueType: NormalizeQueueType(call?.Source ?? residentCase.ReferralSource),
            CompletedAt: new DateTimeOffset(DateTime.SpecifyKind(
                residentCase.ScreeningCompletedAtUtc ?? residentCase.LastContactAtUtc ?? residentCase.OpenedAtUtc,
                DateTimeKind.Utc)));
    }

    private static ScreeningSchedulingAssignmentDto MapSchedulingAssignment(
        ScheduledIntake scheduledIntake,
        IReadOnlyDictionary<Guid, Call> calls)
    {
        var residentCase = scheduledIntake.ResidentCase;
        var call = ResolveLinkedCall(residentCase, calls);
        var (firstName, surname) = call is null ? (string.Empty, string.Empty) : SplitCallerName(call.Caller);
        var resolvedName = string.IsNullOrWhiteSpace(firstName)
            ? (residentCase.Resident?.FirstName ?? "Unknown")
            : firstName;
        var resolvedSurname = string.IsNullOrWhiteSpace(surname)
            ? (residentCase.Resident?.Surname ?? "Unknown")
            : surname;

        return new ScreeningSchedulingAssignmentDto(
            ScheduledIntakeId: scheduledIntake.Id,
            CaseId: residentCase.Id,
            CallId: call?.Id,
            Surname: resolvedSurname,
            Name: resolvedName,
            PhoneNumber: call?.PhoneNumber ?? string.Empty,
            QueueType: NormalizeQueueType(call?.Source ?? residentCase.ReferralSource),
            Status: scheduledIntake.Status);
    }

    private static Call? ResolveLinkedCall(ResidentCase residentCase, IReadOnlyDictionary<Guid, Call> calls)
    {
        if (!TryParseReferralCallId(residentCase.ReferralReference, out var callId))
        {
            return null;
        }

        return calls.GetValueOrDefault(callId);
    }

    private static bool TryParseReferralCallId(string? referralReference, out Guid callId)
    {
        return Guid.TryParse(referralReference, out callId);
    }

    private async Task<Unit?> ResolveUnitAsync(string queueType, CancellationToken cancellationToken)
    {
        if (string.Equals(queueType, "general_query", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return await _dbContext.Units
            .AsNoTracking()
            .Where(unit => unit.IsActive && unit.Code == queueType)
            .OrderBy(unit => unit.DisplayOrder)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static string NormalizeQueueType(string? source)
    {
        return (source ?? string.Empty).Trim().ToLowerInvariant() switch
        {
            "alcohol" => "alcohol",
            "drugs" => "drugs",
            "gambling" => "gambling",
            "ladies" => "ladies",
            "general" => "general_query",
            "general query" => "general_query",
            "general_query" => "general_query",
            _ => "general_query"
        };
    }

    private static (string FirstName, string Surname) SplitCallerName(string? caller)
    {
        if (string.IsNullOrWhiteSpace(caller))
        {
            return (string.Empty, string.Empty);
        }

        var parts = caller.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1)
        {
            return (parts[0], string.Empty);
        }

        return (parts[0], string.Join(' ', parts.Skip(1)));
    }
}
