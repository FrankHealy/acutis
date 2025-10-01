namespace Acutis.Domain.Entities;

public class AuditEntry : AuditableEntity
{
    public string EntityName { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? KeyValues { get; set; }
    public string? OriginalValues { get; set; }
    public string? CurrentValues { get; set; }
    public string? ChangedColumns { get; set; }
    public string? CorrelationId { get; set; }
    public string? IpAddress { get; set; }
}

