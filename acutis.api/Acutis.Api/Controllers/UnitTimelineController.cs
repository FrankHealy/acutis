using Acutis.Api.Contracts;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/units/{unitCode}/timeline")]
[Authorize]
public sealed class UnitTimelineController : ControllerBase
{
    private readonly IUnitTimelineService _unitTimelineService;

    public UnitTimelineController(IUnitTimelineService unitTimelineService)
    {
        _unitTimelineService = unitTimelineService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UnitTimelineItemDto>>> GetTimeline(
        string unitCode,
        [FromQuery] DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await _unitTimelineService.GetTimelineAsync(unitCode, date, cancellationToken));
        }
        catch (InvalidOperationException error)
        {
            return NotFound(error.Message);
        }
    }

    [HttpPost("take-event")]
    public async Task<ActionResult<UnitTimelineItemDto>> TakeEvent(
        string unitCode,
        [FromBody] TakeUnitTimelineEventRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await _unitTimelineService.TakeEventAsync(unitCode, request, cancellationToken));
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { message = error.Message });
        }
    }
}
