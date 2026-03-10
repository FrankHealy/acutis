namespace Acutis.Api.Contracts;

public sealed class OfflineWindowPolicyStatusDto
{
    public string TimeZone { get; set; } = "Europe/Dublin";
    public DateTime ServerTimeUtc { get; set; }
    public DateTime LocalTime { get; set; }
    public bool IsInMorningWindow { get; set; }
    public bool IsInEveningWindow { get; set; }
    public DateTime? CurrentWindowEndsAtLocal { get; set; }
    public DateTime? NextWindowStartsAtLocal { get; set; }
    public int TokenValidityMinutes { get; set; }
    public int DataValidityMinutes { get; set; }
}
