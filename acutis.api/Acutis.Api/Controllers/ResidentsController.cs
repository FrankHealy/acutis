using Acutis.Api.Contracts;
using Acutis.Api.Services.Residents;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/residents")]
[AllowAnonymous]
public sealed class ResidentsController : ControllerBase
{
    private readonly IResidentService _residentService;
    private readonly IUnitIdentityService _unitIdentityService;

    public ResidentsController(IResidentService residentService, IUnitIdentityService unitIdentityService)
    {
        _residentService = residentService;
        _unitIdentityService = unitIdentityService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidents(
        [FromQuery] string unitId = "alcohol",
        CancellationToken cancellationToken = default)
    {
        var residents = await _residentService.GetAllResidentsAsync(unitId, cancellationToken);
        return Ok(residents);
    }

    [HttpGet("/api/units/{unitId:guid}/residents")]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidentsByUnitId(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFound();
        }

        var residents = await _residentService.GetAllResidentsAsync(unit.UnitCode, cancellationToken);
        return Ok(residents);
    }
}
