namespace Acutis.Domain.Entities;

public sealed class AppPermission
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    public ICollection<AppRolePermission> RolePermissions { get; set; } = new List<AppRolePermission>();
}
