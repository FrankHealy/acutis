using System.Security.Claims;
using Acutis.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Acutis.Infrastructure.Security;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => GetClaimValue(ClaimTypes.NameIdentifier);

    public string? UserName => GetClaimValue(ClaimTypes.Name);

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

    private string? GetClaimValue(string claimType)
    {
        var principal = _httpContextAccessor.HttpContext?.User;
        return principal?.FindFirst(claimType)?.Value;
    }
}
