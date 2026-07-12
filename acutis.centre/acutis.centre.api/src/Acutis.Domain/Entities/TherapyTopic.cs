namespace Acutis.Domain.Entities;

public sealed class TherapyTopic
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DefaultName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
