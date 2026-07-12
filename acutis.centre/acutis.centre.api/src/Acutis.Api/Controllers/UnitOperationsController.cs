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

    [HttpGet("/api/units/{unitId:guid}/ot-roles")]
    public async Task<ActionResult<IReadOnlyList<UnitOtRoleDefinitionDto>>> GetOtRoles(
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

        var result = await _unitOperationsService.GetOtRolesAsync(unit.UnitCode, cancellationToken);
        return Ok(result);
    }

    [HttpPost("/api/units/{unitId:guid}/ot-role-assignments")]
    public async Task<ActionResult<UnitOtRoleAssignmentDto>> AssignOtRole(
        Guid unitId,
        [FromBody] AssignUnitOtRoleRequest request,
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

        try
        {
            var result = await _unitOperationsService.AssignOtRoleAsync(unit.UnitCode, request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { message = error.Message });
        }
    }

    [HttpDelete("/api/units/{unitId:guid}/ot-role-assignments/{assignmentId:guid}")]
    public async Task<IActionResult> ReleaseOtRole(
        Guid unitId,
        Guid assignmentId,
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

        try
        {
            await _unitOperationsService.ReleaseOtRoleAsync(unit.UnitCode, assignmentId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { message = error.Message });
        }
    }

    [HttpPost("/api/units/{unitId:guid}/bed-assignments")]
    public async Task<ActionResult<AssignUnitBedResponse>> AssignBed(
        Guid unitId,
        [FromBody] AssignUnitBedRequest request,
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

        try
        {
            var result = await _unitOperationsService.AssignBedAsync(unit.UnitCode, request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException error)
        {
            return BadRequest(new { message = error.Message });
        }
    }
}
