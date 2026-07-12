using Acutis.Api.Services.VideoConsultations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/video-consultations")]
[EnableRateLimiting("video-consultation-tokens")]
[VideoConsultationExceptionFilter]
public sealed class VideoConsultationsController(IVideoConsultationService service) : ControllerBase
{
    [HttpGet("appointments/{appointmentId:guid}")]
    public async Task<ActionResult<VideoConsultationContextDto>> PractitionerContext(Guid appointmentId, CancellationToken ct)
        => Ok(await service.GetPractitionerContextAsync(appointmentId, User, ct));

    [HttpPost("appointments/{appointmentId:guid}/credentials")]
    public async Task<ActionResult<JoinCredentialDto>> PractitionerCredential(Guid appointmentId, CancellationToken ct)
        => Created(string.Empty, await service.IssuePractitionerCredentialAsync(appointmentId, User, ct));

    [HttpPost("appointments/{appointmentId:guid}/invitations")]
    public async Task<ActionResult<InvitationDto>> CreateInvitation(Guid appointmentId, CancellationToken ct)
        => Created(string.Empty, await service.CreateInvitationAsync(appointmentId, User, ct));

    [HttpPost("appointments/{appointmentId:guid}/end")]
    public async Task<IActionResult> End(Guid appointmentId, CancellationToken ct) { await service.EndAsync(appointmentId, User, ct); return NoContent(); }

    [AllowAnonymous, HttpGet("invitations/{invitationToken}")]
    public async Task<ActionResult<VideoConsultationContextDto>> ClientContext(string invitationToken, CancellationToken ct)
        => Ok(await service.GetClientContextAsync(invitationToken, ct));

    [AllowAnonymous, HttpPost("invitations/{invitationToken}/credentials")]
    public async Task<ActionResult<JoinCredentialDto>> ClientCredential(string invitationToken, ClientJoinRequest request, CancellationToken ct)
        => Created(string.Empty, await service.IssueClientCredentialAsync(invitationToken, request.DisplayName, ct));
}

public sealed record ClientJoinRequest(string DisplayName);

public sealed class VideoConsultationExceptionFilterAttribute : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext context)
    {
        var (status, title) = context.Exception switch
        {
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Not found"),
            ArgumentException => (StatusCodes.Status400BadRequest, "Invalid request"),
            InvalidOperationException => (StatusCodes.Status409Conflict, "Consultation unavailable"),
            _ => (0, string.Empty)
        };
        if (status == 0) return;
        context.Result = new ObjectResult(new ProblemDetails { Status = status, Title = title, Detail = context.Exception.Message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
