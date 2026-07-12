namespace Acutis.Api.Security;

public static class DotEnvLoader
{
    public static void LoadForCurrentEnvironment()
    {
        Load(".env");

        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (!string.IsNullOrWhiteSpace(environmentName))
        {
            Load($".env.{environmentName}");
        }
    }

    private static void Load(string fileName)
    {
        foreach (var candidate in GetCandidatePaths(fileName))
        {
            if (!File.Exists(candidate))
            {
                continue;
            }

            foreach (var rawLine in File.ReadAllLines(candidate))
            {
                var line = rawLine.Trim();
                if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
                {
                    continue;
                }

                var separatorIndex = line.IndexOf('=');
                if (separatorIndex <= 0)
                {
                    continue;
                }

                var key = line[..separatorIndex].Trim();
                if (string.IsNullOrWhiteSpace(key) || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key)))
                {
                    continue;
                }

                var value = line[(separatorIndex + 1)..].Trim();
                if (value.Length >= 2 && value.StartsWith('"') && value.EndsWith('"'))
                {
                    value = value[1..^1];
                }

                Environment.SetEnvironmentVariable(key, value);
            }

            return;
        }
    }

    private static IEnumerable<string> GetCandidatePaths(string fileName)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var root in new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory })
        {
            var directory = new DirectoryInfo(root);
            while (directory is not null)
            {
                var candidate = Path.Combine(directory.FullName, fileName);
                if (seen.Add(candidate))
                {
                    yield return candidate;
                }

                directory = directory.Parent;
            }
        }
    }
}
