namespace Acutis.Application.DTOs;

public record ResidentDto(
    Guid Id,
    string Psn,
    string FirstName,
    string Surname,
    string Nationality,
    int? WeekNumber,
    string RoomNumber,
    string? PhotoUrl,
    string PrimaryAddiction,
    bool HasSpoken,
    bool IsPreviousResident
);
