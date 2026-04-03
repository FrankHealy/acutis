using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Configuration;

public interface IGlobalConfigurationService
{
    Task<IReadOnlyList<CentreConfigurationDto>> GetCentresAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<CentreConfigurationDto> CreateCentreAsync(UpsertCentreRequest request, CancellationToken cancellationToken = default);
    Task<CentreConfigurationDto> UpdateCentreAsync(Guid centreId, UpsertCentreRequest request, CancellationToken cancellationToken = default);
    Task ArchiveCentreAsync(Guid centreId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UnitConfigurationDto>> GetUnitsAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<UnitConfigurationDto> CreateUnitAsync(UpsertUnitRequest request, CancellationToken cancellationToken = default);
    Task<UnitConfigurationDto> UpdateUnitAsync(Guid unitId, UpsertUnitRequest request, CancellationToken cancellationToken = default);
    Task ArchiveUnitAsync(Guid unitId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProgrammeDefinitionDto>> GetProgrammeDefinitionsAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<ProgrammeDefinitionDto> CreateProgrammeDefinitionAsync(UpsertProgrammeDefinitionRequest request, CancellationToken cancellationToken = default);
    Task<ProgrammeDefinitionDto> UpdateProgrammeDefinitionAsync(Guid programmeDefinitionId, UpsertProgrammeDefinitionRequest request, CancellationToken cancellationToken = default);
    Task ArchiveProgrammeDefinitionAsync(Guid programmeDefinitionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScheduleTemplateDto>> GetScheduleTemplatesAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<ScheduleTemplateDto> CreateScheduleTemplateAsync(UpsertScheduleTemplateRequest request, CancellationToken cancellationToken = default);
    Task<ScheduleTemplateDto> UpdateScheduleTemplateAsync(Guid scheduleTemplateId, UpsertScheduleTemplateRequest request, CancellationToken cancellationToken = default);
    Task ArchiveScheduleTemplateAsync(Guid scheduleTemplateId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ScheduleOccurrenceDto>> GetScheduleOccurrencesAsync(CancellationToken cancellationToken = default);
    Task<ScheduleOccurrenceDto> CreateScheduleOccurrenceAsync(UpsertScheduleOccurrenceRequest request, CancellationToken cancellationToken = default);
    Task<ScheduleOccurrenceDto> UpdateScheduleOccurrenceAsync(Guid scheduleOccurrenceId, UpsertScheduleOccurrenceRequest request, CancellationToken cancellationToken = default);
    Task ArchiveScheduleOccurrenceAsync(Guid scheduleOccurrenceId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppPermissionDto>> GetPermissionsAsync(CancellationToken cancellationToken = default);
    Task<AppPermissionDto> CreatePermissionAsync(UpsertAppPermissionRequest request, CancellationToken cancellationToken = default);
    Task<AppPermissionDto> UpdatePermissionAsync(Guid permissionId, UpsertAppPermissionRequest request, CancellationToken cancellationToken = default);
    Task ArchivePermissionAsync(Guid permissionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppRoleDto>> GetRolesAsync(CancellationToken cancellationToken = default);
    Task<AppRoleDto> CreateRoleAsync(UpsertAppRoleRequest request, CancellationToken cancellationToken = default);
    Task<AppRoleDto> UpdateRoleAsync(Guid roleId, UpsertAppRoleRequest request, CancellationToken cancellationToken = default);
    Task ArchiveRoleAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppUserDto>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<AppUserDto> CreateUserAsync(UpsertAppUserRequest request, CancellationToken cancellationToken = default);
    Task<AppUserDto> UpdateUserAsync(Guid userId, UpsertAppUserRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppUserRoleAssignmentDto>> ReplaceUserAssignmentsAsync(
        Guid userId,
        ReplaceUserRoleAssignmentsRequest request,
        CancellationToken cancellationToken = default);
}

public sealed class GlobalConfigurationService : IGlobalConfigurationService
{
    private readonly AcutisDbContext _dbContext;

    public GlobalConfigurationService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<CentreConfigurationDto>> GetCentresAsync(
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Centres
            .AsNoTracking()
            .Include(x => x.Units)
            .AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        var centres = await query
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return centres.Select(MapCentre).ToList();
    }

    public async Task<CentreConfigurationDto> CreateCentreAsync(
        UpsertCentreRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateCentreRequest(request);
        var code = NormalizeKey(request.CentreCode);

        if (await _dbContext.Centres.AnyAsync(x => x.Code == code, cancellationToken))
        {
            throw new ArgumentException($"A centre with code '{code}' already exists.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var centre = new Centre
        {
            Id = Guid.NewGuid(),
            Code = code,
            Name = request.DisplayName.Trim(),
            Description = request.Description.Trim(),
            BrandName = request.BrandName.Trim(),
            BrandSubtitle = request.BrandSubtitle.Trim(),
            BrandLogoUrl = request.BrandLogoUrl.Trim(),
            BrowserTitle = request.BrowserTitle.Trim(),
            FaviconUrl = request.FaviconUrl.Trim(),
            ThemeKey = request.ThemeKey.Trim().ToLowerInvariant(),
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.Centres.Add(centre);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapCentre(centre);
    }

    public async Task<CentreConfigurationDto> UpdateCentreAsync(
        Guid centreId,
        UpsertCentreRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateCentreRequest(request);
        var centre = await _dbContext.Centres
            .Include(x => x.Units)
            .FirstOrDefaultAsync(x => x.Id == centreId, cancellationToken)
            ?? throw new KeyNotFoundException($"Centre '{centreId}' was not found.");

        var code = NormalizeKey(request.CentreCode);
        if (await _dbContext.Centres.AnyAsync(x => x.Id != centreId && x.Code == code, cancellationToken))
        {
            throw new ArgumentException($"A centre with code '{code}' already exists.", nameof(request));
        }

        centre.Code = code;
        centre.Name = request.DisplayName.Trim();
        centre.Description = request.Description.Trim();
        centre.BrandName = request.BrandName.Trim();
        centre.BrandSubtitle = request.BrandSubtitle.Trim();
        centre.BrandLogoUrl = request.BrandLogoUrl.Trim();
        centre.BrowserTitle = request.BrowserTitle.Trim();
        centre.FaviconUrl = request.FaviconUrl.Trim();
        centre.ThemeKey = request.ThemeKey.Trim().ToLowerInvariant();
        centre.DisplayOrder = request.DisplayOrder;
        centre.IsActive = request.IsActive;
        centre.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapCentre(centre);
    }

    public async Task ArchiveCentreAsync(Guid centreId, CancellationToken cancellationToken = default)
    {
        var centre = await _dbContext.Centres
            .Include(x => x.Units)
            .FirstOrDefaultAsync(x => x.Id == centreId, cancellationToken)
            ?? throw new KeyNotFoundException($"Centre '{centreId}' was not found.");

        centre.IsActive = false;
        centre.UpdatedAtUtc = DateTime.UtcNow;

        foreach (var unit in centre.Units.Where(x => x.IsActive))
        {
            unit.IsActive = false;
            unit.UpdatedAtUtc = centre.UpdatedAtUtc;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<UnitConfigurationDto>> GetUnitsAsync(
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Units
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.ProgrammeDefinition)
            .AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        var units = await query
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return units.Select(MapUnit).ToList();
    }

    public async Task<UnitConfigurationDto> CreateUnitAsync(UpsertUnitRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUnitRequest(request);
        var code = NormalizeKey(request.UnitCode);
        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));

        if (await _dbContext.Units.AnyAsync(x => x.Code == code, cancellationToken))
        {
            throw new ArgumentException($"A unit with code '{code}' already exists.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var programme = await ResolveProgrammeDefinitionAsync(request.ProgrammeDefinitionId, centre.Id, cancellationToken);
        var unit = new Acutis.Domain.Entities.Unit
        {
            Id = Guid.NewGuid(),
            CentreId = centre.Id,
            Centre = centre,
            ProgrammeDefinitionId = programme?.Id,
            ProgrammeDefinition = programme,
            Code = code,
            Name = request.DisplayName.Trim(),
            Description = request.Description.Trim(),
            Capacity = request.UnitCapacity,
            CurrentOccupancy = request.CurrentOccupancy,
            CapacityWarningThreshold = request.CapacityWarningThreshold,
            DefaultResidentWeekNumber = request.DefaultResidentWeekNumber,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.Units.Add(unit);
        _dbContext.ScreeningControls.Add(new Acutis.Domain.Entities.ScreeningControl
        {
            Id = Guid.NewGuid(),
            UnitCode = unit.Code,
            UnitName = unit.Name,
            UnitCapacity = unit.Capacity,
            CurrentOccupancy = unit.CurrentOccupancy,
            CapacityWarningThreshold = unit.CapacityWarningThreshold,
            CallLogsCacheSeconds = 15,
            EvaluationQueueCacheSeconds = 30,
            LocalizationCacheSeconds = 300,
            EnableClientCacheOverride = true,
            UpdatedAt = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapUnit(unit);
    }

    public async Task<UnitConfigurationDto> UpdateUnitAsync(
        Guid unitId,
        UpsertUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUnitRequest(request);
        var unit = await _dbContext.Units
            .Include(x => x.Centre)
            .Include(x => x.ProgrammeDefinition)
            .FirstOrDefaultAsync(x => x.Id == unitId, cancellationToken)
            ?? throw new KeyNotFoundException($"Unit '{unitId}' was not found.");
        var previousCode = unit.Code;
        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));
        var programme = await ResolveProgrammeDefinitionAsync(request.ProgrammeDefinitionId, centre.Id, cancellationToken);

        var code = NormalizeKey(request.UnitCode);
        if (await _dbContext.Units.AnyAsync(x => x.Id != unitId && x.Code == code, cancellationToken))
        {
            throw new ArgumentException($"A unit with code '{code}' already exists.", nameof(request));
        }

        unit.CentreId = centre.Id;
        unit.Centre = centre;
        unit.ProgrammeDefinitionId = programme?.Id;
        unit.ProgrammeDefinition = programme;
        unit.Code = code;
        unit.Name = request.DisplayName.Trim();
        unit.Description = request.Description.Trim();
        unit.Capacity = request.UnitCapacity;
        unit.CurrentOccupancy = request.CurrentOccupancy;
        unit.CapacityWarningThreshold = request.CapacityWarningThreshold;
        unit.DefaultResidentWeekNumber = request.DefaultResidentWeekNumber;
        unit.DisplayOrder = request.DisplayOrder;
        unit.IsActive = request.IsActive;
        unit.UpdatedAtUtc = DateTime.UtcNow;

        var screeningControl = await _dbContext.ScreeningControls.FirstOrDefaultAsync(x => x.UnitCode == previousCode, cancellationToken);
        if (screeningControl is not null)
        {
            screeningControl.UnitCode = unit.Code;
            screeningControl.UnitName = unit.Name;
            screeningControl.UnitCapacity = unit.Capacity;
            screeningControl.CurrentOccupancy = unit.CurrentOccupancy;
            screeningControl.CapacityWarningThreshold = unit.CapacityWarningThreshold;
            screeningControl.UpdatedAt = unit.UpdatedAtUtc;
        }
        else
        {
            _dbContext.ScreeningControls.Add(new Acutis.Domain.Entities.ScreeningControl
            {
                Id = Guid.NewGuid(),
                UnitCode = unit.Code,
                UnitName = unit.Name,
                UnitCapacity = unit.Capacity,
                CurrentOccupancy = unit.CurrentOccupancy,
                CapacityWarningThreshold = unit.CapacityWarningThreshold,
                CallLogsCacheSeconds = 15,
                EvaluationQueueCacheSeconds = 30,
                LocalizationCacheSeconds = 300,
                EnableClientCacheOverride = true,
                UpdatedAt = unit.UpdatedAtUtc
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapUnit(unit);
    }

    public async Task ArchiveUnitAsync(Guid unitId, CancellationToken cancellationToken = default)
    {
        var unit = await _dbContext.Units.FirstOrDefaultAsync(x => x.Id == unitId, cancellationToken)
            ?? throw new KeyNotFoundException($"Unit '{unitId}' was not found.");

        unit.IsActive = false;
        unit.UpdatedAtUtc = DateTime.UtcNow;

        var screeningControl = await _dbContext.ScreeningControls.FirstOrDefaultAsync(x => x.UnitCode == unit.Code, cancellationToken);
        if (screeningControl is not null)
        {
            screeningControl.UpdatedAt = unit.UpdatedAtUtc;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProgrammeDefinitionDto>> GetProgrammeDefinitionsAsync(
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.ProgrammeDefinitions
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.Units)
            .AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        var programmes = await query
            .OrderBy(x => x.Centre!.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return programmes.Select(MapProgrammeDefinition).ToList();
    }

    public async Task<ProgrammeDefinitionDto> CreateProgrammeDefinitionAsync(
        UpsertProgrammeDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateProgrammeDefinitionRequest(request);
        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));

        var code = NormalizeKey(request.Code);
        if (await _dbContext.ProgrammeDefinitions.AnyAsync(
                x => x.CentreId == centre.Id && x.Code == code,
                cancellationToken))
        {
            throw new ArgumentException($"A programme with code '{code}' already exists for this centre.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var programme = new ProgrammeDefinition
        {
            Id = Guid.NewGuid(),
            CentreId = centre.Id,
            Centre = centre,
            Code = code,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            TotalDurationValue = request.TotalDurationValue,
            TotalDurationUnit = ParseProgrammeDurationUnit(request.TotalDurationUnit, nameof(request.TotalDurationUnit)),
            DetoxPhaseDurationValue = request.DetoxPhaseDurationValue,
            DetoxPhaseDurationUnit = request.DetoxPhaseDurationValue.HasValue
                ? ParseProgrammeDurationUnit(request.DetoxPhaseDurationUnit, nameof(request.DetoxPhaseDurationUnit))
                : null,
            MainPhaseDurationValue = request.MainPhaseDurationValue,
            MainPhaseDurationUnit = request.MainPhaseDurationValue.HasValue
                ? ParseProgrammeDurationUnit(request.MainPhaseDurationUnit, nameof(request.MainPhaseDurationUnit))
                : null,
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.ProgrammeDefinitions.Add(programme);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadProgrammeDefinitionAsync(programme.Id, cancellationToken);
    }

    public async Task<ProgrammeDefinitionDto> UpdateProgrammeDefinitionAsync(
        Guid programmeDefinitionId,
        UpsertProgrammeDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateProgrammeDefinitionRequest(request);
        var programme = await _dbContext.ProgrammeDefinitions
            .Include(x => x.Centre)
            .Include(x => x.Units)
            .FirstOrDefaultAsync(x => x.Id == programmeDefinitionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Programme definition '{programmeDefinitionId}' was not found.");

        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));

        var code = NormalizeKey(request.Code);
        if (await _dbContext.ProgrammeDefinitions.AnyAsync(
                x => x.Id != programmeDefinitionId && x.CentreId == centre.Id && x.Code == code,
                cancellationToken))
        {
            throw new ArgumentException($"A programme with code '{code}' already exists for this centre.", nameof(request));
        }

        if (programme.CentreId != centre.Id && programme.Units.Any())
        {
            throw new ArgumentException("A programme assigned to units cannot be moved to a different centre.", nameof(request));
        }

        programme.CentreId = centre.Id;
        programme.Centre = centre;
        programme.Code = code;
        programme.Name = request.Name.Trim();
        programme.Description = request.Description.Trim();
        programme.TotalDurationValue = request.TotalDurationValue;
        programme.TotalDurationUnit = ParseProgrammeDurationUnit(request.TotalDurationUnit, nameof(request.TotalDurationUnit));
        programme.DetoxPhaseDurationValue = request.DetoxPhaseDurationValue;
        programme.DetoxPhaseDurationUnit = request.DetoxPhaseDurationValue.HasValue
            ? ParseProgrammeDurationUnit(request.DetoxPhaseDurationUnit, nameof(request.DetoxPhaseDurationUnit))
            : null;
        programme.MainPhaseDurationValue = request.MainPhaseDurationValue;
        programme.MainPhaseDurationUnit = request.MainPhaseDurationValue.HasValue
            ? ParseProgrammeDurationUnit(request.MainPhaseDurationUnit, nameof(request.MainPhaseDurationUnit))
            : null;
        programme.IsActive = request.IsActive;
        programme.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadProgrammeDefinitionAsync(programme.Id, cancellationToken);
    }

    public async Task ArchiveProgrammeDefinitionAsync(Guid programmeDefinitionId, CancellationToken cancellationToken = default)
    {
        var programme = await _dbContext.ProgrammeDefinitions.FirstOrDefaultAsync(x => x.Id == programmeDefinitionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Programme definition '{programmeDefinitionId}' was not found.");

        programme.IsActive = false;
        programme.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ScheduleTemplateDto>> GetScheduleTemplatesAsync(
        bool includeInactive,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.ScheduleTemplates
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.Unit)
            .Include(x => x.ProgrammeDefinition)
            .AsQueryable();
        if (!includeInactive)
        {
            query = query.Where(x => x.IsActive);
        }

        var templates = await query
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
        return templates.Select(MapScheduleTemplate).ToList();
    }

    public async Task<ScheduleTemplateDto> CreateScheduleTemplateAsync(
        UpsertScheduleTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateScheduleTemplateRequest(request);
        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));

        var unit = await ResolveUnitAsync(request.UnitId, centre.Id, cancellationToken);
        var programme = await ResolveProgrammeDefinitionAsync(request.ProgrammeDefinitionId, centre.Id, cancellationToken);
        var code = NormalizeKey(request.Code);

        if (unit is not null && await _dbContext.ScheduleTemplates.AnyAsync(
                x => x.CentreId == centre.Id && x.UnitId == unit.Id && x.Code == code,
                cancellationToken))
        {
            throw new ArgumentException($"A schedule template with code '{code}' already exists for this unit.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var template = new ScheduleTemplate
        {
            Id = Guid.NewGuid(),
            CentreId = centre.Id,
            Centre = centre,
            UnitId = unit?.Id,
            Unit = unit,
            ProgrammeDefinitionId = programme?.Id,
            ProgrammeDefinition = programme,
            Code = code,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Category = CleanOptional(request.Category),
            RecurrenceType = ParseScheduleRecurrenceType(request.RecurrenceType, nameof(request.RecurrenceType)),
            WeeklyDayOfWeek = request.WeeklyDayOfWeek.HasValue ? (DayOfWeek)request.WeeklyDayOfWeek.Value : null,
            StartTime = ParseOptionalTime(request.StartTime, nameof(request.StartTime)),
            EndTime = ParseOptionalTime(request.EndTime, nameof(request.EndTime)),
            AudienceType = ParseScheduleAudienceType(request.AudienceType, nameof(request.AudienceType)),
            FacilitatorType = ParseScheduleFacilitatorType(request.FacilitatorType, nameof(request.FacilitatorType)),
            FacilitatorRole = CleanOptional(request.FacilitatorRole),
            ExternalResourceName = CleanOptional(request.ExternalResourceName),
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.ScheduleTemplates.Add(template);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadScheduleTemplateAsync(template.Id, cancellationToken);
    }

    public async Task<ScheduleTemplateDto> UpdateScheduleTemplateAsync(
        Guid scheduleTemplateId,
        UpsertScheduleTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateScheduleTemplateRequest(request);
        var template = await _dbContext.ScheduleTemplates
            .Include(x => x.Centre)
            .Include(x => x.Unit)
            .Include(x => x.ProgrammeDefinition)
            .FirstOrDefaultAsync(x => x.Id == scheduleTemplateId, cancellationToken)
            ?? throw new KeyNotFoundException($"Schedule template '{scheduleTemplateId}' was not found.");

        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));
        var unit = await ResolveUnitAsync(request.UnitId, centre.Id, cancellationToken);
        var programme = await ResolveProgrammeDefinitionAsync(request.ProgrammeDefinitionId, centre.Id, cancellationToken);
        var code = NormalizeKey(request.Code);

        if (unit is not null && await _dbContext.ScheduleTemplates.AnyAsync(
                x => x.Id != scheduleTemplateId && x.CentreId == centre.Id && x.UnitId == unit.Id && x.Code == code,
                cancellationToken))
        {
            throw new ArgumentException($"A schedule template with code '{code}' already exists for this unit.", nameof(request));
        }

        template.CentreId = centre.Id;
        template.Centre = centre;
        template.UnitId = unit?.Id;
        template.Unit = unit;
        template.ProgrammeDefinitionId = programme?.Id;
        template.ProgrammeDefinition = programme;
        template.Code = code;
        template.Name = request.Name.Trim();
        template.Description = request.Description.Trim();
        template.Category = CleanOptional(request.Category);
        template.RecurrenceType = ParseScheduleRecurrenceType(request.RecurrenceType, nameof(request.RecurrenceType));
        template.WeeklyDayOfWeek = request.WeeklyDayOfWeek.HasValue ? (DayOfWeek)request.WeeklyDayOfWeek.Value : null;
        template.StartTime = ParseOptionalTime(request.StartTime, nameof(request.StartTime));
        template.EndTime = ParseOptionalTime(request.EndTime, nameof(request.EndTime));
        template.AudienceType = ParseScheduleAudienceType(request.AudienceType, nameof(request.AudienceType));
        template.FacilitatorType = ParseScheduleFacilitatorType(request.FacilitatorType, nameof(request.FacilitatorType));
        template.FacilitatorRole = CleanOptional(request.FacilitatorRole);
        template.ExternalResourceName = CleanOptional(request.ExternalResourceName);
        template.IsActive = request.IsActive;
        template.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadScheduleTemplateAsync(template.Id, cancellationToken);
    }

    public async Task ArchiveScheduleTemplateAsync(Guid scheduleTemplateId, CancellationToken cancellationToken = default)
    {
        var template = await _dbContext.ScheduleTemplates.FirstOrDefaultAsync(x => x.Id == scheduleTemplateId, cancellationToken)
            ?? throw new KeyNotFoundException($"Schedule template '{scheduleTemplateId}' was not found.");

        template.IsActive = false;
        template.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ScheduleOccurrenceDto>> GetScheduleOccurrencesAsync(CancellationToken cancellationToken = default)
    {
        var occurrences = await _dbContext.ScheduleOccurrences
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.Unit)
            .Include(x => x.ProgrammeDefinition)
            .Include(x => x.Template)
            .OrderByDescending(x => x.ScheduledDate)
            .ThenBy(x => x.StartTime)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);
        return occurrences.Select(MapScheduleOccurrence).ToList();
    }

    public async Task<ScheduleOccurrenceDto> CreateScheduleOccurrenceAsync(
        UpsertScheduleOccurrenceRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateScheduleOccurrenceRequest(request);
        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));
        var unit = await ResolveUnitAsync(request.UnitId, centre.Id, cancellationToken);
        var programme = await ResolveProgrammeDefinitionAsync(request.ProgrammeDefinitionId, centre.Id, cancellationToken);
        var template = await ResolveScheduleTemplateAsync(request.TemplateId, centre.Id, cancellationToken);

        var now = DateTime.UtcNow;
        var occurrence = new ScheduleOccurrence
        {
            Id = Guid.NewGuid(),
            CentreId = centre.Id,
            Centre = centre,
            UnitId = unit?.Id,
            Unit = unit,
            ProgrammeDefinitionId = programme?.Id,
            ProgrammeDefinition = programme,
            TemplateId = template?.Id,
            Template = template,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = CleanOptional(request.Category),
            ScheduledDate = request.ScheduledDate,
            StartTime = ParseOptionalTime(request.StartTime, nameof(request.StartTime)),
            EndTime = ParseOptionalTime(request.EndTime, nameof(request.EndTime)),
            AudienceType = ParseScheduleAudienceType(request.AudienceType, nameof(request.AudienceType)),
            FacilitatorType = ParseScheduleFacilitatorType(request.FacilitatorType, nameof(request.FacilitatorType)),
            FacilitatorRole = CleanOptional(request.FacilitatorRole),
            ExternalResourceName = CleanOptional(request.ExternalResourceName),
            Status = ParseScheduleOccurrenceStatus(request.Status, nameof(request.Status)),
            Notes = CleanOptional(request.Notes),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.ScheduleOccurrences.Add(occurrence);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadScheduleOccurrenceAsync(occurrence.Id, cancellationToken);
    }

    public async Task<ScheduleOccurrenceDto> UpdateScheduleOccurrenceAsync(
        Guid scheduleOccurrenceId,
        UpsertScheduleOccurrenceRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateScheduleOccurrenceRequest(request);
        var occurrence = await _dbContext.ScheduleOccurrences
            .Include(x => x.Centre)
            .Include(x => x.Unit)
            .Include(x => x.ProgrammeDefinition)
            .Include(x => x.Template)
            .FirstOrDefaultAsync(x => x.Id == scheduleOccurrenceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Schedule occurrence '{scheduleOccurrenceId}' was not found.");

        var centre = await _dbContext.Centres.FirstOrDefaultAsync(
            x => x.Id == request.CentreId && x.IsActive,
            cancellationToken)
            ?? throw new ArgumentException("A valid active centre is required.", nameof(request));
        var unit = await ResolveUnitAsync(request.UnitId, centre.Id, cancellationToken);
        var programme = await ResolveProgrammeDefinitionAsync(request.ProgrammeDefinitionId, centre.Id, cancellationToken);
        var template = await ResolveScheduleTemplateAsync(request.TemplateId, centre.Id, cancellationToken);

        occurrence.CentreId = centre.Id;
        occurrence.Centre = centre;
        occurrence.UnitId = unit?.Id;
        occurrence.Unit = unit;
        occurrence.ProgrammeDefinitionId = programme?.Id;
        occurrence.ProgrammeDefinition = programme;
        occurrence.TemplateId = template?.Id;
        occurrence.Template = template;
        occurrence.Title = request.Title.Trim();
        occurrence.Description = request.Description.Trim();
        occurrence.Category = CleanOptional(request.Category);
        occurrence.ScheduledDate = request.ScheduledDate;
        occurrence.StartTime = ParseOptionalTime(request.StartTime, nameof(request.StartTime));
        occurrence.EndTime = ParseOptionalTime(request.EndTime, nameof(request.EndTime));
        occurrence.AudienceType = ParseScheduleAudienceType(request.AudienceType, nameof(request.AudienceType));
        occurrence.FacilitatorType = ParseScheduleFacilitatorType(request.FacilitatorType, nameof(request.FacilitatorType));
        occurrence.FacilitatorRole = CleanOptional(request.FacilitatorRole);
        occurrence.ExternalResourceName = CleanOptional(request.ExternalResourceName);
        occurrence.Status = ParseScheduleOccurrenceStatus(request.Status, nameof(request.Status));
        occurrence.Notes = CleanOptional(request.Notes);
        occurrence.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadScheduleOccurrenceAsync(occurrence.Id, cancellationToken);
    }

    public async Task ArchiveScheduleOccurrenceAsync(Guid scheduleOccurrenceId, CancellationToken cancellationToken = default)
    {
        var occurrence = await _dbContext.ScheduleOccurrences.FirstOrDefaultAsync(x => x.Id == scheduleOccurrenceId, cancellationToken)
            ?? throw new KeyNotFoundException($"Schedule occurrence '{scheduleOccurrenceId}' was not found.");

        occurrence.Status = ScheduleOccurrenceStatus.Cancelled;
        occurrence.UpdatedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppPermissionDto>> GetPermissionsAsync(CancellationToken cancellationToken = default)
    {
        var permissions = await _dbContext.AppPermissions
            .AsNoTracking()
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Key)
            .ToListAsync(cancellationToken);
        return permissions.Select(MapPermission).ToList();
    }

    public async Task<AppPermissionDto> CreatePermissionAsync(
        UpsertAppPermissionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidatePermissionRequest(request);
        var key = NormalizeKey(request.Key);
        if (await _dbContext.AppPermissions.AnyAsync(x => x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A permission with key '{key}' already exists.", nameof(request));
        }

        var permission = new Acutis.Domain.Entities.AppPermission
        {
            Id = Guid.NewGuid(),
            Key = key,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Category = NormalizeKey(request.Category),
            IsActive = request.IsActive
        };

        _dbContext.AppPermissions.Add(permission);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPermission(permission);
    }

    public async Task<AppPermissionDto> UpdatePermissionAsync(
        Guid permissionId,
        UpsertAppPermissionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidatePermissionRequest(request);
        var permission = await _dbContext.AppPermissions.FirstOrDefaultAsync(x => x.Id == permissionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Permission '{permissionId}' was not found.");
        var key = NormalizeKey(request.Key);

        if (await _dbContext.AppPermissions.AnyAsync(x => x.Id != permissionId && x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A permission with key '{key}' already exists.", nameof(request));
        }

        permission.Key = key;
        permission.Name = request.Name.Trim();
        permission.Description = request.Description.Trim();
        permission.Category = NormalizeKey(request.Category);
        permission.IsActive = request.IsActive;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPermission(permission);
    }

    public async Task ArchivePermissionAsync(Guid permissionId, CancellationToken cancellationToken = default)
    {
        var permission = await _dbContext.AppPermissions.FirstOrDefaultAsync(x => x.Id == permissionId, cancellationToken)
            ?? throw new KeyNotFoundException($"Permission '{permissionId}' was not found.");
        permission.IsActive = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppRoleDto>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _dbContext.AppRoles
            .AsNoTracking()
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.AppPermission)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return roles.Select(MapRole).ToList();
    }

    public async Task<AppRoleDto> CreateRoleAsync(UpsertAppRoleRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRoleRequest(request);
        var key = NormalizeKey(request.Key);
        if (await _dbContext.AppRoles.AnyAsync(x => x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A role with key '{key}' already exists.", nameof(request));
        }

        var permissionIds = await ResolvePermissionIdsAsync(request.PermissionKeys, cancellationToken);
        var role = new Acutis.Domain.Entities.AppRole
        {
            Id = Guid.NewGuid(),
            Key = key,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            ExternalRoleName = request.ExternalRoleName.Trim(),
            DefaultScopeType = NormalizeScopeType(request.DefaultScopeType),
            IsSystemRole = request.IsSystemRole,
            IsActive = request.IsActive
        };

        foreach (var permissionId in permissionIds)
        {
            role.RolePermissions.Add(new Acutis.Domain.Entities.AppRolePermission
            {
                AppRoleId = role.Id,
                AppPermissionId = permissionId
            });
        }

        _dbContext.AppRoles.Add(role);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadRoleAsync(role.Id, cancellationToken);
    }

    public async Task<AppRoleDto> UpdateRoleAsync(Guid roleId, UpsertAppRoleRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRoleRequest(request);
        var role = await _dbContext.AppRoles
            .Include(x => x.RolePermissions)
            .FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Role '{roleId}' was not found.");

        var key = NormalizeKey(request.Key);
        if (await _dbContext.AppRoles.AnyAsync(x => x.Id != roleId && x.Key == key, cancellationToken))
        {
            throw new ArgumentException($"A role with key '{key}' already exists.", nameof(request));
        }

        role.Key = key;
        role.Name = request.Name.Trim();
        role.Description = request.Description.Trim();
        role.ExternalRoleName = request.ExternalRoleName.Trim();
        role.DefaultScopeType = NormalizeScopeType(request.DefaultScopeType);
        role.IsSystemRole = request.IsSystemRole;
        role.IsActive = request.IsActive;

        var permissionIds = await ResolvePermissionIdsAsync(request.PermissionKeys, cancellationToken);
        _dbContext.AppRolePermissions.RemoveRange(role.RolePermissions);
        role.RolePermissions.Clear();
        foreach (var permissionId in permissionIds)
        {
            role.RolePermissions.Add(new Acutis.Domain.Entities.AppRolePermission
            {
                AppRoleId = role.Id,
                AppPermissionId = permissionId
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadRoleAsync(role.Id, cancellationToken);
    }

    public async Task ArchiveRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var role = await _dbContext.AppRoles.FirstOrDefaultAsync(x => x.Id == roleId, cancellationToken)
            ?? throw new KeyNotFoundException($"Role '{roleId}' was not found.");
        role.IsActive = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AppUserDto>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _dbContext.AppUsers
            .AsNoTracking()
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.AppRole)
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.Centre)
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.Unit)
            .OrderBy(x => x.DisplayName)
            .ThenBy(x => x.UserName)
            .ToListAsync(cancellationToken);

        return users.Select(MapUser).ToList();
    }

    public async Task<AppUserDto> CreateUserAsync(UpsertAppUserRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserRequest(request);
        if (await _dbContext.AppUsers.AnyAsync(x => x.ExternalSubject == request.ExternalSubject.Trim(), cancellationToken))
        {
            throw new ArgumentException($"A user with subject '{request.ExternalSubject}' already exists.", nameof(request));
        }

        var now = DateTime.UtcNow;
        var user = new Acutis.Domain.Entities.AppUser
        {
            Id = Guid.NewGuid(),
            ExternalSubject = request.ExternalSubject.Trim(),
            UserName = request.UserName.Trim(),
            DisplayName = request.DisplayName.Trim(),
            Email = request.Email.Trim(),
            IsActive = request.IsActive,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        _dbContext.AppUsers.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadUserAsync(user.Id, cancellationToken);
    }

    public async Task<AppUserDto> UpdateUserAsync(Guid userId, UpsertAppUserRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserRequest(request);
        var user = await _dbContext.AppUsers.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        var subject = request.ExternalSubject.Trim();
        if (await _dbContext.AppUsers.AnyAsync(x => x.Id != userId && x.ExternalSubject == subject, cancellationToken))
        {
            throw new ArgumentException($"A user with subject '{subject}' already exists.", nameof(request));
        }

        user.ExternalSubject = subject;
        user.UserName = request.UserName.Trim();
        user.DisplayName = request.DisplayName.Trim();
        user.Email = request.Email.Trim();
        user.IsActive = request.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await LoadUserAsync(user.Id, cancellationToken);
    }

    public async Task<IReadOnlyList<AppUserRoleAssignmentDto>> ReplaceUserAssignmentsAsync(
        Guid userId,
        ReplaceUserRoleAssignmentsRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.AppUsers
            .Include(x => x.RoleAssignments)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken)
            ?? throw new KeyNotFoundException($"User '{userId}' was not found.");

        var roleIds = request.Assignments.Select(x => x.RoleId).Distinct().ToList();
        var knownRoleIds = await _dbContext.AppRoles
            .Where(x => roleIds.Contains(x.Id) && x.IsActive)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        if (knownRoleIds.Count != roleIds.Count)
        {
            throw new ArgumentException("One or more roleIds were not found or are inactive.", nameof(request));
        }

        var normalizedAssignments = request.Assignments
            .Select(x => new
            {
                x.RoleId,
                ScopeType = NormalizeScopeType(x.ScopeType),
                x.CentreId,
                x.UnitId,
                x.IsActive
            })
            .ToList();

        var centreIds = normalizedAssignments.Select(x => x.CentreId).Distinct().ToList();
        var knownCentres = await _dbContext.Centres
            .Where(x => centreIds.Contains(x.Id) && x.IsActive)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);
        if (knownCentres.Count != centreIds.Count)
        {
            throw new ArgumentException("One or more centreIds were not found or are inactive.", nameof(request));
        }

        var unitIds = normalizedAssignments.Where(x => x.UnitId.HasValue).Select(x => x.UnitId!.Value).Distinct().ToList();
        var knownUnitIds = await _dbContext.Units
            .Where(x => unitIds.Contains(x.Id) && x.IsActive)
            .Select(x => new { x.Id, x.CentreId })
            .ToListAsync(cancellationToken);
        if (knownUnitIds.Count != unitIds.Count)
        {
            throw new ArgumentException("One or more unitIds were not found or are inactive.", nameof(request));
        }

        var unitsById = knownUnitIds.ToDictionary(x => x.Id, x => x.CentreId);

        foreach (var assignment in normalizedAssignments)
        {
            if (assignment.ScopeType == ConfigurationScopeTypes.Centre && assignment.UnitId.HasValue)
            {
                throw new ArgumentException("Centre-scoped assignments cannot include a unitId.", nameof(request));
            }

            if (assignment.ScopeType == ConfigurationScopeTypes.Unit && !assignment.UnitId.HasValue)
            {
                throw new ArgumentException("Unit-scoped assignments require a unitId.", nameof(request));
            }

            if (assignment.UnitId.HasValue &&
                unitsById.TryGetValue(assignment.UnitId.Value, out var unitCentreId) &&
                unitCentreId != assignment.CentreId)
            {
                throw new ArgumentException("The selected unit does not belong to the selected centre.", nameof(request));
            }
        }

        _dbContext.AppUserRoleAssignments.RemoveRange(user.RoleAssignments);
        user.RoleAssignments.Clear();
        var now = DateTime.UtcNow;

        foreach (var assignment in normalizedAssignments
                     .DistinctBy(x => new { x.RoleId, x.ScopeType, x.CentreId, x.UnitId }))
        {
            user.RoleAssignments.Add(new Acutis.Domain.Entities.AppUserRoleAssignment
            {
                Id = Guid.NewGuid(),
                AppUserId = user.Id,
                AppRoleId = assignment.RoleId,
                ScopeType = assignment.ScopeType,
                CentreId = assignment.CentreId,
                UnitId = assignment.UnitId,
                IsActive = assignment.IsActive,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            });
        }

        user.UpdatedAtUtc = now;
        await _dbContext.SaveChangesAsync(cancellationToken);
        var updatedUser = await LoadUserAsync(user.Id, cancellationToken);
        return updatedUser.Assignments;
    }

    private async Task<List<Guid>> ResolvePermissionIdsAsync(
        IReadOnlyList<string> permissionKeys,
        CancellationToken cancellationToken)
    {
        var normalizedKeys = permissionKeys
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(NormalizeKey)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (normalizedKeys.Count == 0)
        {
            return new List<Guid>();
        }

        var permissions = await _dbContext.AppPermissions
            .Where(x => normalizedKeys.Contains(x.Key) && x.IsActive)
            .Select(x => new { x.Id, x.Key })
            .ToListAsync(cancellationToken);

        if (permissions.Count != normalizedKeys.Count)
        {
            throw new ArgumentException("One or more permission keys were not found or are inactive.");
        }

        return permissions.Select(x => x.Id).ToList();
    }

    private async Task<ProgrammeDefinition?> ResolveProgrammeDefinitionAsync(
        Guid? programmeDefinitionId,
        Guid centreId,
        CancellationToken cancellationToken)
    {
        if (!programmeDefinitionId.HasValue)
        {
            return null;
        }

        return await _dbContext.ProgrammeDefinitions.FirstOrDefaultAsync(
                   x => x.Id == programmeDefinitionId.Value && x.CentreId == centreId,
                   cancellationToken)
               ?? throw new ArgumentException("The selected programme does not belong to the selected centre.");
    }

    private async Task<Acutis.Domain.Entities.Unit?> ResolveUnitAsync(
        Guid? unitId,
        Guid centreId,
        CancellationToken cancellationToken)
    {
        if (!unitId.HasValue)
        {
            return null;
        }

        return await _dbContext.Units.FirstOrDefaultAsync(
                   x => x.Id == unitId.Value && x.CentreId == centreId,
                   cancellationToken)
               ?? throw new ArgumentException("The selected unit does not belong to the selected centre.");
    }

    private async Task<ScheduleTemplate?> ResolveScheduleTemplateAsync(
        Guid? scheduleTemplateId,
        Guid centreId,
        CancellationToken cancellationToken)
    {
        if (!scheduleTemplateId.HasValue)
        {
            return null;
        }

        return await _dbContext.ScheduleTemplates.FirstOrDefaultAsync(
                   x => x.Id == scheduleTemplateId.Value && x.CentreId == centreId,
                   cancellationToken)
               ?? throw new ArgumentException("The selected schedule template does not belong to the selected centre.");
    }

    private async Task<ProgrammeDefinitionDto> LoadProgrammeDefinitionAsync(Guid programmeDefinitionId, CancellationToken cancellationToken)
    {
        var programme = await _dbContext.ProgrammeDefinitions
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.Units)
            .FirstAsync(x => x.Id == programmeDefinitionId, cancellationToken);
        return MapProgrammeDefinition(programme);
    }

    private async Task<ScheduleTemplateDto> LoadScheduleTemplateAsync(Guid scheduleTemplateId, CancellationToken cancellationToken)
    {
        var template = await _dbContext.ScheduleTemplates
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.Unit)
            .Include(x => x.ProgrammeDefinition)
            .FirstAsync(x => x.Id == scheduleTemplateId, cancellationToken);
        return MapScheduleTemplate(template);
    }

    private async Task<ScheduleOccurrenceDto> LoadScheduleOccurrenceAsync(Guid scheduleOccurrenceId, CancellationToken cancellationToken)
    {
        var occurrence = await _dbContext.ScheduleOccurrences
            .AsNoTracking()
            .Include(x => x.Centre)
            .Include(x => x.Unit)
            .Include(x => x.ProgrammeDefinition)
            .Include(x => x.Template)
            .FirstAsync(x => x.Id == scheduleOccurrenceId, cancellationToken);
        return MapScheduleOccurrence(occurrence);
    }

    private async Task<AppRoleDto> LoadRoleAsync(Guid roleId, CancellationToken cancellationToken)
    {
        var role = await _dbContext.AppRoles
            .AsNoTracking()
            .Include(x => x.RolePermissions)
            .ThenInclude(x => x.AppPermission)
            .FirstAsync(x => x.Id == roleId, cancellationToken);
        return MapRole(role);
    }

    private async Task<AppUserDto> LoadUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.AppRole)
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.Centre)
            .Include(x => x.RoleAssignments)
            .ThenInclude(x => x.Unit)
            .FirstAsync(x => x.Id == userId, cancellationToken);
        return MapUser(user);
    }

    private static CentreConfigurationDto MapCentre(Centre centre)
    {
        return new CentreConfigurationDto
        {
            CentreId = centre.Id,
            CentreCode = centre.Code,
            DisplayName = centre.Name,
            Description = centre.Description,
            BrandName = centre.BrandName,
            BrandSubtitle = centre.BrandSubtitle,
            BrandLogoUrl = centre.BrandLogoUrl,
            BrowserTitle = centre.BrowserTitle,
            FaviconUrl = centre.FaviconUrl,
            ThemeKey = centre.ThemeKey,
            DisplayOrder = centre.DisplayOrder,
            UnitCount = centre.Units.Count(x => x.IsActive),
            IsActive = centre.IsActive
        };
    }

    private static UnitConfigurationDto MapUnit(Acutis.Domain.Entities.Unit unit)
    {
        return new UnitConfigurationDto
        {
            UnitId = unit.Id,
            CentreId = unit.CentreId,
            CentreCode = unit.Centre.Code,
            CentreName = unit.Centre.Name,
            UnitCode = unit.Code,
            DisplayName = unit.Name,
            Description = unit.Description,
            UnitCapacity = unit.Capacity,
            CurrentOccupancy = unit.CurrentOccupancy,
            FreeBeds = Math.Max(0, unit.Capacity - unit.CurrentOccupancy),
            CapacityWarningThreshold = unit.CapacityWarningThreshold,
            DefaultResidentWeekNumber = unit.DefaultResidentWeekNumber,
            ProgrammeDefinitionId = unit.ProgrammeDefinitionId,
            ProgrammeDefinitionName = unit.ProgrammeDefinition?.Name ?? string.Empty,
            DisplayOrder = unit.DisplayOrder,
            IsActive = unit.IsActive
        };
    }

    private static ProgrammeDefinitionDto MapProgrammeDefinition(ProgrammeDefinition programme)
    {
        return new ProgrammeDefinitionDto
        {
            ProgrammeDefinitionId = programme.Id,
            CentreId = programme.CentreId,
            CentreName = programme.Centre?.Name ?? string.Empty,
            Code = programme.Code,
            Name = programme.Name,
            Description = programme.Description,
            TotalDurationValue = programme.TotalDurationValue,
            TotalDurationUnit = programme.TotalDurationUnit.ToString(),
            DetoxPhaseDurationValue = programme.DetoxPhaseDurationValue,
            DetoxPhaseDurationUnit = programme.DetoxPhaseDurationUnit?.ToString() ?? string.Empty,
            MainPhaseDurationValue = programme.MainPhaseDurationValue,
            MainPhaseDurationUnit = programme.MainPhaseDurationUnit?.ToString() ?? string.Empty,
            IsActive = programme.IsActive,
            AssignedUnitNames = programme.Units
                .Where(x => x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.Name)
                .Select(x => x.Name)
                .ToList()
        };
    }

    private static ScheduleTemplateDto MapScheduleTemplate(ScheduleTemplate template)
    {
        return new ScheduleTemplateDto
        {
            ScheduleTemplateId = template.Id,
            CentreId = template.CentreId,
            CentreName = template.Centre?.Name ?? string.Empty,
            UnitId = template.UnitId,
            UnitName = template.Unit?.Name ?? string.Empty,
            ProgrammeDefinitionId = template.ProgrammeDefinitionId,
            ProgrammeDefinitionName = template.ProgrammeDefinition?.Name ?? string.Empty,
            Code = template.Code,
            Name = template.Name,
            Description = template.Description,
            Category = template.Category ?? string.Empty,
            RecurrenceType = template.RecurrenceType.ToString(),
            WeeklyDayOfWeek = template.WeeklyDayOfWeek.HasValue ? (int)template.WeeklyDayOfWeek.Value : null,
            StartTime = template.StartTime?.ToString(@"hh\:mm") ?? string.Empty,
            EndTime = template.EndTime?.ToString(@"hh\:mm") ?? string.Empty,
            AudienceType = template.AudienceType.ToString(),
            FacilitatorType = template.FacilitatorType.ToString(),
            FacilitatorRole = template.FacilitatorRole ?? string.Empty,
            ExternalResourceName = template.ExternalResourceName ?? string.Empty,
            IsActive = template.IsActive
        };
    }

    private static ScheduleOccurrenceDto MapScheduleOccurrence(ScheduleOccurrence occurrence)
    {
        return new ScheduleOccurrenceDto
        {
            ScheduleOccurrenceId = occurrence.Id,
            CentreId = occurrence.CentreId,
            CentreName = occurrence.Centre?.Name ?? string.Empty,
            UnitId = occurrence.UnitId,
            UnitName = occurrence.Unit?.Name ?? string.Empty,
            ProgrammeDefinitionId = occurrence.ProgrammeDefinitionId,
            ProgrammeDefinitionName = occurrence.ProgrammeDefinition?.Name ?? string.Empty,
            TemplateId = occurrence.TemplateId,
            TemplateName = occurrence.Template?.Name ?? string.Empty,
            Title = occurrence.Title,
            Description = occurrence.Description,
            Category = occurrence.Category ?? string.Empty,
            ScheduledDate = occurrence.ScheduledDate,
            StartTime = occurrence.StartTime?.ToString(@"hh\:mm") ?? string.Empty,
            EndTime = occurrence.EndTime?.ToString(@"hh\:mm") ?? string.Empty,
            AudienceType = occurrence.AudienceType.ToString(),
            FacilitatorType = occurrence.FacilitatorType.ToString(),
            FacilitatorRole = occurrence.FacilitatorRole ?? string.Empty,
            ExternalResourceName = occurrence.ExternalResourceName ?? string.Empty,
            Status = occurrence.Status.ToString(),
            Notes = occurrence.Notes ?? string.Empty
        };
    }

    private static AppPermissionDto MapPermission(Acutis.Domain.Entities.AppPermission permission)
    {
        return new AppPermissionDto
        {
            PermissionId = permission.Id,
            Key = permission.Key,
            Name = permission.Name,
            Description = permission.Description,
            Category = permission.Category,
            IsActive = permission.IsActive
        };
    }

    private static AppRoleDto MapRole(Acutis.Domain.Entities.AppRole role)
    {
        return new AppRoleDto
        {
            RoleId = role.Id,
            Key = role.Key,
            Name = role.Name,
            Description = role.Description,
            ExternalRoleName = role.ExternalRoleName,
            DefaultScopeType = role.DefaultScopeType,
            IsSystemRole = role.IsSystemRole,
            IsActive = role.IsActive,
            PermissionKeys = role.RolePermissions
                .Select(x => x.AppPermission.Key)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(x => x)
                .ToList()
        };
    }

    private static AppUserDto MapUser(Acutis.Domain.Entities.AppUser user)
    {
        return new AppUserDto
        {
            UserId = user.Id,
            ExternalSubject = user.ExternalSubject,
            UserName = user.UserName,
            DisplayName = user.DisplayName,
            Email = user.Email,
            IsActive = user.IsActive,
            LastSeenAtUtc = user.LastSeenAtUtc,
            Assignments = user.RoleAssignments
                .OrderBy(x => x.AppRole.Name)
                .ThenBy(x => x.Centre.Name)
                .ThenBy(x => x.UnitId.HasValue ? x.Unit!.Name : string.Empty)
                .Select(x => new AppUserRoleAssignmentDto
                {
                    AssignmentId = x.Id,
                    RoleId = x.AppRoleId,
                    RoleKey = x.AppRole.Key,
                    ScopeType = x.ScopeType,
                    CentreId = x.CentreId,
                    CentreCode = x.Centre.Code,
                    CentreName = x.Centre.Name,
                    UnitId = x.UnitId,
                    UnitCode = x.Unit?.Code ?? string.Empty,
                    UnitName = x.Unit?.Name ?? string.Empty,
                    IsActive = x.IsActive
                })
                .ToList()
        };
    }

    private static string NormalizeKey(string key)
    {
        return key.Trim().ToLowerInvariant();
    }

    private static string NormalizeScopeType(string scopeType)
    {
        var normalized = NormalizeKey(scopeType);
        if (!ConfigurationScopeTypes.All.Contains(normalized))
        {
            throw new ArgumentException($"Unsupported scope type '{scopeType}'.");
        }

        return normalized;
    }

    private static void ValidateCentreRequest(UpsertCentreRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CentreCode))
        {
            throw new ArgumentException("Centre code is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException("Centre display name is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.BrandName))
        {
            throw new ArgumentException("Centre brand name is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.BrandSubtitle))
        {
            throw new ArgumentException("Centre brand subtitle is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.BrandLogoUrl))
        {
            throw new ArgumentException("Centre brand logo URL is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.BrowserTitle))
        {
            throw new ArgumentException("Centre browser title is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.FaviconUrl))
        {
            throw new ArgumentException("Centre favicon URL is required.", nameof(request));
        }

        var normalizedThemeKey = request.ThemeKey.Trim().ToLowerInvariant();
        var allowedThemeKeys = new[] { "acutis", "harbor", "evergreen", "high_contrast" };
        if (!allowedThemeKeys.Contains(normalizedThemeKey, StringComparer.Ordinal))
        {
            throw new ArgumentException("Centre theme key must be one of: acutis, harbor, evergreen, high_contrast.", nameof(request));
        }
    }

    private static void ValidateUnitRequest(UpsertUnitRequest request)
    {
        if (request.CentreId == Guid.Empty)
        {
            throw new ArgumentException("Centre is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.UnitCode))
        {
            throw new ArgumentException("Unit code is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException("Display name is required.", nameof(request));
        }

        if (request.UnitCapacity < 0 || request.CurrentOccupancy < 0 || request.CapacityWarningThreshold < 0)
        {
            throw new ArgumentException("Unit capacity and occupancy values must be zero or greater.", nameof(request));
        }

        if (request.CurrentOccupancy > request.UnitCapacity)
        {
            throw new ArgumentException("Current occupancy cannot exceed unit capacity.", nameof(request));
        }

        if (request.DefaultResidentWeekNumber < 1 || request.DefaultResidentWeekNumber > 12)
        {
            throw new ArgumentException("Default resident week number must be between 1 and 12.", nameof(request));
        }
    }

    private static void ValidateProgrammeDefinitionRequest(UpsertProgrammeDefinitionRequest request)
    {
        if (request.CentreId == Guid.Empty)
        {
            throw new ArgumentException("Centre is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Programme code and name are required.", nameof(request));
        }

        if (request.TotalDurationValue <= 0)
        {
            throw new ArgumentException("Programme duration must be greater than zero.", nameof(request));
        }
    }

    private static void ValidateScheduleTemplateRequest(UpsertScheduleTemplateRequest request)
    {
        if (request.CentreId == Guid.Empty)
        {
            throw new ArgumentException("Centre is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Schedule template code and name are required.", nameof(request));
        }

        if (string.Equals(request.RecurrenceType?.Trim(), ScheduleRecurrenceType.Weekly.ToString(), StringComparison.OrdinalIgnoreCase)
            && (!request.WeeklyDayOfWeek.HasValue || request.WeeklyDayOfWeek < 0 || request.WeeklyDayOfWeek > 6))
        {
            throw new ArgumentException("Weekly schedules require a valid day of week.", nameof(request));
        }
    }

    private static void ValidateScheduleOccurrenceRequest(UpsertScheduleOccurrenceRequest request)
    {
        if (request.CentreId == Guid.Empty)
        {
            throw new ArgumentException("Centre is required.", nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Occurrence title is required.", nameof(request));
        }
    }

    private static void ValidatePermissionRequest(UpsertAppPermissionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Key) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Category))
        {
            throw new ArgumentException("Permission key, name, and category are required.", nameof(request));
        }
    }

    private static void ValidateRoleRequest(UpsertAppRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Key) || string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Role key and name are required.", nameof(request));
        }

        NormalizeScopeType(request.DefaultScopeType);
    }

    private static void ValidateUserRequest(UpsertAppUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ExternalSubject) ||
            string.IsNullOrWhiteSpace(request.UserName) ||
            string.IsNullOrWhiteSpace(request.DisplayName))
        {
            throw new ArgumentException("User subject, username, and display name are required.", nameof(request));
        }
    }

    private static ProgrammeDurationUnit ParseProgrammeDurationUnit(string value, string parameterName)
    {
        if (Enum.TryParse<ProgrammeDurationUnit>(value?.Trim(), true, out var parsed))
        {
            return parsed;
        }

        throw new ArgumentException($"Unsupported programme duration unit '{value}'.", parameterName);
    }

    private static ScheduleRecurrenceType ParseScheduleRecurrenceType(string value, string parameterName)
    {
        if (Enum.TryParse<ScheduleRecurrenceType>(value?.Trim(), true, out var parsed))
        {
            return parsed;
        }

        throw new ArgumentException($"Unsupported schedule recurrence type '{value}'.", parameterName);
    }

    private static ScheduleAudienceType ParseScheduleAudienceType(string value, string parameterName)
    {
        if (Enum.TryParse<ScheduleAudienceType>(value?.Trim(), true, out var parsed))
        {
            return parsed;
        }

        throw new ArgumentException($"Unsupported schedule audience type '{value}'.", parameterName);
    }

    private static ScheduleFacilitatorType ParseScheduleFacilitatorType(string value, string parameterName)
    {
        if (Enum.TryParse<ScheduleFacilitatorType>(value?.Trim(), true, out var parsed))
        {
            return parsed;
        }

        throw new ArgumentException($"Unsupported facilitator type '{value}'.", parameterName);
    }

    private static ScheduleOccurrenceStatus ParseScheduleOccurrenceStatus(string value, string parameterName)
    {
        if (Enum.TryParse<ScheduleOccurrenceStatus>(value?.Trim(), true, out var parsed))
        {
            return parsed;
        }

        throw new ArgumentException($"Unsupported schedule occurrence status '{value}'.", parameterName);
    }

    private static TimeSpan? ParseOptionalTime(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (TimeSpan.TryParse(value.Trim(), out var parsed))
        {
            return parsed;
        }

        throw new ArgumentException($"Unsupported time value '{value}'.", parameterName);
    }

    private static string? CleanOptional(string value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
