using Acutis.Api.Middleware;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Acutis.Api.Tests.Infrastructure;

public sealed class FileRequestLoggingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_logs_only_redacted_invitation_path()
    {
        const string token = "f1f2f3f4f5f6f7f8f9fa0123456789abcdef0123456789abcdef0123456789ab";
        var root = Path.Combine(Path.GetTempPath(), $"acutis-log-test-{Guid.NewGuid():N}");
        Directory.CreateDirectory(root);
        try
        {
            var middleware = new FileRequestLoggingMiddleware(_ => Task.CompletedTask, new TestEnvironment(root), NullLogger<FileRequestLoggingMiddleware>.Instance);
            var context = new DefaultHttpContext();
            context.Request.Method = HttpMethods.Post;
            context.Request.Path = $"/api/video-consultations/invitations/{token}/credentials";
            context.Request.QueryString = new QueryString("?unexpected=sensitive");

            await middleware.InvokeAsync(context);

            var output = await File.ReadAllTextAsync(Directory.GetFiles(Path.Combine(root, "logs")).Single());
            Assert.Contains("/api/video-consultations/invitations/[REDACTED]/credentials", output, StringComparison.Ordinal);
            Assert.DoesNotContain(token, output, StringComparison.Ordinal);
            Assert.DoesNotContain("unexpected=sensitive", output, StringComparison.Ordinal);
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }

    private sealed class TestEnvironment(string root) : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = root;
        public string EnvironmentName { get; set; } = "Testing";
        public string ContentRootPath { get; set; } = root;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
