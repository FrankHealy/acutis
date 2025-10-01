using Acutis.Application.DTOs;
using Acutis.Application.Interfaces;
using Acutis.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Acutis.Infrastructure.Audit;

public class AuditTrailService : IAuditTrail
{
    private readonly AcutisDbContext _context;
    private readonly ILogger<AuditTrailService> _logger;

    public AuditTrailService(AcutisDbContext context, ILogger<AuditTrailService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task RecordAsync(AuditTrailItem item, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("External audit record requested for {Entity} {EntityId}", item.EntityName, item.EntityId);
        _context.AuditEntries.Add(new Domain.Entities.AuditEntry
        {
            EntityName = item.EntityName,
            EntityId = item.EntityId,
            Action = item.Action,
            CreatedAt = item.Timestamp,
            CreatedBy = item.UserName,
            KeyValues = item.EntityId.HasValue ? item.EntityId.Value.ToString() : null,
            OriginalValues = item.OriginalValues,
            CurrentValues = item.CurrentValues,
            ChangedColumns = item.ChangedColumns,
            CorrelationId = item.CorrelationId,
            IpAddress = item.IpAddress
        });

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuditTrailItem>> GetHistoryAsync(Guid entityId, string entityName, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var query = _context.AuditEntries
            .AsNoTracking()
            .Where(x => x.EntityName == entityName && x.EntityId == entityId)
            .OrderByDescending(x => x.CreatedAt);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AuditTrailItem(
                x.Id,
                x.CreatedAt,
                x.EntityName,
                x.EntityId,
                x.Action,
                x.CreatedBy,
                x.CreatedBy,
                x.OriginalValues,
                x.CurrentValues,
                x.ChangedColumns,
                x.CorrelationId,
                x.IpAddress))
            .ToListAsync(cancellationToken);

        return items;
    }
}
