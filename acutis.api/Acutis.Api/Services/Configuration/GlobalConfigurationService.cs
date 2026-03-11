using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Configuration;

public interface IGlobalConfigurationService
{
    Task<IReadOnlyList<UnitConfigurationDto>> GetUnitsAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<UnitConfigurationDto> CreateUnitAsync(UpsertUnitRequest request, CancellationToken cancellationToken = default);
    Task<UnitConfigurationDto> UpdateUnitAsync(Guid unitId, UpsertUnitRequest request, CancellationToken cancellationToken = default);
    Task ArchiveUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppPermissionDto>> GetPermissionsAsync(CancellationToken cancellationToken = default);
    Task<AppPermissionDto> CreatePermissionAsync(UpsertAppPermissionRequest request, CancellationToken cancellationToken = default);
    Task<AppPermissionDto> UpdatePermissionAsync(Guid permissionId, UpsertAppPermissionRequest request, CancellationToken cancellationToken = default);
    Task ArchivePermissionAsync(Guid permissionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppRoleDto>> GetRolesAsync(CancellationToken cancellationToken = default);
    Task<AppRoleDto> CreateRoleAsync(UpsertAppRoleRequest request, CancellationToken cancellationToken = default);
    Task<AppRoleDto> UpdateRoleAsync(Guid roleId, UpsertAppRoleRequest request, CancellationToken cancellationToken = default);
    Task ArchiveRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppUserDto>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<AppUserDto> CreateUserAsync(UpsertAppUserRequest request, CancellationToken cancellationToken = default);
    Task<AppUserDto> UpdateUserAsync(Guid userId, UpsertAppUserRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppUserRoleAssignmentDto>> ReplaceUserAssignmentsAsync(
        Guid userId,
        ReplaceUserRoleAssignmentsRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class GlobalConfigurationService : IGlobalConfigurationService
{
    private readonly AcutisDbContext _dbContext;

    public GlobalConfigurationService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<UnitConfigurationDto>> GetUnitsAsync(
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Units.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        var units = await query
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return units.Select(MapUnit).ToList();
    }

    public async Task<UnitConfigurationDto> CreateUnitAsync(UpsertUnitRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUnitRequest(request);
        var code = NormalizeKey(request.UnitCode);

        if (await _dbContext.Units.AnyAsync(x => x.Code == code, cancellationToken))
        {
            throw new ArgumentException($"A unit with code '{code}' already exists.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var unit = new Acutis.Domain.Entities.Unit
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = request.DisplayName.Trim(),
            Description = request.Description.Trim(),
            Capacity = request.UnitCapacity,
            CurrentOccupancy = request.CurrentOccupancy,
            CapacityWarningThreshold = request.CapacityWarningThreshold,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.Units.Add(unit);
        _dbContext.ScreeningControls.Add(new Acutis.Domain.Entities.ScreeningControl
        {
            Id = Guid.NewGuid(),
            UnitCode = unit.Code,
            UnitName = unit.Name,
            UnitCapacity = unit.Capacity,
            CurrentOccupancy = unit.CurrentOccupancy,
            CapacityWarningThreshold = unit.CapacityWarningThreshold,
            CallLogsCacheSeconds = 15,
            EvaluationQueueCacheSeconds = 30,
            LocalizationCacheSeconds = 300,
            EnableClientCacheOverride = true,
            UpdatedAt = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapUnit(unit);
    }

    public async Task<UnitConfigurationDto> UpdateUnitAsync(
        Guid unitId,
        UpsertUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUnitRequest(request);
        var unit = await _dbContext.Units.FirstOrDefaultAsync(x => x.Id == unitId, cancellationToken)
            ?? throw new KeyNotFoundException($"Unit '{unitId}' was not found.");
        var previousCode = unit.Code;

        var code = NormalizeKey(request.UnitCode);
        if (await _dbContext.Units.AnyAsync(x => x.Id != unitId && x.Code == code, cancellationToken))
        {
            throw new ArgumentException($"A unit with code '{code}' already exists.", nameof(request));
        }

        unit.Code = code;
        unit.Name = request.DisplayName.Trim();
        unit.Description = request.Description.Trim();
        unit.Capacity = request.UnitCapacity;
        unit.CurrentOccupancy = request.CurrentOccupancy;
        unit.CapacityWarningThreshold = request.CapacityWarningThreshold;
        unit.DisplayOrder = request.DisplayOrder;
        unit.IsActive = request.IsActive;
        unit.UpdatedAtUtc = DateTime.UtcNow;

        var screeningControl = await _dbContext.ScreeningControls.FirstOrDefaultAsync(x => x.UnitCode == previousCode, cancellationToken);
        if (screeningControl is not null)
        {
            screeningControl.UnitCode = unit.Code;
            screeningControl.UnitName = unit.Name;
            screeningControl.UnitCapacity = unit.Capacity;
            screeningControl.CurrentOccupancy = unit.CurrentOccupancy;
            screeningControl.CapacityWarningThreshold = unit.CapacityWarningThreshold;
            screeningControl.UpdatedAt = unit.UpdatedAtUtc;
        }
        else
        {
            _dbContext.ScreeningControls.Add(new Acutis.Domain.Entities.ScreeningControl
            {
                Id = Guid.NewGuid(),
                UnitCode = unit.Code,
                UnitName = unit.Name,
                UnitCapacity = unit.Capacity,
                CurrentOccupancy = unit.CurrentOccupancy,
                CapacityWarningThreshold = unit.CapacityWarningThreshold,
                CallLogsCacheSeconds = 15,
                EvaluationQueueCacheSeconds = 30,
                LocalizationCacheSeconds = 300,
                EnableClientCacheOverride = true,
                UpdatedAt = unit.UpdatedAtUtc
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapUnit(unit);
    }

    public async Task ArchiveUnitAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var unit = await _dbContext.Units.FirstOrDefaultAsync(x => x.Id == unitId, cancellationToken)
            ?? throw new KeyNotFoundException($"Unit '{unitId}' was not found.");

        unit.IsActive = false;
        unit.UpdatedAtUtc = DateTime.UtcNow;

        var screeningControl = await _dbContext.ScreeningControls.FirstOrDefaultAsync(x => x.UnitCode == unit.Code, cancellationToken);
        if (screeningControl is not null)
        {
            screeningControl.UpdatedAt = unit.UpdatedAtUtc;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppPermissionDto>> GetPermissionsAsync(CancellationToken cancellationToken = default)
    {
        var permissions = await _dbContext.AppPermissions
            .AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Key)
            .ToListAsync(cancellationToken);
        return permissions.Select(MapPermission).ToList();
    }

    public async Task<AppPermissionDto> CreatePermissionAsync(
        UpsertAppPermissionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidatePermissionRequest(request);
        var key = NormalizeKey(request.Key);
        if (await _dbContext.AppPermissions.AnyAsync(x => x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A permission with key '{key}' already exists.", nameof(request));
        }

        var permission = new Acutis.Domain.Entities.AppPermission
        {
            Id = Guid.NewGuid(),
            Key = key,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Category = NormalizeKey(request.Category),
            IsActive = request.IsActive
        };

        _dbContext.AppPermissions.Add(permission);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPermission(permission);
    }

    public async Task<AppPermissionDto> UpdatePermissionAsync(
        Guid permissionId,
        UpsertAppPermissionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidatePermissionRequest(request);
        var permission = await _dbContext.AppPermissions.FirstOrDefaultAsync(x => x.Id == permissionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Permission '{permissionId}' was not found.");
        var key = NormalizeKey(request.Key);

        if (await _dbContext.AppPermissions.AnyAsync(x => x.Id != permissionId && x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A permission with key '{key}' already exists.", nameof(request));
        }

        permission.Key = key;
        permission.Name = request.Name.Trim();
        permission.Description = request.Description.Trim();
        permission.Category = NormalizeKey(request.Category);
        permission.IsActive = request.IsActive;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPermission(permission);
    }

    public async Task ArchivePermissionAsync(Guid permissionId, CancellationToken cancellationToken = default)
    {
        var permission = await _dbContext.AppPermissions.FirstOrDefaultAsync(x => x.Id == permissionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Permission '{permissionId}' was not found.");
        permission.IsActive = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppRoleDto>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _dbContext.AppRoles
            .AsNoTracking()
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.AppPermission)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return roles.Select(MapRole).ToList();
    }

    public async Task<AppRoleDto> CreateRoleAsync(UpsertAppRoleRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRoleRequest(request);
        var key = NormalizeKey(request.Key);
        if (await _dbContext.AppRoles.AnyAsync(x => x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A role with key '{key}' already exists.", nameof(request));
        }

        var permissionIds = await ResolvePermissionIdsAsync(request.PermissionKeys, cancellationToken);
        var role = new Acutis.Domain.Entities.AppRole
        {
            Id = Guid.NewGuid(),
            Key = key,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            ExternalRoleName = request.ExternalRoleName.Trim(),
            IsSystemRole = request.IsSystemRole,
            IsActive = request.IsActive
        };

        foreach (var permissionId in permissionIds)
        {
            role.RolePermissions.Add(new Acutis.Domain.Entities.AppRolePermission
            {
                AppRoleId = role.Id,
                AppPermissionId = permissionId
            });
        }

        _dbContext.AppRoles.Add(role);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadRoleAsync(role.Id, cancellationToken);
    }

    public async Task<AppRoleDto> UpdateRoleAsync(Guid roleId, UpsertAppRoleRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRoleRequest(request);
        var role = await _dbContext.AppRoles
            .Include(x => x.RolePermissions)
            .FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Role '{roleId}' was not found.");

        var key = NormalizeKey(request.Key);
        if (await _dbContext.AppRoles.AnyAsync(x => x.Id != roleId && x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A role with key '{key}' already exists.", nameof(request));
        }

        role.Key = key;
        role.Name = request.Name.Trim();
        role.Description = request.Description.Trim();
        role.ExternalRoleName = request.ExternalRoleName.Trim();
        role.IsSystemRole = request.IsSystemRole;
        role.IsActive = request.IsActive;

        var permissionIds = await ResolvePermissionIdsAsync(request.PermissionKeys, cancellationToken);
        _dbContext.AppRolePermissions.RemoveRange(role.RolePermissions);
        role.RolePermissions.Clear();
        foreach (var permissionId in permissionIds)
        {
            role.RolePermissions.Add(new Acutis.Domain.Entities.AppRolePermission
            {
                AppRoleId = role.Id,
                AppPermissionId = permissionId
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadRoleAsync(role.Id, cancellationToken);
    }

    public async Task ArchiveRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var role = await _dbContext.AppRoles.FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Role '{roleId}' was not found.");
        role.IsActive = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppUserDto>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _dbContext.AppUsers
            .AsNoTracking()
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.AppRole)
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.Unit)
            .OrderBy(x => x.DisplayName)
            .ThenBy(x => x.UserName)
            .ToListAsync(cancellationToken);

        return users.Select(MapUser).ToList();
    }

    public async Task<AppUserDto> CreateUserAsync(UpsertAppUserRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserRequest(request);
        if (await _dbContext.AppUsers.AnyAsync(x => x.ExternalSubject == request.ExternalSubject.Trim(), cancellationToken))
        {
            throw new ArgumentException($"A user with subject '{request.ExternalSubject}' already exists.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var user = new Acutis.Domain.Entities.AppUser
        {
            Id = Guid.NewGuid(),
            ExternalSubject = request.ExternalSubject.Trim(),
            UserName = request.UserName.Trim(),
            DisplayName = request.DisplayName.Trim(),
            Email = request.Email.Trim(),
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.AppUsers.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadUserAsync(user.Id, cancellationToken);
    }

    public async Task<AppUserDto> UpdateUserAsync(Guid userId, UpsertAppUserRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserRequest(request);
        var user = await _dbContext.AppUsers.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        var subject = request.ExternalSubject.Trim();
        if (await _dbContext.AppUsers.AnyAsync(x => x.Id != userId && x.ExternalSubject == subject, cancellationToken))
        {
            throw new ArgumentException($"A user with subject '{subject}' already exists.", nameof(request));
        }

        user.ExternalSubject = subject;
        user.UserName = request.UserName.Trim();
        user.DisplayName = request.DisplayName.Trim();
        user.Email = request.Email.Trim();
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadUserAsync(user.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<AppUserRoleAssignmentDto>> ReplaceUserAssignmentsAsync(
        Guid userId,
        ReplaceUserRoleAssignmentsRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.AppUsers
            .Include(x => x.RoleAssignments)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        var roleIds = request.Assignments.Select(x => x.RoleId).Distinct().ToList();
        var knownRoleIds = await _dbContext.AppRoles
            .Where(x => roleIds.Contains(x.Id) && x.IsActive)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        if (knownRoleIds.Count != roleIds.Count)
        {
            throw new ArgumentException("One or more roleIds were not found or are inactive.", nameof(request));
        }

        var unitIds = request.Assignments.Where(x => x.UnitId.HasValue).Select(x => x.UnitId!.Value).Distinct().ToList();
        var knownUnitIds = await _dbContext.Units
            .Where(x => unitIds.Contains(x.Id) && x.IsActive)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        if (knownUnitIds.Count != unitIds.Count)
        {
            throw new ArgumentException("One or more unitIds were not found or are inactive.", nameof(request));
        }

        _dbContext.AppUserRoleAssignments.RemoveRange(user.RoleAssignments);
        user.RoleAssignments.Clear();
        var now = DateTime.UtcNow;

        foreach (var assignment in request.Assignments
                     .DistinctBy(x => new { x.RoleId, x.UnitId }))
        {
            user.RoleAssignments.Add(new Acutis.Domain.Entities.AppUserRoleAssignment
            {
                Id = Guid.NewGuid(),
                AppUserId = user.Id,
                AppRoleId = assignment.RoleId,
                UnitId = assignment.UnitId,
                IsActive = assignment.IsActive,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            });
        }

        user.UpdatedAtUtc = now;
        await _dbContext.SaveChangesAsync(cancellationToken);
        var updatedUser = await LoadUserAsync(user.Id, cancellationToken);
        return updatedUser.Assignments;
    }

    private async Task<List<Guid>> ResolvePermissionIdsAsync(
        IReadOnlyList<string> permissionKeys,
        CancellationToken cancellationToken)
    {
        var normalizedKeys = permissionKeys
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(NormalizeKey)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedKeys.Count == 0)
        {
            return new List<Guid>();
        }

        var permissions = await _dbContext.AppPermissions
            .Where(x => normalizedKeys.Contains(x.Key) && x.IsActive)
            .Select(x => new { x.Id, x.Key })
            .ToListAsync(cancellationToken);

        if (permissions.Count != normalizedKeys.Count)
        {
            throw new ArgumentException("One or more permission keys were not found or are inactive.");
        }

        return permissions.Select(x => x.Id).ToList();
    }

    private async Task<AppRoleDto> LoadRoleAsync(Guid roleId, CancellationToken cancellationToken)
    {
        var role = await _dbContext.AppRoles
            .AsNoTracking()
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.AppPermission)
            .FirstAsync(x => x.Id == roleId, cancellationToken);
        return MapRole(role);
    }

    private async Task<AppUserDto> LoadUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.AppRole)
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.Unit)
            .FirstAsync(x => x.Id == userId, cancellationToken);
        return MapUser(user);
    }

    private static UnitConfigurationDto MapUnit(Acutis.Domain.Entities.Unit unit)
    {
        return new UnitConfigurationDto
        {
            UnitId = unit.Id,
            UnitCode = unit.Code,
            DisplayName = unit.Name,
            Description = unit.Description,
            UnitCapacity = unit.Capacity,
            CurrentOccupancy = unit.CurrentOccupancy,
            FreeBeds = Math.Max(0, unit.Capacity - unit.CurrentOccupancy),
            CapacityWarningThreshold = unit.CapacityWarningThreshold,
            DisplayOrder = unit.DisplayOrder,
            IsActive = unit.IsActive
        };
    }

    private static AppPermissionDto MapPermission(Acutis.Domain.Entities.AppPermission permission)
    {
        return new AppPermissionDto
        {
            PermissionId = permission.Id,
            Key = permission.Key,
            Name = permission.Name,
            Description = permission.Description,
            Category = permission.Category,
            IsActive = permission.IsActive
        };
    }

    private static AppRoleDto MapRole(Acutis.Domain.Entities.AppRole role)
    {
        return new AppRoleDto
        {
            RoleId = role.Id,
            Key = role.Key,
            Name = role.Name,
            Description = role.Description,
            ExternalRoleName = role.ExternalRoleName,
            IsSystemRole = role.IsSystemRole,
            IsActive = role.IsActive,
            PermissionKeys = role.RolePermissions
                .Select(x => x.AppPermission.Key)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(x => x)
                .ToList()
        };
    }

    private static AppUserDto MapUser(Acutis.Domain.Entities.AppUser user)
    {
        return new AppUserDto
        {
            UserId = user.Id,
            ExternalSubject = user.ExternalSubject,
            UserName = user.UserName,
            DisplayName = user.DisplayName,
            Email = user.Email,
            IsActive = user.IsActive,
            LastSeenAtUtc = user.LastSeenAtUtc,
            Assignments = user.RoleAssignments
                .OrderBy(x => x.AppRole.Name)
                .ThenBy(x => x.UnitId.HasValue ? x.Unit!.Name : string.Empty)
                .Select(x => new AppUserRoleAssignmentDto
                {
                    AssignmentId = x.Id,
                    RoleId = x.AppRoleId,
                    RoleKey = x.AppRole.Key,
                    UnitId = x.UnitId,
                    UnitCode = x.Unit?.Code ?? string.Empty,
                    UnitName = x.Unit?.Name ?? string.Empty,
                    IsActive = x.IsActive
                })
                .ToList()
        };
    }

    private static string NormalizeKey(string key)
    {
        return key.Trim().ToLowerInvariant();
    }

    private static void ValidateUnitRequest(UpsertUnitRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UnitCode))
        {
            throw new ArgumentException("Unit code is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException("Display name is required.", nameof(request));
        }

        if (request.UnitCapacity < 0 || request.CurrentOccupancy < 0 || request.CapacityWarningThreshold < 0)
        {
            throw new ArgumentException("Unit capacity and occupancy values must be zero or greater.", nameof(request));
        }

        if (request.CurrentOccupancy > request.UnitCapacity)
        {
            throw new ArgumentException("Current occupancy cannot exceed unit capacity.", nameof(request));
        }
    }

    private static void ValidatePermissionRequest(UpsertAppPermissionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Key) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Category))
        {
            throw new ArgumentException("Permission key, name, and category are required.", nameof(request));
        }
    }

    private static void ValidateRoleRequest(UpsertAppRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Key) || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Role key and name are required.", nameof(request));
        }
    }

    private static void ValidateUserRequest(UpsertAppUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ExternalSubject) ||
            string.IsNullOrWhiteSpace(request.UserName) ||
            string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException("User subject, username, and display name are required.", nameof(request));
        }
    }
}
