namespace Acutis.Domain.Entities;

public sealed class AppRole
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExternalRoleName { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; }

    public ICollection<AppRolePermission> RolePermissions { get; set; } = new List<AppRolePermission>();
    public ICollection<AppUserRoleAssignment> UserAssignments { get; set; } = new List<AppUserRoleAssignment>();
}
