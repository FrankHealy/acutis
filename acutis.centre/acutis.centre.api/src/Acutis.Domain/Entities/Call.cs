namespace Acutis.Domain.Entities;

public sealed class Call
{
    public Guid Id { get; set; }
    public DateTimeOffset CallTimeUtc { get; set; }
    public string? Caller { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Notes { get; set; }
    public string? Source { get; set; }
}
