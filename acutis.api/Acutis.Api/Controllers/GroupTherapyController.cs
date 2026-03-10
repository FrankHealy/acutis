using Acutis.Api.Contracts;
using Acutis.Api.Services.GroupTherapy;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/grouptherapy")]
[AllowAnonymous]
public sealed class GroupTherapyController : ControllerBase
{
    private readonly IGroupTherapyService _groupTherapyService;
    private readonly IUnitIdentityService _unitIdentityService;

    public GroupTherapyController(IGroupTherapyService groupTherapyService, IUnitIdentityService unitIdentityService)
    {
        _groupTherapyService = groupTherapyService;
        _unitIdentityService = unitIdentityService;
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

        var program = await _groupTherapyService.GetProgramAsync(unitCode, programCode, cancellationToken);
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
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
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

        var remarks = await _groupTherapyService.GetRemarksAsync(unitCode, programCode, moduleKey, cancellationToken);
        return Ok(remarks);
    }

    [HttpGet("/api/units/{unitId:guid}/grouptherapy/remarks")]
    public async Task<ActionResult<IReadOnlyList<GroupTherapyResidentRemarkDto>>> GetRemarksByUnitId(
        Guid unitId,
        [FromQuery] string programCode = "bruree_alcohol_gt",
        [FromQuery] string moduleKey = "spirituality",
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
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

        var remarks = await _groupTherapyService.GetRemarksAsync(unit.UnitCode, programCode, moduleKey, cancellationToken);
        return Ok(remarks);
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

        var remark = await _groupTherapyService.UpsertRemarkAsync(request, cancellationToken);
        return Ok(remark);
    }

    [HttpPost("/api/units/{unitId:guid}/grouptherapy/remarks")]
    public async Task<ActionResult<GroupTherapyResidentRemarkDto>> UpsertRemarkByUnitId(
        Guid unitId,
        [FromBody] UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFound($"No unit mapping found for unitId '{unitId}'.");
        }

        request.UnitCode = unit.UnitCode;
        return await UpsertRemark(request, cancellationToken);
    }
}
