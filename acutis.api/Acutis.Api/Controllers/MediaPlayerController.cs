using Acutis.Api.Contracts;
using Acutis.Api.Services.MediaPlayer;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/mediaplayer")]
[AllowAnonymous]
public sealed class MediaPlayerController : ControllerBase
{
    private readonly IMediaPlayerService _mediaPlayerService;
    private readonly IUnitIdentityService _unitIdentityService;

    public MediaPlayerController(IMediaPlayerService mediaPlayerService, IUnitIdentityService unitIdentityService)
    {
        _mediaPlayerService = mediaPlayerService;
        _unitIdentityService = unitIdentityService;
    }

    [HttpGet("catalog")]
    public async Task<ActionResult<ApiEnvelope<MediaPlayerCatalogDto>>> GetCatalog(
        [FromQuery] string unitCode,
        CancellationToken cancellationToken = default)
    {
        var catalog = await _mediaPlayerService.GetCatalogAsync(unitCode, cancellationToken);
        return OkEnvelope(catalog);
    }

    [HttpGet("/api/units/{unitId:guid}/mediaplayer/catalog")]
    public async Task<ActionResult<ApiEnvelope<MediaPlayerCatalogDto>>> GetCatalogByUnitId(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFoundEnvelope("UNIT_NOT_FOUND", $"No unit mapping found for unitId '{unitId}'.");
        }

        var catalog = await _mediaPlayerService.GetCatalogAsync(unit.UnitCode, cancellationToken);
        return OkEnvelope(catalog);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> Sync(
        [FromBody] SyncMediaAssetsRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var added = await _mediaPlayerService.SyncAsync(request, cancellationToken);
            return Ok(new ApiEnvelope<object>
            {
                CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
                ServerTimeUtc = DateTime.UtcNow,
                Data = new { added }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequestEnvelope("SYNC_FAILED", ex.Message);
        }
    }

    [HttpPost("/api/units/{unitId:guid}/mediaplayer/sync")]
    public async Task<IActionResult> SyncByUnitId(
        Guid unitId,
        [FromBody] MediaAssetActionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_unitIdentityService.TryGetById(unitId, out var unit))
        {
            return NotFoundEnvelope("UNIT_NOT_FOUND", $"No unit mapping found for unitId '{unitId}'.");
        }

        var added = await _mediaPlayerService.SyncAsync(
            new SyncMediaAssetsRequest
            {
                UnitCode = unit.UnitCode,
                Reason = request.Reason
            },
            cancellationToken);

        return Ok(new ApiEnvelope<object>
        {
            CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
            ServerTimeUtc = DateTime.UtcNow,
            Data = new { added }
        });
    }

    [HttpPost("assets")]
    public async Task<ActionResult<ApiEnvelope<MediaAssetDto>>> RegisterAsset(
        [FromBody] RegisterMediaAssetRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var asset = await _mediaPlayerService.RegisterAsync(request, cancellationToken);
            return OkEnvelope(asset);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequestEnvelope("INVALID_MEDIA_ASSET", ex.Message);
        }
    }

    // One-time migration utility endpoint:
    // imports existing on-disk media metadata into MediaAsset rows (upsert).
    // Keep for controlled backfills only, not regular day-to-day media ingestion.
    [HttpPost("assets/import")]
    public async Task<ActionResult<ApiEnvelope<ImportMediaAssetsResult>>> ImportAssets(
        [FromBody] ImportMediaAssetsRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _mediaPlayerService.ImportAsync(request, cancellationToken);
            return OkEnvelope(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequestEnvelope("IMPORT_FAILED", ex.Message);
        }
    }

    [HttpPost("assets/{assetId:guid}/played")]
    public async Task<ActionResult<ApiEnvelope<MediaAssetDto>>> MarkPlayed(
        Guid assetId,
        [FromBody] MediaAssetActionRequest request,
        CancellationToken cancellationToken = default)
    {
        var asset = await _mediaPlayerService.MarkPlayedAsync(assetId, request.Reason, cancellationToken);
        if (asset is null)
        {
            return NotFoundEnvelope("ASSET_NOT_FOUND", "Media asset not found.");
        }

        return OkEnvelope(asset);
    }

    [HttpPost("assets/{assetId:guid}/deactivate")]
    public async Task<ActionResult<ApiEnvelope<MediaAssetDto>>> Deactivate(
        Guid assetId,
        [FromBody] MediaAssetActionRequest request,
        CancellationToken cancellationToken = default)
    {
        var asset = await _mediaPlayerService.DeactivateAsync(assetId, request.Reason, cancellationToken);
        if (asset is null)
        {
            return NotFoundEnvelope("ASSET_NOT_FOUND", "Media asset not found.");
        }

        return OkEnvelope(asset);
    }

    [HttpDelete("assets/{assetId:guid}")]
    public async Task<IActionResult> Delete(
        Guid assetId,
        [FromQuery] bool deleteFile = false,
        [FromQuery] string? reason = null,
        CancellationToken cancellationToken = default)
    {
        var deleted = await _mediaPlayerService.DeleteAsync(assetId, deleteFile, reason, cancellationToken);
        if (!deleted)
        {
            return NotFoundEnvelope("ASSET_NOT_FOUND", "Media asset not found.");
        }

        return Ok(new ApiEnvelope<object>
        {
            CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
            ServerTimeUtc = DateTime.UtcNow,
            Data = new { deleted = true }
        });
    }

    [HttpGet("assets/{assetId:guid}/stream")]
    public async Task<IActionResult> Stream(Guid assetId, CancellationToken cancellationToken = default)
    {
        var stream = await _mediaPlayerService.ResolveStreamAsync(assetId, cancellationToken);
        if (stream is null)
        {
            return NotFound(new ApiErrorEnvelope
            {
                CorrelationId = RequestCorrelationMiddleware.GetCorrelationId(HttpContext),
                Error = new ApiErrorDetail
                {
                    Code = "ASSET_NOT_FOUND",
                    Message = "Media asset stream not found."
                }
            });
        }

        return PhysicalFile(stream.Value.path, stream.Value.contentType, enableRangeProcessing: true);
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
}
