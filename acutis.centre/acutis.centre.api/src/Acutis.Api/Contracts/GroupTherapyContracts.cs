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

public sealed class GroupTherapyResidentObservationDto
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? EpisodeEventId { get; set; }
    public Guid ObserverUserId { get; set; }
    public string ModuleKey { get; set; } = string.Empty;
    public int SessionNumber { get; set; }
    public DateTime ObservedAtUtc { get; set; }
    public List<string> SelectedTerms { get; set; } = new();
    public List<GroupTherapyConversationThemeDto> ConversationThemes { get; set; } = new();
    public string? Notes { get; set; }
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

public sealed class UpsertGroupTherapyResidentObservationRequest
{
    public string UnitCode { get; set; } = string.Empty;
    public string ProgramCode { get; set; } = string.Empty;
    public string ModuleKey { get; set; } = string.Empty;
    public int SessionNumber { get; set; }
    public Guid ResidentId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public Guid? EpisodeId { get; set; }
    public Guid? EpisodeEventId { get; set; }
    public DateTime ObservedAtUtc { get; set; }
    public List<string> SelectedTerms { get; set; } = new();
    public List<Guid> ConversationThemeIds { get; set; } = new();
    public string? Notes { get; set; }
}

public sealed class GroupTherapyConversationThemeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public sealed class GroupTherapyFacilitationConfigDto
{
    public Guid Id { get; set; }
    public string CounsellorStyle { get; set; } = string.Empty;
    public bool IsTimingEnabled { get; set; }
    public int? SessionDurationMinutes { get; set; }
    public int? ResidentDurationMinutes { get; set; }
    public decimal ResidentTimeMultiplier { get; set; }
    public int SortOrder { get; set; }
}

public sealed class GroupTherapyFacilitationOptionsDto
{
    public string UnitCode { get; set; } = string.Empty;
    public string ProgramCode { get; set; } = string.Empty;
    public List<GroupTherapyFacilitationConfigDto> Configs { get; set; } = new();
    public List<GroupTherapyConversationThemeDto> ConversationThemes { get; set; } = new();
}
