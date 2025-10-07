using Microsoft.AspNetCore.Mvc;
using Acutis.Application.Interfaces;
using Acutis.Application.Requests;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResidentsController : ControllerBase
{
    private readonly IResidentService _service;
    public ResidentsController(IResidentService service) { _service = service; }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateResidentRequest request)
    {
        var user = User.Identity?.Name ?? "system";
        var dto = await _service.CreateResidentAsync(request, user);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var dto = await _service.GetResidentByIdAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _service.GetAllResidentsAsync();
        return Ok(list);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResidentRequest request)
    {
        var user = User.Identity?.Name ?? "system";
        var dto = await _service.UpdateResidentAsync(id, request, user);
        return Ok(dto);
    }

    [HttpPost("{id:guid}/complete-form")]
    public async Task<IActionResult> MarkAdmissionFormComplete(Guid id)
    {
        var user = User.Identity?.Name ?? "system";
        var dto = await _service.MarkAdmissionFormCompleteAsync(id, user);
        return Ok(dto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = User.Identity?.Name ?? "system";
        var ok = await _service.DeleteResidentAsync(id, user);
        return ok ? NoContent() : NotFound();
    }
}
