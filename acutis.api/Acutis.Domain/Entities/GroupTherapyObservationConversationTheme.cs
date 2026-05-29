namespace Acutis.Domain.Entities;

public sealed class GroupTherapyObservationConversationTheme
{
    public Guid ObservationId { get; set; }
    public Guid ConversationThemeId { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public GroupTherapyResidentObservation Observation { get; set; } = null!;
    public GroupTherapyConversationTheme ConversationTheme { get; set; } = null!;
}
