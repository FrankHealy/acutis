using Acutis.Api.Contracts;
using Acutis.Api.Services.UnitVideos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[AllowAnonymous]
public sealed class UnitVideosController : ControllerBase
{
    private readonly IUnitVideoService _service;

    public UnitVideosController(IUnitVideoService service)
    {
        _service = service;
    }

    [HttpGet("/api/units/{unitId:guid}/videos")]
    public async Task<IActionResult> Get(Guid unitId)
    {
        var result = await _service.GetVideos(unitId);
        return Ok(result);
    }
}
