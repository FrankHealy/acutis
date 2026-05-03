namespace Acutis.Domain.Entities;

public sealed class ResidentOtRoleAssignment
{
    public Guid Id { get; set; }
    public Guid OtRoleDefinitionId { get; set; }
    public Guid ResidentId { get; set; }
    public Guid EpisodeId { get; set; }
    public DateTime AssignedAtUtc { get; set; }
    public Guid AssignedByUserId { get; set; }
    public string? Notes { get; set; }
    public DateTime? ReleasedAtUtc { get; set; }
    public Guid? ReleasedByUserId { get; set; }
}
