using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.Incidents;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Api.Services.Units;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace Acutis.Api.Controllers;

[ApiController]
[Authorize]
public sealed class IncidentsController : ControllerBase
{
    private static readonly Guid SystemActorUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    private readonly IIncidentService _incidentService;
    private readonly IUnitIdentityService _unitIdentityService;
    private readonly IApplicationAccessService _accessService;
    private readonly IAuditService _auditService;
    private readonly Acutis.Api.Security.AuthorizationOptions _authorizationOptions;

    public IncidentsController(
        IIncidentService incidentService,
        IUnitIdentityService unitIdentityService,
        IApplicationAccessService accessService,
        IAuditService auditService,
        IOptions<Acutis.Api.Security.AuthorizationOptions> authorizationOptions)
    {
        _incidentService = incidentService;
        _unitIdentityService = unitIdentityService;
        _accessService = accessService;
        _auditService = auditService;
        _authorizationOptions = authorizationOptions.Value;
    }

    [HttpGet("/api/incident-types")]
    public async Task<ActionResult<IReadOnlyList<IncidentTypeDto>>> GetIncidentTypes(
        CancellationToken cancellationToken = default)
    {
        if (!_authorizationOptions.Disabled &&
            !_accessService.HasPermission(User, ApplicationPermissions.UnitOperationsView))
        {
            return Forbid();
        }

        return Ok(await _incidentService.GetIncidentTypesAsync(cancellationToken));
    }

    [HttpGet("/api/units/{unitId:guid}/incidents")]
    public async Task<ActionResult<IReadOnlyList<IncidentDto>>> GetIncidentsForUnit(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_authorizationOptions.Disabled &&
            !_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.UnitOperationsView))
        {
            return Forbid();
        }

        return Ok(await _incidentService.GetIncidentsForUnitAsync(unitId, cancellationToken));
    }

    [HttpPost("/api/units/{unitId:guid}/incidents")]
    public async Task<ActionResult<IncidentDto>> CreateIncident(
        Guid unitId,
        [FromBody] CreateIncidentRequest request,
        CancellationToken cancellationToken = default)
    {
        var unit = await _unitIdentityService.GetByIdAsync(unitId, cancellationToken);
        if (unit is null)
        {
            return NotFound();
        }

        if (!_authorizationOptions.Disabled &&
            !_accessService.HasUnitPermission(User, unitId, ApplicationPermissions.UnitOperationsView))
        {
            return Forbid();
        }

        try
        {
            var actorUserId = ResolveActorUserId(User);
            var created = await _incidentService.CreateIncidentAsync(unitId, request, actorUserId, cancellationToken);

            await _auditService.WriteAsync(
                centreId: created.CentreId,
                unitId: created.UnitId,
                entityType: nameof(Acutis.Domain.Entities.Incident),
                entityId: created.Id.ToString("D"),
                action: "Create",
                before: null,
                after: created,
                reason: created.Notes,
                cancellationToken);

            return Ok(created);
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
