using Acutis.Domain.Entities;
using Acutis.Infrastructure.Auditing;
using Acutis.Infrastructure.Data;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Acutis.Api.Services.TherapyScheduling;

public interface IAuditService
{
    Task WriteAsync(
        Guid? centreId,
        Guid? unitId,
        string entityType,
        string entityId,
        string action,
        object? before,
        object? after,
        string? reason,
        CancellationToken cancellationToken = default);
}

public sealed class AuditService : IAuditService
{
    private static readonly Guid SystemActorUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    private readonly AcutisDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditService(AcutisDbContext dbContext, IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task WriteAsync(
        Guid? centreId,
        Guid? unitId,
        string entityType,
        string entityId,
        string action,
        object? before,
        object? after,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var actorUserId = ResolveActorUserId(httpContext?.User);
        var actorRole = httpContext?.User.FindFirstValue(ClaimTypes.Role);
        var correlationId = RequestCorrelationMiddleware.GetCorrelationId(httpContext);

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            OccurredAt = DateTime.UtcNow,
            ActorUserId = actorUserId,
            ActorRole = actorRole,
            CentreId = centreId,
            UnitId = unitId,
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            BeforeJson = SerializeForAudit(before),
            AfterJson = SerializeForAudit(after),
            Reason = reason,
            CorrelationId = correlationId,
            RequestPath = httpContext?.Request.Path.Value ?? string.Empty,
            RequestMethod = httpContext?.Request.Method ?? string.Empty,
            ClientIp = httpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = httpContext?.Request.Headers.UserAgent.ToString()
        };

        _dbContext.AuditLogs.Add(auditLog);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Guid ResolveActorUserId(ClaimsPrincipal? user)
    {
        if (user is null)
        {
            return SystemActorUserId;
        }

        var candidateClaims = new[]
        {
            ClaimTypes.NameIdentifier,
            "sub",
            "userid",
            "user_id"
        };

        foreach (var claimType in candidateClaims)
        {
            var claimValue = user.FindFirstValue(claimType);
            if (!string.IsNullOrWhiteSpace(claimValue) && Guid.TryParse(claimValue, out var parsed))
            {
                return parsed;
            }
        }

        return SystemActorUserId;
    }

    private static string? SerializeForAudit(object? value)
    {
        return AuditJsonSanitizer.Serialize(value, JsonOptions);
    }
}
