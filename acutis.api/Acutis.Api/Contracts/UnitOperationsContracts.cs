namespace Acutis.Api.Contracts;

public sealed class RoomAssignmentOccupantDto
{
    public int ResidentId { get; set; }
    public Guid ResidentGuid { get; set; }
    public Guid EpisodeId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public string Initials { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public string? PhotoUrl { get; set; }
    public string? OtRole { get; set; }
    public string? BedCode { get; set; }
}

public sealed class RoomAssignmentBedDto
{
    public string BedCode { get; set; } = string.Empty;
    public RoomAssignmentOccupantDto? Occupant { get; set; }
}

public sealed class UnitRoomAssignmentDto
{
    public string RoomCode { get; set; } = string.Empty;
    public string StorageRoomCode { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public IReadOnlyList<RoomAssignmentOccupantDto> Occupants { get; set; } = Array.Empty<RoomAssignmentOccupantDto>();
    public IReadOnlyList<RoomAssignmentBedDto> Beds { get; set; } = Array.Empty<RoomAssignmentBedDto>();
}

public sealed class UnitOperationsResidentDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
}

public sealed class UnitOtSessionDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Facilitator { get; set; } = string.Empty;
    public string Room { get; set; } = string.Empty;
    public IReadOnlyList<UnitOperationsResidentDto> Residents { get; set; } = Array.Empty<UnitOperationsResidentDto>();
}

public sealed class UnitOtDayScheduleDto
{
    public string Day { get; set; } = string.Empty;
    public IReadOnlyList<UnitOtSessionDto> Sessions { get; set; } = Array.Empty<UnitOtSessionDto>();
}

public sealed class UnitOtRoleAssignmentDto
{
    public Guid Id { get; set; }
    public Guid RoleId { get; set; }
    public Guid ResidentGuid { get; set; }
    public Guid EpisodeId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public int ResidentId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public int WeekNumber { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string AssignedAtUtc { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public sealed class UnitOtRoleDefinitionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string RoleType { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public bool RequiresTraining { get; set; }
    public Guid? StaffMemberInChargeId { get; set; }
    public bool IsActive { get; set; }
    public int OccupiedCount { get; set; }
    public int? AvailableSlots { get; set; }
    public IReadOnlyList<UnitOtRoleAssignmentDto> Assignments { get; set; } = Array.Empty<UnitOtRoleAssignmentDto>();
}

public sealed class AssignUnitOtRoleRequest
{
    public Guid EpisodeId { get; set; }
    public Guid RoleId { get; set; }
    public string? Notes { get; set; }
}

public sealed class AssignUnitBedRequest
{
    public Guid EpisodeId { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public string BedCode { get; set; } = string.Empty;
}

public sealed class AssignUnitBedResponse
{
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public Guid? ResidentCaseId { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public string StorageRoomCode { get; set; } = string.Empty;
    public string BedCode { get; set; } = string.Empty;
}

public sealed class UnitTimelineItemDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public int TimeMinutes { get; set; }
    public string EndTime { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string ScheduledDate { get; set; } = string.Empty;
    public bool RequiresFacilitator { get; set; }
    public bool CanTakeEvent { get; set; }
    public Guid? AssignedFacilitatorUserId { get; set; }
    public string AssignedFacilitatorName { get; set; } = string.Empty;
}

public sealed class TakeUnitTimelineEventRequest
{
    public string Key { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public DateOnly ScheduledDate { get; set; }
}

public sealed class UnitStaffRosterStaffDto
{
    public Guid AppUserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public sealed class UnitStaffRosterShiftDto
{
    public string ShiftType { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public int StartMinutes { get; set; }
    public int EndMinutes { get; set; }
    public Guid? AssignedAppUserId { get; set; }
    public string AssignedStaffName { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool IsFilled { get; set; }
}

public sealed class UnitStaffRosterIssueDto
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public sealed class UnitStaffRosterBoardDto
{
    public string UnitCode { get; set; } = string.Empty;
    public string UnitName { get; set; } = string.Empty;
    public string ScheduledDate { get; set; } = string.Empty;
    public Guid? CurrentAppUserId { get; set; }
    public IReadOnlyList<UnitStaffRosterStaffDto> Staff { get; set; } = Array.Empty<UnitStaffRosterStaffDto>();
    public IReadOnlyList<UnitStaffRosterShiftDto> Shifts { get; set; } = Array.Empty<UnitStaffRosterShiftDto>();
    public IReadOnlyList<UnitTimelineItemDto> Events { get; set; } = Array.Empty<UnitTimelineItemDto>();
    public IReadOnlyList<UnitStaffRosterIssueDto> Issues { get; set; } = Array.Empty<UnitStaffRosterIssueDto>();
}

public sealed class AssignUnitStaffRosterShiftRequest
{
    public DateOnly ScheduledDate { get; set; }
    public string ShiftType { get; set; } = string.Empty;
    public Guid? AppUserId { get; set; }
    public string? Notes { get; set; }
}
