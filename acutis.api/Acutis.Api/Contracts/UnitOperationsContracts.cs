namespace Acutis.Api.Contracts;

public sealed class RoomAssignmentOccupantDto
{
    public int ResidentId { get; set; }
    public string Initials { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
}

public sealed class UnitRoomAssignmentDto
{
    public string RoomCode { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public IReadOnlyList<RoomAssignmentOccupantDto> Occupants { get; set; } = Array.Empty<RoomAssignmentOccupantDto>();
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
