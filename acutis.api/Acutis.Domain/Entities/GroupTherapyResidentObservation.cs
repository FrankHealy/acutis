namespace Acutis.Domain.Entities;

public sealed class GroupTherapyResidentObservation
{
    public Guid Id { get; set; }
    public string UnitCode { get; set; } = null!;
    public string ProgramCode { get; set; } = null!;
    public string ModuleKey { get; set; } = null!;
    public int SessionNumber { get; set; }
    public Guid ResidentId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? EpisodeEventId { get; set; }
    public Guid ObserverUserId { get; set; }
    public DateTime ObservedAtUtc { get; set; }
    public string SelectedTermsJson { get; set; } = "[]";
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public Resident? Resident { get; set; }
    public ResidentCase? ResidentCase { get; set; }
    public ResidentProgrammeEpisode? Episode { get; set; }
    public EpisodeEvent? EpisodeEvent { get; set; }
    public AppUser? ObserverUser { get; set; }
}
