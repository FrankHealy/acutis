namespace Acutis.Api.Contracts;

public sealed class ResidentListItemDto
{
    public int Id { get; set; }
    public string Psn { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public int Age { get; set; }
    public int WeekNumber { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string UnitId { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}
