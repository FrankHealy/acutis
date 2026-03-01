namespace Acutis.Api.Contracts;

public sealed class GroupTherapyProgramResponse
{
    public string UnitCode { get; set; } = string.Empty;
    public string ProgramCode { get; set; } = string.Empty;
    public List<GroupTherapyWeekDto> Weeks { get; set; } = new();
}

public sealed class GroupTherapyWeekDto
{
    public int WeekNumber { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string IntroText { get; set; } = string.Empty;
    public List<GroupTherapyDayDto> Days { get; set; } = new();
}

public sealed class GroupTherapyDayDto
{
    public int DayNumber { get; set; }
    public List<string> Questions { get; set; } = new();
}

public sealed class GroupTherapyResidentRemarkDto
{
    public Guid Id { get; set; }
    public int ResidentId { get; set; }
    public string ModuleKey { get; set; } = string.Empty;
    public List<string> NoteLines { get; set; } = new();
    public string FreeText { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}

public sealed class UpsertGroupTherapyResidentRemarkRequest
{
    public string UnitCode { get; set; } = string.Empty;
    public string ProgramCode { get; set; } = string.Empty;
    public int ResidentId { get; set; }
    public string ModuleKey { get; set; } = string.Empty;
    public List<string> NoteLines { get; set; } = new();
    public string FreeText { get; set; } = string.Empty;
}
