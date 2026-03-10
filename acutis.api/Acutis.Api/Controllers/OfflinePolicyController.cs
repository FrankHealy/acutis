using Acutis.Api.Contracts;
using Acutis.Api.Services.Policy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/policy")]
[AllowAnonymous]
public sealed class OfflinePolicyController : ControllerBase
{
    private readonly IOfflineWindowPolicyService _policyService;

    public OfflinePolicyController(IOfflineWindowPolicyService policyService)
    {
        _policyService = policyService;
    }

    [HttpGet("offline-windows")]
    public ActionResult<OfflineWindowPolicyStatusDto> GetStatus([FromQuery] DateTime? atUtc = null)
    {
        var now = atUtc?.ToUniversalTime() ?? DateTime.UtcNow;
        return Ok(_policyService.GetStatus(now));
    }
}
