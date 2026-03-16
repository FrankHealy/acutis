namespace Acutis.Api.Contracts;

public sealed class CentreConfigurationDto
{
    public Guid CentreId { get; set; }
    public string CentreCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string BrandSubtitle { get; set; } = string.Empty;
    public string BrandLogoUrl { get; set; } = string.Empty;
    public string BrowserTitle { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public int UnitCount { get; set; }
    public bool IsActive { get; set; }
}

public sealed class UpsertCentreRequest
{
    public string CentreCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string BrandSubtitle { get; set; } = string.Empty;
    public string BrandLogoUrl { get; set; } = string.Empty;
    public string BrowserTitle { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UnitConfigurationDto
{
    public Guid UnitId { get; set; }
    public Guid CentreId { get; set; }
    public string CentreCode { get; set; } = string.Empty;
    public string CentreName { get; set; } = string.Empty;
    public string UnitCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UnitCapacity { get; set; }
    public int CurrentOccupancy { get; set; }
    public int FreeBeds { get; set; }
    public int CapacityWarningThreshold { get; set; }
    public int DefaultResidentWeekNumber { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

public sealed class UpsertUnitRequest
{
    public Guid CentreId { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UnitCapacity { get; set; }
    public int CurrentOccupancy { get; set; }
    public int CapacityWarningThreshold { get; set; }
    public int DefaultResidentWeekNumber { get; set; } = 1;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class AppPermissionDto
{
    public Guid PermissionId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public sealed class UpsertAppPermissionRequest
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public sealed class AppRoleDto
{
    public Guid RoleId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExternalRoleName { get; set; } = string.Empty;
    public string DefaultScopeType { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; }
    public IReadOnlyList<string> PermissionKeys { get; set; } = Array.Empty<string>();
}

public sealed class UpsertAppRoleRequest
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ExternalRoleName { get; set; } = string.Empty;
    public string DefaultScopeType { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public bool IsActive { get; set; } = true;
    public IReadOnlyList<string> PermissionKeys { get; set; } = Array.Empty<string>();
}

public sealed class AppUserRoleAssignmentDto
{
    public Guid AssignmentId { get; set; }
    public Guid RoleId { get; set; }
    public string RoleKey { get; set; } = string.Empty;
    public string ScopeType { get; set; } = string.Empty;
    public Guid CentreId { get; set; }
    public string CentreCode { get; set; } = string.Empty;
    public string CentreName { get; set; } = string.Empty;
    public Guid? UnitId { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string UnitName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public sealed class AppUserDto
{
    public Guid UserId { get; set; }
    public string ExternalSubject { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastSeenAtUtc { get; set; }
    public IReadOnlyList<AppUserRoleAssignmentDto> Assignments { get; set; } = Array.Empty<AppUserRoleAssignmentDto>();
}

public sealed class UpsertAppUserRequest
{
    public string ExternalSubject { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public sealed class ReplaceUserRoleAssignmentsRequest
{
    public IReadOnlyList<UpsertUserRoleAssignmentItem> Assignments { get; set; } = Array.Empty<UpsertUserRoleAssignmentItem>();
}

public sealed class UpsertUserRoleAssignmentItem
{
    public Guid RoleId { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public bool IsActive { get; set; } = true;
}
