using Acutis.Application.DTOs;

namespace Acutis.Application.Interfaces;

public interface IAuditTrail
{
    Task RecordAsync(AuditTrailItem item, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AuditTrailItem>> GetHistoryAsync(Guid entityId, string entityName, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
}
