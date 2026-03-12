using System.Security.Claims;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Security;

public interface IApplicationAccessService
{
    bool HasPermission(ClaimsPrincipal principal, string permission);
    bool HasUnitPermission(ClaimsPrincipal principal, Guid unitId, string permission);
}

public sealed class ApplicationAccessService : IApplicationAccessService
{
    private readonly AuthorizationOptions _authorizationOptions;

    public ApplicationAccessService(IOptions<AuthorizationOptions> authorizationOptions)
    {
        _authorizationOptions = authorizationOptions.Value;
    }

    public bool HasPermission(ClaimsPrincipal principal, string permission)
    {
        if (_authorizationOptions.Disabled)
        {
            return true;
        }

        return principal.HasClaim(ApplicationClaimTypes.Permission, permission);
    }

    public bool HasUnitPermission(ClaimsPrincipal principal, Guid unitId, string permission)
    {
        if (_authorizationOptions.Disabled)
        {
            return true;
        }

        if (HasPermission(principal, permission))
        {
            return true;
        }

        var expected = BuildUnitPermissionValue(unitId, permission);
        return principal.HasClaim(ApplicationClaimTypes.UnitPermission, expected);
    }

    public static string BuildUnitPermissionValue(Guid unitId, string permission)
    {
        return $"{unitId:D}|{permission}";
    }
}
