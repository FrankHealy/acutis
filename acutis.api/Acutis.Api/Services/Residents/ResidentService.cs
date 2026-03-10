using Acutis.Api.Contracts;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Residents;

public interface IResidentService
{
    Task<IReadOnlyList<ResidentListItemDto>> GetAllResidentsAsync(
        string unitId,
        CancellationToken cancellationToken = default);
}

public sealed class ResidentService : IResidentService
{
    private readonly AcutisDbContext _dbContext;

    public ResidentService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<ResidentListItemDto>> GetAllResidentsAsync(
        string unitId,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnit = NormalizeUnit(unitId);
        var residents = await _dbContext.Residents
            .AsNoTracking()
            .Where(resident => resident.UnitCode == normalizedUnit)
            .OrderBy(resident => resident.Surname)
            .ThenBy(resident => resident.FirstName)
            .ToListAsync(cancellationToken);

        return residents
            .Select(resident => new ResidentListItemDto
            {
                Id = ToLegacyResidentId(resident.Id),
                Psn = resident.Psn?.Trim() ?? string.Empty,
                UnitGuid = resident.UnitId,
                FirstName = resident.FirstName?.Trim() ?? string.Empty,
                Surname = resident.Surname?.Trim() ?? string.Empty,
                Nationality = resident.Nationality?.Trim() ?? string.Empty,
                Age = resident.DateOfBirth.HasValue
                    ? CalculateAge(resident.DateOfBirth.Value.ToString("yyyy-MM-dd"))
                    : 18,
                WeekNumber = resident.WeekNumber,
                RoomNumber = resident.RoomNumber?.Trim() ?? string.Empty,
                UnitId = resident.UnitCode?.Trim().ToLowerInvariant() ?? normalizedUnit,
                PhotoUrl = resident.PhotoUrl,
                AdmissionDate = resident.AdmissionDate?.ToString("yyyy-MM-dd"),
                ExpectedCompletion = resident.ExpectedCompletionDate?.ToString("yyyy-MM-dd"),
                PrimaryAddiction = resident.PrimaryAddiction?.Trim() ?? string.Empty,
                IsDrug = resident.IsDrug,
                IsGambeler = resident.IsGambeler,
                IsPreviousResident = resident.IsPreviousResident,
                DietaryNeedsCode = resident.DietaryNeedsCode,
                IsSnorer = resident.IsSnorer,
                HasCriminalHistory = resident.HasCriminalHistory,
                IsOnProbation = resident.IsOnProbation,
                ArgumentativeScale = resident.ArgumentativeScale,
                LearningDifficultyScale = resident.LearningDifficultyScale,
                LiteracyScale = resident.LiteracyScale
            })
            .ToList();
    }

    private static int ToLegacyResidentId(Guid residentId)
    {
        var value = BitConverter.ToInt32(residentId.ToByteArray(), 0) & int.MaxValue;
        return value == 0 ? 1 : value;
    }

    private static string NormalizeUnit(string unitId)
    {
        if (string.IsNullOrWhiteSpace(unitId))
        {
            return "alcohol";
        }

        return unitId.Trim().ToLowerInvariant();
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
}
