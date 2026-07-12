using Acutis.Infrastructure.Auditing;
using Xunit;

namespace Acutis.Api.Tests.Infrastructure;

public sealed class RequestPathRedactorTests
{
    private const string Token = "f1f2f3f4f5f6f7f8f9fa0123456789abcdef0123456789abcdef0123456789ab";

    [Theory]
    [InlineData("/api/video-consultations/invitations/" + Token, "/api/video-consultations/invitations/[REDACTED]")]
    [InlineData("/api/video-consultations/invitations/" + Token + "/credentials", "/api/video-consultations/invitations/[REDACTED]/credentials")]
    [InlineData("/vc/join/" + Token, "/vc/join/[REDACTED]")]
    public void Redact_removes_invitation_token(string path, string expected)
    {
        var result = RequestPathRedactor.Redact(path);
        Assert.Equal(expected, result);
        Assert.DoesNotContain(Token, result, StringComparison.Ordinal);
    }

    [Fact]
    public void Redact_leaves_ordinary_paths_unchanged()
    {
        const string path = "/api/ambulatory/practitioner/dashboard";
        Assert.Equal(path, RequestPathRedactor.Redact(path));
    }
}
