namespace Acutis.Infrastructure.Auditing;

/// <summary>Canonical request-path sanitisation for logging and audit persistence.</summary>
public static class RequestPathRedactor
{
    private const string ApiPrefix = "/api/video-consultations/invitations/";
    private const string FrontendPrefix = "/vc/join/";

    public static string Redact(string? path)
    {
        if (string.IsNullOrEmpty(path)) return string.Empty;

        if (TryRedact(path, ApiPrefix, out var apiPath)) return apiPath;
        if (TryRedact(path, FrontendPrefix, out var frontendPath)) return frontendPath;
        return path;
    }

    public static bool IsSensitive(string? path) => !string.Equals(path, Redact(path), StringComparison.Ordinal);

    private static bool TryRedact(string path, string prefix, out string redacted)
    {
        if (!path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            redacted = path;
            return false;
        }

        var tokenStart = prefix.Length;
        var tokenEnd = path.IndexOf('/', tokenStart);
        var suffix = tokenEnd >= 0 ? path[tokenEnd..] : string.Empty;
        redacted = $"{prefix}[REDACTED]{suffix}";
        return true;
    }
}
