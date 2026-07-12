namespace Acutis.Domain.Entities;

public sealed class Incident
{
    public Guid Id { get; set; }
    public int IncidentTypeId { get; set; }
    public Guid? ResidentId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string DetailsJson { get; set; } = "{}";
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid CreatedByUserId { get; set; }

    public IncidentType? IncidentType { get; set; }
    public Resident? Resident { get; set; }
    public ResidentCase? ResidentCase { get; set; }
    public ResidentProgrammeEpisode? Episode { get; set; }
    public Centre? Centre { get; set; }
    public Unit? Unit { get; set; }
    public AppUser? CreatedByUser { get; set; }
}
