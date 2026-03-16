using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ScreeningsController : ControllerBase
{
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

    private readonly ICallService _callService;
    private readonly AcutisDbContext _dbContext;

    public ScreeningsController(ICallService callService, AcutisDbContext dbContext)
    {
        _callService = callService;
        _dbContext = dbContext;
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
        var created = await _callService.LogCallAsync(call, cancellationToken);
        return CreatedAtAction(nameof(GetLastNDaysCalls), new { numDays = 1 }, created);
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
}
