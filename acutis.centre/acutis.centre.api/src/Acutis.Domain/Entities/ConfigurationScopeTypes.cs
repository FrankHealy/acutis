namespace Acutis.Domain.Entities;

public static class ConfigurationScopeTypes
{
    public const string Centre = "centre";
    public const string Unit = "unit";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        Centre,
        Unit
    };
}
