using System.Text.Json;
using Acutis.Application.Interfaces;
using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

namespace Acutis.Infrastructure.Audit;

public class AuditInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuditInterceptor> _logger;

    public AuditInterceptor(ICurrentUserService currentUserService, ILogger<AuditInterceptor> logger)
    {
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            WriteAuditEntries(eventData.Context);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void WriteAuditEntries(DbContext context)
    {
        var entries = context.ChangeTracker.Entries<AuditableEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        if (entries.Count == 0)
        {
            return;
        }

        var correlationId = context.Database.GetDbConnection().Database + ":" + Guid.NewGuid();

        foreach (var entry in entries)
        {
            if (entry.Entity is AuditEntry)
            {
                continue; // avoid auditing the audit table
            }

            var audit = new AuditEntry
            {
                EntityName = entry.Entity.GetType().Name,
                EntityId = entry.Entity.Id,
                Action = entry.State.ToString(),
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = _currentUserService.UserName,
                CorrelationId = correlationId,
                IpAddress = _currentUserService.IpAddress
            };

            var original = new Dictionary<string, object?>();
            var current = new Dictionary<string, object?>();
            var changed = new List<string>();

            foreach (var property in entry.Properties)
            {
                var propName = property.Metadata.Name;

                switch (entry.State)
                {
                    case EntityState.Added:
                        current[propName] = property.CurrentValue;
                        break;
                    case EntityState.Deleted:
                        original[propName] = property.OriginalValue;
                        break;
                    case EntityState.Modified:
                        if (!Equals(property.OriginalValue, property.CurrentValue))
                        {
                            original[propName] = property.OriginalValue;
                            current[propName] = property.CurrentValue;
                            changed.Add(propName);
                        }
                        break;
                }
            }

            audit.OriginalValues = original.Count == 0 ? null : JsonSerializer.Serialize(original);
            audit.CurrentValues = current.Count == 0 ? null : JsonSerializer.Serialize(current);
            audit.ChangedColumns = changed.Count == 0 ? null : JsonSerializer.Serialize(changed);
            audit.KeyValues = JsonSerializer.Serialize(new Dictionary<string, object?>
            {
                ["Id"] = entry.Entity.Id
            });

            context.Add(audit);
            _logger.LogTrace("Captured audit entry {@Audit}", audit);
        }
    }
}
