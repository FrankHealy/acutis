namespace Acutis.Domain.Entities;

public class CallLog : AuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string CallerType { get; set; } = string.Empty;
    public string ConcernType { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTimeOffset TimestampUtc { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Urgency { get; set; } = string.Empty;
}
