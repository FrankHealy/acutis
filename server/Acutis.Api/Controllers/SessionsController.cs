using System.ComponentModel.DataAnnotations;
using Acutis.Application.DTOs;
using Acutis.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController : ControllerBase
{
    private readonly IGroupSessionService _sessionService;

    public SessionsController(IGroupSessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "Therapy.Read")]
    [ProducesResponseType(typeof(GroupSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSession(Guid id, CancellationToken cancellationToken)
    {
        var session = await _sessionService.GetSessionAsync(id, cancellationToken);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpPost]
    [Authorize(Policy = "Therapy.Write")]
    [ProducesResponseType(typeof(GroupSessionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> ScheduleSession([FromBody] ScheduleSessionRequest request, CancellationToken cancellationToken)
    {
        var session = await _sessionService.ScheduleSessionAsync(
            request.ModuleId,
            request.ScheduledAt,
            request.Facilitator,
            request.Location,
            request.ResidentIds,
            cancellationToken);

        return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
    }

    [HttpPost("{id:guid}/close")]
    [Authorize(Policy = "Therapy.Write")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CloseSession(Guid id, CancellationToken cancellationToken)
    {
        await _sessionService.CloseSessionAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPut("participants/{participantId:guid}/note")]
    [Authorize(Policy = "Therapy.Write")]
    [ProducesResponseType(typeof(SessionNoteDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpsertNote(Guid participantId, [FromBody] UpsertSessionNoteRequest request, CancellationToken cancellationToken)
    {
        var note = await _sessionService.UpsertSessionNoteAsync(participantId, request.Body, request.QuickCommentTemplateIds ?? Array.Empty<Guid>(), cancellationToken);
        return Ok(note);
    }

    public sealed record ScheduleSessionRequest(
        [Required] Guid ModuleId,
        [Required] DateTimeOffset ScheduledAt,
        [Required, MaxLength(128)] string Facilitator,
        [Required, MaxLength(128)] string Location,
        [Required] IReadOnlyCollection<Guid> ResidentIds);

    public sealed record UpsertSessionNoteRequest(
        [Required] string Body,
        IReadOnlyCollection<Guid>? QuickCommentTemplateIds
    );
}

