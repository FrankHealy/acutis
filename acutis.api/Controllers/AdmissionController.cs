using Microsoft.AspNetCore.Mvc;
using Acutis.Application.Admissions;
using Acutis.Application.Admissions.Requests;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdmissionsController : ControllerBase
{
    private readonly IAdmissionsFunctionClient _functions;

    public AdmissionsController(IAdmissionsFunctionClient functions) => _functions = functions;

    [HttpPost("residents")]
    public async Task<IActionResult> CreateResident(CreateResidentRequest request)
    {
        var id = await _functions.CreateResidentAsync(request);
        return CreatedAtAction(nameof(GetResident), new { id }, new { id });
    }

    [HttpGet("residents/{id:guid}")]
    public async Task<IActionResult> GetResident(Guid id)
    {
        var resident = await _functions.GetResidentAsync(id);
        return resident is null ? NotFound() : Ok(resident);
    }

    [HttpGet("residents")]
    public async Task<IActionResult> GetAllResidents()
    {
        var residents = await _functions.GetAllResidentsAsync();
        return Ok(residents);
    }

    [HttpPut("residents/{id:guid}/complete")]
    public async Task<IActionResult> MarkResidentCompleted(Guid id)
    {
        var username = User?.Identity?.Name ?? "system";
        await _functions.MarkResidentCompletedAsync(id, username);
        return NoContent();
    }
}
