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
    public int TokenLifetimeMinutes { get; set; } = 10;
    public int JoinWindowMinutesBefore { get; set; } = 30;
    public int JoinWindowMinutesAfter { get; set; } = 120;
    public int InvitationLifetimeHours { get; set; } = 72;
}

public interface ILiveKitTokenService
{
    string CreateParticipantToken(string roomName, string participantIdentity);
}

public sealed class LiveKitTokenService : ILiveKitTokenService
{
    private readonly LiveKitOptions _options;

    public LiveKitTokenService(IOptions<LiveKitOptions> options)
    {
        _options = options.Value;
        if (string.IsNullOrWhiteSpace(_options.ApiKey) || string.IsNullOrWhiteSpace(_options.ApiSecret))
        {
            throw new InvalidOperationException("LiveKit API credentials are not configured.");
        }
    }

    public string CreateParticipantToken(string roomName, string participantIdentity)
    {
        var now = DateTime.UtcNow;
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.ApiSecret));
        var videoGrant = JsonSerializer.Serialize(new
        {
            roomJoin = true,
            room = roomName,
            canPublish = true,
            canSubscribe = true,
            canPublishData = false,
            canPublishSources = new[] { "camera", "microphone" },
            roomAdmin = false,
            roomRecord = false
        });

        var token = new JwtSecurityToken(
            issuer: _options.ApiKey,
            audience: null,
            claims:
            [
                new Claim(JwtRegisteredClaimNames.Sub, participantIdentity),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
                new Claim("video", videoGrant, JsonClaimValueTypes.Json)
            ],
            notBefore: now.AddSeconds(-30),
            expires: now.AddMinutes(Math.Max(1, _options.TokenLifetimeMinutes)),
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
