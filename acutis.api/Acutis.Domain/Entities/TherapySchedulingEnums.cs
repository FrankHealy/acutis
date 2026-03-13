namespace Acutis.Domain.Entities;

public enum ProgrammeType
{
    Alcohol = 1
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
