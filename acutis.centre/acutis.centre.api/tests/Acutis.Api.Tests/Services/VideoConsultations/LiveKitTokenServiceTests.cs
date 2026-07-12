using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
using Acutis.Api.Services.VideoConsultations;
using Microsoft.Extensions.Options;
using Xunit;

namespace Acutis.Api.Tests.Services.VideoConsultations;

public sealed class LiveKitTokenServiceTests
{
    [Fact]
    public void Token_contains_only_expected_room_and_minimal_media_grants()
    {
        var service = new LiveKitTokenService(Options.Create(new LiveKitOptions
        {
            ApiKey = "test-api-key", ApiSecret = "a-development-secret-at-least-32-bytes"
        }), TimeProvider.System);

        var encoded = service.CreateParticipantToken("vc_practitioner_opaque", "opaque-room", "Practitioner");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(encoded);
        var grants = JsonDocument.Parse(jwt.Claims.Single(x => x.Type == "video").Value).RootElement;

        Assert.Equal("test-api-key", jwt.Issuer);
        Assert.Equal("vc_practitioner_opaque", jwt.Subject);
        Assert.Equal("Practitioner", jwt.Claims.Single(x => x.Type == "name").Value);
        Assert.Equal("opaque-room", grants.GetProperty("room").GetString());
        Assert.True(grants.GetProperty("roomJoin").GetBoolean());
        Assert.True(grants.GetProperty("canPublish").GetBoolean());
        Assert.True(grants.GetProperty("canSubscribe").GetBoolean());
        Assert.False(grants.GetProperty("canPublishData").GetBoolean());
        Assert.False(grants.GetProperty("roomAdmin").GetBoolean());
        Assert.False(grants.GetProperty("roomRecord").GetBoolean());
        Assert.Equal(new[] { "camera", "microphone" }, grants.GetProperty("canPublishSources").EnumerateArray().Select(x => x.GetString()));
        Assert.DoesNotContain("client", encoded, StringComparison.OrdinalIgnoreCase);
        Assert.InRange(jwt.ValidTo - jwt.ValidFrom, TimeSpan.FromMinutes(10), TimeSpan.FromMinutes(11));
    }

    [Fact]
    public void Participants_receive_unique_identities_for_the_same_room()
    {
        var service = new LiveKitTokenService(Options.Create(new LiveKitOptions
        {
            ApiKey = "key", ApiSecret = "a-development-secret-at-least-32-bytes"
        }), TimeProvider.System);
        var first = new JwtSecurityTokenHandler().ReadJwtToken(service.CreateParticipantToken("vc_practitioner_a", "room", "A"));
        var second = new JwtSecurityTokenHandler().ReadJwtToken(service.CreateParticipantToken("vc_client_b", "room", "B"));
        Assert.NotEqual(first.Subject, second.Subject);
        Assert.Equal(first.Claims.Single(x => x.Type == "video").Value, second.Claims.Single(x => x.Type == "video").Value);
    }
}
