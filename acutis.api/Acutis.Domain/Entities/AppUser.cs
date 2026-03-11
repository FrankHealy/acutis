namespace Acutis.Domain.Entities;

public sealed class AppUser
{
    public Guid Id { get; set; }
    public string ExternalSubject { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastSeenAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<AppUserRoleAssignment> RoleAssignments { get; set; } = new List<AppUserRoleAssignment>();
}
