using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Residents;

public interface IResidentService
{
    Task<IReadOnlyList<ResidentListItemDto>> GetAllResidentsAsync(
        string unitId,
        CancellationToken cancellationToken = default);

    Task<RecordDischargeResponse> RecordDischargeAsync(
        Guid residentGuid,
        RecordDischargeRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ResidentPreviousTreatmentDto>> GetPreviousTreatmentsAsync(
        Guid residentGuid,
        CancellationToken cancellationToken = default);

    Task<ResidentPreviousTreatmentDto> CreatePreviousTreatmentAsync(
        Guid residentGuid,
        UpsertResidentPreviousTreatmentRequest request,
        CancellationToken cancellationToken = default);

    Task<ResidentPreviousTreatmentDto?> UpdatePreviousTreatmentAsync(
        Guid residentGuid,
        Guid treatmentId,
        UpsertResidentPreviousTreatmentRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeletePreviousTreatmentAsync(
        Guid residentGuid,
        Guid treatmentId,
        CancellationToken cancellationToken = default);
}

public sealed class ResidentService : IResidentService
{
    private readonly AcutisDbContext _dbContext;
    private readonly IAuditService _auditService;

    public ResidentService(AcutisDbContext dbContext, IAuditService auditService)
    {
        _dbContext = dbContext;
        _auditService = auditService;
    }

    public async Task<IReadOnlyList<ResidentListItemDto>> GetAllResidentsAsync(
        string unitId,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnit = NormalizeUnit(unitId);
        var unit = await _dbContext.Units
            .AsNoTracking()
            .Where(x => x.Code == normalizedUnit)
            .Select(x => new { x.Id, x.Code })
            .FirstOrDefaultAsync(cancellationToken);

        var activeEpisodes = unit is null
            ? []
            : await _dbContext.ResidentProgrammeEpisodes
                .AsNoTracking()
                .Where(x => x.UnitId == unit.Id && x.EndDate == null)
                .OrderByDescending(x => x.StartDate)
                .Select(x => new
                {
                    x.Id,
                    x.ResidentId,
                    x.ResidentCaseId,
                    x.UnitId,
                    x.StartDate,
                    x.CurrentWeekNumber,
                    x.CentreEpisodeCode,
                    x.EntryYear,
                    x.EntryWeek,
                    x.EntrySequence,
                    x.RoomNumber,
                    x.ExpectedCompletionDate,
                    x.PrimaryAddiction
                })
                .ToListAsync(cancellationToken);

        var currentEpisodeByResident = activeEpisodes
            .GroupBy(x => x.ResidentId)
            .ToDictionary(x => x.Key, x => x.First());

        var residentIdsWithEpisode = currentEpisodeByResident.Keys.ToHashSet();

        var residentsFromEpisode = residentIdsWithEpisode.Count == 0
            ? []
            : await _dbContext.Residents
                .AsNoTracking()
                .Where(resident => residentIdsWithEpisode.Contains(resident.Id))
                .ToListAsync(cancellationToken);

        var residentsFromLegacyUnit = await _dbContext.Residents
            .AsNoTracking()
            .Where(resident => resident.UnitCode == normalizedUnit && !residentIdsWithEpisode.Contains(resident.Id))
            .ToListAsync(cancellationToken);

        var residents = residentsFromEpisode
            .Concat(residentsFromLegacyUnit)
            .OrderBy(resident => resident.Surname)
            .ThenBy(resident => resident.FirstName)
            .ToList();

        var caseIds = currentEpisodeByResident.Values
            .Where(x => x.ResidentCaseId.HasValue)
            .Select(x => x.ResidentCaseId!.Value)
            .Distinct()
            .ToList();

        var caseStatusById = caseIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _dbContext.ResidentCases
                .AsNoTracking()
                .Where(x => caseIds.Contains(x.Id))
                .ToDictionaryAsync(x => x.Id, x => x.CaseStatus, cancellationToken);

        return residents
            .Select(resident =>
            {
                currentEpisodeByResident.TryGetValue(resident.Id, out var episode);
                var episodeCaseStatus = episode?.ResidentCaseId is Guid residentCaseId &&
                                        caseStatusById.TryGetValue(residentCaseId, out var status)
                    ? status
                    : null;

                var currentWeekNumber = episode?.CurrentWeekNumber ?? resident.WeekNumber;
                var currentUnitGuid = episode?.UnitId ?? resident.UnitId;
                var currentUnitCode = unit?.Code ?? resident.UnitCode?.Trim().ToLowerInvariant() ?? normalizedUnit;
                var admissionDate = episode?.StartDate.ToString("yyyy-MM-dd") ?? resident.AdmissionDate?.ToString("yyyy-MM-dd");
                var roomNumber = episode?.RoomNumber?.Trim() ?? resident.RoomNumber?.Trim() ?? string.Empty;
                var expectedCompletion = episode?.ExpectedCompletionDate?.ToString("yyyy-MM-dd") ?? resident.ExpectedCompletionDate?.ToString("yyyy-MM-dd");
                var primaryAddiction = episode?.PrimaryAddiction?.Trim() ?? resident.PrimaryAddiction?.Trim() ?? string.Empty;

                return new ResidentListItemDto
                {
                Id = ToLegacyResidentId(resident.Id),
                ResidentGuid = resident.Id,
                EpisodeId = episode?.Id,
                ResidentCaseId = episode?.ResidentCaseId,
                CentreEpisodeCode = episode?.CentreEpisodeCode,
                EntryYear = episode?.EntryYear,
                EntryWeek = episode?.EntryWeek,
                EntrySequence = episode?.EntrySequence,
                CaseStatus = episodeCaseStatus,
                Psn = resident.Psn?.Trim() ?? string.Empty,
                UnitGuid = currentUnitGuid,
                FirstName = resident.FirstName?.Trim() ?? string.Empty,
                Surname = resident.Surname?.Trim() ?? string.Empty,
                Nationality = resident.Nationality?.Trim() ?? string.Empty,
                Age = resident.DateOfBirth.HasValue
                    ? CalculateAge(resident.DateOfBirth.Value.ToString("yyyy-MM-dd"))
                    : 18,
                WeekNumber = currentWeekNumber,
                RoomNumber = roomNumber,
                UnitId = currentUnitCode,
                PhotoUrl = resident.PhotoUrl,
                AdmissionDate = admissionDate,
                ExpectedCompletion = expectedCompletion,
                PrimaryAddiction = primaryAddiction,
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
                };
            })
            .ToList();
    }

    public async Task<RecordDischargeResponse> RecordDischargeAsync(
        Guid residentGuid,
        RecordDischargeRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        // Idempotency: if this clientEventId was already recorded, return it without creating a duplicate.
        var existing = await _dbContext.EpisodeEvents
            .AsNoTracking()
            .Where(e => e.ClientEventId == request.ClientEventId)
            .Select(e => new { e.Id, e.EpisodeId })
            .FirstOrDefaultAsync(cancellationToken);

        if (existing is not null)
        {
            return new RecordDischargeResponse
            {
                EpisodeEventId = existing.Id,
                EpisodeId = existing.EpisodeId,
                WasAlreadyRecorded = true
            };
        }

        var episode = await _dbContext.ResidentProgrammeEpisodes
            .Where(e => e.ResidentId == residentGuid && e.EndDate == null)
            .OrderByDescending(e => e.StartDate)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new KeyNotFoundException($"No active episode found for resident '{residentGuid}'.");

        var exitType = (EpisodeEventType)request.ExitType;

        var episodeEvent = new EpisodeEvent
        {
            Id = Guid.NewGuid(),
            ClientEventId = request.ClientEventId,
            EpisodeId = episode.Id,
            EventType = exitType,
            EventDate = request.EventDate,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = actorUserId,
            PayloadJson = "{}"
        };

        _dbContext.EpisodeEvents.Add(episodeEvent);

        // ExtendedStay keeps the episode open — resident is staying on past their programme end date.
        // All other exit types close the episode.
        if (exitType != EpisodeEventType.ExtendedStay)
        {
            episode.EndDate = request.EventDate;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new RecordDischargeResponse
        {
            EpisodeEventId = episodeEvent.Id,
            EpisodeId = episode.Id,
            WasAlreadyRecorded = false
        };
    }

    public async Task<IReadOnlyList<ResidentPreviousTreatmentDto>> GetPreviousTreatmentsAsync(
        Guid residentGuid,
        CancellationToken cancellationToken = default)
    {
        var residentExists = await _dbContext.Residents
            .AsNoTracking()
            .AnyAsync(x => x.Id == residentGuid, cancellationToken);

        if (!residentExists)
        {
            throw new KeyNotFoundException($"Resident '{residentGuid}' was not found.");
        }

        return await _dbContext.ResidentPreviousTreatments
            .AsNoTracking()
            .Where(x => x.ResidentId == residentGuid)
            .OrderByDescending(x => x.StartYear)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(MapPreviousTreatmentDtoExpression())
            .ToListAsync(cancellationToken);
    }

    public async Task<ResidentPreviousTreatmentDto> CreatePreviousTreatmentAsync(
        Guid residentGuid,
        UpsertResidentPreviousTreatmentRequest request,
        CancellationToken cancellationToken = default)
    {
        var residentExists = await _dbContext.Residents
            .AsNoTracking()
            .AnyAsync(x => x.Id == residentGuid, cancellationToken);

        if (!residentExists)
        {
            throw new KeyNotFoundException($"Resident '{residentGuid}' was not found.");
        }

        ValidatePreviousTreatmentRequest(request);

        var now = DateTime.UtcNow;
        var treatment = new ResidentPreviousTreatment
        {
            Id = Guid.NewGuid(),
            ResidentId = residentGuid,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        ApplyPreviousTreatmentRequest(treatment, request);

        _dbContext.ResidentPreviousTreatments.Add(treatment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(ResidentPreviousTreatment),
            entityId: treatment.Id.ToString("D"),
            action: "Create",
            before: null,
            after: treatment,
            reason: null,
            cancellationToken);

        return MapPreviousTreatmentDto(treatment);
    }

    public async Task<ResidentPreviousTreatmentDto?> UpdatePreviousTreatmentAsync(
        Guid residentGuid,
        Guid treatmentId,
        UpsertResidentPreviousTreatmentRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidatePreviousTreatmentRequest(request);

        var treatment = await _dbContext.ResidentPreviousTreatments
            .FirstOrDefaultAsync(
                x => x.Id == treatmentId && x.ResidentId == residentGuid,
                cancellationToken);

        if (treatment is null)
        {
            return null;
        }

        var before = MapPreviousTreatmentDto(treatment);

        ApplyPreviousTreatmentRequest(treatment, request);
        treatment.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(ResidentPreviousTreatment),
            entityId: treatment.Id.ToString("D"),
            action: "Update",
            before: before,
            after: treatment,
            reason: null,
            cancellationToken);

        return MapPreviousTreatmentDto(treatment);
    }

    public async Task<bool> DeletePreviousTreatmentAsync(
        Guid residentGuid,
        Guid treatmentId,
        CancellationToken cancellationToken = default)
    {
        var treatment = await _dbContext.ResidentPreviousTreatments
            .FirstOrDefaultAsync(
                x => x.Id == treatmentId && x.ResidentId == residentGuid,
                cancellationToken);

        if (treatment is null)
        {
            return false;
        }

        var before = MapPreviousTreatmentDto(treatment);
        _dbContext.ResidentPreviousTreatments.Remove(treatment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _auditService.WriteAsync(
            centreId: null,
            unitId: null,
            entityType: nameof(ResidentPreviousTreatment),
            entityId: treatmentId.ToString("D"),
            action: "Delete",
            before: before,
            after: null,
            reason: null,
            cancellationToken);

        return true;
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

    private static System.Linq.Expressions.Expression<Func<ResidentPreviousTreatment, ResidentPreviousTreatmentDto>> MapPreviousTreatmentDtoExpression()
    {
        return treatment => new ResidentPreviousTreatmentDto
        {
            Id = treatment.Id,
            ResidentId = treatment.ResidentId,
            CentreName = treatment.CentreName,
            TreatmentType = treatment.TreatmentType,
            StartYear = treatment.StartYear,
            DurationValue = treatment.DurationValue,
            DurationUnit = treatment.DurationUnit,
            CompletedTreatment = treatment.CompletedTreatment,
            SobrietyAfterwardsValue = treatment.SobrietyAfterwardsValue,
            SobrietyAfterwardsUnit = treatment.SobrietyAfterwardsUnit,
            Notes = treatment.Notes,
            CreatedAtUtc = treatment.CreatedAtUtc,
            UpdatedAtUtc = treatment.UpdatedAtUtc
        };
    }

    private static ResidentPreviousTreatmentDto MapPreviousTreatmentDto(ResidentPreviousTreatment treatment)
    {
        return new ResidentPreviousTreatmentDto
        {
            Id = treatment.Id,
            ResidentId = treatment.ResidentId,
            CentreName = treatment.CentreName,
            TreatmentType = treatment.TreatmentType,
            StartYear = treatment.StartYear,
            DurationValue = treatment.DurationValue,
            DurationUnit = treatment.DurationUnit,
            CompletedTreatment = treatment.CompletedTreatment,
            SobrietyAfterwardsValue = treatment.SobrietyAfterwardsValue,
            SobrietyAfterwardsUnit = treatment.SobrietyAfterwardsUnit,
            Notes = treatment.Notes,
            CreatedAtUtc = treatment.CreatedAtUtc,
            UpdatedAtUtc = treatment.UpdatedAtUtc
        };
    }

    private static void ApplyPreviousTreatmentRequest(
        ResidentPreviousTreatment treatment,
        UpsertResidentPreviousTreatmentRequest request)
    {
        treatment.CentreName = request.CentreName.Trim();
        treatment.TreatmentType = NormalizeOptionalText(request.TreatmentType);
        treatment.StartYear = request.StartYear;
        treatment.DurationValue = request.DurationValue;
        treatment.DurationUnit = NormalizeOptionalText(request.DurationUnit);
        treatment.CompletedTreatment = request.CompletedTreatment;
        treatment.SobrietyAfterwardsValue = request.SobrietyAfterwardsValue;
        treatment.SobrietyAfterwardsUnit = NormalizeOptionalText(request.SobrietyAfterwardsUnit);
        treatment.Notes = NormalizeOptionalText(request.Notes);
    }

    private static void ValidatePreviousTreatmentRequest(UpsertResidentPreviousTreatmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CentreName))
        {
            throw new InvalidOperationException("CentreName is required.");
        }

        if (request.StartYear is < 1900 or > 2100)
        {
            throw new InvalidOperationException("StartYear must be between 1900 and 2100.");
        }

        if (request.DurationValue < 0)
        {
            throw new InvalidOperationException("DurationValue cannot be negative.");
        }

        if (request.SobrietyAfterwardsValue < 0)
        {
            throw new InvalidOperationException("SobrietyAfterwardsValue cannot be negative.");
        }
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
