using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.Residents;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/residents")]
public sealed class ResidentsController : ControllerBase
{
    private readonly IResidentService _residentService;
    private readonly IUnitIdentityService _unitIdentityService;
    private readonly IApplicationAccessService _accessService;
    private readonly Acutis.Api.Security.AuthorizationOptions _authorizationOptions;

    public ResidentsController(
        IResidentService residentService,
        IUnitIdentityService unitIdentityService,
        IApplicationAccessService accessService,
        IOptions<Acutis.Api.Security.AuthorizationOptions> authorizationOptions)
    {
        _residentService = residentService;
        _unitIdentityService = unitIdentityService;
        _accessService = accessService;
        _authorizationOptions = authorizationOptions.Value;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidents(
        [FromQuery] string unitId = "alcohol",
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByCodeAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_authorizationOptions.Disabled &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        var residents = await _residentService.GetAllResidentsAsync(unit.UnitCode, cancellationToken);
        return Ok(residents);
    }

    [HttpGet("/api/units/{unitId:guid}/residents")]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidentsByUnitId(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_authorizationOptions.Disabled &&
            !_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        var residents = await _residentService.GetAllResidentsAsync(unit.UnitCode, cancellationToken);
        return Ok(residents);
    }
}
