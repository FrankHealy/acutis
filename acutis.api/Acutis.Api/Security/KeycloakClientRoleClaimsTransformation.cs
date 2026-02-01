using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;

namespace Acutis.Api.Security;

public sealed class KeycloakClientRoleClaimsTransformation : IClaimsTransformation
{
    private const string ClientId = "api-client";

    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
            return Task.FromResult(principal);

        AddRealmRoles(principal, identity);
        AddClientRoles(principal, identity);

        return Task.FromResult(principal);
    }

    private static void AddRealmRoles(ClaimsPrincipal principal, ClaimsIdentity identity)
    {
        var json = principal.FindFirst("realm_access")?.Value;
        if (string.IsNullOrWhiteSpace(json)) return;

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("roles", out var roles) || roles.ValueKind != JsonValueKind.Array)
                return;

            foreach (var r in roles.EnumerateArray())
            {
                var role = r.GetString();
                if (!string.IsNullOrWhiteSpace(role) && !identity.HasClaim(ClaimTypes.Role, role))
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }
        catch { /* ignore */ }
    }

    private static void AddClientRoles(ClaimsPrincipal principal, ClaimsIdentity identity)
    {
        var json = principal.FindFirst("resource_access")?.Value;
        if (string.IsNullOrWhiteSpace(json)) return;

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty(ClientId, out var client)) return;

            if (!client.TryGetProperty("roles", out var roles) || roles.ValueKind != JsonValueKind.Array)
                return;

            foreach (var r in roles.EnumerateArray())
            {
                var role = r.GetString();
                if (!string.IsNullOrWhiteSpace(role) && !identity.HasClaim(ClaimTypes.Role, role))
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }
        catch { /* ignore */ }
    }
}
