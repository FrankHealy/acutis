using Acutis.Application.DTOs;
using Acutis.Application.Requests;
using Acutis.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.CallLogging;

public static class AuthSchemes
{
    // Matches the typical JWT Bearer scheme name for Azure AD.
    public const string AzureAdJwt = "AzureAdJwtBearer";
}

public static class AuthPolicies
{
    public const string CallLoggingRead = "CallLogging.Read";
    public const string CallLoggingWrite = "CallLogging.Write";
}

[ApiController]
[Route("api/call-logs")]
[Authorize(AuthenticationSchemes = AuthSchemes.AzureAdJwt)]
public sealed class CallLoggingController : ControllerBase
{
    private readonly ICallLoggingService _callLoggingService;

    public CallLoggingController(ICallLoggingService callLoggingService)
    {
        _callLoggingService = callLoggingService;
    }

    // POST /api/call-logs
    [HttpPost]
    [Authorize(Policy = AuthPolicies.CallLoggingWrite)]
    [ProducesResponseType(typeof(CallLogDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<CallLogDto>> CreateAsync(
        [FromBody] CreateCallLogRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _callLoggingService.CreateAsync(request, User, cancellationToken);
        return CreatedAtAction(nameof(GetByIdAsync), new { id = result.Id }, result);
    }

    // GET /api/call-logs/{id}
    [HttpGet("{id:guid}")]
    [Authorize(Policy = AuthPolicies.CallLoggingRead)]
    [ProducesResponseType(typeof(CallLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CallLogDto>> GetByIdAsync(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _callLoggingService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    // GET /api/call-logs?from=...&to=...&unit=...&callerType=...&concernType=...&status=...&urgency=...&page=...&pageSize=...
    [HttpGet]
    [Authorize(Policy = AuthPolicies.CallLoggingRead)]
    [ProducesResponseType(typeof(PagedResult<CallLogDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<CallLogDto>>> QueryAsync(
        [FromQuery] CallLogQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _callLoggingService.QueryAsync(query, cancellationToken);
        return Ok(result);
    }

    // PUT /api/call-logs/{id}
    [HttpPut("{id:guid}")]
    [Authorize(Policy = AuthPolicies.CallLoggingWrite)]
    [ProducesResponseType(typeof(CallLogDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CallLogDto>> UpdateAsync(
        [FromRoute] Guid id,
        [FromBody] UpdateCallLogRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _callLoggingService.UpdateAsync(id, request, User, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
