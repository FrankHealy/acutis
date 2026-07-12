namespace Acutis.Domain.Entities;

public sealed class IncidentType
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DefaultName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
}
