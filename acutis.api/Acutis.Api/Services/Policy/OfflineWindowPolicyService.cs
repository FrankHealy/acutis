using Acutis.Api.Contracts;
using Microsoft.Extensions.Options;

namespace Acutis.Api.Services.Policy;

public sealed class OfflineWindowPolicyOptions
{
    public string TimeZone { get; set; } = "Europe/Dublin";
    public WindowOptions Morning { get; set; } = new();
    public WindowOptions Evening { get; set; } = new();
}

public sealed class WindowOptions
{
    public string StartLocalTime { get; set; } = "07:00";
    public string EndLocalTime { get; set; } = "11:00";
    public int TokenValidityMinutes { get; set; } = 240;
    public int DataValidityMinutes { get; set; } = 240;
}

public interface IOfflineWindowPolicyService
{
    OfflineWindowPolicyStatusDto GetStatus(DateTime utcNow);
}

public sealed class OfflineWindowPolicyService : IOfflineWindowPolicyService
{
    private readonly OfflineWindowPolicyOptions _options;

    public OfflineWindowPolicyService(IOptions<OfflineWindowPolicyOptions> options)
    {
        _options = options.Value;
    }

    public OfflineWindowPolicyStatusDto GetStatus(DateTime utcNow)
    {
        var timeZone = ResolveTimeZone(_options.TimeZone);
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, timeZone);
        var morning = BuildWindow(localNow.Date, _options.Morning);
        var evening = BuildWindow(localNow.Date, _options.Evening);

        var inMorning = localNow >= morning.start && localNow <= morning.end;
        var inEvening = localNow >= evening.start && localNow <= evening.end;
        var isInAny = inMorning || inEvening;

        var currentEnd = inMorning ? morning.end : inEvening ? evening.end : (DateTime?)null;
        var nextStart = !isInAny
            ? (localNow < morning.start ? morning.start : localNow < evening.start ? evening.start : BuildWindow(localNow.Date.AddDays(1), _options.Morning).start)
            : (DateTime?)null;

        var tokenMins = inMorning ? _options.Morning.TokenValidityMinutes : inEvening ? _options.Evening.TokenValidityMinutes : 0;
        var dataMins = inMorning ? _options.Morning.DataValidityMinutes : inEvening ? _options.Evening.DataValidityMinutes : 0;

        return new OfflineWindowPolicyStatusDto
        {
            TimeZone = timeZone.Id,
            ServerTimeUtc = utcNow,
            LocalTime = localNow,
            IsInMorningWindow = inMorning,
            IsInEveningWindow = inEvening,
            CurrentWindowEndsAtLocal = currentEnd,
            NextWindowStartsAtLocal = nextStart,
            TokenValidityMinutes = tokenMins,
            DataValidityMinutes = dataMins
        };
    }

    private static (DateTime start, DateTime end) BuildWindow(DateTime localDate, WindowOptions options)
    {
        var startTime = ParseTime(options.StartLocalTime);
        var endTime = ParseTime(options.EndLocalTime);
        return (localDate.Add(startTime), localDate.Add(endTime));
    }

    private static TimeSpan ParseTime(string value)
    {
        return TimeSpan.TryParse(value, out var parsed) ? parsed : TimeSpan.Zero;
    }

    private static TimeZoneInfo ResolveTimeZone(string configured)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(configured);
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
        }
    }
}
