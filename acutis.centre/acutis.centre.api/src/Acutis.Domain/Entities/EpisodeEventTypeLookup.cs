namespace Acutis.Domain.Entities;

public sealed class EpisodeEventTypeLookup
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DefaultName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<EpisodeEvent> EpisodeEvents { get; set; } = new List<EpisodeEvent>();
}
