namespace Acutis.Api.Services.TherapyScheduling;

public sealed class RequestCorrelationMiddleware
{
    public const string CorrelationIdHeader = "X-Correlation-Id";
    private const string CorrelationIdItemKey = "__CorrelationId";

    private readonly RequestDelegate _next;

    public RequestCorrelationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var correlationId = ResolveCorrelationId(context.Request.Headers[CorrelationIdHeader].ToString());
        context.Items[CorrelationIdItemKey] = correlationId;
        context.Response.Headers[CorrelationIdHeader] = correlationId;
        await _next(context);
    }

    public static string GetCorrelationId(HttpContext? context)
    {
        if (context is null)
        {
            return Guid.NewGuid().ToString("N");
        }

        if (context.Items.TryGetValue(CorrelationIdItemKey, out var value) && value is string correlationId)
        {
            return correlationId;
        }

        return ResolveCorrelationId(context.Request.Headers[CorrelationIdHeader].ToString());
    }

    private static string ResolveCorrelationId(string candidate)
    {
        if (!string.IsNullOrWhiteSpace(candidate))
        {
            return candidate.Trim();
        }

        return Guid.NewGuid().ToString("N");
    }
}
