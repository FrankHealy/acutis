namespace Acutis.Application.DTOs;

public record AuditTrailItem(
    Guid Id,
    DateTimeOffset Timestamp,
    string EntityName,
    Guid? EntityId,
    string Action,
    string? UserId,
    string? UserName,
    string? OriginalValues,
    string? CurrentValues,
    string? ChangedColumns,
    string? CorrelationId,
    string? IpAddress
);
