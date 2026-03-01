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

        var control = await _dbContext.ScreeningControls
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UnitCode == normalized, cancellationToken);

        if (control is null)
        {
            return null;
        }

        return new ScreeningControlDto
        {
            UnitCode = control.UnitCode,
            UnitName = control.UnitName,
            UnitCapacity = control.UnitCapacity,
            CurrentOccupancy = control.CurrentOccupancy,
            CapacityWarningThreshold = control.CapacityWarningThreshold,
            CallLogsCacheSeconds = control.CallLogsCacheSeconds,
            EvaluationQueueCacheSeconds = control.EvaluationQueueCacheSeconds,
            LocalizationCacheSeconds = control.LocalizationCacheSeconds,
            EnableClientCacheOverride = control.EnableClientCacheOverride,
            UpdatedAt = control.UpdatedAt
        };
    }
}
