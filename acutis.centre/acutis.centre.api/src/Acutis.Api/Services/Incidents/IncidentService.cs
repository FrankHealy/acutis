using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Incidents;

public interface IIncidentService
{
    Task<IReadOnlyList<IncidentTypeDto>> GetIncidentTypesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IncidentDto>> GetIncidentsForUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<IncidentDto> CreateIncidentAsync(Guid unitId, CreateIncidentRequest request, Guid actorUserId, CancellationToken cancellationToken = default);
}

public sealed class IncidentService : IIncidentService
{
    private readonly AcutisDbContext _dbContext;

    public IncidentService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<IncidentTypeDto>> GetIncidentTypesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.IncidentTypes
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.DefaultName)
            .Select(x => new IncidentTypeDto
            {
                Id = x.Id,
                Code = x.Code,
                DefaultName = x.DefaultName
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<IncidentDto>> GetIncidentsForUnitAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var unit = await _dbContext.Units
            .AsNoTracking()
            .Where(x => x.Id == unitId && x.IsActive)
            .Select(x => new { x.Id, x.CentreId })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException($"Unit '{unitId}' was not found.");

        return await _dbContext.Incidents
            .AsNoTracking()
            .Where(x => x.UnitId == unit.Id || (x.UnitId == null && x.CentreId == unit.CentreId))
            .OrderByDescending(x => x.OccurredAtUtc)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(x => new IncidentDto
            {
                Id = x.Id,
                IncidentTypeId = x.IncidentTypeId,
                IncidentTypeCode = x.IncidentType!.Code,
                IncidentTypeName = x.IncidentType.DefaultName,
                Scope = x.ResidentId != null ? "resident" : x.UnitId != null ? "unit" : x.CentreId != null ? "centre" : "unknown",
                ResidentId = x.ResidentId,
                ResidentName = x.Resident == null
                    ? null
                    : ((x.Resident.FirstName ?? string.Empty) + " " + (x.Resident.Surname ?? string.Empty)).Trim(),
                ResidentCaseId = x.ResidentCaseId,
                EpisodeId = x.EpisodeId,
                CentreId = x.CentreId,
                UnitId = x.UnitId,
                OccurredAtUtc = x.OccurredAtUtc,
                Summary = x.Summary,
                DetailsJson = x.DetailsJson,
                Notes = x.Notes,
                CreatedAtUtc = x.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IncidentDto> CreateIncidentAsync(
        Guid unitId,
        CreateIncidentRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var unit = await _dbContext.Units
            .AsNoTracking()
            .Where(x => x.Id == unitId && x.IsActive)
            .Select(x => new { x.Id, x.CentreId })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException($"Unit '{unitId}' was not found.");

        var normalizedScope = NormalizeScope(request.Scope);
        ValidateRequest(request, normalizedScope);

        var incidentTypeExists = await _dbContext.IncidentTypes
            .AsNoTracking()
            .AnyAsync(x => x.Id == request.IncidentTypeId && x.IsActive, cancellationToken);
        if (!incidentTypeExists)
        {
            throw new InvalidOperationException($"IncidentType '{request.IncidentTypeId}' was not found.");
        }

        if (request.ResidentId.HasValue)
        {
            var residentExists = await _dbContext.Residents
                .AsNoTracking()
                .AnyAsync(x => x.Id == request.ResidentId.Value, cancellationToken);
            if (!residentExists)
            {
                throw new InvalidOperationException($"Resident '{request.ResidentId}' was not found.");
            }
        }

        if (request.ResidentCaseId.HasValue)
        {
            var caseExists = await _dbContext.ResidentCases
                .AsNoTracking()
                .AnyAsync(x => x.Id == request.ResidentCaseId.Value, cancellationToken);
            if (!caseExists)
            {
                throw new InvalidOperationException($"ResidentCase '{request.ResidentCaseId}' was not found.");
            }
        }

        if (request.EpisodeId.HasValue)
        {
            var episodeExists = await _dbContext.ResidentProgrammeEpisodes
                .AsNoTracking()
                .AnyAsync(x => x.Id == request.EpisodeId.Value, cancellationToken);
            if (!episodeExists)
            {
                throw new InvalidOperationException($"Episode '{request.EpisodeId}' was not found.");
            }
        }

        var createdByUserId = await ResolveCreatedByUserIdAsync(actorUserId, cancellationToken);

        var incident = new Acutis.Domain.Entities.Incident
        {
            Id = Guid.NewGuid(),
            IncidentTypeId = request.IncidentTypeId,
            ResidentId = normalizedScope == "resident" ? request.ResidentId : null,
            ResidentCaseId = normalizedScope == "resident" ? request.ResidentCaseId : null,
            EpisodeId = normalizedScope == "resident" ? request.EpisodeId : null,
            CentreId = unit.CentreId,
            UnitId = normalizedScope == "centre" ? null : unit.Id,
            OccurredAtUtc = request.OccurredAtUtc,
            Summary = request.Summary.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            DetailsJson = string.IsNullOrWhiteSpace(request.DetailsJson) ? "{}" : request.DetailsJson.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            CreatedByUserId = createdByUserId
        };

        _dbContext.Incidents.Add(incident);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await _dbContext.Incidents
            .AsNoTracking()
            .Where(x => x.Id == incident.Id)
            .Select(x => new IncidentDto
            {
                Id = x.Id,
                IncidentTypeId = x.IncidentTypeId,
                IncidentTypeCode = x.IncidentType!.Code,
                IncidentTypeName = x.IncidentType.DefaultName,
                Scope = x.ResidentId != null ? "resident" : x.UnitId != null ? "unit" : x.CentreId != null ? "centre" : "unknown",
                ResidentId = x.ResidentId,
                ResidentName = x.Resident == null
                    ? null
                    : ((x.Resident.FirstName ?? string.Empty) + " " + (x.Resident.Surname ?? string.Empty)).Trim(),
                ResidentCaseId = x.ResidentCaseId,
                EpisodeId = x.EpisodeId,
                CentreId = x.CentreId,
                UnitId = x.UnitId,
                OccurredAtUtc = x.OccurredAtUtc,
                Summary = x.Summary,
                DetailsJson = x.DetailsJson,
                Notes = x.Notes,
                CreatedAtUtc = x.CreatedAtUtc
            })
            .FirstAsync(cancellationToken);
    }

    private static string NormalizeScope(string? scope)
    {
        return string.IsNullOrWhiteSpace(scope) ? "unit" : scope.Trim().ToLowerInvariant();
    }

    private static void ValidateRequest(CreateIncidentRequest request, string scope)
    {
        if (request.IncidentTypeId <= 0)
        {
            throw new InvalidOperationException("IncidentTypeId is required.");
        }

        if (request.OccurredAtUtc == default)
        {
            throw new InvalidOperationException("OccurredAtUtc is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Summary))
        {
            throw new InvalidOperationException("Summary is required.");
        }

        if (scope is not ("resident" or "unit" or "centre"))
        {
            throw new InvalidOperationException("Scope must be resident, unit, or centre.");
        }

        if (scope == "resident" && !request.ResidentId.HasValue)
        {
            throw new InvalidOperationException("ResidentId is required for resident-scope incidents.");
        }
    }

    private async Task<Guid> ResolveCreatedByUserIdAsync(Guid actorUserId, CancellationToken cancellationToken)
    {
        if (actorUserId != Guid.Empty)
        {
            var actorExists = await _dbContext.AppUsers
                .AsNoTracking()
                .AnyAsync(x => x.Id == actorUserId, cancellationToken);

            if (actorExists)
            {
                return actorUserId;
            }
        }

        var existingUserId = await _dbContext.AppUsers
            .AsNoTracking()
            .OrderByDescending(x => x.IsActive)
            .ThenBy(x => x.CreatedAtUtc)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingUserId.HasValue)
        {
            return existingUserId.Value;
        }

        var systemUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        var now = DateTime.UtcNow;

        _dbContext.AppUsers.Add(new Acutis.Domain.Entities.AppUser
        {
            Id = systemUserId,
            ExternalSubject = "system",
            UserName = "system",
            DisplayName = "System",
            Email = "system@local.invalid",
            IsActive = true,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return systemUserId;
    }
}
