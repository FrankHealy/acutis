using Acutis.Api.Contracts;
using Acutis.Api.Services.Residents;

namespace Acutis.Api.Services.Units;

public interface IUnitOperationsService
{
    Task<IReadOnlyList<UnitRoomAssignmentDto>> GetRoomAssignmentsAsync(string unitCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UnitOtDayScheduleDto>> GetOtScheduleAsync(string unitCode, CancellationToken cancellationToken = default);
}

public sealed class UnitOperationsService : IUnitOperationsService
{
    private static readonly string[] Weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    private readonly IResidentService _residentService;

    public UnitOperationsService(IResidentService residentService)
    {
        _residentService = residentService;
    }

    public async Task<IReadOnlyList<UnitRoomAssignmentDto>> GetRoomAssignmentsAsync(
        string unitCode,
        CancellationToken cancellationToken = default)
    {
        var residents = await _residentService.GetAllResidentsAsync(unitCode, cancellationToken);
        var rooms = GetRoomCodes(unitCode);

        var occupantsByRoom = residents
            .Where(resident => !string.IsNullOrWhiteSpace(resident.RoomNumber))
            .GroupBy(resident => resident.RoomNumber.Trim(), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<RoomAssignmentOccupantDto>)group
                    .OrderBy(resident => resident.Surname)
                    .ThenBy(resident => resident.FirstName)
                    .Take(2)
                    .Select(resident => new RoomAssignmentOccupantDto
                    {
                        ResidentId = resident.Id,
                        Initials = GetInitials(resident.FirstName, resident.Surname),
                        FirstName = resident.FirstName,
                        Surname = resident.Surname
                    })
                    .ToList(),
                StringComparer.OrdinalIgnoreCase);

        return rooms
            .Select(roomCode => new UnitRoomAssignmentDto
            {
                RoomCode = roomCode,
                Capacity = 2,
                Occupants = occupantsByRoom.TryGetValue(roomCode, out var occupants)
                    ? occupants
                    : Array.Empty<RoomAssignmentOccupantDto>()
            })
            .ToList();
    }

    public async Task<IReadOnlyList<UnitOtDayScheduleDto>> GetOtScheduleAsync(
        string unitCode,
        CancellationToken cancellationToken = default)
    {
        var residents = await _residentService.GetAllResidentsAsync(unitCode, cancellationToken);
        var residentPool = residents
            .OrderBy(resident => resident.RoomNumber)
            .ThenBy(resident => resident.Surname)
            .ThenBy(resident => resident.FirstName)
            .ToList();

        return Weekdays
            .Select((day, dayIndex) => new UnitOtDayScheduleDto
            {
                Day = day,
                Sessions = BuildSessionsForDay(unitCode, residentPool, dayIndex)
            })
            .ToList();
    }

    private static IReadOnlyList<string> GetRoomCodes(string unitCode)
    {
        return unitCode.ToLowerInvariant() switch
        {
            "detox" => Enumerable.Range(1, 16).Select(index => index.ToString()).ToList(),
            "ladies" => Enumerable.Range(1, 18).Select(index => index.ToString()).ToList(),
            "drugs" => Enumerable.Range(1, 22).Select(index => index.ToString()).ToList(),
            _ => Enumerable.Range(1, 44).Select(index => index.ToString()).ToList()
        };
    }

    private static IReadOnlyList<UnitOtSessionDto> BuildSessionsForDay(
        string unitCode,
        IReadOnlyList<ResidentListItemDto> residents,
        int dayIndex)
    {
        var cycleOffset = dayIndex * 3;

        return
        [
            BuildSession("ot-am", "Morning OT", $"{GetUnitLabel(unitCode)} OT-1", "OT Studio 1", residents, cycleOffset, 6),
            BuildSession("focus-inside", "Focus Group", $"{GetUnitLabel(unitCode)} Focus Lead", "Focus Room", residents, cycleOffset + 6, 6),
            BuildSession("focus-outside", "Outdoor OT", $"{GetUnitLabel(unitCode)} Activities", "Garden Room", residents, cycleOffset + 12, 6),
            BuildSession("ot-pm", "Afternoon OT", $"{GetUnitLabel(unitCode)} OT-2", "OT Studio 2", residents, cycleOffset + 18, 6)
        ];
    }

    private static UnitOtSessionDto BuildSession(
        string id,
        string title,
        string facilitator,
        string room,
        IReadOnlyList<ResidentListItemDto> residents,
        int startIndex,
        int take)
    {
        if (residents.Count == 0)
        {
            return new UnitOtSessionDto
            {
                Id = id,
                Title = title,
                Facilitator = facilitator,
                Room = room,
                Residents = Array.Empty<UnitOperationsResidentDto>()
            };
        }

        var selected = Enumerable.Range(0, Math.Min(take, residents.Count))
            .Select(offset => residents[(startIndex + offset) % residents.Count])
            .DistinctBy(resident => resident.Id)
            .Select(resident => new UnitOperationsResidentDto
            {
                Id = resident.Id,
                FirstName = resident.FirstName,
                Surname = resident.Surname,
                Age = resident.Age,
                Nationality = resident.Nationality,
                RoomNumber = resident.RoomNumber,
                PhotoUrl = resident.PhotoUrl
            })
            .ToList();

        return new UnitOtSessionDto
        {
            Id = id,
            Title = title,
            Facilitator = facilitator,
            Room = room,
            Residents = selected
        };
    }

    private static string GetInitials(string firstName, string surname)
    {
        var first = string.IsNullOrWhiteSpace(firstName) ? "?" : char.ToUpperInvariant(firstName.Trim()[0]).ToString();
        var second = string.IsNullOrWhiteSpace(surname) ? "?" : char.ToUpperInvariant(surname.Trim()[0]).ToString();
        return $"{first}{second}";
    }

    private static string GetUnitLabel(string unitCode)
    {
        return unitCode.ToLowerInvariant() switch
        {
            "detox" => "Detox",
            "drugs" => "Drugs",
            "ladies" => "Ladies",
            _ => "Alcohol"
        };
    }
}
