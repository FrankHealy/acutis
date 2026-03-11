namespace Acutis.Domain.Entities;

public sealed class AppUserRoleAssignment
{
    public Guid Id { get; set; }
    public Guid AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;
    public Guid AppRoleId { get; set; }
    public AppRole AppRole { get; set; } = null!;
    public string ScopeType { get; set; } = ConfigurationScopeTypes.Unit;
    public Guid CentreId { get; set; }
    public Centre Centre { get; set; } = null!;
    public Guid? UnitId { get; set; }
    public Unit? Unit { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
