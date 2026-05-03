namespace Acutis.Domain.Entities;

public enum ProgrammeType
{
    Alcohol = 1
}

public enum ProgrammeDurationUnit
{
    Days = 1,
    Weeks = 2
}

public enum ParticipationMode
{
    FullProgramme = 1,
    RoleCallOnly = 2,
    Paused = 3,
    Removed = 4
}

public enum WeeklyTherapyRunStatus
{
    Draft = 1,
    Published = 2
}

public enum AssignmentSource
{
    Auto = 1,
    ManualOverride = 2
}

public enum EpisodeEventType
{
    Paused = 1,
    Resumed = 2,
    WeekRepositioned = 3,
    CohortChanged = 4,
    ParticipationModeChanged = 5,
    Ejected = 6,
    Completed = 7,
    SelfDischarge = 8,
    ExtendedStay = 9,
    ClinicalDischarge = 10
}

public enum ScheduleRecurrenceType
{
    OnceOff = 1,
    Daily = 2,
    Weekly = 3,
    Monthly = 4,
    BiMonthly = 5
}

public enum ScheduleAudienceType
{
    UnitResidents = 1,
    AllResidents = 2,
    Cohort = 3,
    ResidentSubset = 4,
    Resident = 5,
    OpenSession = 6
}

public enum ScheduleFacilitatorType
{
    None = 1,
    Staff = 2,
    ResidentLed = 3,
    External = 4
}

public enum ScheduleOccurrenceStatus
{
    Scheduled = 1,
    Cancelled = 2,
    Completed = 3
}
