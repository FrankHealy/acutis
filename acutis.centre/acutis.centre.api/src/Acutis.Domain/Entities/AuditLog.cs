namespace Acutis.Domain.Entities;

public sealed class AuditLog
{
    public Guid Id { get; set; }
    public DateTime OccurredAt { get; set; }
    public Guid ActorUserId { get; set; }
    public string? ActorRole { get; set; }
    public Guid? CentreId { get; set; }
    public Guid? UnitId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? BeforeJson { get; set; }
    public string? AfterJson { get; set; }
    public string? Reason { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public string RequestPath { get; set; } = string.Empty;
    public string RequestMethod { get; set; } = string.Empty;
    public string? ClientIp { get; set; }
    public string? UserAgent { get; set; }
}
