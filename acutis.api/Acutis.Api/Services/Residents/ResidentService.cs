using System.Text.Json;
using Acutis.Api.Contracts;

namespace Acutis.Api.Services.Residents;

public interface IResidentService
{
    Task<IReadOnlyList<ResidentListItemDto>> GetAllResidentsAsync(
        string unitId,
        CancellationToken cancellationToken = default);
}

public sealed class ResidentService : IResidentService
{
    private readonly IWebHostEnvironment _environment;

    public ResidentService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public async Task<IReadOnlyList<ResidentListItemDto>> GetAllResidentsAsync(
        string unitId,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnit = NormalizeUnit(unitId);
        var seedResidents = await ReadSeedResidentsAsync(cancellationToken);
        if (seedResidents.Count == 0)
        {
            return Array.Empty<ResidentListItemDto>();
        }

        var mapped = seedResidents
            .Select((seed, index) =>
            {
                var derivedUnit = DeriveUnit(seed, index);
                return new ResidentListItemDto
                {
                    Id = index + 1,
                    Psn = seed.Psn,
                    FirstName = seed.FirstName,
                    Surname = seed.Surname,
                    Nationality = seed.Nationality,
                    Age = CalculateAge(seed.Dob),
                    WeekNumber = seed.WeekNumber,
                    RoomNumber = seed.RoomNumber.ToString(),
                    UnitId = derivedUnit,
                    PhotoUrl = string.IsNullOrWhiteSpace(seed.PhotoURL) ? null : seed.PhotoURL.Trim()
                };
            })
            .Where(resident => resident.UnitId.Equals(normalizedUnit, StringComparison.OrdinalIgnoreCase))
            .OrderBy(resident => resident.Surname)
            .ThenBy(resident => resident.FirstName)
            .ToList();

        return mapped;
    }

    private async Task<List<SeedResident>> ReadSeedResidentsAsync(CancellationToken cancellationToken)
    {
        var seedPath = Path.GetFullPath(Path.Combine(
            _environment.ContentRootPath,
            "..",
            "..",
            "acutis.web",
            "src",
            "data",
            "mockResidents.json"));

        if (!File.Exists(seedPath))
        {
            return new List<SeedResident>();
        }

        await using var stream = File.OpenRead(seedPath);
        var residents = await JsonSerializer.DeserializeAsync<List<SeedResident>>(
            stream,
            cancellationToken: cancellationToken);
        return residents ?? new List<SeedResident>();
    }

    private static string NormalizeUnit(string unitId)
    {
        if (string.IsNullOrWhiteSpace(unitId))
        {
            return "alcohol";
        }

        return unitId.Trim().ToLowerInvariant();
    }

    private static string DeriveUnit(SeedResident seed, int index)
    {
        if (seed.IsDrug)
        {
            return "drugs";
        }

        if (seed.WeekNumber <= 4)
        {
            return "detox";
        }

        if (index % 9 == 0)
        {
            return "ladies";
        }

        return "alcohol";
    }

    private static int CalculateAge(string dobIso)
    {
        if (!DateOnly.TryParse(dobIso, out var dob))
        {
            return 18;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - dob.Year;
        if (dob > today.AddYears(-age))
        {
            age--;
        }

        return Math.Clamp(age, 16, 120);
    }

    private sealed class SeedResident
    {
        public string Psn { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? PhotoURL { get; set; }
        public string Dob { get; set; } = string.Empty;
        public int WeekNumber { get; set; }
        public int RoomNumber { get; set; }
        public string Nationality { get; set; } = string.Empty;
        public bool IsDrug { get; set; }
    }
}
