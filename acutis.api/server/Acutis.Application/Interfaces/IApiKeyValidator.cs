namespace Acutis.Application.Interfaces;

public interface IApiKeyValidator
{
    Task<bool> ValidateAsync(string apiKey, CancellationToken cancellationToken = default);
}
