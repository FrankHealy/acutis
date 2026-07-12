using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface IAdmissionCompletionService
{
    Task<AdmissionCompletionDto?> CompleteAdmissionAsync(
        SaveRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class AdmissionCompletionService : IAdmissionCompletionService
{
    private const string AdmissionFormPrefix = "admission_";

    private readonly AcutisDbContext _dbContext;

    public AdmissionCompletionService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AdmissionCompletionDto?> CompleteAdmissionAsync(
        SaveRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!string.Equals(request.SubjectType, "admission", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var unitCode = ResolveUnitCode(request.FormCode);
        if (unitCode is null)
        {
            return null;
        }

        var unit = await _dbContext.Units
            .AsTracking()
            .Include(item => item.Centre)
            .SingleOrDefaultAsync(item => item.Code == unitCode, cancellationToken);
        if (unit is null)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var residentCase = await ResolveResidentCaseAsync(request.SubjectId, cancellationToken);
        if (residentCase is null)
        {
            residentCase = CreateAdHocResidentCase(unit, now);
            _dbContext.ResidentCases.Add(residentCase);
        }

        residentCase.UnitId = unit.Id;

        var resident = residentCase.ResidentId.HasValue
            ? await _dbContext.Residents.SingleOrDefaultAsync(item => item.Id == residentCase.ResidentId.Value, cancellationToken)
            : null;

        if (resident is null)
        {
            resident = CreateResidentFromAdmission(unit, request.Answers, now);
            _dbContext.Residents.Add(resident);
        }
        else
        {
            ApplyResidentAdmissionDetails(resident, unit, request.Answers, now);
        }

        residentCase.ResidentId = resident.Id;
        residentCase.CaseStatus = "admitted";
        residentCase.CaseStatusLookupValueId = ScreeningLifecycleLookups.CaseStatuses.Admitted;
        residentCase.CasePhase = "admission";
        residentCase.CasePhaseLookupValueId = ScreeningLifecycleLookups.CasePhases.Admission;
        residentCase.AdmissionDecisionStatus = "admitted";
        residentCase.AdmissionDecisionStatusLookupValueId = ScreeningLifecycleLookups.AdmissionDecisionStatuses.Admitted;
        residentCase.AdmissionDecisionAtUtc ??= now;
        residentCase.ScreeningStartedAtUtc ??= now;
        residentCase.ScreeningCompletedAtUtc ??= now;
        residentCase.OpenedAtUtc = residentCase.OpenedAtUtc == default ? now : residentCase.OpenedAtUtc;
        residentCase.LastContactAtUtc = now;

        var episode = await _dbContext.ResidentProgrammeEpisodes
            .SingleOrDefaultAsync(item => item.ResidentId == resident.Id && item.UnitId == unit.Id && item.EndDate == null, cancellationToken);

        if (episode is null)
        {
            episode = await CreateEpisodeAsync(unit, residentCase, resident, now, cancellationToken);
            _dbContext.ResidentProgrammeEpisodes.Add(episode);
        }
        else
        {
            episode.ResidentCaseId = residentCase.Id;
            episode.UnitId = unit.Id;
            episode.RoomNumber = resident.RoomNumber;
            episode.ExpectedCompletionDate = resident.ExpectedCompletionDate;
            episode.PrimaryAddiction = resident.PrimaryAddiction;
            episode.CurrentWeekNumber = resident.WeekNumber;
        }

        await CancelScheduledIntakeAsync(residentCase.Id, now, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AdmissionCompletionDto
        {
            ResidentId = resident.Id,
            EpisodeId = episode.Id,
            ResidentCaseId = residentCase.Id,
            UnitId = unit.Id,
            UnitCode = unit.Code,
            ResidentName = BuildResidentName(resident.FirstName, resident.Surname),
            RoomNumber = resident.RoomNumber,
            BedCode = episode.BedCode
        };
    }

    private async Task<ResidentProgrammeEpisode> CreateEpisodeAsync(
        Unit unit,
        ResidentCase residentCase,
        Resident resident,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var admissionDate = DateOnly.FromDateTime(now);
        var entryYear = admissionDate.Year;
        var entryWeek = resident.WeekNumber;
        var entrySequence = await GetNextEntrySequenceAsync(unit.CentreId, entryYear, entryWeek, cancellationToken);

        return new ResidentProgrammeEpisode
        {
            Id = Guid.NewGuid(),
            ResidentCaseId = residentCase.Id,
            ResidentId = resident.Id,
            CentreId = unit.CentreId,
            UnitId = unit.Id,
            StartDate = admissionDate,
            EndDate = null,
            CentreEpisodeCode = BuildCentreEpisodeCode(unit.Centre.Code, entryYear, entryWeek, entrySequence),
            EntryYear = entryYear,
            EntryWeek = entryWeek,
            EntrySequence = entrySequence,
            RoomNumber = resident.RoomNumber,
            BedCode = null,
            ExpectedCompletionDate = resident.ExpectedCompletionDate,
            PrimaryAddiction = resident.PrimaryAddiction,
            ProgrammeType = ProgrammeType.Alcohol,
            CurrentWeekNumber = resident.WeekNumber,
            ParticipationMode = ParticipationMode.FullProgramme,
            CohortId = null
        };
    }

    private static ResidentCase CreateAdHocResidentCase(Unit unit, DateTime now)
    {
        return new ResidentCase
        {
            Id = Guid.NewGuid(),
            ResidentId = null,
            CentreId = unit.CentreId,
            UnitId = unit.Id,
            CaseStatusLookupValueId = ScreeningLifecycleLookups.CaseStatuses.Admitted,
            CasePhaseLookupValueId = ScreeningLifecycleLookups.CasePhases.Admission,
            CaseStatus = "admitted",
            CasePhase = "admission",
            IntakeSource = "ad_hoc_admission",
            ReferralSource = "ad_hoc",
            ReferralReference = $"ADHOC-{now:yyyyMMddHHmmss}",
            ReferralCallId = null,
            ReferralReceivedAtUtc = now,
            ScreeningStartedAtUtc = now,
            ScreeningCompletedAtUtc = now,
            AdmissionDecisionAtUtc = now,
            AdmissionDecisionStatusLookupValueId = ScreeningLifecycleLookups.AdmissionDecisionStatuses.Admitted,
            AdmissionDecisionStatus = "admitted",
            OpenedAtUtc = now,
            LastContactAtUtc = now,
            SummaryNotes = "Created from ad hoc admission."
        };
    }

    private Resident CreateResidentFromAdmission(Unit unit, IReadOnlyDictionary<string, JsonElement> answers, DateTime now)
    {
        var defaultWeek = Math.Max(1, unit.DefaultResidentWeekNumber);
        var firstName = GetStringAnswer(answers, "first_name");
        var surname = GetStringAnswer(answers, "surname");
        if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(surname))
        {
            (firstName, surname) = SplitName(GetStringAnswer(answers, "service_user_full_name"));
        }

        var roomNumber = string.Empty;
        var residentNumber = GetNextResidentSequence(unit.Code, defaultWeek, now);
        return new Resident
        {
            Id = Guid.NewGuid(),
            Psn = BuildResidentSecondaryKey(unit.Centre.Code, unit.Code, now.Year, defaultWeek, residentNumber),
            UnitId = unit.Id,
            UnitCode = unit.Code,
            FirstName = string.IsNullOrWhiteSpace(firstName) ? "Ad Hoc" : firstName,
            Surname = string.IsNullOrWhiteSpace(surname) ? "Admission" : surname,
            Nationality = GetStringAnswer(answers, "nationality"),
            DateOfBirth = GetDateTimeAnswer(answers, "date_of_birth"),
            WeekNumber = defaultWeek,
            RoomNumber = roomNumber,
            PhotoUrl = GetPhotoAnswer(answers),
            AdmissionDate = now,
            ExpectedCompletionDate = now.AddDays(84),
            PrimaryAddiction = GetPrimaryAddiction(answers, unit.Code),
            IsDrug = unit.Code == "drugs",
            IsGambeler = GetBooleanAnswer(answers, "is_gambeler"),
            IsPreviousResident = GetBooleanAnswer(answers, "is_previous_resident"),
            DietaryNeedsCode = GetIntegerAnswer(answers, "dietary_needs_code"),
            IsSnorer = GetBooleanAnswer(answers, "is_snorer"),
            HasCriminalHistory = GetBooleanAnswer(answers, "has_criminal_history"),
            IsOnProbation = GetBooleanAnswer(answers, "is_on_probation"),
            ArgumentativeScale = GetIntegerAnswer(answers, "argumentative_scale"),
            LearningDifficultyScale = GetIntegerAnswer(answers, "learning_difficulty_scale"),
            LiteracyScale = GetIntegerAnswer(answers, "literacy_scale"),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
    }

    private static void ApplyResidentAdmissionDetails(Resident resident, Unit unit, IReadOnlyDictionary<string, JsonElement> answers, DateTime now)
    {
        var firstName = GetStringAnswer(answers, "first_name");
        var surname = GetStringAnswer(answers, "surname");
        if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(surname))
        {
            (firstName, surname) = SplitName(GetStringAnswer(answers, "service_user_full_name"));
        }

        resident.UnitId = unit.Id;
        resident.UnitCode = unit.Code;
        resident.WeekNumber = resident.WeekNumber > 0 ? resident.WeekNumber : Math.Max(1, unit.DefaultResidentWeekNumber);
        resident.FirstName = ChooseValue(firstName, resident.FirstName);
        resident.Surname = ChooseValue(surname, resident.Surname);
        resident.Nationality = ChooseValue(GetStringAnswer(answers, "nationality"), resident.Nationality);
        resident.DateOfBirth ??= GetDateTimeAnswer(answers, "date_of_birth");
        resident.AdmissionDate ??= now;
        resident.ExpectedCompletionDate ??= now.AddDays(84);
        resident.PrimaryAddiction = ChooseValue(GetPrimaryAddiction(answers, unit.Code), resident.PrimaryAddiction);
        resident.PhotoUrl ??= GetPhotoAnswer(answers);
        resident.UpdatedAtUtc = now;
    }

    private async Task<ResidentCase?> ResolveResidentCaseAsync(string? subjectId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(subjectId, out var residentCaseId))
        {
            return null;
        }

        return await _dbContext.ResidentCases
            .AsTracking()
            .SingleOrDefaultAsync(item => item.Id == residentCaseId, cancellationToken);
    }

    private async Task CancelScheduledIntakeAsync(Guid residentCaseId, DateTime now, CancellationToken cancellationToken)
    {
        var scheduledIntake = await _dbContext.ScheduledIntakes
            .SingleOrDefaultAsync(item =>
                item.ResidentCaseId == residentCaseId &&
                (item.StatusLookupValueId == ScreeningLifecycleLookups.ScheduledIntakeStatuses.Scheduled ||
                 item.Status == "scheduled"),
                cancellationToken);

        if (scheduledIntake is null)
        {
            return;
        }

        scheduledIntake.Status = "cancelled";
        scheduledIntake.StatusLookupValueId = ScreeningLifecycleLookups.ScheduledIntakeStatuses.Cancelled;
        scheduledIntake.UpdatedAtUtc = now;
        scheduledIntake.Notes = "Admission completed.";
    }

    private async Task<int> GetNextEntrySequenceAsync(Guid centreId, int entryYear, int entryWeek, CancellationToken cancellationToken)
    {
        var maxExisting = await _dbContext.ResidentProgrammeEpisodes
            .Where(item => item.CentreId == centreId && item.EntryYear == entryYear && item.EntryWeek == entryWeek)
            .Select(item => (int?)item.EntrySequence)
            .MaxAsync(cancellationToken);

        return (maxExisting ?? 0) + 1;
    }

    private int GetNextResidentSequence(string unitCode, int weekNumber, DateTime now)
    {
        var year = now.Year;
        return _dbContext.Residents
            .Count(item => item.UnitCode == unitCode && item.WeekNumber == weekNumber && item.AdmissionDate.HasValue && item.AdmissionDate.Value.Year == year) + 1;
    }

    private static string? ResolveUnitCode(string formCode)
    {
        if (string.IsNullOrWhiteSpace(formCode) || !formCode.StartsWith(AdmissionFormPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return formCode[AdmissionFormPrefix.Length..].Trim().ToLowerInvariant();
    }

    private static string BuildResidentName(string? firstName, string? surname)
    {
        var value = string.Join(" ", new[] { firstName?.Trim(), surname?.Trim() }.Where(item => !string.IsNullOrWhiteSpace(item)));
        return string.IsNullOrWhiteSpace(value) ? "Unknown resident" : value;
    }

    private static string BuildCentreEpisodeCode(string centreCode, int year, int weekNumber, int entrySequence) =>
        $"{centreCode.ToUpperInvariant()}-{year}W{weekNumber:00}-{entrySequence:000}";

    private static string BuildResidentSecondaryKey(string centreCode, string unitCode, int year, int weekNumber, int residentNumber) =>
        $"{centreCode.ToUpperInvariant()}-{unitCode[..Math.Min(3, unitCode.Length)].ToUpperInvariant()}-{year % 100:00}-{weekNumber:00}-{residentNumber:00}";

    private static string ChooseValue(string? candidate, string? fallback) =>
        string.IsNullOrWhiteSpace(candidate) ? fallback ?? string.Empty : candidate.Trim();

    private static string GetStringAnswer(IReadOnlyDictionary<string, JsonElement> answers, string key)
    {
        if (!answers.TryGetValue(key, out var value))
        {
            return string.Empty;
        }

        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString()?.Trim() ?? string.Empty,
            JsonValueKind.Number => value.ToString(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => string.Empty
        };
    }

    private static DateTime? GetDateTimeAnswer(IReadOnlyDictionary<string, JsonElement> answers, string key)
    {
        var value = GetStringAnswer(answers, key);
        return DateTime.TryParse(value, out var parsed) ? parsed : null;
    }

    private static bool GetBooleanAnswer(IReadOnlyDictionary<string, JsonElement> answers, string key)
    {
        if (!answers.TryGetValue(key, out var value))
        {
            return false;
        }

        return value.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.String => bool.TryParse(value.GetString(), out var parsed) && parsed,
            _ => false
        };
    }

    private static int GetIntegerAnswer(IReadOnlyDictionary<string, JsonElement> answers, string key)
    {
        if (!answers.TryGetValue(key, out var value))
        {
            return 0;
        }

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var numericValue))
        {
            return numericValue;
        }

        return value.ValueKind == JsonValueKind.String && int.TryParse(value.GetString(), out var parsed) ? parsed : 0;
    }

    private static string? GetPhotoAnswer(IReadOnlyDictionary<string, JsonElement> answers)
    {
        var photo = GetStringAnswer(answers, "residentPhotoDataUrl");
        return string.IsNullOrWhiteSpace(photo) ? null : photo;
    }

    private static string GetPrimaryAddiction(IReadOnlyDictionary<string, JsonElement> answers, string unitCode)
    {
        var value = ChooseValue(GetStringAnswer(answers, "primary_addiction"), string.Empty);
        if (!string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        return unitCode switch
        {
            "drugs" => "Drugs",
            _ => "Alcohol"
        };
    }

    private static (string firstName, string surname) SplitName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return (string.Empty, string.Empty);
        }

        var parts = fullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length == 1)
        {
            return (parts[0], string.Empty);
        }

        return (parts[0], string.Join(" ", parts.Skip(1)));
    }
}
