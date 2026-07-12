using Acutis.Api.Contracts;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/units/{unitCode}/staff-roster")]
[Authorize]
public sealed class UnitStaffRosterController : ControllerBase
{
    private readonly IUnitStaffRosterService _unitStaffRosterService;

    public UnitStaffRosterController(IUnitStaffRosterService unitStaffRosterService)
    {
        _unitStaffRosterService = unitStaffRosterService;
    }

    [HttpGet]
    public async Task<ActionResult<UnitStaffRosterBoardDto>> GetBoard(
        string unitCode,
        [FromQuery] DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await _unitStaffRosterService.GetBoardAsync(unitCode, date, cancellationToken));
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { message = error.Message });
        }
    }

    [HttpPost("assign-shift")]
    public async Task<ActionResult<UnitStaffRosterBoardDto>> AssignShift(
        string unitCode,
        [FromBody] AssignUnitStaffRosterShiftRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await _unitStaffRosterService.AssignShiftAsync(unitCode, request, cancellationToken));
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { message = error.Message });
        }
    }
}
