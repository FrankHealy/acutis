using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Services.Configuration;

public sealed record KeycloakUserUpsertRequest(
    string UserName,
    string DisplayName,
    string Email,
    bool IsActive,
    string TemporaryPassword);

public sealed record KeycloakUserRecord(
    string Id,
    string UserName,
    string DisplayName,
    string Email,
    bool IsActive);

public interface IKeycloakAdminService
{
    bool IsEnabled { get; }
    Task<KeycloakUserRecord?> FindUserByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<KeycloakUserRecord> EnsureUserAsync(KeycloakUserUpsertRequest request, CancellationToken cancellationToken = default);
    Task<KeycloakUserRecord> UpdateUserAsync(string subject, KeycloakUserUpsertRequest request, CancellationToken cancellationToken = default);
}

public sealed class DisabledKeycloakAdminService : IKeycloakAdminService
{
    public bool IsEnabled => false;

    public Task<KeycloakUserRecord?> FindUserByUsernameAsync(string username, CancellationToken cancellationToken = default) =>
        Task.FromResult<KeycloakUserRecord?>(null);

    public Task<KeycloakUserRecord> EnsureUserAsync(KeycloakUserUpsertRequest request, CancellationToken cancellationToken = default) =>
        throw new InvalidOperationException("Keycloak admin integration is not configured.");

    public Task<KeycloakUserRecord> UpdateUserAsync(string subject, KeycloakUserUpsertRequest request, CancellationToken cancellationToken = default) =>
        throw new InvalidOperationException("Keycloak admin integration is not configured.");
}

public sealed class KeycloakAdminService : IKeycloakAdminService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly KeycloakAdminOptions _options;

    public KeycloakAdminService(HttpClient httpClient, IOptions<KeycloakAdminOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public bool IsEnabled => _options.Enabled;

    public async Task<KeycloakUserRecord?> FindUserByUsernameAsync(
        string username,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return null;
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{AdminRealmPath}/users?username={Uri.EscapeDataString(username.Trim())}&exact=true");
        request.Headers.Authorization = new("Bearer", token);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        var users = await response.Content.ReadFromJsonAsync<List<KeycloakUserResponse>>(JsonOptions, cancellationToken)
            ?? new List<KeycloakUserResponse>();

        return users.Count == 0 ? null : Map(users[0]);
    }

    public async Task<KeycloakUserRecord> EnsureUserAsync(
        KeycloakUserUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await FindUserByUsernameAsync(request.UserName, cancellationToken);
        if (existing is not null)
        {
            return await UpdateUserAsync(existing.Id, request, cancellationToken);
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var (firstName, lastName) = SplitDisplayName(request.DisplayName);
        using var createRequest = new HttpRequestMessage(HttpMethod.Post, $"{AdminRealmPath}/users");
        createRequest.Headers.Authorization = new("Bearer", token);
        createRequest.Content = JsonContent.Create(new
        {
            username = request.UserName.Trim(),
            email = CleanOptional(request.Email),
            firstName,
            lastName,
            enabled = request.IsActive,
            credentials = string.IsNullOrWhiteSpace(request.TemporaryPassword)
                ? Array.Empty<object>()
                : new object[]
                {
                    new
                    {
                        type = "password",
                        value = request.TemporaryPassword,
                        temporary = true
                    }
                }
        }, options: JsonOptions);

        using var createResponse = await _httpClient.SendAsync(createRequest, cancellationToken);
        await EnsureSuccessAsync(createResponse, cancellationToken);

        return await FindUserByUsernameAsync(request.UserName, cancellationToken)
            ?? throw new InvalidOperationException("Keycloak user was created but could not be read back.");
    }

    public async Task<KeycloakUserRecord> UpdateUserAsync(
        string subject,
        KeycloakUserUpsertRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(subject))
        {
            throw new ArgumentException("A Keycloak subject is required.", nameof(subject));
        }

        var token = await GetAdminTokenAsync(cancellationToken);
        var (firstName, lastName) = SplitDisplayName(request.DisplayName);
        using var updateRequest = new HttpRequestMessage(
            HttpMethod.Put,
            $"{AdminRealmPath}/users/{Uri.EscapeDataString(subject.Trim())}");
        updateRequest.Headers.Authorization = new("Bearer", token);
        updateRequest.Content = JsonContent.Create(new
        {
            username = request.UserName.Trim(),
            email = CleanOptional(request.Email),
            firstName,
            lastName,
            enabled = request.IsActive
        }, options: JsonOptions);

        using var updateResponse = await _httpClient.SendAsync(updateRequest, cancellationToken);
        await EnsureSuccessAsync(updateResponse, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.TemporaryPassword))
        {
            await ResetPasswordAsync(subject, request.TemporaryPassword, token, cancellationToken);
        }

        return await GetUserAsync(subject, token, cancellationToken);
    }

    private string AdminRealmPath => $"admin/realms/{Uri.EscapeDataString(_options.Realm)}";

    private async Task<string> GetAdminTokenAsync(CancellationToken cancellationToken)
    {
        ValidateOptions();
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"realms/{Uri.EscapeDataString(_options.AdminRealm)}/protocol/openid-connect/token");
        request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "password",
            ["client_id"] = _options.ClientId,
            ["username"] = _options.Username,
            ["password"] = _options.Password
        });

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        var payload = await response.Content.ReadFromJsonAsync<KeycloakTokenResponse>(JsonOptions, cancellationToken);
        return payload?.AccessToken
            ?? throw new InvalidOperationException("Keycloak admin token response did not contain an access token.");
    }

    private async Task<KeycloakUserRecord> GetUserAsync(
        string subject,
        string token,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"{AdminRealmPath}/users/{Uri.EscapeDataString(subject.Trim())}");
        request.Headers.Authorization = new("Bearer", token);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        var user = await response.Content.ReadFromJsonAsync<KeycloakUserResponse>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("Keycloak user response was empty.");
        return Map(user);
    }

    private async Task ResetPasswordAsync(
        string subject,
        string password,
        string token,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Put,
            $"{AdminRealmPath}/users/{Uri.EscapeDataString(subject.Trim())}/reset-password");
        request.Headers.Authorization = new("Bearer", token);
        request.Content = JsonContent.Create(new
        {
            type = "password",
            value = password,
            temporary = true
        }, options: JsonOptions);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    private void ValidateOptions()
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl) ||
            string.IsNullOrWhiteSpace(_options.Realm) ||
            string.IsNullOrWhiteSpace(_options.AdminRealm) ||
            string.IsNullOrWhiteSpace(_options.ClientId) ||
            string.IsNullOrWhiteSpace(_options.Username) ||
            string.IsNullOrWhiteSpace(_options.Password))
        {
            throw new InvalidOperationException("Keycloak admin integration is enabled but not fully configured.");
        }
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        var message = string.IsNullOrWhiteSpace(body)
            ? response.ReasonPhrase
            : body;
        throw new InvalidOperationException($"Keycloak admin request failed ({(int)response.StatusCode} {response.StatusCode}): {message}");
    }

    private static KeycloakUserRecord Map(KeycloakUserResponse user)
    {
        var displayName = string.Join(" ", new[] { user.FirstName, user.LastName }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim();
        return new KeycloakUserRecord(
            user.Id ?? string.Empty,
            user.Username ?? string.Empty,
            string.IsNullOrWhiteSpace(displayName) ? user.Username ?? string.Empty : displayName,
            user.Email ?? string.Empty,
            user.Enabled ?? true);
    }

    private static (string FirstName, string LastName) SplitDisplayName(string displayName)
    {
        var clean = displayName.Trim();
        if (string.IsNullOrWhiteSpace(clean))
        {
            return (string.Empty, string.Empty);
        }

        var separator = clean.IndexOf(' ', StringComparison.Ordinal);
        return separator < 0
            ? (clean, string.Empty)
            : (clean[..separator], clean[(separator + 1)..].Trim());
    }

    private static string? CleanOptional(string value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private sealed class KeycloakTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }
    }

    private sealed class KeycloakUserResponse
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool? Enabled { get; set; }
    }
}
