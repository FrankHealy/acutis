using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Lookups;

public interface ILookupService
{
    Task<LookupSetResponseDto> GetLookupsForUnitAsync(
        Guid unitId,
        IEnumerable<string> keys,
        string locale,
        CancellationToken cancellationToken = default);

    Task<LookupVersionsResponseDto> GetLookupVersionsForUnitAsync(
        Guid unitId,
        CancellationToken cancellationToken = default);
}

public sealed class LookupService : ILookupService
{
    private const string DefaultLocale = "en-IE";

    private readonly AcutisDbContext _dbContext;

    public LookupService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<LookupSetResponseDto> GetLookupsForUnitAsync(
        Guid unitId,
        IEnumerable<string> keys,
        string locale,
        CancellationToken cancellationToken = default)
    {
        var normalizedLocale = NormalizeLocale(locale);
        var requestedKeys = NormalizeKeys(keys);
        var response = new LookupSetResponseDto
        {
            UnitId = unitId,
            Locale = normalizedLocale
        };

        if (requestedKeys.Count == 0)
        {
            return response;
        }

        var types = await _dbContext.LookupTypes
            .AsNoTracking()
            .Where(type => type.IsActive && requestedKeys.Contains(type.Key))
            .Select(type => new LookupTypeProjection
            {
                LookupTypeId = type.LookupTypeId,
                Key = type.Key,
                DefaultLocale = type.DefaultLocale
            })
            .ToListAsync(cancellationToken);

        if (types.Count == 0)
        {
            return response;
        }

        var typeIds = types.Select(type => type.LookupTypeId).ToHashSet();

        var values = await _dbContext.LookupValues
            .AsNoTracking()
            .Where(value =>
                typeIds.Contains(value.LookupTypeId) &&
                (value.UnitId == unitId || value.UnitId == null))
            .Select(value => new LookupValueProjection
            {
                LookupValueId = value.LookupValueId,
                LookupTypeId = value.LookupTypeId,
                UnitId = value.UnitId,
                Code = value.Code,
                SortOrder = value.SortOrder,
                IsActive = value.IsActive
            })
            .ToListAsync(cancellationToken);

        if (values.Count == 0)
        {
            return response;
        }

        var valueIds = values.Select(value => value.LookupValueId).ToHashSet();
        var labels = await _dbContext.LookupValueLabels
            .AsNoTracking()
            .Where(label => valueIds.Contains(label.LookupValueId))
            .Select(label => new LookupLabelProjection
            {
                LookupValueId = label.LookupValueId,
                Locale = label.Locale,
                Label = label.Label
            })
            .ToListAsync(cancellationToken);

        var labelsByValueId = labels
            .GroupBy(label => label.LookupValueId)
            .ToDictionary(group => group.Key, group => group.ToList());

        var typesByKey = types.ToDictionary(type => type.Key, StringComparer.OrdinalIgnoreCase);
        var valuesByTypeId = values
            .GroupBy(value => value.LookupTypeId)
            .ToDictionary(group => group.Key, group => group.ToList());

        foreach (var key in requestedKeys)
        {
            if (!typesByKey.TryGetValue(key, out var type))
            {
                continue;
            }

            if (!valuesByTypeId.TryGetValue(type.LookupTypeId, out var candidates))
            {
                response.Lookups[key] = new List<LookupItemDto>();
                continue;
            }

            var hasUnitSpecific = candidates.Any(value => value.UnitId == unitId);
            var effectiveValues = hasUnitSpecific
                ? candidates.Where(value => value.UnitId == unitId)
                : candidates.Where(value => value.UnitId == null);

            var items = effectiveValues
                .OrderBy(value => value.SortOrder)
                .ThenBy(value => value.Code, StringComparer.OrdinalIgnoreCase)
                .Select(value => new LookupItemDto
                {
                    Id = value.LookupValueId,
                    Code = value.Code,
                    Label = ResolveLabel(
                        labelsByValueId.TryGetValue(value.LookupValueId, out var valueLabels)
                            ? valueLabels
                            : null,
                        normalizedLocale,
                        type.DefaultLocale,
                        value.Code),
                    SortOrder = value.SortOrder,
                    IsActive = value.IsActive
                })
                .ToList();

            response.Lookups[key] = items;
        }

        return response;
    }

    public async Task<LookupVersionsResponseDto> GetLookupVersionsForUnitAsync(
        Guid unitId,
        CancellationToken cancellationToken = default)
    {
        var versions = await _dbContext.LookupTypes
            .AsNoTracking()
            .Where(type => type.IsActive)
            .OrderBy(type => type.Key)
            .ToDictionaryAsync(
                type => type.Key,
                type => type.Version,
                StringComparer.OrdinalIgnoreCase,
                cancellationToken);

        return new LookupVersionsResponseDto
        {
            UnitId = unitId,
            Versions = versions
        };
    }

    private static string ResolveLabel(
        IReadOnlyCollection<LookupLabelProjection>? labels,
        string locale,
        string defaultLocale,
        string code)
    {
        if (labels is null || labels.Count == 0)
        {
            return code;
        }

        var requested = labels.FirstOrDefault(label =>
            string.Equals(label.Locale, locale, StringComparison.OrdinalIgnoreCase));
        if (requested is not null)
        {
            return requested.Label;
        }

        var fallback = labels.FirstOrDefault(label =>
            string.Equals(label.Locale, defaultLocale, StringComparison.OrdinalIgnoreCase));
        if (fallback is not null)
        {
            return fallback.Label;
        }

        return code;
    }

    private static List<string> NormalizeKeys(IEnumerable<string> keys)
    {
        return keys
            .Select(key => key.Trim())
            .Where(key => !string.IsNullOrWhiteSpace(key))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string NormalizeLocale(string locale)
    {
        return string.IsNullOrWhiteSpace(locale) ? DefaultLocale : locale.Trim();
    }

    private sealed class LookupTypeProjection
    {
        public Guid LookupTypeId { get; set; }
        public string Key { get; set; } = string.Empty;
        public string DefaultLocale { get; set; } = "en-IE";
    }

    private sealed class LookupValueProjection
    {
        public Guid LookupValueId { get; set; }
        public Guid LookupTypeId { get; set; }
        public Guid? UnitId { get; set; }
        public string Code { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }

    private sealed class LookupLabelProjection
    {
        public Guid LookupValueId { get; set; }
        public string Locale { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
    }
}
