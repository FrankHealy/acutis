using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Acutis.Api.Services.Quotes;

public interface IQuoteService
{
    Task<QuoteOfTheDayResponse> GetQuoteOfTheDayAsync(Guid unitId, DateOnly? localDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<QuoteDto>> GetQuotesAsync(string? attribution, string? language, string? tag, bool? active, CancellationToken cancellationToken = default);
    Task<QuoteDto> CreateQuoteAsync(CreateQuoteRequest request, CancellationToken cancellationToken = default);
    Task<QuoteDto?> UpdateQuoteAsync(Guid id, UpdateQuoteRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteQuoteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UnitQuoteCurationDto>> GetUnitCurationAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<UnitQuoteCurationDto> UpsertUnitCurationAsync(Guid unitId, UpsertUnitQuoteCurationRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteUnitCurationAsync(Guid unitId, Guid curationId, CancellationToken cancellationToken = default);
}

public sealed class QuoteService : IQuoteService
{
    private static readonly TimeZoneInfo DublinTimeZone = ResolveDublinTimeZone();
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;

    public QuoteService(AcutisDbContext dbContext, IAuditService auditService)
    {
        _dbContext = dbContext;
        _auditService = auditService;
    }

    public async Task<QuoteOfTheDayResponse> GetQuoteOfTheDayAsync(
        Guid unitId,
        DateOnly? localDate,
        CancellationToken cancellationToken = default)
    {
        var date = localDate ?? DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, DublinTimeZone));

        var curated = await _dbContext.UnitQuoteCurations
            .AsNoTracking()
            .Where(x => x.UnitId == unitId)
            .ToListAsync(cancellationToken);
        var activeQuotes = await _dbContext.Quotes
            .AsNoTracking()
            .Where(x => x.IsActive)
            .ToListAsync(cancellationToken);

        var quoteLookup = activeQuotes.ToDictionary(x => x.Id);

        var pinned = curated
            .Where(x => !x.IsExcluded && x.PinnedFrom.HasValue && x.PinnedTo.HasValue && x.PinnedFrom.Value <= date && x.PinnedTo.Value >= date)
            .OrderBy(x => x.DisplayOrder ?? int.MaxValue)
            .ThenBy(x => x.Id)
            .Select(x => quoteLookup.GetValueOrDefault(x.QuoteId))
            .FirstOrDefault(x => x is not null);
        if (pinned is not null)
        {
            return new QuoteOfTheDayResponse { Date = date, Quote = MapQuoteOfDay(pinned) };
        }

        var curatedCandidates = curated
            .Where(x => !x.IsExcluded && quoteLookup.ContainsKey(x.QuoteId))
            .Select(x => new WeightedQuote(quoteLookup[x.QuoteId], Math.Max(1, x.Weight ?? 1), x.DisplayOrder))
            .ToList();

        Quote selected;
        if (curatedCandidates.Count > 0)
        {
            selected = DeterministicPick(unitId, date, curatedCandidates);
        }
        else
        {
            var globalCandidates = activeQuotes
                .Select(x => new WeightedQuote(x, 1, null))
                .ToList();
            if (globalCandidates.Count == 0)
            {
                throw new InvalidOperationException("No active quotes are available.");
            }

            selected = DeterministicPick(unitId, date, globalCandidates);
        }

        return new QuoteOfTheDayResponse { Date = date, Quote = MapQuoteOfDay(selected) };
    }

    public async Task<IReadOnlyList<QuoteDto>> GetQuotesAsync(
        string? attribution,
        string? language,
        string? tag,
        bool? active,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Quotes.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(attribution))
        {
            var term = attribution.Trim().ToLowerInvariant();
            query = query.Where(x => x.Attribution.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            var lang = language.Trim().ToLowerInvariant();
            query = query.Where(x => x.Language.ToLower() == lang);
        }

        if (active.HasValue)
        {
            query = query.Where(x => x.IsActive == active.Value);
        }

        var quotes = await query.OrderBy(x => x.Attribution).ThenBy(x => x.Text).ToListAsync(cancellationToken);
        if (!string.IsNullOrWhiteSpace(tag))
        {
            var normalizedTag = tag.Trim().ToLowerInvariant();
            quotes = quotes.Where(x => ParseTags(x.TagsJson).Any(t => t.Equals(normalizedTag, StringComparison.OrdinalIgnoreCase))).ToList();
        }

        return quotes.Select(MapQuote).ToList();
    }

    public async Task<QuoteDto> CreateQuoteAsync(CreateQuoteRequest request, CancellationToken cancellationToken = default)
    {
        ValidateQuoteRequest(request);
        var now = DateTime.UtcNow;
        var quote = new Quote
        {
            Id = Guid.NewGuid(),
            Text = request.Text.Trim(),
            Attribution = request.Attribution.Trim(),
            SourceWork = request.SourceWork?.Trim(),
            SourceNotes = request.SourceNotes?.Trim(),
            Language = request.Language.Trim().ToLowerInvariant(),
            PronunciationGuide = request.PronunciationGuide?.Trim(),
            TagsJson = JsonSerializer.Serialize(request.Tags.Select(t => t.Trim()).Where(t => t.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase).ToList()),
            IsActive = request.IsActive,
            CreatedAt = now,
            CreatedBy = "api",
            ModifiedAt = now,
            ModifiedBy = "api"
        };

        _dbContext.Quotes.Add(quote);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, null, nameof(Quote), quote.Id.ToString(), "Create", null, quote, null, cancellationToken);
        return MapQuote(quote);
    }

    public async Task<QuoteDto?> UpdateQuoteAsync(Guid id, UpdateQuoteRequest request, CancellationToken cancellationToken = default)
    {
        ValidateQuoteRequest(request);
        var quote = await _dbContext.Quotes.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (quote is null)
        {
            return null;
        }

        var before = CloneQuote(quote);
        quote.Text = request.Text.Trim();
        quote.Attribution = request.Attribution.Trim();
        quote.SourceWork = request.SourceWork?.Trim();
        quote.SourceNotes = request.SourceNotes?.Trim();
        quote.Language = request.Language.Trim().ToLowerInvariant();
        quote.PronunciationGuide = request.PronunciationGuide?.Trim();
        quote.TagsJson = JsonSerializer.Serialize(request.Tags.Select(t => t.Trim()).Where(t => t.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase).ToList());
        quote.IsActive = request.IsActive;
        quote.ModifiedAt = DateTime.UtcNow;
        quote.ModifiedBy = "api";

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, null, nameof(Quote), quote.Id.ToString(), "Update", before, quote, null, cancellationToken);
        return MapQuote(quote);
    }

    public async Task<bool> DeleteQuoteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var quote = await _dbContext.Quotes.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (quote is null)
        {
            return false;
        }

        var before = CloneQuote(quote);
        _dbContext.Quotes.Remove(quote);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, null, nameof(Quote), id.ToString(), "Delete", before, null, null, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<UnitQuoteCurationDto>> GetUnitCurationAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var rows = await _dbContext.UnitQuoteCurations
            .AsNoTracking()
            .Where(x => x.UnitId == unitId)
            .OrderBy(x => x.DisplayOrder ?? int.MaxValue)
            .ThenBy(x => x.Id)
            .ToListAsync(cancellationToken);
        return rows.Select(MapCuration).ToList();
    }

    public async Task<UnitQuoteCurationDto> UpsertUnitCurationAsync(
        Guid unitId,
        UpsertUnitQuoteCurationRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.UnitQuoteCurations
            .SingleOrDefaultAsync(x => x.UnitId == unitId && x.QuoteId == request.QuoteId, cancellationToken);
        var before = existing is null ? null : CloneCuration(existing);
        if (existing is null)
        {
            existing = new UnitQuoteCuration
            {
                Id = Guid.NewGuid(),
                UnitId = unitId,
                QuoteId = request.QuoteId
            };
            _dbContext.UnitQuoteCurations.Add(existing);
        }

        existing.Weight = request.Weight;
        existing.DisplayOrder = request.DisplayOrder;
        existing.PinnedFrom = request.PinnedFrom;
        existing.PinnedTo = request.PinnedTo;
        existing.IsExcluded = request.IsExcluded;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, unitId, nameof(UnitQuoteCuration), existing.Id.ToString(), before is null ? "Create" : "Update", before, existing, null, cancellationToken);
        return MapCuration(existing);
    }

    public async Task<bool> DeleteUnitCurationAsync(Guid unitId, Guid curationId, CancellationToken cancellationToken = default)
    {
        var row = await _dbContext.UnitQuoteCurations.SingleOrDefaultAsync(x => x.Id == curationId && x.UnitId == unitId, cancellationToken);
        if (row is null)
        {
            return false;
        }

        var before = CloneCuration(row);
        _dbContext.UnitQuoteCurations.Remove(row);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(null, unitId, nameof(UnitQuoteCuration), row.Id.ToString(), "Delete", before, null, null, cancellationToken);
        return true;
    }

    private static Quote DeterministicPick(Guid unitId, DateOnly date, List<WeightedQuote> candidates)
    {
        var ordered = candidates
            .OrderBy(x => x.DisplayOrder ?? int.MaxValue)
            .ThenBy(x => x.Quote.Id)
            .ToList();
        var totalWeight = ordered.Sum(x => Math.Max(1, x.Weight));
        var input = $"{unitId:D}|{date:yyyy-MM-dd}";
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        var bucket = BitConverter.ToUInt32(hashBytes, 0) % (uint)totalWeight;

        var running = 0;
        foreach (var candidate in ordered)
        {
            running += Math.Max(1, candidate.Weight);
            if (bucket < running)
            {
                return candidate.Quote;
            }
        }

        return ordered[0].Quote;
    }

    private static QuoteOfTheDayQuote MapQuoteOfDay(Quote quote)
    {
        return new QuoteOfTheDayQuote
        {
            Id = quote.Id,
            Text = quote.Text,
            Attribution = quote.Attribution,
            Language = quote.Language,
            PronunciationGuide = quote.Language == "en" ? null : quote.PronunciationGuide
        };
    }

    private static QuoteDto MapQuote(Quote quote)
    {
        return new QuoteDto
        {
            Id = quote.Id,
            Text = quote.Text,
            Attribution = quote.Attribution,
            SourceWork = quote.SourceWork,
            SourceNotes = quote.SourceNotes,
            Language = quote.Language,
            PronunciationGuide = quote.PronunciationGuide,
            Tags = ParseTags(quote.TagsJson),
            IsActive = quote.IsActive
        };
    }

    private static UnitQuoteCurationDto MapCuration(UnitQuoteCuration curation)
    {
        return new UnitQuoteCurationDto
        {
            Id = curation.Id,
            UnitId = curation.UnitId,
            QuoteId = curation.QuoteId,
            Weight = curation.Weight,
            DisplayOrder = curation.DisplayOrder,
            PinnedFrom = curation.PinnedFrom,
            PinnedTo = curation.PinnedTo,
            IsExcluded = curation.IsExcluded
        };
    }

    private static Quote CloneQuote(Quote quote)
    {
        return new Quote
        {
            Id = quote.Id,
            Text = quote.Text,
            Attribution = quote.Attribution,
            SourceWork = quote.SourceWork,
            SourceNotes = quote.SourceNotes,
            Language = quote.Language,
            PronunciationGuide = quote.PronunciationGuide,
            TagsJson = quote.TagsJson,
            IsActive = quote.IsActive,
            CreatedAt = quote.CreatedAt,
            CreatedBy = quote.CreatedBy,
            ModifiedAt = quote.ModifiedAt,
            ModifiedBy = quote.ModifiedBy
        };
    }

    private static UnitQuoteCuration CloneCuration(UnitQuoteCuration curation)
    {
        return new UnitQuoteCuration
        {
            Id = curation.Id,
            UnitId = curation.UnitId,
            QuoteId = curation.QuoteId,
            Weight = curation.Weight,
            DisplayOrder = curation.DisplayOrder,
            PinnedFrom = curation.PinnedFrom,
            PinnedTo = curation.PinnedTo,
            IsExcluded = curation.IsExcluded
        };
    }

    private static List<string> ParseTags(string tagsJson)
    {
        if (string.IsNullOrWhiteSpace(tagsJson))
        {
            return new List<string>();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<List<string>>(tagsJson);
            return parsed ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }

    private static void ValidateQuoteRequest(CreateQuoteRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            throw new InvalidOperationException("text is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Attribution))
        {
            throw new InvalidOperationException("attribution is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Language))
        {
            throw new InvalidOperationException("language is required.");
        }

        var language = request.Language.Trim().ToLowerInvariant();
        if (language != "en" && string.IsNullOrWhiteSpace(request.PronunciationGuide))
        {
            throw new InvalidOperationException("pronunciation_guide is required when language is not 'en'.");
        }
    }

    private sealed record WeightedQuote(Quote Quote, int Weight, int? DisplayOrder);

    private static TimeZoneInfo ResolveDublinTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Europe/Dublin");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
        }
    }
}
