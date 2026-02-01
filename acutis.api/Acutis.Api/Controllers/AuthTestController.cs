using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/auth-test")]
public sealed class AuthTestController : ControllerBase
{
    [HttpGet("public")]
    [AllowAnonymous]
    public IActionResult Public()
    {
        return Ok(new { message = "Public endpoint OK", utc = DateTimeOffset.UtcNow });
    }

    [HttpGet("protected")]
    [Authorize]
    public IActionResult Protected()
    {
        return Ok(new
        {
            message = "JWT valid",
            user = User.Identity?.Name,
            subject = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"),
            audience = User.FindFirstValue("aud"),
            issuer = User.FindFirstValue("iss"),
            roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToArray()
        });
    }

    [HttpGet("whoami")]
    [Authorize]
    public IActionResult WhoAmI()
    {
        var claims = User.Claims
            .Select(c => new { c.Type, c.Value })
            .ToArray();

        return Ok(new { claims });
    }
}
