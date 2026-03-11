using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Authorize]
public sealed class UnitOperationsController : ControllerBase
{
    private readonly IUnitOperationsService _unitOperationsService;
    private readonly IUnitIdentityService _unitIdentityService;
    private readonly IApplicationAccessService _accessService;

    public UnitOperationsController(
        IUnitOperationsService unitOperationsService,
        IUnitIdentityService unitIdentityService,
        IApplicationAccessService accessService)
    {
        _unitOperationsService = unitOperationsService;
        _unitIdentityService = unitIdentityService;
        _accessService = accessService;
    }

    [HttpGet("/api/units/{unitId:guid}/room-assignments")]
    public async Task<ActionResult<IReadOnlyList<UnitRoomAssignmentDto>>> GetRoomAssignments(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.UnitOperationsView))
        {
            return Forbid();
        }

        var result = await _unitOperationsService.GetRoomAssignmentsAsync(unit.UnitCode, cancellationToken);
        return Ok(result);
    }

    [HttpGet("/api/units/{unitId:guid}/ot-schedule")]
    public async Task<ActionResult<IReadOnlyList<UnitOtDayScheduleDto>>> GetOtSchedule(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.UnitOperationsView))
        {
            return Forbid();
        }

        var result = await _unitOperationsService.GetOtScheduleAsync(unit.UnitCode, cancellationToken);
        return Ok(result);
    }
}
