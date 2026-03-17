using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.GroupTherapy;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/grouptherapy")]
[Authorize]
public sealed class GroupTherapyController : ControllerBase
{
    private static readonly Guid SystemActorUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private readonly IGroupTherapyService _groupTherapyService;
    private readonly IUnitIdentityService _unitIdentityService;
    private readonly IApplicationAccessService _accessService;

    public GroupTherapyController(
        IGroupTherapyService groupTherapyService,
        IUnitIdentityService unitIdentityService,
        IApplicationAccessService accessService)
    {
        _groupTherapyService = groupTherapyService;
        _unitIdentityService = unitIdentityService;
        _accessService = accessService;
    }

    [HttpGet("program")]
    public async Task<ActionResult<GroupTherapyProgramResponse>> GetProgram(
        [FromQuery] string unitCode = "alcohol",
        [FromQuery] string programCode = "bruree_alcohol_gt",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(unitCode))
        {
            return BadRequest("Query parameter 'unitCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(programCode))
        {
            return BadRequest("Query parameter 'programCode' is required.");
        }

        var unit = await _unitIdentityService.GetByCodeAsync(unitCode, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitCode '{unitCode}'.");
        }

        if (!_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        var program = await _groupTherapyService.GetProgramAsync(unit.UnitCode, programCode, cancellationToken);
        if (program is null)
        {
            return NotFound(
                $"No group therapy program found for unit '{unitCode}' and program '{programCode}'.");
        }

        return Ok(program);
    }

    [HttpGet("/api/units/{unitId:guid}/grouptherapy/program")]
    public async Task<ActionResult<GroupTherapyProgramResponse>> GetProgramByUnitId(
        Guid unitId,
        [FromQuery] string programCode = "bruree_alcohol_gt",
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        var program = await _groupTherapyService.GetProgramAsync(unit.UnitCode, programCode, cancellationToken);
        if (program is null)
        {
            return NotFound(
                $"No group therapy program found for unit '{unit.UnitCode}' and program '{programCode}'.");
        }

        return Ok(program);
    }

    [HttpGet("remarks")]
    public async Task<ActionResult<IReadOnlyList<GroupTherapyResidentRemarkDto>>> GetRemarks(
        [FromQuery] string unitCode = "alcohol",
        [FromQuery] string programCode = "bruree_alcohol_gt",
        [FromQuery] string moduleKey = "spirituality",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(unitCode))
        {
            return BadRequest("Query parameter 'unitCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(programCode))
        {
            return BadRequest("Query parameter 'programCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(moduleKey))
        {
            return BadRequest("Query parameter 'moduleKey' is required.");
        }

        var unit = await _unitIdentityService.GetByCodeAsync(unitCode, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitCode '{unitCode}'.");
        }

        if (!_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        var remarks = await _groupTherapyService.GetRemarksAsync(unit.UnitCode, programCode, moduleKey, cancellationToken);
        return Ok(remarks);
    }

    [HttpGet("/api/units/{unitId:guid}/grouptherapy/remarks")]
    public async Task<ActionResult<IReadOnlyList<GroupTherapyResidentRemarkDto>>> GetRemarksByUnitId(
        Guid unitId,
        [FromQuery] string programCode = "bruree_alcohol_gt",
        [FromQuery] string moduleKey = "spirituality",
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
        }

        if (string.IsNullOrWhiteSpace(programCode))
        {
            return BadRequest("Query parameter 'programCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(moduleKey))
        {
            return BadRequest("Query parameter 'moduleKey' is required.");
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        var remarks = await _groupTherapyService.GetRemarksAsync(unit.UnitCode, programCode, moduleKey, cancellationToken);
        return Ok(remarks);
    }

    [HttpGet("/api/units/{unitId:guid}/grouptherapy/observations")]
    public async Task<ActionResult<IReadOnlyList<GroupTherapyResidentObservationDto>>> GetObservationsByUnitId(
        Guid unitId,
        [FromQuery] string programCode = "bruree_alcohol_gt",
        [FromQuery] string moduleKey = "spirituality",
        [FromQuery] int sessionNumber = 1,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
        }

        if (string.IsNullOrWhiteSpace(programCode))
        {
            return BadRequest("Query parameter 'programCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(moduleKey))
        {
            return BadRequest("Query parameter 'moduleKey' is required.");
        }

        if (sessionNumber <= 0)
        {
            return BadRequest("Query parameter 'sessionNumber' must be greater than zero.");
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        var observations = await _groupTherapyService.GetObservationsAsync(
            unit.UnitCode,
            programCode,
            moduleKey,
            sessionNumber,
            cancellationToken);
        return Ok(observations);
    }

    [HttpPost("remarks")]
    public async Task<ActionResult<GroupTherapyResidentRemarkDto>> UpsertRemark(
        [FromBody] UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return BadRequest("Request body is required.");
        }

        if (request.ResidentId <= 0)
        {
            return BadRequest("Request field 'residentId' must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.UnitCode))
        {
            return BadRequest("Request field 'unitCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ProgramCode))
        {
            return BadRequest("Request field 'programCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ModuleKey))
        {
            return BadRequest("Request field 'moduleKey' is required.");
        }

        var unit = await _unitIdentityService.GetByCodeAsync(request.UnitCode, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitCode '{request.UnitCode}'.");
        }

        if (!_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        request.UnitCode = unit.UnitCode;
        var remark = await _groupTherapyService.UpsertRemarkAsync(request, cancellationToken);
        return Ok(remark);
    }

    [HttpPost("/api/units/{unitId:guid}/grouptherapy/remarks")]
    public async Task<ActionResult<GroupTherapyResidentRemarkDto>> UpsertRemarkByUnitId(
        Guid unitId,
        [FromBody] UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        request.UnitCode = unit.UnitCode;
        return await UpsertRemark(request, cancellationToken);
    }

    [HttpPost("/api/units/{unitId:guid}/grouptherapy/observations")]
    public async Task<ActionResult<GroupTherapyResidentObservationDto>> UpsertObservationByUnitId(
        Guid unitId,
        [FromBody] UpsertGroupTherapyResidentObservationRequest request,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
        }

        if (!_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.GroupTherapyView))
        {
            return Forbid();
        }

        if (request is null)
        {
            return BadRequest("Request body is required.");
        }

        if (request.ResidentId == Guid.Empty)
        {
            return BadRequest("Request field 'residentId' is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ProgramCode))
        {
            return BadRequest("Request field 'programCode' is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ModuleKey))
        {
            return BadRequest("Request field 'moduleKey' is required.");
        }

        if (request.SessionNumber <= 0)
        {
            return BadRequest("Request field 'sessionNumber' must be greater than zero.");
        }

        if (request.ObservedAtUtc == default)
        {
            return BadRequest("Request field 'observedAtUtc' is required.");
        }

        request.UnitCode = unit.UnitCode;

        try
        {
            var actorUserId = ResolveActorUserId(User);
            var observation = await _groupTherapyService.UpsertObservationAsync(request, actorUserId, cancellationToken);
            return Ok(observation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private static Guid ResolveActorUserId(ClaimsPrincipal user)
    {
        var candidateClaims = new[] { ClaimTypes.NameIdentifier, "sub", "app_user_id" };
        foreach (var claimType in candidateClaims)
        {
            var value = user.FindFirstValue(claimType);
            if (!string.IsNullOrWhiteSpace(value) && Guid.TryParse(value, out var parsed))
            {
                return parsed;
            }
        }

        return SystemActorUserId;
    }
}
