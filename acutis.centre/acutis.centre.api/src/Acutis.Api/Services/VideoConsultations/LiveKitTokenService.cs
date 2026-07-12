using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Acutis.Api.Services.VideoConsultations;

public sealed class LiveKitOptions
{
    public const string SectionName = "LiveKit";
    public string Url { get; set; } = "wss://vc.salientrecovery.com";
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public int JoinWindowMinutesBefore { get; set; } = 30;
    public int JoinWindowMinutesAfter { get; set; } = 120;
}

public interface ILiveKitTokenService
{
    string CreateParticipantToken(string identity, string roomName, string displayName);
}

public sealed class LiveKitTokenService(IOptions<LiveKitOptions> options, TimeProvider clock) : ILiveKitTokenService
{
    public string CreateParticipantToken(string identity, string roomName, string displayName)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.ApiKey) || string.IsNullOrWhiteSpace(settings.ApiSecret))
            throw new InvalidOperationException("LiveKit server credentials are not configured.");

        var now = clock.GetUtcNow();
        var grants = JsonSerializer.Serialize(new
        {
            roomJoin = true, room = roomName, canPublish = true, canSubscribe = true,
            canPublishData = false, canPublishSources = new[] { "camera", "microphone" },
            roomAdmin = false, roomRecord = false
        });
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, identity),
            // Keep personal names out of participant JWTs; the authorised Acutis context supplies UI labels.
            new Claim("name", identity.Contains("practitioner", StringComparison.Ordinal) ? "Practitioner" : "Client"),
            new Claim("video", grants, JsonClaimValueTypes.Json)
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.ApiSecret)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(settings.ApiKey, claims: claims,
            notBefore: now.AddSeconds(-30).UtcDateTime, expires: now.AddMinutes(10).UtcDateTime,
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
