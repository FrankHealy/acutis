using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Acutis.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Acutis.Infrastructure.Security;

public class ApiKeyValidator : IApiKeyValidator
{
    private readonly ApiKeyOptions _options;
    private readonly ILogger<ApiKeyValidator> _logger;

    public ApiKeyValidator(IOptions<ApiKeyOptions> options, ILogger<ApiKeyValidator> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public Task<bool> ValidateAsync(string apiKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Task.FromResult(false);
        }

        foreach (var key in _options.Keys)
        {
            if (IsMatch(apiKey, key.Value))
            {
                _logger.LogInformation("API key authenticated as {Name}", key.Name);
                return Task.FromResult(true);
            }
        }

        _logger.LogWarning("Invalid API key attempted");
        return Task.FromResult(false);
    }

    private static bool IsMatch(string input, string stored)
    {
        if (string.IsNullOrWhiteSpace(stored))
        {
            return false;
        }

        if (stored.Length == 64 && stored.All(IsHex))
        {
            var hash = ComputeSha256(input);
            return CryptographicOperations.FixedTimeEquals(Convert.FromHexString(stored), Convert.FromHexString(hash));
        }

        return string.Equals(input, stored, StringComparison.Ordinal);
    }

    private static string ComputeSha256(string value)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }

    private static bool IsHex(char c) => c is >= '0' and <= '9' or >= 'a' and <= 'f' or >= 'A' and <= 'F';
}
