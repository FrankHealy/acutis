namespace Acutis.Domain.Entities;

public sealed class AppRolePermission
{
    public Guid AppRoleId { get; set; }
    public AppRole AppRole { get; set; } = null!;
    public Guid AppPermissionId { get; set; }
    public AppPermission AppPermission { get; set; } = null!;
}
