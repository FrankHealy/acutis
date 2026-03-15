namespace Acutis.Domain.Entities;

public sealed class ResidentPreviousTreatment
{
    public Guid Id { get; set; }
    public Guid ResidentId { get; set; }
    public string CentreName { get; set; } = string.Empty;
    public string? TreatmentType { get; set; }
    public int? StartYear { get; set; }
    public int? DurationValue { get; set; }
    public string? DurationUnit { get; set; }
    public bool? CompletedTreatment { get; set; }
    public int? SobrietyAfterwardsValue { get; set; }
    public string? SobrietyAfterwardsUnit { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public Resident Resident { get; set; } = null!;
}
