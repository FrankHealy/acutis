using Acutis.Api.Contracts;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[AllowAnonymous]
public sealed class UnitOperationsController : ControllerBase
{
    private readonly IUnitOperationsService _unitOperationsService;
    private readonly IUnitIdentityService _unitIdentityService;

    public UnitOperationsController(IUnitOperationsService unitOperationsService, IUnitIdentityService unitIdentityService)
    {
        _unitOperationsService = unitOperationsService;
        _unitIdentityService = unitIdentityService;
    }

    [HttpGet("/api/units/{unitId:guid}/room-assignments")]
    public async Task<ActionResult<IReadOnlyList<UnitRoomAssignmentDto>>> GetRoomAssignments(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFound();
        }

        var result = await _unitOperationsService.GetRoomAssignmentsAsync(unit.UnitCode, cancellationToken);
        return Ok(result);
    }

    [HttpGet("/api/units/{unitId:guid}/ot-schedule")]
    public async Task<ActionResult<IReadOnlyList<UnitOtDayScheduleDto>>> GetOtSchedule(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFound();
        }

        var result = await _unitOperationsService.GetOtScheduleAsync(unit.UnitCode, cancellationToken);
        return Ok(result);
    }
}
