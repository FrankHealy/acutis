namespace Acutis.Domain.Entities;

public sealed class TherapySchedulingConfig
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DayOfWeek IntakeDayPreference { get; set; } = DayOfWeek.Monday;
    public bool ShiftIntakeIfPublicHoliday { get; set; } = true;
    public int DetoxWeeks { get; set; } = 2;
    public int TotalWeeks { get; set; } = 12;
    public int MainProgrammeWeeks { get; set; } = 10;
    public int TopicsRequired { get; set; } = 10;
    public int TopicsRunningPerWeek { get; set; } = 3;
    public string WeekDefinition { get; set; } = "MondayToSunday";
    public string HolidayCalendarCode { get; set; } = "Ireland";
    public bool AllowDuplicateCompletionsInEpisode { get; set; }
}
