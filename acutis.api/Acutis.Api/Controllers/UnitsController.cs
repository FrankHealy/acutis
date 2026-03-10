using Acutis.Api.Contracts;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/units")]
[AllowAnonymous]
public sealed class UnitsController : ControllerBase
{
    private readonly IUnitIdentityService _unitIdentityService;

    public UnitsController(IUnitIdentityService unitIdentityService)
    {
        _unitIdentityService = unitIdentityService;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<UnitIdentityDto>> GetAll()
    {
        return Ok(_unitIdentityService.GetAll());
    }

    [HttpGet("resolve")]
    public ActionResult<UnitIdentityDto> Resolve([FromQuery] string unitCode)
    {
        if (string.IsNullOrWhiteSpace(unitCode))
        {
            return BadRequest("unitCode is required.");
        }

        if (!_unitIdentityService.TryGetByCode(unitCode, out var unit))
        {
            return NotFound();
        }

        return Ok(unit);
    }
}
