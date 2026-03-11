using System.Security.Claims;
using System.Text.Json;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Security;

public sealed class KeycloakClientRoleClaimsTransformation : IClaimsTransformation
{
    private const string ClientId = "api-client";
    private readonly AcutisDbContext _dbContext;

    public KeycloakClientRoleClaimsTransformation(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
        {
            return principal;
        }

        if (identity.HasClaim(ApplicationClaimTypes.ClaimsHydrated, "true"))
        {
            return principal;
        }

        var externalRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        AddRealmRoles(principal, identity, externalRoles);
        AddClientRoles(principal, identity, externalRoles);

        var appUser = await EnsureAppUserAsync(principal);
        if (appUser is not null && !identity.HasClaim(ApplicationClaimTypes.AppUserId, appUser.Id.ToString("D")))
        {
            identity.AddClaim(new Claim(ApplicationClaimTypes.AppUserId, appUser.Id.ToString("D")));
        }

        var roleRecords = await ResolveAuthorizedRolesAsync(appUser?.Id, externalRoles);
        foreach (var role in roleRecords.Select(x => x.RoleKey).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!identity.HasClaim(ClaimTypes.Role, role))
            {
                identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }

        foreach (var permission in roleRecords
                     .Where(x => x.UnitId is null)
                     .Select(x => x.PermissionKey)
                     .Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!identity.HasClaim(ApplicationClaimTypes.Permission, permission))
            {
                identity.AddClaim(new Claim(ApplicationClaimTypes.Permission, permission));
            }
        }

        foreach (var record in roleRecords.Where(x => x.UnitId.HasValue))
        {
            var unitId = record.UnitId!.Value;
            if (!identity.HasClaim(ApplicationClaimTypes.UnitAccess, unitId.ToString("D")))
            {
                identity.AddClaim(new Claim(ApplicationClaimTypes.UnitAccess, unitId.ToString("D")));
            }

            var unitPermission = ApplicationAccessService.BuildUnitPermissionValue(unitId, record.PermissionKey);
            if (!identity.HasClaim(ApplicationClaimTypes.UnitPermission, unitPermission))
            {
                identity.AddClaim(new Claim(ApplicationClaimTypes.UnitPermission, unitPermission));
            }
        }

        identity.AddClaim(new Claim(ApplicationClaimTypes.ClaimsHydrated, "true"));
        return principal;
    }

    private async Task<Acutis.Domain.Entities.AppUser?> EnsureAppUserAsync(ClaimsPrincipal principal)
    {
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        if (string.IsNullOrWhiteSpace(subject))
        {
            return null;
        }

        var user = await _dbContext.AppUsers.FirstOrDefaultAsync(x => x.ExternalSubject == subject);
        var userName = principal.FindFirstValue("preferred_username")
            ?? principal.Identity?.Name
            ?? principal.FindFirstValue(ClaimTypes.Email)
            ?? subject;
        var displayName = principal.FindFirstValue("name") ?? userName;
        var email = principal.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        if (user is null)
        {
            user = new Acutis.Domain.Entities.AppUser
            {
                Id = Guid.NewGuid(),
                ExternalSubject = subject,
                UserName = userName.Trim(),
                DisplayName = displayName.Trim(),
                Email = email.Trim(),
                IsActive = true,
                LastSeenAtUtc = DateTime.UtcNow,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _dbContext.AppUsers.Add(user);
            await _dbContext.SaveChangesAsync();
            return user;
        }

        var changed = false;
        if (!string.Equals(user.UserName, userName.Trim(), StringComparison.Ordinal))
        {
            user.UserName = userName.Trim();
            changed = true;
        }

        if (!string.Equals(user.DisplayName, displayName.Trim(), StringComparison.Ordinal))
        {
            user.DisplayName = displayName.Trim();
            changed = true;
        }

        if (!string.Equals(user.Email, email.Trim(), StringComparison.Ordinal))
        {
            user.Email = email.Trim();
            changed = true;
        }

        var now = DateTime.UtcNow;
        if (!user.LastSeenAtUtc.HasValue || user.LastSeenAtUtc.Value < now.AddMinutes(-5))
        {
            user.LastSeenAtUtc = now;
            changed = true;
        }

        if (changed)
        {
            user.UpdatedAtUtc = now;
            await _dbContext.SaveChangesAsync();
        }

        return user;
    }

    private async Task<List<ResolvedRoleRecord>> ResolveAuthorizedRolesAsync(Guid? appUserId, HashSet<string> externalRoles)
    {
        var userRoleQuery = _dbContext.AppUserRoleAssignments
            .AsNoTracking()
            .Where(x => x.IsActive && x.AppUser.IsActive && x.AppRole.IsActive && x.AppRole.RolePermissions.Any(rp => rp.AppPermission.IsActive));

        if (appUserId.HasValue)
        {
            userRoleQuery = userRoleQuery.Where(x => x.AppUserId == appUserId.Value && x.AppUser.IsActive);
        }
        else
        {
            userRoleQuery = userRoleQuery.Where(x => false);
        }

        var userRoleRecords = await userRoleQuery
            .SelectMany(
                assignment => assignment.AppRole.RolePermissions.Where(rp => rp.AppPermission.IsActive),
                (assignment, rolePermission) => new ResolvedRoleRecord
                {
                    RoleKey = assignment.AppRole.Key,
                    PermissionKey = rolePermission.AppPermission.Key,
                    UnitId = assignment.UnitId
                })
            .ToListAsync();

        var externalRoleRecords = await _dbContext.AppRoles
            .AsNoTracking()
            .Where(x => x.IsActive && x.ExternalRoleName != string.Empty && externalRoles.Contains(x.ExternalRoleName))
            .SelectMany(
                role => role.RolePermissions.Where(rp => rp.AppPermission.IsActive),
                (role, rolePermission) => new ResolvedRoleRecord
                {
                    RoleKey = role.Key,
                    PermissionKey = rolePermission.AppPermission.Key,
                    UnitId = null
                })
            .ToListAsync();

        return userRoleRecords
            .Concat(externalRoleRecords)
            .Where(x => !string.IsNullOrWhiteSpace(x.PermissionKey))
            .ToList();
    }

    private static void AddRealmRoles(ClaimsPrincipal principal, ClaimsIdentity identity, HashSet<string> rolesFound)
    {
        var json = principal.FindFirst("realm_access")?.Value;
        if (string.IsNullOrWhiteSpace(json))
        {
            return;
        }

        TryAddRolesFromJson(json, identity, rolesFound);
    }

    private static void AddClientRoles(ClaimsPrincipal principal, ClaimsIdentity identity, HashSet<string> rolesFound)
    {
        var json = principal.FindFirst("resource_access")?.Value;
        if (string.IsNullOrWhiteSpace(json))
        {
            return;
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty(ClientId, out var client))
            {
                return;
            }

            if (!client.TryGetProperty("roles", out var roles) || roles.ValueKind != JsonValueKind.Array)
            {
                return;
            }

            foreach (var entry in roles.EnumerateArray())
            {
                var role = entry.GetString();
                if (string.IsNullOrWhiteSpace(role))
                {
                    continue;
                }

                rolesFound.Add(role);
                if (!identity.HasClaim(ClaimTypes.Role, role))
                {
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }
        }
        catch
        {
        }
    }

    private static void TryAddRolesFromJson(string json, ClaimsIdentity identity, HashSet<string> rolesFound)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("roles", out var roles) || roles.ValueKind != JsonValueKind.Array)
            {
                return;
            }

            foreach (var entry in roles.EnumerateArray())
            {
                var role = entry.GetString();
                if (string.IsNullOrWhiteSpace(role))
                {
                    continue;
                }

                rolesFound.Add(role);
                if (!identity.HasClaim(ClaimTypes.Role, role))
                {
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }
        }
        catch
        {
        }
    }

    private sealed class ResolvedRoleRecord
    {
        public string RoleKey { get; set; } = string.Empty;
        public string PermissionKey { get; set; } = string.Empty;
        public Guid? UnitId { get; set; }
    }
}
