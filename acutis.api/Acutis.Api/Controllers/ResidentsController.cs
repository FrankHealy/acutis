using Acutis.Api.Contracts;
using Acutis.Api.Services.Residents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/residents")]
[AllowAnonymous]
public sealed class ResidentsController : ControllerBase
{
    private readonly IResidentService _residentService;

    public ResidentsController(IResidentService residentService)
    {
        _residentService = residentService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidents(
        [FromQuery] string unitId = "alcohol",
        CancellationToken cancellationToken = default)
    {
        var residents = await _residentService.GetAllResidentsAsync(unitId, cancellationToken);
        return Ok(residents);
    }
}
