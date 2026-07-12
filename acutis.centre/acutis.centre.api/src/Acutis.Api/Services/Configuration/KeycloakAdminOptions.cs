namespace Acutis.Api.Services.Configuration;

public sealed class KeycloakAdminOptions
{
    public const string SectionName = "KeycloakAdmin";

    public bool Enabled { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string Realm { get; set; } = string.Empty;
    public string AdminRealm { get; set; } = "master";
    public string ClientId { get; set; } = "admin-cli";
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
