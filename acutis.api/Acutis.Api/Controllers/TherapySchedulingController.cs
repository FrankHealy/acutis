using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/centres/{centreId:guid}")]
[AllowAnonymous]
public sealed class TherapySchedulingController : ControllerBase
{
    private readonly ITherapySchedulingService _therapySchedulingService;

    public TherapySchedulingController(ITherapySchedulingService therapySchedulingService)
    {
        _therapySchedulingService = therapySchedulingService;
    }

    [HttpGet("therapy-topics")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<TherapyTopicDto>>>> GetTherapyTopics(
        Guid centreId,
        CancellationToken cancellationToken = default)
    {
        var topics = await _therapySchedulingService.GetTherapyTopicsAsync(cancellationToken);
        return OkEnvelope(topics);
    }

    [HttpPost("therapy-scheduling/runs")]
    public async Task<ActionResult<ApiEnvelope<WeeklyTherapyRunDto>>> CreateWeeklyRun(
        Guid centreId,
        [FromBody] CreateWeeklyTherapyRunRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.TopicsRunning.Count != 3)
        {
            return BadRequestEnvelope("TOPICS_RUNNING_INVALID", "Exactly 3 therapy topics must be provided.");
        }

        if (!string.Equals(request.GenerationMode, "AutoDraft", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequestEnvelope("UNSUPPORTED_GENERATION_MODE", "Only generationMode 'AutoDraft' is supported.");
        }

        var run = await _therapySchedulingService.CreateWeeklyRunAsync(centreId, request, cancellationToken);
        return OkEnvelope(run);
    }

    [HttpGet("therapy-scheduling/runs/{runId:guid}")]
    public async Task<ActionResult<ApiEnvelope<WeeklyTherapyRunWithAssignmentsDto>>> GetRunWithAssignments(
        Guid centreId,
        Guid runId,
        CancellationToken cancellationToken = default)
    {
        var run = await _therapySchedulingService.GetRunWithAssignmentsAsync(centreId, runId, cancellationToken);
        if (run is null)
        {
            return NotFoundEnvelope("RUN_NOT_FOUND", "Weekly therapy run not found.");
        }

        return OkEnvelope(run);
    }

    [HttpPost("therapy-scheduling/runs/{runId:guid}/publish")]
    public async Task<ActionResult<ApiEnvelope<PublishWeeklyTherapyRunResponse>>> PublishRun(
        Guid centreId,
        Guid runId,
        [FromBody] PublishWeeklyTherapyRunRequest request,
        CancellationToken cancellationToken = default)
    {
        var published = await _therapySchedulingService.PublishRunAsync(centreId, runId, request, cancellationToken);
        if (published is null)
        {
            return NotFoundEnvelope("RUN_NOT_FOUND", "Weekly therapy run not found.");
        }

        return OkEnvelope(published);
    }

    [HttpPost("therapy-scheduling/assignments/override")]
    public async Task<ActionResult<ApiEnvelope<ResidentWeeklyTherapyAssignmentDto>>> OverrideAssignment(
        Guid centreId,
        [FromBody] OverrideResidentWeeklyTherapyAssignmentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OverrideReason))
        {
            return BadRequestEnvelope("OVERRIDE_REASON_REQUIRED", "overrideReason is required.");
        }

        var assignment = await _therapySchedulingService.OverrideAssignmentAsync(centreId, request, cancellationToken);
        return OkEnvelope(assignment);
    }

    [HttpPost("therapy-scheduling/completions")]
    public async Task<ActionResult<ApiEnvelope<TherapyTopicCompletionDto>>> CreateCompletion(
        Guid centreId,
        [FromBody] CreateTherapyTopicCompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var completion = await _therapySchedulingService.CreateCompletionAsync(centreId, request, cancellationToken);
            return OkEnvelope(completion);
        }
        catch (DuplicateCompletionException ex)
        {
            return ConflictEnvelope(
                "DUPLICATE_COMPLETION",
                "Duplicate topic completion is not allowed in this episode.",
                new { ex.EpisodeId, ex.TherapyTopicId });
        }
    }

    [HttpGet("therapy-scheduling/progress")]
    public async Task<ActionResult<ApiEnvelope<TherapyProgressDto>>> GetProgress(
        Guid centreId,
        [FromQuery] Guid episodeId,
        CancellationToken cancellationToken = default)
    {
        var progress = await _therapySchedulingService.GetProgressAsync(centreId, episodeId, cancellationToken);
        if (progress is null)
        {
            return NotFoundEnvelope("EPISODE_NOT_FOUND", "Resident programme episode not found.");
        }

        return OkEnvelope(progress);
    }

    [HttpPost("episodes/{episodeId:guid}/events")]
    public async Task<ActionResult<ApiEnvelope<EpisodeEventDto>>> CreateEpisodeEvent(
        Guid centreId,
        Guid episodeId,
        [FromBody] CreateEpisodeEventRequest request,
        CancellationToken cancellationToken = default)
    {
        var eventTypeNames = Enum.GetNames<EpisodeEventType>();
        if (!eventTypeNames.Contains(request.EventType, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequestEnvelope(
                "INVALID_EVENT_TYPE",
                "Unsupported eventType value.",
                new { allowedValues = eventTypeNames });
        }

        var episodeEvent = await _therapySchedulingService.CreateEpisodeEventAsync(
            centreId,
            episodeId,
            request,
            cancellationToken);

        if (episodeEvent is null)
        {
            return NotFoundEnvelope("EPISODE_NOT_FOUND", "Resident programme episode not found.");
        }

        return OkEnvelope(episodeEvent);
    }

    private ActionResult<ApiEnvelope<T>> OkEnvelope<T>(T data)
    {
        return Ok(new ApiEnvelope<T>
        {
            CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
            ServerTimeUtc = DateTime.UtcNow,
            Data = data
        });
    }

    private ActionResult BadRequestEnvelope(string code, string message, object? details = null)
    {
        return BadRequest(new ApiErrorEnvelope
        {
            CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
            Error = new ApiErrorDetail
            {
                Code = code,
                Message = message,
                Details = details
            }
        });
    }

    private ActionResult NotFoundEnvelope(string code, string message, object? details = null)
    {
        return NotFound(new ApiErrorEnvelope
        {
            CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
            Error = new ApiErrorDetail
            {
                Code = code,
                Message = message,
                Details = details
            }
        });
    }

    private ActionResult ConflictEnvelope(string code, string message, object? details = null)
    {
        return Conflict(new ApiErrorEnvelope
        {
            CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
            Error = new ApiErrorDetail
            {
                Code = code,
                Message = message,
                Details = details
            }
        });
    }
}
