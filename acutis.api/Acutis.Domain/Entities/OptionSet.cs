namespace Acutis.Domain.Entities;

public sealed class OptionSet
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public ICollection<OptionItem> Items { get; set; } = new List<OptionItem>();
}
