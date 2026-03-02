namespace Acutis.Domain.Entities;

public sealed class ResidentProgrammeEpisode
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public ProgrammeType ProgrammeType { get; set; } = ProgrammeType.Alcohol;
    public int CurrentWeekNumber { get; set; }
    public ParticipationMode ParticipationMode { get; set; } = ParticipationMode.FullProgramme;
    public Guid? CohortId { get; set; }
}
