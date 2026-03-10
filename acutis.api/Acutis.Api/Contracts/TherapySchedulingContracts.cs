using Acutis.Domain.Entities;
using System.Text.Json;

namespace Acutis.Api.Contracts;

public sealed class ApiEnvelope<T>
{
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime ServerTimeUtc { get; set; }
    public T Data { get; set; } = default!;
}

public sealed class ApiErrorEnvelope
{
    public string CorrelationId { get; set; } = string.Empty;
    public ApiErrorDetail Error { get; set; } = new();
}

public sealed class ApiErrorDetail
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? Details { get; set; }
}

public sealed class TherapyTopicDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DefaultName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public sealed class CreateWeeklyTherapyRunRequest
{
    public Guid? UnitId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public List<Guid> TopicsRunning { get; set; } = new();
    public string GenerationMode { get; set; } = "AutoDraft";
    public string? Notes { get; set; }
}

public sealed class WeeklyTherapyRunDto
{
    public Guid RunId { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public DateOnly WeekEndDate { get; set; }
    public List<Guid> TopicsRunning { get; set; } = new();
    public string Status { get; set; } = string.Empty;
    public DateTime GeneratedAtUtc { get; set; }
    public Guid GeneratedByUserId { get; set; }
    public AssignmentSummaryDto AssignmentSummary { get; set; } = new();
}

public sealed class AssignmentSummaryDto
{
    public int EligibleResidents { get; set; }
    public int Assigned { get; set; }
    public int Skipped { get; set; }
    public List<GenerationWarningDto> Warnings { get; set; } = new();
}

public sealed class GenerationWarningDto
{
    public string Code { get; set; } = string.Empty;
    public int Count { get; set; }
}

public sealed class WeeklyTherapyRunWithAssignmentsDto
{
    public WeeklyTherapyRunDto Run { get; set; } = new();
    public List<ResidentWeeklyTherapyAssignmentDto> Assignments { get; set; } = new();
}

public sealed class ResidentWeeklyTherapyAssignmentDto
{
    public Guid AssignmentId { get; set; }
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public Guid TherapyTopicId { get; set; }
    public string AssignmentSource { get; set; } = string.Empty;
    public string? OverrideReason { get; set; }
    public Guid? SupersedesAssignmentId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid CreatedByUserId { get; set; }
}

public sealed class PublishWeeklyTherapyRunRequest
{
    public string? PublishComment { get; set; }
}

public sealed class PublishWeeklyTherapyRunResponse
{
    public Guid RunId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; }
    public Guid PublishedByUserId { get; set; }
}

public sealed class OverrideResidentWeeklyTherapyAssignmentRequest
{
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public DateOnly WeekStartDate { get; set; }
    public Guid TherapyTopicId { get; set; }
    public string OverrideReason { get; set; } = string.Empty;
}

public sealed class CreateTherapyTopicCompletionRequest
{
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public Guid TherapyTopicId { get; set; }
    public DateOnly CompletedOn { get; set; }
    public Guid? EvidenceNoteId { get; set; }
}

public sealed class TherapyTopicCompletionDto
{
    public Guid CompletionId { get; set; }
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public Guid TherapyTopicId { get; set; }
    public DateOnly CompletedOn { get; set; }
    public Guid? EvidenceNoteId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid CreatedByUserId { get; set; }
}

public sealed class TherapyProgressDto
{
    public Guid EpisodeId { get; set; }
    public int TopicsRequired { get; set; }
    public int TopicsCompleted { get; set; }
    public List<Guid> CompletedTopicIds { get; set; } = new();
    public List<Guid> RemainingTopicIds { get; set; } = new();
    public string ParticipationMode { get; set; } = string.Empty;
    public int CurrentWeekNumber { get; set; }
}

public sealed class CreateEpisodeEventRequest
{
    public string EventType { get; set; } = string.Empty;
    public DateOnly EventDate { get; set; }
    public string? Reason { get; set; }
    public JsonElement Payload { get; set; }
}

public sealed class EpisodeEventDto
{
    public Guid EventId { get; set; }
    public Guid EpisodeId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public DateOnly EventDate { get; set; }
    public string? Reason { get; set; }
    public JsonElement Payload { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public Guid CreatedByUserId { get; set; }
}

public sealed class TherapySchedulingPreferences
{
    public int DetoxWeeks { get; set; } = 2;
    public int TotalWeeks { get; set; } = 12;
    public int MainProgrammeWeeks { get; set; } = 10;
    public int TopicsRequired { get; set; } = 10;
    public int TopicsRunningPerWeek { get; set; } = 3;
    public bool AllowDuplicateCompletionsInEpisode { get; set; }
}

public sealed class TherapySchedulingConfigDto
{
    public Guid? ConfigId { get; set; }
    public Guid CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public string IntakeDayPreference { get; set; } = "Monday";
    public bool ShiftIntakeIfPublicHoliday { get; set; } = true;
    public int DetoxWeeks { get; set; } = 2;
    public int TotalWeeks { get; set; } = 12;
    public int MainProgrammeWeeks { get; set; } = 10;
    public int TopicsRequired { get; set; } = 10;
    public int TopicsRunningPerWeek { get; set; } = 3;
    public string WeekDefinition { get; set; } = "MondayToSunday";
    public string HolidayCalendar { get; set; } = "Ireland";
    public bool AllowDuplicateCompletionsInEpisode { get; set; }
    public bool IsPersisted { get; set; }
    public string Source { get; set; } = "Default";
}

public sealed class UpsertTherapySchedulingConfigRequest
{
    public Guid? UnitId { get; set; }
    public string IntakeDayPreference { get; set; } = "Monday";
    public bool ShiftIntakeIfPublicHoliday { get; set; } = true;
    public int DetoxWeeks { get; set; } = 2;
    public int TotalWeeks { get; set; } = 12;
    public int MainProgrammeWeeks { get; set; } = 10;
    public int TopicsRequired { get; set; } = 10;
    public int TopicsRunningPerWeek { get; set; } = 3;
    public string WeekDefinition { get; set; } = "MondayToSunday";
    public string HolidayCalendar { get; set; } = "Ireland";
    public bool AllowDuplicateCompletionsInEpisode { get; set; }
    public string? Reason { get; set; }
}

public sealed class DuplicateCompletionException : InvalidOperationException
{
    public DuplicateCompletionException(Guid episodeId, Guid therapyTopicId)
        : base("Duplicate topic completion is not allowed for this episode.")
    {
        EpisodeId = episodeId;
        TherapyTopicId = therapyTopicId;
    }

    public Guid EpisodeId { get; }
    public Guid TherapyTopicId { get; }
}
