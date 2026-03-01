using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Acutis.Api.Services.GroupTherapy;

public interface IGroupTherapyService
{
    Task<GroupTherapyProgramResponse?> GetProgramAsync(
        string unitCode,
        string programCode,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<GroupTherapyResidentRemarkDto>> GetRemarksAsync(
        string unitCode,
        string programCode,
        string moduleKey,
        CancellationToken cancellationToken = default);

    Task<GroupTherapyResidentRemarkDto> UpsertRemarkAsync(
        UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class GroupTherapyService : IGroupTherapyService
{
    private readonly AcutisDbContext _dbContext;

    public GroupTherapyService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GroupTherapyProgramResponse?> GetProgramAsync(
        string unitCode,
        string programCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = programCode.Trim().ToLowerInvariant();

        var subjects = await _dbContext.GroupTherapySubjectTemplates
            .AsNoTracking()
            .Include(subject => subject.DailyQuestions)
            .Where(subject =>
                subject.IsActive &&
                subject.UnitCode.ToLower() == normalizedUnitCode &&
                subject.ProgramCode.ToLower() == normalizedProgramCode)
            .OrderBy(subject => subject.WeekNumber)
            .ToListAsync(cancellationToken);

        if (subjects.Count == 0)
        {
            return null;
        }

        return new GroupTherapyProgramResponse
        {
            UnitCode = subjects[0].UnitCode,
            ProgramCode = subjects[0].ProgramCode,
            Weeks = subjects.Select(subject => new GroupTherapyWeekDto
            {
                WeekNumber = subject.WeekNumber,
                Topic = subject.Topic,
                IntroText = subject.IntroText,
                Days = subject.DailyQuestions
                    .Where(question => question.IsActive)
                    .GroupBy(question => question.DayNumber)
                    .OrderBy(group => group.Key)
                    .Select(group => new GroupTherapyDayDto
                    {
                        DayNumber = group.Key,
                        Questions = group
                            .OrderBy(question => question.SortOrder)
                            .Select(question => question.QuestionText)
                            .ToList()
                    })
                    .ToList()
            }).ToList()
        };
    }

    public async Task<IReadOnlyList<GroupTherapyResidentRemarkDto>> GetRemarksAsync(
        string unitCode,
        string programCode,
        string moduleKey,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = unitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = programCode.Trim().ToLowerInvariant();
        var normalizedModuleKey = moduleKey.Trim().ToLowerInvariant();

        var remarks = await _dbContext.GroupTherapyResidentRemarks
            .AsNoTracking()
            .Where(remark =>
                remark.UnitCode.ToLower() == normalizedUnitCode &&
                remark.ProgramCode.ToLower() == normalizedProgramCode &&
                remark.ModuleKey.ToLower() == normalizedModuleKey)
            .OrderBy(remark => remark.ResidentId)
            .ToListAsync(cancellationToken);

        return remarks.Select(MapRemark).ToList();
    }

    public async Task<GroupTherapyResidentRemarkDto> UpsertRemarkAsync(
        UpsertGroupTherapyResidentRemarkRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedUnitCode = request.UnitCode.Trim().ToLowerInvariant();
        var normalizedProgramCode = request.ProgramCode.Trim().ToLowerInvariant();
        var normalizedModuleKey = request.ModuleKey.Trim().ToLowerInvariant();
        var sanitizedNoteLines = request.NoteLines
            .Select(line => line.Trim())
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
        var sanitizedFreeText = request.FreeText.Trim();
        var nowUtc = DateTime.UtcNow;

        var existing = await _dbContext.GroupTherapyResidentRemarks
            .SingleOrDefaultAsync(
                remark =>
                    remark.UnitCode == normalizedUnitCode &&
                    remark.ProgramCode == normalizedProgramCode &&
                    remark.ModuleKey == normalizedModuleKey &&
                    remark.ResidentId == request.ResidentId,
                cancellationToken);

        if (existing is null)
        {
            existing = new GroupTherapyResidentRemark
            {
                Id = Guid.NewGuid(),
                UnitCode = normalizedUnitCode,
                ProgramCode = normalizedProgramCode,
                ModuleKey = normalizedModuleKey,
                ResidentId = request.ResidentId,
                CreatedAtUtc = nowUtc
            };
            _dbContext.GroupTherapyResidentRemarks.Add(existing);
        }

        existing.NoteLinesJson = JsonSerializer.Serialize(sanitizedNoteLines);
        existing.FreeText = sanitizedFreeText;
        existing.UpdatedAtUtc = nowUtc;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapRemark(existing);
    }

    private static GroupTherapyResidentRemarkDto MapRemark(GroupTherapyResidentRemark remark)
    {
        List<string>? noteLines = null;

        if (!string.IsNullOrWhiteSpace(remark.NoteLinesJson))
        {
            try
            {
                noteLines = JsonSerializer.Deserialize<List<string>>(remark.NoteLinesJson);
            }
            catch (JsonException)
            {
                noteLines = null;
            }
        }

        return new GroupTherapyResidentRemarkDto
        {
            Id = remark.Id,
            ResidentId = remark.ResidentId,
            ModuleKey = remark.ModuleKey,
            NoteLines = noteLines ?? new List<string>(),
            FreeText = remark.FreeText,
            CreatedAtUtc = remark.CreatedAtUtc,
            UpdatedAtUtc = remark.UpdatedAtUtc
        };
    }
}
