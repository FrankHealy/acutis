namespace Acutis.Domain.Entities;

public sealed class TextTranslation
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public TextResource Resource { get; set; } = null!;
    public string Locale { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}
