namespace Acutis.Domain.Entities;

public sealed class TextResource
{
    public string Key { get; set; } = string.Empty;
    public string DefaultText { get; set; } = string.Empty;
    public ICollection<TextTranslation> Translations { get; set; } = new List<TextTranslation>();
}
