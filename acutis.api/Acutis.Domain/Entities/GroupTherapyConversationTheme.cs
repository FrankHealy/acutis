namespace Acutis.Domain.Entities;

public sealed class GroupTherapyConversationTheme
{
    public Guid Id { get; set; }
    public string? UnitCode { get; set; }
    public string? ProgramCode { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ICollection<GroupTherapyObservationConversationTheme> ObservationThemes { get; set; } = new List<GroupTherapyObservationConversationTheme>();
}
