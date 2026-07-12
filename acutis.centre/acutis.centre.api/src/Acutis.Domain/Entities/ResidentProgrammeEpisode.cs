namespace Acutis.Domain.Entities;

public sealed class ResidentProgrammeEpisode
{
    public Guid Id { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid ResidentId { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? CentreEpisodeCode { get; set; }
    public int EntryYear { get; set; }
    public int EntryWeek { get; set; }
    public int EntrySequence { get; set; }
    public string? RoomNumber { get; set; }
    public string? BedCode { get; set; }
    public DateTime? ExpectedCompletionDate { get; set; }
    public string? PrimaryAddiction { get; set; }
    public ProgrammeType ProgrammeType { get; set; } = ProgrammeType.Alcohol;
    public int CurrentWeekNumber { get; set; }
    public ParticipationMode ParticipationMode { get; set; } = ParticipationMode.FullProgramme;
    public Guid? CohortId { get; set; }

    public ResidentCase? ResidentCase { get; set; }
    public ICollection<EpisodeEvent> EpisodeEvents { get; set; } = new List<EpisodeEvent>();
}
