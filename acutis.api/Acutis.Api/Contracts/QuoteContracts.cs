namespace Acutis.Api.Contracts;

public sealed class QuoteDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Attribution { get; set; } = string.Empty;
    public string? SourceWork { get; set; }
    public string? SourceNotes { get; set; }
    public string Language { get; set; } = "en";
    public string? PronunciationGuide { get; set; }
    public List<string> Tags { get; set; } = new();
    public bool IsActive { get; set; }
}

public sealed class QuoteOfTheDayResponse
{
    public DateOnly Date { get; set; }
    public QuoteOfTheDayQuote Quote { get; set; } = new();
}

public sealed class QuoteOfTheDayQuote
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Attribution { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public string? PronunciationGuide { get; set; }
}

public class CreateQuoteRequest
{
    public string Text { get; set; } = string.Empty;
    public string Attribution { get; set; } = string.Empty;
    public string? SourceWork { get; set; }
    public string? SourceNotes { get; set; }
    public string Language { get; set; } = "en";
    public string? PronunciationGuide { get; set; }
    public List<string> Tags { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateQuoteRequest : CreateQuoteRequest
{
}

public sealed class UnitQuoteCurationDto
{
    public Guid Id { get; set; }
    public Guid UnitId { get; set; }
    public Guid QuoteId { get; set; }
    public int? Weight { get; set; }
    public int? DisplayOrder { get; set; }
    public DateOnly? PinnedFrom { get; set; }
    public DateOnly? PinnedTo { get; set; }
    public bool IsExcluded { get; set; }
}

public sealed class UpsertUnitQuoteCurationRequest
{
    public Guid QuoteId { get; set; }
    public int? Weight { get; set; }
    public int? DisplayOrder { get; set; }
    public DateOnly? PinnedFrom { get; set; }
    public DateOnly? PinnedTo { get; set; }
    public bool IsExcluded { get; set; }
}
