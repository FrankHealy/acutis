using Acutis.Api.Contracts;
using Acutis.Api.Services.Lookups;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/lookups")]
[Authorize]
public sealed class LookupsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet]
    public async Task<ActionResult<LookupSetResponseDto>> GetLookupsForUnit(
        [FromQuery] Guid unitId,
        [FromQuery] List<string>? keys = null,
        [FromQuery] string locale = "en-IE",
        CancellationToken cancellationToken = default)
    {
        if (unitId == Guid.Empty)
        {
            return BadRequest("Query parameter 'unitId' is required.");
        }

        var parsedKeys = ParseKeys(keys);
        var result = await _lookupService.GetLookupsForUnitAsync(unitId, parsedKeys, locale, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<LookupSetResponseDto>> GetLookupByKeyForUnit(
        string key,
        [FromQuery] Guid unitId,
        [FromQuery] string locale = "en-IE",
        CancellationToken cancellationToken = default)
    {
        if (unitId == Guid.Empty)
        {
            return BadRequest("Query parameter 'unitId' is required.");
        }

        if (string.IsNullOrWhiteSpace(key))
        {
            return BadRequest("Route parameter 'key' is required.");
        }

        var result = await _lookupService.GetLookupsForUnitAsync(unitId, new[] { key }, locale, cancellationToken);
        return Ok(result);
    }

    [HttpGet("versions")]
    public async Task<ActionResult<LookupVersionsResponseDto>> GetLookupVersionsForUnit(
        [FromQuery] Guid unitId,
        CancellationToken cancellationToken = default)
    {
        if (unitId == Guid.Empty)
        {
            return BadRequest("Query parameter 'unitId' is required.");
        }

        var result = await _lookupService.GetLookupVersionsForUnitAsync(unitId, cancellationToken);
        return Ok(result);
    }

    private static List<string> ParseKeys(List<string>? keys)
    {
        if (keys is null || keys.Count == 0)
        {
            return new List<string>();
        }

        return keys
            .SelectMany(key => key.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .Select(key => key.Trim())
            .Where(key => !string.IsNullOrWhiteSpace(key))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}
