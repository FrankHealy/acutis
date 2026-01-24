namespace Acutis.Application.Requests;

public sealed record UpdateCallLogRequest(
    string FirstName,
    string Surname,
    string CallerType,
    string ConcernType,
    string Unit,
    string Location,
    string PhoneNumber,
    DateTimeOffset TimestampUtc,
    string Notes,
    string Status,
    string Urgency);
