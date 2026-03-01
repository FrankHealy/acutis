using Acutis.Api.Contracts;
using Acutis.Api.Services.GroupTherapy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/grouptherapy")]
[AllowAnonymous]
public sealed class GroupTherapyController : ControllerBase
{
    private readonly IGroupTherapyService _groupTherapyService;

    public GroupTherapyController(IGroupTherapyService groupTherapyService)
    {
        _groupTherapyService = groupTherapyService;
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
}
