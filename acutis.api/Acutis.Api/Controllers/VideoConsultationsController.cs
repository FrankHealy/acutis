using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Api.Services.VideoConsultations;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

namespace Acutis.Api.Controllers;

[ApiController]
public sealed class VideoConsultationsController : ControllerBase
{
    private static readonly ConcurrentDictionary<string, SlidingWindow> ExternalLimits = new();
    private readonly VideoConsultationService _service;

    public VideoConsultationsController(
        AcutisAmbulatoryDbContext db,
        IConfiguration configuration,
        IAuditService audit)
    {
        _service = new VideoConsultationService(db, configuration, audit);
    }

    [HttpGet("api/practitioner/appointments/{appointmentId:guid}/video")]
    public async Task<ActionResult<PractitionerVideoConsultationContextDto>> GetPractitionerContext(
        Guid appointmentId,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _service.GetPractitionerContextAsync(appointmentId, User, cancellationToken));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("api/practitioner/appointments/{appointmentId:guid}/video/join-credential")]
    public async Task<ActionResult<LiveKitJoinCredentialDto>> CreatePractitionerCredential(
        Guid appointmentId,
        CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-store";
        try
        {
            var credential = await _service.CreatePractitionerCredentialAsync(appointmentId, User, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, credential);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Unable to join consultation", Detail = ex.Message, Status = 409 });
        }
    }

    [HttpPost("api/practitioner/appointments/{appointmentId:guid}/video/invitations")]
    public async Task<ActionResult<CreateVideoConsultationInvitationResponse>> CreateInvitation(
        Guid appointmentId,
        CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-store";
        try
        {
            var invitation = await _service.CreateInvitationAsync(appointmentId, User, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, invitation);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Unable to create invitation", Detail = ex.Message, Status = 409 });
        }
    }

    [HttpPost("api/practitioner/appointments/{appointmentId:guid}/video/end")]
    public async Task<IActionResult> End(Guid appointmentId, CancellationToken cancellationToken)
    {
        try
        {
            await _service.EndAsync(appointmentId, User, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [AllowAnonymous]
    [HttpPost("api/video-consultations/external/context")]
    public async Task<ActionResult<ExternalVideoConsultationContextDto>> GetExternalContext(
        ExternalInvitationRequest request,
        CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-store";
        if (!AllowExternalRequest()) return StatusCode(StatusCodes.Status429TooManyRequests);
        try
        {
            return Ok(await _service.GetExternalContextAsync(request.InvitationToken, cancellationToken));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Invitation unavailable", Detail = ex.Message, Status = 409 });
        }
    }

    [AllowAnonymous]
    [HttpPost("api/video-consultations/external/join-credential")]
    public async Task<ActionResult<LiveKitJoinCredentialDto>> CreateExternalCredential(
        ExternalJoinCredentialRequest request,
        CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-store";
        if (!AllowExternalRequest()) return StatusCode(StatusCodes.Status429TooManyRequests);
        try
        {
            var credential = await _service.CreateExternalCredentialAsync(request.InvitationToken, request.DisplayName, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, credential);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid join request", Detail = ex.Message, Status = 400 });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = "Invitation unavailable", Detail = ex.Message, Status = 409 });
        }
    }

    private bool AllowExternalRequest()
    {
        var key = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return ExternalLimits.GetOrAdd(key, _ => new SlidingWindow()).TryAcquire(DateTime.UtcNow);
    }

    private sealed class SlidingWindow
    {
        private readonly Queue<DateTime> _requests = new();
        private readonly object _sync = new();

        public bool TryAcquire(DateTime now)
        {
            lock (_sync)
            {
                while (_requests.Count > 0 && now - _requests.Peek() > TimeSpan.FromMinutes(1))
                {
                    _requests.Dequeue();
                }

                if (_requests.Count >= 20) return false;
                _requests.Enqueue(now);
                return true;
            }
        }
    }
}
