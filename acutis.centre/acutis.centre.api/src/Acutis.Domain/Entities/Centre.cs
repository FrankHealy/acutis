namespace Acutis.Domain.Entities;

public sealed class Centre
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string BrandSubtitle { get; set; } = string.Empty;
    public string BrandLogoUrl { get; set; } = string.Empty;
    public string BrowserTitle { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<Unit> Units { get; set; } = new List<Unit>();
    public ICollection<AppUserRoleAssignment> UserAssignments { get; set; } = new List<AppUserRoleAssignment>();
}
