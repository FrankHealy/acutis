namespace Acutis.Api.Contracts;

public sealed class UnitIdentityDto
{
    public Guid UnitId { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CentreId { get; set; }
    public string CentreCode { get; set; } = string.Empty;
    public string CentreDisplayName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string BrandSubtitle { get; set; } = string.Empty;
    public string BrandLogoUrl { get; set; } = string.Empty;
    public string BrowserTitle { get; set; } = string.Empty;
    public string FaviconUrl { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = string.Empty;
    public int UnitCapacity { get; set; }
    public int CurrentOccupancy { get; set; }
    public int FreeBeds { get; set; }
    public int CapacityWarningThreshold { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}
