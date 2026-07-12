namespace Acutis.Api.Security;

public static class ApplicationRoles
{
    public const string PlatformAdmin = "platform_admin";
    public const string ExternalAdmin = "admin";
    public static readonly string[] SuperAdminAliases = [PlatformAdmin, ExternalAdmin, "super_admin", "super admin"];
}
