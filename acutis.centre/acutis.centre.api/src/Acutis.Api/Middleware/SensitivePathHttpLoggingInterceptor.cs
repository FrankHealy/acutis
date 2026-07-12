using Acutis.Infrastructure.Auditing;
using Microsoft.AspNetCore.HttpLogging;

namespace Acutis.Api.Middleware;

/// <summary>Suppresses fields HttpLogging cannot safely rewrite before they reach its logger.</summary>
public sealed class SensitivePathHttpLoggingInterceptor : IHttpLoggingInterceptor
{
    public ValueTask OnRequestAsync(HttpLoggingInterceptorContext logContext)
    {
        if (RequestPathRedactor.IsSensitive(logContext.HttpContext.Request.Path.Value))
        {
            logContext.LoggingFields &= ~(HttpLoggingFields.RequestPath | HttpLoggingFields.RequestQuery);
        }
        return ValueTask.CompletedTask;
    }

    public ValueTask OnResponseAsync(HttpLoggingInterceptorContext logContext) => ValueTask.CompletedTask;
}
