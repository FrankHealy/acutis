using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ScreeningsController : ControllerBase
{
    private readonly ICallService _callService;

    public ScreeningsController(ICallService callService)
    {
        _callService = callService;
    }

    [HttpGet("calls")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<Call>>> GetCalls(CancellationToken cancellationToken)
    {
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

    [HttpPost("calls")]
    [Authorize]
    public async Task<ActionResult<Call>> LogCall([FromBody] Call call, CancellationToken cancellationToken)
    {
        var created = await _callService.LogCallAsync(call, cancellationToken);
        return CreatedAtAction(nameof(GetLastNDaysCalls), new { numDays = 1 }, created);
    }
}
