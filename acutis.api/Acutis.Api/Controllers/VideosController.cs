using Acutis.Api.Contracts;
using Acutis.Api.Services.UnitVideos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api")]
[AllowAnonymous]
public sealed class VideosController : ControllerBase
{
    private readonly IUnitVideoAdminService _adminService;

    public VideosController(IUnitVideoAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("videos")]
    public async Task<ActionResult<IReadOnlyList<VideoDto>>> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await _adminService.GetAllVideos(cancellationToken);
        return Ok(result);
    }

    [HttpPost("videos")]
    public async Task<ActionResult<VideoDto>> Create([FromBody] CreateVideoRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var created = await _adminService.CreateVideo(request, cancellationToken);
            return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("videos/{id:guid}")]
    public async Task<ActionResult<VideoDto>> Update(Guid id, [FromBody] UpdateVideoRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _adminService.UpdateVideo(id, request, cancellationToken);
            if (updated is null)
            {
                return NotFound();
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("videos/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string? reason = null, CancellationToken cancellationToken = default)
    {
        var deleted = await _adminService.DeleteVideo(id, reason, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("videos/{id:guid}/stream")]
    public async Task<IActionResult> Stream(Guid id, CancellationToken cancellationToken = default)
    {
        var resolved = await _adminService.ResolveStream(id, cancellationToken);
        if (resolved is null)
        {
            return NotFound();
        }

        return PhysicalFile(resolved.Value.path, resolved.Value.contentType, resolved.Value.downloadName, enableRangeProcessing: true);
    }

    [HttpGet("units/{unitId:guid}/video-curation")]
    public async Task<ActionResult<IReadOnlyList<UnitVideoCurationDto>>> GetCuration(Guid unitId, CancellationToken cancellationToken = default)
    {
        var rows = await _adminService.GetUnitCuration(unitId, cancellationToken);
        return Ok(rows);
    }

    [HttpPost("units/{unitId:guid}/video-curation")]
    public async Task<ActionResult<UnitVideoCurationDto>> UpsertCuration(
        Guid unitId,
        [FromBody] UpsertUnitVideoCurationRequest request,
        CancellationToken cancellationToken = default)
    {
        var row = await _adminService.UpsertUnitCuration(unitId, request, cancellationToken);
        return Ok(row);
    }

    [HttpDelete("units/{unitId:guid}/video-curation/{curationId:guid}")]
    public async Task<IActionResult> DeleteCuration(
        Guid unitId,
        Guid curationId,
        [FromQuery] string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var deleted = await _adminService.DeleteUnitCuration(unitId, curationId, reason, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
