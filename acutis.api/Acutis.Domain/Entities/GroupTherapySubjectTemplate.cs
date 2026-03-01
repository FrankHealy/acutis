namespace Acutis.Domain.Entities;

public sealed class GroupTherapySubjectTemplate
{
    public Guid Id { get; set; }
    public string UnitCode { get; set; } = null!;
    public string ProgramCode { get; set; } = null!;
    public int WeekNumber { get; set; }
    public string Topic { get; set; } = null!;
    public string IntroText { get; set; } = null!;
    public bool IsActive { get; set; } = true;

    public ICollection<GroupTherapyDailyQuestion> DailyQuestions { get; set; } = new List<GroupTherapyDailyQuestion>();
}
