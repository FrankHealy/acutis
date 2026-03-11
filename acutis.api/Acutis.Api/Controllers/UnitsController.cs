using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/units")]
[Authorize]
public sealed class UnitsController : ControllerBase
{
    private readonly IUnitIdentityService _unitIdentityService;
    private readonly IApplicationAccessService _accessService;

    public UnitsController(IUnitIdentityService unitIdentityService, IApplicationAccessService accessService)
    {
        _unitIdentityService = unitIdentityService;
        _accessService = accessService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UnitIdentityDto>>> GetAll(CancellationToken cancellationToken = default)
    {
        var units = await _unitIdentityService.GetAllAsync(cancellationToken: cancellationToken);
        if (_accessService.HasPermission(User, ApplicationPermissions.ConfigurationManage) ||
            _accessService.HasPermission(User, ApplicationPermissions.UnitsManage))
        {
            return Ok(units);
        }

        var permittedUnitIds = User.Claims
            .Where(claim => claim.Type == ApplicationClaimTypes.UnitAccess)
            .Select(claim => Guid.TryParse(claim.Value, out var unitId) ? unitId : Guid.Empty)
            .Where(unitId => unitId != Guid.Empty)
            .ToHashSet();

        return Ok(units.Where(unit => permittedUnitIds.Contains(unit.UnitId)).ToList());
    }

    [HttpGet("resolve")]
    public async Task<ActionResult<UnitIdentityDto>> Resolve([FromQuery] string unitCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(unitCode))
        {
            return BadRequest("unitCode is required.");
        }

        var unit = await _unitIdentityService.GetByCodeAsync(unitCode, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_accessService.HasPermission(User, ApplicationPermissions.ConfigurationManage) &&
            !_accessService.HasPermission(User, ApplicationPermissions.UnitsManage) &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.ResidentsView) &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.ScreeningView) &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.MediaView) &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.GroupTherapyView) &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.UnitOperationsView))
        {
            return Forbid();
        }

        return Ok(unit);
    }
}
