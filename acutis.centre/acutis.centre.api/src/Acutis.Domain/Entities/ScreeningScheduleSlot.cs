namespace Acutis.Domain.Entities;

public sealed class ScreeningScheduleSlot
{
    public Guid Id { get; set; }
    public Guid CentreId { get; set; }
    public Guid UnitId { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public Centre Centre { get; set; } = null!;
    public Unit Unit { get; set; } = null!;
}
