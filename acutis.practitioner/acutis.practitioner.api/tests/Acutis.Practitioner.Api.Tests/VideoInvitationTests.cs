using Acutis.Email;
using Acutis.Practitioner.Api;
using Xunit;

namespace Acutis.Practitioner.Api.Tests;

public sealed class VideoInvitationTests
{
    [Fact]
    public void InvitationTokens_AreOpaqueUrlSafeAndUse256Bits()
    {
        var first = InvitationTokens.Create();
        var second = InvitationTokens.Create();
        Assert.Equal(43, first.Length);
        Assert.DoesNotContain("=", first);
        Assert.DoesNotContain("+", first);
        Assert.DoesNotContain("/", first);
        Assert.NotEqual(first, second);
        Assert.Equal(32, InvitationTokens.Hash(first).Length);
    }

    [Fact]
    public void Template_HtmlEncodesUserData_AndDoesNotContainClinicalData()
    {
        var content = VideoInvitationTemplate.Create("en-IE", "Dr <script>alert(1)</script>", new DateTime(2026, 7, 14, 10, 0, 0, DateTimeKind.Utc), "Europe/London", "https://example.test/meetings/join/opaque", "support@example.test");
        Assert.DoesNotContain("<script>", content.Html);
        Assert.Contains("&lt;script&gt;", content.Html);
        Assert.Contains("https://example.test/meetings/join/opaque", content.Text);
        Assert.DoesNotContain("diagnosis", content.Text, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ArabicTemplate_IsRightToLeft()
    {
        var content = VideoInvitationTemplate.Create("ar", "Practitioner", DateTime.UtcNow, "Europe/London", "https://example.test/meetings/join/opaque", "support@example.test");
        Assert.Contains("dir=\"rtl\"", content.Html);
    }

    [Fact]
    public void EmailConfiguration_MissingPassword_IsReportedWithoutThrowing()
    {
        var options = new EmailOptions { Password = "" };
        Assert.Equal("SMTP credentials are missing.", options.Validate());
    }
}
