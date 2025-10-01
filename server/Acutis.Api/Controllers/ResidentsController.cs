using Acutis.Application.Common;
using Acutis.Application.DTOs;
using Acutis.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Therapy.Read")]
public class ResidentsController : ControllerBase
{
    private readonly IResidentService _residentService;

    public ResidentsController(IResidentService residentService)
    {
        _residentService = residentService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ResidentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResidents([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken cancellationToken = default)
    {
        var result = await _residentService.GetResidentsAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ResidentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetResident(Guid id, CancellationToken cancellationToken = default)
    {
        var resident = await _residentService.GetResidentAsync(id, cancellationToken);
        return resident is null ? NotFound() : Ok(resident);
    }
}
