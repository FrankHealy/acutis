using System.Diagnostics;

namespace Acutis.Api.Middleware;

public sealed class FileRequestLoggingMiddleware
{
    private static readonly SemaphoreSlim WriteLock = new(1, 1);

    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileRequestLoggingMiddleware> _logger;

    public FileRequestLoggingMiddleware(
        RequestDelegate next,
        IWebHostEnvironment environment,
        ILogger<FileRequestLoggingMiddleware> logger)
    {
        _next = next;
        _environment = environment;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            var query = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : string.Empty;
            var correlationId = context.Response.Headers.TryGetValue("X-Correlation-Id", out var headerValue)
                ? headerValue.ToString()
                : "n/a";

            var logLine =
                $"{DateTimeOffset.Now:yyyy-MM-dd HH:mm:ss.fff zzz} | {context.Request.Method} {context.Request.Path}{query} | {context.Response.StatusCode} | {stopwatch.ElapsedMilliseconds} ms | CorrelationId={correlationId}{Environment.NewLine}";

            var logDirectory = Path.Combine(_environment.ContentRootPath, "logs");
            Directory.CreateDirectory(logDirectory);

            var logPath = Path.Combine(logDirectory, $"requests-{DateTime.Today:yyyy-MM-dd}.log");

            try
            {
                await WriteLock.WaitAsync();
                await File.AppendAllTextAsync(logPath, logLine);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to write request log entry to {LogPath}", logPath);
            }
            finally
            {
                if (WriteLock.CurrentCount == 0)
                {
                    WriteLock.Release();
                }
            }
        }
    }
}
