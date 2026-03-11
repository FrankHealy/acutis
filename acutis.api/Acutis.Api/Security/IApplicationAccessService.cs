using System.Security.Claims;

namespace Acutis.Api.Security;

public interface IApplicationAccessService
{
    bool HasPermission(ClaimsPrincipal principal, string permission);
    bool HasUnitPermission(ClaimsPrincipal principal, Guid unitId, string permission);
}

public sealed class ApplicationAccessService : IApplicationAccessService
{
    public bool HasPermission(ClaimsPrincipal principal, string permission)
    {
        return principal.HasClaim(ApplicationClaimTypes.Permission, permission);
    }

    public bool HasUnitPermission(ClaimsPrincipal principal, Guid unitId, string permission)
    {
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
