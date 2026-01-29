using Acutis.Application.DTOs;
using Acutis.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/therapy")]
[Authorize(Policy = "Therapy.Read")]
public class TherapyController : ControllerBase
{
    private readonly ITherapyCatalogService _catalogService;

    public TherapyController(ITherapyCatalogService catalogService)
    {
        _catalogService = catalogService;
    }

    [HttpGet("ratings")]
    [ProducesResponseType(typeof(IReadOnlyCollection<TherapyTermRatingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRatings(CancellationToken cancellationToken)
    {
        var ratings = await _catalogService.GetRatingsAsync(cancellationToken);
        return Ok(ratings);
    }

    [HttpGet("ratings/{id:guid}/terms")]
    [ProducesResponseType(typeof(IReadOnlyCollection<TherapyTermDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTermsByRating(Guid id, CancellationToken cancellationToken)
    {
        var terms = await _catalogService.GetTermsByRatingAsync(id, cancellationToken);
        if (terms.Count == 0)
        {
            return NotFound();
        }

        return Ok(terms);
    }

    [HttpGet("modules")]
    [ProducesResponseType(typeof(IReadOnlyCollection<TherapyModuleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModules(CancellationToken cancellationToken)
    {
        var modules = await _catalogService.GetModulesAsync(cancellationToken);
        return Ok(modules);
    }
}
