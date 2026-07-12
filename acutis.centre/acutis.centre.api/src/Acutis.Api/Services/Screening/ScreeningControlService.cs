using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface IScreeningControlService
{
    Task<ScreeningControlDto?> GetByUnitCodeAsync(string unitCode, CancellationToken cancellationToken = default);
}

public sealed class ScreeningControlService : IScreeningControlService
{
    private readonly AcutisDbContext _dbContext;

    public ScreeningControlService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ScreeningControlDto?> GetByUnitCodeAsync(string unitCode, CancellationToken cancellationToken = default)
    {
        var normalized = string.IsNullOrWhiteSpace(unitCode) ? "alcohol" : unitCode.Trim().ToLowerInvariant();

        var unit = await _dbContext.Units
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Code == normalized && item.IsActive, cancellationToken);

        if (unit is null)
        {
            return null;
        }

        var control = await _dbContext.ScreeningControls
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UnitCode == normalized, cancellationToken);

        if (control is null)
        {
            return new ScreeningControlDto
            {
                UnitCode = unit.Code,
                UnitName = unit.Name,
                UnitCapacity = unit.Capacity,
                CurrentOccupancy = unit.CurrentOccupancy,
                CapacityWarningThreshold = unit.CapacityWarningThreshold,
                CallLogsCacheSeconds = 15,
                EvaluationQueueCacheSeconds = 30,
                LocalizationCacheSeconds = 300,
                EnableClientCacheOverride = true,
                UpdatedAt = unit.UpdatedAtUtc
            };
        }

        return new ScreeningControlDto
        {
            UnitCode = unit.Code,
            UnitName = unit.Name,
            UnitCapacity = unit.Capacity,
            CurrentOccupancy = unit.CurrentOccupancy,
            CapacityWarningThreshold = unit.CapacityWarningThreshold,
            CallLogsCacheSeconds = control.CallLogsCacheSeconds,
            EvaluationQueueCacheSeconds = control.EvaluationQueueCacheSeconds,
            LocalizationCacheSeconds = control.LocalizationCacheSeconds,
            EnableClientCacheOverride = control.EnableClientCacheOverride,
            UpdatedAt = unit.UpdatedAtUtc > control.UpdatedAt ? unit.UpdatedAtUtc : control.UpdatedAt
        };
    }
}
