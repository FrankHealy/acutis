using System.Linq;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Acutis.Application.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Authentication;

public class ApiKeyAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "ApiKey";
    private readonly IApiKeyValidator _validator;

    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory loggerFactory,
        UrlEncoder encoder,
        ISystemClock clock,
        IApiKeyValidator validator)
        : base(options, loggerFactory, encoder, clock)
    {
        _validator = validator;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("X-API-Key", out var apiKeyValues))
        {
            return AuthenticateResult.NoResult();
        }

        var apiKey = apiKeyValues.FirstOrDefault();
        if (apiKey is null)
        {
            return AuthenticateResult.NoResult();
        }

        if (!await _validator.ValidateAsync(apiKey, Context.RequestAborted))
        {
            return AuthenticateResult.Fail("Invalid API key");
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "api-key-client"),
            new Claim(ClaimTypes.Name, "API Client"),
            new Claim("auth_type", SchemeName)
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);
        return AuthenticateResult.Success(ticket);
    }
}
