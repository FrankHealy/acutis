using Acutis.Application.Interfaces;
using Acutis.Application.Requests;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResidentsController : ControllerBase
{
    private readonly IResidentService _service;

    public ResidentsController(IResidentService service)
    {
        _service = service;
    }

    /// <summary>
    /// Create a new resident
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateResidentRequest request)
    {
        var user = User.Identity?.Name ?? "system";
        var result = await _service.CreateResidentAsync(request, user);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Get resident by Id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetResidentByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Get all residents
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllResidentsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Update resident (partial)
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateResidentRequest request)
    {
        var user = User.Identity?.Name ?? "system";
        var result = await _service.UpdateResidentAsync(id, request, user);
        return Ok(result);
    }

    /// <summary>
    /// Mark resident as completed (all info gathered)
    /// </summary>
    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> MarkCompleted(Guid id)
    {
        var user = User.Identity?.Name ?? "system";
        var result = await _service.MarkResidentCompletedAsync(id, user);
        return Ok(result);
    }

    /// <summary>
    /// Delete resident
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = User.Identity?.Name ?? "system";
        var success = await _service.DeleteResidentAsync(id, user);
        if (!success) return NotFound();
        return NoContent();
    }
}
