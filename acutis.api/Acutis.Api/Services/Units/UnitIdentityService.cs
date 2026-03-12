using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Acutis.Api.Services.Units;

public interface IUnitIdentityService
{
    Task<IReadOnlyList<UnitIdentityDto>> GetAllAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    Task<UnitIdentityDto?> GetByCodeAsync(string unitCode, CancellationToken cancellationToken = default);
    Task<UnitIdentityDto?> GetByIdAsync(Guid unitId, CancellationToken cancellationToken = default);
}

public sealed class UnitIdentityService : IUnitIdentityService
{
    private readonly AcutisDbContext _dbContext;

    public UnitIdentityService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<UnitIdentityDto>> GetAllAsync(
        bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Units.AsNoTracking();
        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        return await query
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .Select(Map)
            .ToListAsync(cancellationToken);
    }

    public async Task<UnitIdentityDto?> GetByCodeAsync(
        string unitCode,
        CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeCode(unitCode);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return null;
        }

        return await _dbContext.Units
            .AsNoTracking()
            .Where(x => x.Code == normalized && x.IsActive)
            .Select(Map)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<UnitIdentityDto?> GetByIdAsync(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Units
            .AsNoTracking()
            .Where(x => x.Id == unitId && x.IsActive)
            .Select(Map)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static string NormalizeCode(string unitCode)
    {
        return string.IsNullOrWhiteSpace(unitCode) ? string.Empty : unitCode.Trim().ToLowerInvariant();
    }

    private static readonly Expression<Func<Acutis.Domain.Entities.Unit, UnitIdentityDto>> Map = unit => new UnitIdentityDto
    {
        UnitId = unit.Id,
        UnitCode = unit.Code,
        DisplayName = unit.Name,
        Description = unit.Description,
        CentreId = unit.CentreId,
        CentreCode = unit.Centre.Code,
        CentreDisplayName = unit.Centre.Name,
        BrandName = unit.Centre.BrandName,
        BrandSubtitle = unit.Centre.BrandSubtitle,
        BrandLogoUrl = unit.Centre.BrandLogoUrl,
        ThemeKey = unit.Centre.ThemeKey,
        UnitCapacity = unit.Capacity,
        CurrentOccupancy = unit.CurrentOccupancy,
        FreeBeds = unit.Capacity - unit.CurrentOccupancy < 0 ? 0 : unit.Capacity - unit.CurrentOccupancy,
        CapacityWarningThreshold = unit.CapacityWarningThreshold,
        DisplayOrder = unit.DisplayOrder,
        IsActive = unit.IsActive
    };
}
