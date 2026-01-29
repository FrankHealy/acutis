using Acutis.Application.DTOs;
using Acutis.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize(Policy = "Therapy.Read")]
public class AuditController : ControllerBase
{
    private readonly IAuditTrail _auditTrail;

    public AuditController(IAuditTrail auditTrail)
    {
        _auditTrail = auditTrail;
    }

    [HttpGet("{entityName}/{entityId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<AuditTrailItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditHistory(string entityName, Guid entityId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var items = await _auditTrail.GetHistoryAsync(entityId, entityName, page, pageSize, cancellationToken);
        return Ok(items);
    }
}
