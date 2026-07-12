namespace Acutis.Domain.Entities;

public sealed class GroupTherapyDailyQuestion
{
    public Guid Id { get; set; }
    public Guid SubjectTemplateId { get; set; }
    public GroupTherapySubjectTemplate SubjectTemplate { get; set; } = null!;
    public int DayNumber { get; set; }
    public int SortOrder { get; set; }
    public string QuestionText { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
