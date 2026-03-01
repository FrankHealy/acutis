using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ScreeningsController : ControllerBase
{
    public sealed record EvaluateeDto(
        string Surname,
        string Name,
        string Unit,
        int NumCalls,
        DateTimeOffset LastCallDate,
        string Status
    );

    private readonly ICallService _callService;

    public ScreeningsController(ICallService callService)
    {
        _callService = callService;
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
        var calls = await _callService.GetCallsAsync(cancellationToken);

        var grouped = calls
            .GroupBy(call =>
            {
                var caller = (call.Caller ?? string.Empty).Trim();
                var parts = caller.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                var firstName = parts.Length > 0 ? parts[0] : "Unknown";
                var surname = parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : "Unknown";
                var unit = string.IsNullOrWhiteSpace(call.Source) ? "Unknown" : call.Source;
                return new { firstName, surname, unit };
            })
            .Select(group => new EvaluateeDto(
                Surname: group.Key.surname,
                Name: group.Key.firstName,
                Unit: group.Key.unit,
                NumCalls: group.Count(),
                LastCallDate: group.Max(call => call.CallTimeUtc),
                Status: "pending"
            ))
            .OrderBy(item => item.Surname)
            .ThenBy(item => item.Name)
            .ToList();

        return Ok(grouped);
    }

    [HttpPost("calls")]
    [Authorize]
    public async Task<ActionResult<Call>> LogCall([FromBody] Call call, CancellationToken cancellationToken)
    {
        var created = await _callService.LogCallAsync(call, cancellationToken);
        return CreatedAtAction(nameof(GetLastNDaysCalls), new { numDays = 1 }, created);
    }
}
