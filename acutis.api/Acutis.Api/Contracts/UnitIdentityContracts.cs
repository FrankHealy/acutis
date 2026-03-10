namespace Acutis.Api.Contracts;

public sealed class UnitIdentityDto
{
    public Guid UnitId { get; set; }
    public string UnitCode { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}
