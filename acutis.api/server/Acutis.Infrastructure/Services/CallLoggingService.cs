using System.Security.Claims;
using System.Text.Json;
using Acutis.Application.DTOs;
using Acutis.Application.Requests;
using Acutis.Application.Services;
using Acutis.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Infrastructure.Services;

public class CallLoggingService : ICallLoggingService
{
    private readonly AppDbContext _db;

    public CallLoggingService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CallLogDto> CreateAsync(CreateCallLogRequest request, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var userName = ResolveUserName(user);
        var now = DateTimeOffset.UtcNow;

        var entity = new CallLog
        {
            FirstName = request.FirstName,
            Surname = request.Surname,
            CallerType = request.CallerType,
            ConcernType = request.ConcernType,
            Unit = request.Unit,
            Location = request.Location,
            PhoneNumber = request.PhoneNumber,
            TimestampUtc = request.TimestampUtc,
            Notes = request.Notes,
            Status = request.Status,
            Urgency = request.Urgency,
            CreatedAt = now,
            CreatedBy = userName
        };

        _db.CallLogs.Add(entity);
        _db.AuditEntries.Add(BuildAuditEntry(
            entity.Id,
            "Create",
            userName,
            now,
            originalValues: null,
            currentValues: JsonSerializer.Serialize(request),
            changedColumns: string.Join(',', CallLogFields)));

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(entity);
    }

    public async Task<CallLogDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _db.CallLogs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity is null ? null : ToDto(entity);
    }

    public async Task<PagedResult<CallLogDto>> QueryAsync(CallLogQuery query, CancellationToken cancellationToken)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 50 : query.PageSize;

        var callLogs = _db.CallLogs.AsNoTracking();

        if (query.From.HasValue)
            callLogs = callLogs.Where(x => x.TimestampUtc >= query.From.Value);

        if (query.To.HasValue)
            callLogs = callLogs.Where(x => x.TimestampUtc <= query.To.Value);

        if (!string.IsNullOrWhiteSpace(query.Unit))
            callLogs = callLogs.Where(x => x.Unit == query.Unit);

        if (!string.IsNullOrWhiteSpace(query.CallerType))
            callLogs = callLogs.Where(x => x.CallerType == query.CallerType);

        if (!string.IsNullOrWhiteSpace(query.ConcernType))
            callLogs = callLogs.Where(x => x.ConcernType == query.ConcernType);

        if (!string.IsNullOrWhiteSpace(query.Status))
            callLogs = callLogs.Where(x => x.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Urgency))
            callLogs = callLogs.Where(x => x.Urgency == query.Urgency);

        var totalCount = await callLogs.CountAsync(cancellationToken);

        var items = await callLogs
            .OrderByDescending(x => x.TimestampUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToDto(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<CallLogDto>(items, page, pageSize, totalCount);
    }

    public async Task<CallLogDto> UpdateAsync(Guid id, UpdateCallLogRequest request, ClaimsPrincipal user, CancellationToken cancellationToken)
    {
        var entity = await _db.CallLogs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
            throw new KeyNotFoundException($"Call log {id} not found");

        var userName = ResolveUserName(user);
        var now = DateTimeOffset.UtcNow;
        var originalValues = JsonSerializer.Serialize(ToDto(entity));

        entity.FirstName = request.FirstName;
        entity.Surname = request.Surname;
        entity.CallerType = request.CallerType;
        entity.ConcernType = request.ConcernType;
        entity.Unit = request.Unit;
        entity.Location = request.Location;
        entity.PhoneNumber = request.PhoneNumber;
        entity.TimestampUtc = request.TimestampUtc;
        entity.Notes = request.Notes;
        entity.Status = request.Status;
        entity.Urgency = request.Urgency;
        entity.ModifiedAt = now;
        entity.ModifiedBy = userName;

        _db.AuditEntries.Add(BuildAuditEntry(
            entity.Id,
            "Update",
            userName,
            now,
            originalValues,
            JsonSerializer.Serialize(request),
            changedColumns: string.Join(',', CallLogFields)));

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(entity);
    }

    private static AuditEntry BuildAuditEntry(Guid entityId, string action, string? userName, DateTimeOffset timestamp, string? originalValues, string? currentValues, string? changedColumns)
    {
        return new AuditEntry
        {
            EntityName = "CallLog",
            EntityId = entityId,
            Action = action,
            CreatedAt = timestamp,
            CreatedBy = userName,
            OriginalValues = originalValues,
            CurrentValues = currentValues,
            ChangedColumns = changedColumns
        };
    }

    private static CallLogDto ToDto(CallLog entity)
    {
        return new CallLogDto(
            entity.Id,
            entity.FirstName,
            entity.Surname,
            entity.CallerType,
            entity.ConcernType,
            entity.Unit,
            entity.Location,
            entity.PhoneNumber,
            entity.TimestampUtc,
            entity.Notes,
            entity.Status,
            entity.Urgency,
            entity.CreatedBy ?? string.Empty,
            entity.CreatedAt,
            entity.ModifiedBy,
            entity.ModifiedAt);
    }

    private static string? ResolveUserName(ClaimsPrincipal user)
    {
        var name = user.Identity?.Name;
        if (!string.IsNullOrWhiteSpace(name))
            return name;

        return user.FindFirst("preferred_username")?.Value
            ?? user.FindFirst(ClaimTypes.Upn)?.Value
            ?? user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    private static readonly string[] CallLogFields =
    {
        "FirstName",
        "Surname",
        "CallerType",
        "ConcernType",
        "Unit",
        "Location",
        "PhoneNumber",
        "TimestampUtc",
        "Notes",
        "Status",
        "Urgency"
    };
}
