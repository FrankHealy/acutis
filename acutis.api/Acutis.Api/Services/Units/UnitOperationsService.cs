using System.Security.Claims;
using Acutis.Api.Contracts;
using Acutis.Api.Services.Residents;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Units;

public interface IUnitOperationsService
{
    Task<IReadOnlyList<UnitRoomAssignmentDto>> GetRoomAssignmentsAsync(string unitCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UnitOtDayScheduleDto>> GetOtScheduleAsync(string unitCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UnitOtRoleDefinitionDto>> GetOtRolesAsync(string unitCode, CancellationToken cancellationToken = default);
    Task<UnitOtRoleAssignmentDto> AssignOtRoleAsync(string unitCode, AssignUnitOtRoleRequest request, CancellationToken cancellationToken = default);
    Task ReleaseOtRoleAsync(string unitCode, Guid assignmentId, CancellationToken cancellationToken = default);
    Task<AssignUnitBedResponse> AssignBedAsync(string unitCode, AssignUnitBedRequest request, CancellationToken cancellationToken = default);
}

public sealed class UnitOperationsService : IUnitOperationsService
{
    private static readonly string[] Weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    private readonly AcutisDbContext _dbContext;
    private readonly IResidentService _residentService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public UnitOperationsService(
        AcutisDbContext dbContext,
        IResidentService residentService,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _residentService = residentService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<IReadOnlyList<UnitRoomAssignmentDto>> GetRoomAssignmentsAsync(
        string unitCode,
        CancellationToken cancellationToken = default)
    {
        var residents = await _residentService.GetAllResidentsAsync(unitCode, cancellationToken);
        var rooms = GetRoomCodes(unitCode);
        var otRoleByEpisodeId = await GetActiveOtRoleByEpisodeIdAsync(unitCode, residents, cancellationToken);

        var occupantsByRoom = residents
            .Where(resident => !string.IsNullOrWhiteSpace(resident.RoomNumber))
            .GroupBy(resident => ToDisplayRoomCode(unitCode, resident.RoomNumber), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<RoomAssignmentOccupantDto>)group
                    .OrderBy(resident => resident.Surname)
                    .ThenBy(resident => resident.FirstName)
                    .Take(2)
                    .Select(resident => new RoomAssignmentOccupantDto
                    {
                        ResidentId = resident.Id,
                        ResidentGuid = resident.ResidentGuid,
                        EpisodeId = resident.EpisodeId ?? Guid.Empty,
                        ResidentCaseId = resident.ResidentCaseId,
                        Initials = GetInitials(resident.FirstName, resident.Surname),
                        FirstName = resident.FirstName,
                        Surname = resident.Surname,
                        WeekNumber = resident.WeekNumber,
                        PhotoUrl = resident.PhotoUrl,
                        OtRole = resident.EpisodeId is Guid episodeId && otRoleByEpisodeId.TryGetValue(episodeId, out var otRole)
                            ? otRole
                            : null,
                        BedCode = resident.BedCode
                    })
                    .ToList(),
                StringComparer.OrdinalIgnoreCase);

        return rooms
            .Select(roomCode =>
            {
                var occupants = occupantsByRoom.TryGetValue(roomCode, out var roomOccupants)
                    ? roomOccupants
                    : Array.Empty<RoomAssignmentOccupantDto>();
                var bedCodes = GetBedCodes(unitCode, roomCode);
                var occupantByBed = occupants
                    .Where(occupant => !string.IsNullOrWhiteSpace(occupant.BedCode))
                    .ToDictionary(occupant => occupant.BedCode!, StringComparer.OrdinalIgnoreCase);

                return new UnitRoomAssignmentDto
                {
                    RoomCode = roomCode,
                    StorageRoomCode = ToStorageRoomCode(unitCode, roomCode),
                    Capacity = bedCodes.Count,
                    Occupants = occupants,
                    Beds = bedCodes
                        .Select(bedCode => new RoomAssignmentBedDto
                        {
                            BedCode = bedCode,
                            Occupant = occupantByBed.TryGetValue(bedCode, out var occupant) ? occupant : null
                        })
                        .ToList()
                };
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

    public async Task<IReadOnlyList<UnitOtRoleDefinitionDto>> GetOtRolesAsync(
        string unitCode,
        CancellationToken cancellationToken = default)
    {
        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var residents = await _residentService.GetAllResidentsAsync(unitCode, cancellationToken);
        var residentsByEpisodeId = residents
            .Where(resident => resident.EpisodeId.HasValue)
            .ToDictionary(resident => resident.EpisodeId!.Value);
        var today = DateOnly.FromDateTime(DateTime.Today);

        var roleDefinitions = await _dbContext.OtRoleDefinitions
            .AsNoTracking()
            .Where(role =>
                role.CentreId == unit.CentreId &&
                role.IsActive &&
                (!role.UnitId.HasValue || role.UnitId == unit.Id) &&
                (!role.IsOneOff || role.ScheduledDate == today))
            .OrderBy(role => role.DisplayOrder)
            .ThenBy(role => role.Name)
            .ToListAsync(cancellationToken);

        var episodeIds = residentsByEpisodeId.Keys.ToList();
        var activeAssignments = episodeIds.Count == 0
            ? []
            : await _dbContext.ResidentOtRoleAssignments
                .AsNoTracking()
                .Where(assignment => assignment.ReleasedAtUtc == null && episodeIds.Contains(assignment.EpisodeId))
                .OrderBy(assignment => assignment.AssignedAtUtc)
                .ToListAsync(cancellationToken);

        var assignmentsByRoleId = activeAssignments
            .Where(assignment => residentsByEpisodeId.ContainsKey(assignment.EpisodeId))
            .GroupBy(assignment => assignment.OtRoleDefinitionId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<UnitOtRoleAssignmentDto>)group
                    .Select(assignment => MapRoleAssignment(assignment, residentsByEpisodeId[assignment.EpisodeId]))
                    .OrderBy(assignment => assignment.Surname)
                    .ThenBy(assignment => assignment.FirstName)
                    .ToList());

        return roleDefinitions
            .Select(role =>
            {
                var assignments = assignmentsByRoleId.TryGetValue(role.Id, out var value)
                    ? value
                    : Array.Empty<UnitOtRoleAssignmentDto>();
                var occupiedCount = assignments.Count;
                return new UnitOtRoleDefinitionDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    RoleType = role.RoleType.ToString(),
                    Capacity = role.Capacity,
                    RequiresTraining = role.RequiresTraining,
                    StaffMemberInChargeId = role.StaffMemberInChargeId,
                    IsActive = role.IsActive,
                    OccupiedCount = occupiedCount,
                    AvailableSlots = role.Capacity.HasValue ? Math.Max(role.Capacity.Value - occupiedCount, 0) : null,
                    Assignments = assignments
                };
            })
            .ToList();
    }

    public async Task<UnitOtRoleAssignmentDto> AssignOtRoleAsync(
        string unitCode,
        AssignUnitOtRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.EpisodeId == Guid.Empty)
        {
            throw new InvalidOperationException("episodeId is required.");
        }

        if (request.RoleId == Guid.Empty)
        {
            throw new InvalidOperationException("roleId is required.");
        }

        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var role = await _dbContext.OtRoleDefinitions
            .SingleOrDefaultAsync(item =>
                item.Id == request.RoleId &&
                item.CentreId == unit.CentreId &&
                item.IsActive &&
                (!item.UnitId.HasValue || item.UnitId == unit.Id),
                cancellationToken);
        if (role is null)
        {
            throw new InvalidOperationException("OT role was not found.");
        }

        var episode = await _dbContext.ResidentProgrammeEpisodes
            .SingleOrDefaultAsync(item => item.Id == request.EpisodeId && item.EndDate == null, cancellationToken);
        if (episode is null)
        {
            throw new InvalidOperationException("Active episode was not found.");
        }

        if (episode.UnitId != unit.Id)
        {
            throw new InvalidOperationException("Episode does not belong to the requested unit.");
        }

        var existingAssignment = await _dbContext.ResidentOtRoleAssignments
            .SingleOrDefaultAsync(item => item.EpisodeId == episode.Id && item.ReleasedAtUtc == null, cancellationToken);
        if (existingAssignment?.OtRoleDefinitionId == role.Id)
        {
            var residentList = await _residentService.GetAllResidentsAsync(unitCode, cancellationToken);
            var residentDto = residentList.FirstOrDefault(item => item.EpisodeId == episode.Id)
                ?? throw new InvalidOperationException("Resident was not found.");
            return MapRoleAssignment(existingAssignment, residentDto);
        }

        var capacityInUse = await _dbContext.ResidentOtRoleAssignments
            .CountAsync(item => item.OtRoleDefinitionId == role.Id && item.ReleasedAtUtc == null, cancellationToken);
        if (role.Capacity.HasValue && capacityInUse >= role.Capacity.Value)
        {
            throw new InvalidOperationException("That OT role is already full.");
        }

        var actorUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User);
        var now = DateTime.UtcNow;

        if (existingAssignment is not null)
        {
            existingAssignment.ReleasedAtUtc = now;
            existingAssignment.ReleasedByUserId = actorUserId;
        }

        var assignment = new ResidentOtRoleAssignment
        {
            Id = Guid.NewGuid(),
            OtRoleDefinitionId = role.Id,
            ResidentId = episode.ResidentId,
            EpisodeId = episode.Id,
            AssignedAtUtc = now,
            AssignedByUserId = actorUserId,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
        };

        _dbContext.ResidentOtRoleAssignments.Add(assignment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var residents = await _residentService.GetAllResidentsAsync(unitCode, cancellationToken);
        var resident = residents.FirstOrDefault(item => item.EpisodeId == episode.Id)
            ?? throw new InvalidOperationException("Resident was not found.");
        return MapRoleAssignment(assignment, resident);
    }

    public async Task ReleaseOtRoleAsync(
        string unitCode,
        Guid assignmentId,
        CancellationToken cancellationToken = default)
    {
        if (assignmentId == Guid.Empty)
        {
            throw new InvalidOperationException("assignmentId is required.");
        }

        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var assignment = await _dbContext.ResidentOtRoleAssignments
            .SingleOrDefaultAsync(item => item.Id == assignmentId && item.ReleasedAtUtc == null, cancellationToken);
        if (assignment is null)
        {
            throw new InvalidOperationException("Active OT role assignment was not found.");
        }

        var role = await _dbContext.OtRoleDefinitions
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == assignment.OtRoleDefinitionId, cancellationToken);
        if (role is null || role.CentreId != unit.CentreId || (role.UnitId.HasValue && role.UnitId != unit.Id))
        {
            throw new InvalidOperationException("OT role assignment does not belong to the requested unit.");
        }

        var episode = await _dbContext.ResidentProgrammeEpisodes
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == assignment.EpisodeId && item.EndDate == null, cancellationToken);
        if (episode is null || episode.UnitId != unit.Id)
        {
            throw new InvalidOperationException("OT role assignment does not belong to the requested unit.");
        }

        assignment.ReleasedAtUtc = DateTime.UtcNow;
        assignment.ReleasedByUserId = ResolveActorUserId(_httpContextAccessor.HttpContext?.User);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AssignUnitBedResponse> AssignBedAsync(
        string unitCode,
        AssignUnitBedRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = NormalizeUnitCode(unitCode);
        if (request.EpisodeId == Guid.Empty)
        {
            throw new InvalidOperationException("episodeId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.RoomCode))
        {
            throw new InvalidOperationException("roomCode is required.");
        }

        if (string.IsNullOrWhiteSpace(request.BedCode))
        {
            throw new InvalidOperationException("bedCode is required.");
        }

        var episode = await _dbContext.ResidentProgrammeEpisodes
            .Include(item => item.ResidentCase)
            .SingleOrDefaultAsync(item => item.Id == request.EpisodeId && item.EndDate == null, cancellationToken);
        if (episode is null)
        {
            throw new InvalidOperationException("Active episode was not found.");
        }

        var unit = await _dbContext.Units
            .SingleOrDefaultAsync(item => item.Code == normalizedUnitCode, cancellationToken);
        if (unit is null)
        {
            throw new InvalidOperationException("Unit was not found.");
        }

        if (episode.UnitId != unit.Id)
        {
            throw new InvalidOperationException("Episode does not belong to the requested unit.");
        }

        var displayRoomCode = request.RoomCode.Trim();
        var storageRoomCode = ToStorageRoomCode(normalizedUnitCode, displayRoomCode);
        var bedCode = request.BedCode.Trim();

        if (!GetBedCodes(normalizedUnitCode, displayRoomCode).Contains(bedCode, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Bed code is not valid for the requested room.");
        }

        var bedOccupied = await _dbContext.ResidentProgrammeEpisodes
            .AnyAsync(item =>
                item.Id != episode.Id &&
                item.EndDate == null &&
                item.UnitId == unit.Id &&
                item.BedCode == bedCode,
                cancellationToken);
        if (bedOccupied)
        {
            throw new InvalidOperationException("That bed is already occupied.");
        }

        var roomOccupancy = await _dbContext.ResidentProgrammeEpisodes
            .CountAsync(item =>
                item.Id != episode.Id &&
                item.EndDate == null &&
                item.UnitId == unit.Id &&
                item.RoomNumber == storageRoomCode,
                cancellationToken);
        if (roomOccupancy >= GetBedCodes(normalizedUnitCode, displayRoomCode).Count)
        {
            throw new InvalidOperationException("That room is already full.");
        }

        var resident = await _dbContext.Residents.SingleOrDefaultAsync(item => item.Id == episode.ResidentId, cancellationToken);
        if (resident is null)
        {
            throw new InvalidOperationException("Resident was not found.");
        }

        episode.RoomNumber = storageRoomCode;
        episode.BedCode = bedCode;
        resident.RoomNumber = storageRoomCode;
        resident.UnitId = unit.Id;
        resident.UnitCode = normalizedUnitCode;
        resident.UpdatedAtUtc = DateTime.UtcNow;

        if (episode.ResidentCase is not null)
        {
            episode.ResidentCase.UnitId = unit.Id;
            episode.ResidentCase.LastContactAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AssignUnitBedResponse
        {
            ResidentId = resident.Id,
            EpisodeId = episode.Id,
            ResidentCaseId = episode.ResidentCaseId,
            RoomCode = displayRoomCode,
            StorageRoomCode = storageRoomCode,
            BedCode = bedCode
        };
    }

    private async Task<Dictionary<Guid, string>> GetActiveOtRoleByEpisodeIdAsync(
        string unitCode,
        IReadOnlyList<ResidentListItemDto> residents,
        CancellationToken cancellationToken)
    {
        var unit = await GetUnitAsync(unitCode, cancellationToken);
        var episodeIds = residents
            .Where(resident => resident.EpisodeId.HasValue)
            .Select(resident => resident.EpisodeId!.Value)
            .Distinct()
            .ToList();
        if (episodeIds.Count == 0)
        {
            return [];
        }

        var activeAssignments = await _dbContext.ResidentOtRoleAssignments
            .AsNoTracking()
            .Where(assignment => assignment.ReleasedAtUtc == null && episodeIds.Contains(assignment.EpisodeId))
            .Join(
                _dbContext.OtRoleDefinitions.AsNoTracking().Where(role => role.CentreId == unit.CentreId),
                assignment => assignment.OtRoleDefinitionId,
                role => role.Id,
                (assignment, role) => new { assignment.EpisodeId, RoleName = role.Name })
            .ToListAsync(cancellationToken);

        return activeAssignments
            .GroupBy(item => item.EpisodeId)
            .ToDictionary(group => group.Key, group => group.First().RoleName);
    }

    private async Task<Unit> GetUnitAsync(string unitCode, CancellationToken cancellationToken)
    {
        var normalizedUnitCode = NormalizeUnitCode(unitCode);
        return await _dbContext.Units
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Code == normalizedUnitCode, cancellationToken)
            ?? throw new InvalidOperationException("Unit was not found.");
    }

    private static UnitOtRoleAssignmentDto MapRoleAssignment(
        ResidentOtRoleAssignment assignment,
        ResidentListItemDto resident) =>
        new()
        {
            Id = assignment.Id,
            RoleId = assignment.OtRoleDefinitionId,
            ResidentGuid = resident.ResidentGuid,
            EpisodeId = resident.EpisodeId ?? assignment.EpisodeId,
            ResidentCaseId = resident.ResidentCaseId,
            ResidentId = resident.Id,
            FirstName = resident.FirstName,
            Surname = resident.Surname,
            WeekNumber = resident.WeekNumber,
            RoomNumber = resident.RoomNumber,
            PhotoUrl = resident.PhotoUrl,
            AssignedAtUtc = assignment.AssignedAtUtc.ToString("O"),
            Notes = assignment.Notes
        };

    private static IReadOnlyList<string> GetRoomCodes(string unitCode)
    {
        return NormalizeUnitCode(unitCode) switch
        {
            "detox" => Enumerable.Range(1, 16).Select(index => index.ToString()).ToList(),
            "ladies" => Enumerable.Range(1, 18).Select(index => index.ToString()).ToList(),
            "drugs" => Enumerable.Range(1, 22).Select(index => index.ToString()).ToList(),
            _ => Enumerable.Range(1, 44).Select(index => index.ToString()).ToList()
        };
    }

    private static IReadOnlyList<string> GetBedCodes(string unitCode, string roomCode)
    {
        var normalizedRoomCode = roomCode.Trim();
        if (NormalizeUnitCode(unitCode) == "detox")
        {
            return [$"roundel_{normalizedRoomCode}a", $"roundel_{normalizedRoomCode}b"];
        }

        return [$"{normalizedRoomCode}a", $"{normalizedRoomCode}b"];
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

    private static Guid ResolveActorUserId(ClaimsPrincipal? user)
    {
        if (user is null)
        {
            return Guid.Empty;
        }

        foreach (var claimType in new[] { "app_user_id", ClaimTypes.NameIdentifier, "sub" })
        {
            var claimValue = user.FindFirst(claimType)?.Value;
            if (Guid.TryParse(claimValue, out var actorUserId))
            {
                return actorUserId;
            }
        }

        return Guid.Empty;
    }

    private static string ToDisplayRoomCode(string unitCode, string? storedRoomCode)
    {
        if (string.IsNullOrWhiteSpace(storedRoomCode))
        {
            return string.Empty;
        }

        var trimmed = storedRoomCode.Trim();
        var normalizedUnitCode = NormalizeUnitCode(unitCode);
        if (normalizedUnitCode == "detox" && trimmed.StartsWith("D", StringComparison.OrdinalIgnoreCase))
        {
            return int.TryParse(trimmed[1..], out var detoxRoom) ? detoxRoom.ToString() : trimmed;
        }

        if ((normalizedUnitCode == "alcohol" || normalizedUnitCode == "drugs" || normalizedUnitCode == "ladies") &&
            trimmed.Length >= 2 &&
            char.IsLetter(trimmed[0]) &&
            int.TryParse(trimmed[1..], out var roomNumber))
        {
            return roomNumber.ToString();
        }

        return trimmed;
    }

    private static string ToStorageRoomCode(string unitCode, string displayRoomCode)
    {
        var normalizedUnitCode = NormalizeUnitCode(unitCode);
        var trimmed = displayRoomCode.Trim();
        if (!int.TryParse(trimmed, out var roomNumber))
        {
            return trimmed;
        }

        return normalizedUnitCode switch
        {
            "detox" => $"D{roomNumber:00}",
            "alcohol" => $"A{roomNumber:00}",
            "drugs" => $"DR{roomNumber:00}",
            "ladies" => $"L{roomNumber:00}",
            _ => trimmed
        };
    }

    private static string NormalizeUnitCode(string unitCode) => unitCode.Trim().ToLowerInvariant();

    private static string GetUnitLabel(string unitCode)
    {
        return NormalizeUnitCode(unitCode) switch
        {
            "detox" => "Detox",
            "drugs" => "Drugs",
            "ladies" => "Ladies",
            _ => "Alcohol"
        };
    }
}
