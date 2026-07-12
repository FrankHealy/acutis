using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface IOptionService
{
    Task<List<OptionSetDto>> GetOptionSetsAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default);
}

public sealed class OptionService : IOptionService
{
    private readonly AcutisDbContext _dbContext;

    public OptionService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<OptionSetDto>> GetOptionSetsAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default)
    {
        var requestedKeys = keys
            .Where(key => !string.IsNullOrWhiteSpace(key))
            .Select(key => key.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (requestedKeys.Count == 0)
        {
            return new List<OptionSetDto>();
        }

        var optionSets = await _dbContext.OptionSets
            .AsNoTracking()
            .Include(set => set.Items)
            .Where(set => requestedKeys.Contains(set.Key))
            .ToListAsync(cancellationToken);

        return optionSets
            .Select(set => new OptionSetDto
            {
                Key = set.Key,
                Items = set.Items
                    .OrderBy(item => item.SortOrder)
                    .Select(item => new OptionItemDto
                    {
                        Code = item.Code,
                        LabelKey = item.LabelKey,
                        IsActive = item.IsActive,
                        SortOrder = item.SortOrder
                    })
                    .ToList()
            })
            .ToList();
    }
}
