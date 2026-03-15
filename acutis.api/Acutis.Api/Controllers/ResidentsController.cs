using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.Residents;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/residents")]
public sealed class ResidentsController : ControllerBase
{
    private static readonly Guid SystemActorUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private readonly IResidentService _residentService;
    private readonly IUnitIdentityService _unitIdentityService;
    private readonly IApplicationAccessService _accessService;
    private readonly IAuditService _auditService;
    private readonly Acutis.Api.Security.AuthorizationOptions _authorizationOptions;

    public ResidentsController(
        IResidentService residentService,
        IUnitIdentityService unitIdentityService,
        IApplicationAccessService accessService,
        IAuditService auditService,
        IOptions<Acutis.Api.Security.AuthorizationOptions> authorizationOptions)
    {
        _residentService = residentService;
        _unitIdentityService = unitIdentityService;
        _accessService = accessService;
        _auditService = auditService;
        _authorizationOptions = authorizationOptions.Value;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidents(
        [FromQuery] string unitId = "alcohol",
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByCodeAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_authorizationOptions.Disabled &&
            !_accessService.HasUnitPermission(User, unit.UnitId, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        var residents = await _residentService.GetAllResidentsAsync(unit.UnitCode, cancellationToken);
        return Ok(residents);
    }

    [HttpGet("/api/units/{unitId:guid}/residents")]
    public async Task<ActionResult<IReadOnlyList<ResidentListItemDto>>> GetAllResidentsByUnitId(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_authorizationOptions.Disabled &&
            !_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        var residents = await _residentService.GetAllResidentsAsync(unit.UnitCode, cancellationToken);
        return Ok(residents);
    }

    [HttpPost("{residentGuid:guid}/discharge")]
    public async Task<ActionResult<RecordDischargeResponse>> RecordDischarge(
        Guid residentGuid,
        [FromBody] RecordDischargeRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_authorizationOptions.Disabled &&
            !_accessService.HasPermission(User, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        if (request.ClientEventId == Guid.Empty)
        {
            return BadRequest("ClientEventId is required.");
        }

        var actorUserId = ResolveActorUserId(User);

        try
        {
            var result = await _residentService.RecordDischargeAsync(
                residentGuid, request, actorUserId, cancellationToken);

            if (!result.WasAlreadyRecorded)
            {
                await _auditService.WriteAsync(
                    centreId: null,
                    unitId: null,
                    entityType: "ResidentProgrammeEpisode",
                    entityId: result.EpisodeId.ToString("D"),
                    action: "Discharge",
                    before: null,
                    after: new { request.ExitType, request.EventDate, request.Reason, result.EpisodeEventId },
                    reason: request.Reason,
                    cancellationToken);
            }

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{residentGuid:guid}/previous-treatments")]
    public async Task<ActionResult<IReadOnlyList<ResidentPreviousTreatmentDto>>> GetPreviousTreatments(
        Guid residentGuid,
        CancellationToken cancellationToken = default)
    {
        if (!_authorizationOptions.Disabled &&
            !_accessService.HasPermission(User, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        try
        {
            var rows = await _residentService.GetPreviousTreatmentsAsync(residentGuid, cancellationToken);
            return Ok(rows);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost("{residentGuid:guid}/previous-treatments")]
    public async Task<ActionResult<ResidentPreviousTreatmentDto>> CreatePreviousTreatment(
        Guid residentGuid,
        [FromBody] UpsertResidentPreviousTreatmentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_authorizationOptions.Disabled &&
            !_accessService.HasPermission(User, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        try
        {
            var created = await _residentService.CreatePreviousTreatmentAsync(residentGuid, request, cancellationToken);
            return CreatedAtAction(nameof(GetPreviousTreatments), new { residentGuid }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{residentGuid:guid}/previous-treatments/{treatmentId:guid}")]
    public async Task<ActionResult<ResidentPreviousTreatmentDto>> UpdatePreviousTreatment(
        Guid residentGuid,
        Guid treatmentId,
        [FromBody] UpsertResidentPreviousTreatmentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_authorizationOptions.Disabled &&
            !_accessService.HasPermission(User, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        try
        {
            var updated = await _residentService.UpdatePreviousTreatmentAsync(
                residentGuid, treatmentId, request, cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{residentGuid:guid}/previous-treatments/{treatmentId:guid}")]
    public async Task<ActionResult> DeletePreviousTreatment(
        Guid residentGuid,
        Guid treatmentId,
        CancellationToken cancellationToken = default)
    {
        if (!_authorizationOptions.Disabled &&
            !_accessService.HasPermission(User, ApplicationPermissions.ResidentsView))
        {
            return Forbid();
        }

        var deleted = await _residentService.DeletePreviousTreatmentAsync(
            residentGuid, treatmentId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private static Guid ResolveActorUserId(ClaimsPrincipal user)
    {
        var candidateClaims = new[] { ClaimTypes.NameIdentifier, "sub", "app_user_id" };
        foreach (var claimType in candidateClaims)
        {
            var value = user.FindFirstValue(claimType);
            if (!string.IsNullOrWhiteSpace(value) && Guid.TryParse(value, out var parsed))
            {
                return parsed;
            }
        }

        return SystemActorUserId;
    }
}
