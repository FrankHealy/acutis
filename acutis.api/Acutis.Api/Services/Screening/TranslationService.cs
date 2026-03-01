using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface ITranslationService
{
    Task<Dictionary<string, string>> ResolveAsync(string locale, IEnumerable<string> keys, CancellationToken cancellationToken = default);
}

public sealed class TranslationService : ITranslationService
{
    private readonly AcutisDbContext _dbContext;

    public TranslationService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Dictionary<string, string>> ResolveAsync(
        string locale,
        IEnumerable<string> keys,
        CancellationToken cancellationToken = default)
    {
        var requestedKeys = keys
            .Where(key => !string.IsNullOrWhiteSpace(key))
            .Select(key => key.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (requestedKeys.Count == 0)
        {
            return new Dictionary<string, string>();
        }

        var exactLocale = string.IsNullOrWhiteSpace(locale) ? "en-IE" : locale.Trim();
        var baseLocale = exactLocale.Contains('-')
            ? exactLocale.Split('-', 2, StringSplitOptions.TrimEntries)[0]
            : exactLocale;

        var resources = await _dbContext.TextResources
            .AsNoTracking()
            .Where(resource => requestedKeys.Contains(resource.Key))
            .ToListAsync(cancellationToken);

        var translations = await _dbContext.TextTranslations
            .AsNoTracking()
            .Where(translation =>
                requestedKeys.Contains(translation.Key) &&
                (translation.Locale == exactLocale || translation.Locale == baseLocale))
            .ToListAsync(cancellationToken);

        var translationLookup = translations
            .GroupBy(translation => translation.Key)
            .ToDictionary(group => group.Key, group => group.ToList());

        var resourceLookup = resources.ToDictionary(resource => resource.Key, resource => resource.DefaultText);
        var resolved = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var key in requestedKeys)
        {
            if (translationLookup.TryGetValue(key, out var keyTranslations))
            {
                var exact = keyTranslations.FirstOrDefault(translation => translation.Locale.Equals(exactLocale, StringComparison.OrdinalIgnoreCase));
                if (exact is not null)
                {
                    resolved[key] = exact.Text;
                    continue;
                }

                var baseTranslation = keyTranslations.FirstOrDefault(translation => translation.Locale.Equals(baseLocale, StringComparison.OrdinalIgnoreCase));
                if (baseTranslation is not null)
                {
                    resolved[key] = baseTranslation.Text;
                    continue;
                }
            }

            if (resourceLookup.TryGetValue(key, out var defaultText) && !string.IsNullOrWhiteSpace(defaultText))
            {
                resolved[key] = defaultText;
                continue;
            }

            resolved[key] = key;
        }

        return resolved;
    }
}
