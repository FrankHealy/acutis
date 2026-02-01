namespace Acutis.Infrastructure.Security;

public class ApiKeyOptions
{
    public IList<ApiKeyRecord> Keys { get; set; } = new List<ApiKeyRecord>();

    public sealed class ApiKeyRecord
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string[] Scopes { get; set; } = Array.Empty<string>();
    }
}
