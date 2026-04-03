using Acutis.Api.Contracts;
using Acutis.Api.Security;
using Acutis.Api.Services.Configuration;
using Acutis.Api.Services.Forms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/configuration")]
[Authorize(Policy = ApplicationPolicies.ConfigurationManage)]
public sealed class ConfigurationController : ControllerBase
{
    private const string AlcoholScreeningFormCode = "alcohol_screening_call";
    private const string AdmissionFormPrefix = "admission_";
    private const string SurveyFormPrefix = "survey_";

    private readonly IFormConfigurationService _formConfigurationService;
    private readonly IElementLibraryService _elementLibraryService;
    private readonly IGlobalConfigurationService _globalConfigurationService;

    public ConfigurationController(
        IFormConfigurationService formConfigurationService,
        IElementLibraryService elementLibraryService,
        IGlobalConfigurationService globalConfigurationService)
    {
        _formConfigurationService = formConfigurationService;
        _elementLibraryService = elementLibraryService;
        _globalConfigurationService = globalConfigurationService;
    }

    [HttpPost("CreateAlcoholScreeningForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> CreateAlcoholScreeningForm(
        [FromBody] CreateAlcoholScreeningFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.CreateVersionAsync(
                AlcoholScreeningFormCode,
                request.Form,
                cancellationToken));
    }

    [HttpPost("SaveAsDraftAlcoholScreeningForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> SaveAsDraftAlcoholScreeningForm(
        [FromBody] CreateAlcoholScreeningFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.CreateVersionAsync(
                AlcoholScreeningFormCode,
                ToDraftRequest(request.Form),
                cancellationToken));
    }

    [HttpPost("EditAlcoholScreeningForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> EditAlcoholScreeningForm(
        [FromBody] EditAlcoholScreeningFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.EditVersionAsync(
                AlcoholScreeningFormCode,
                request.SourceVersion,
                request.Form,
                cancellationToken));
    }

    [HttpPost("EditAsDraftAlcoholScreeningForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> EditAsDraftAlcoholScreeningForm(
        [FromBody] EditAlcoholScreeningFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.EditVersionAsync(
                AlcoholScreeningFormCode,
                request.SourceVersion,
                ToDraftRequest(request.Form),
                cancellationToken));
    }

    [HttpDelete("DeleteAlcoholScreeningForm/{version:int}")]
    public async Task<IActionResult> DeleteAlcoholScreeningForm(int version, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _formConfigurationService.SoftDeleteVersionAsync(AlcoholScreeningFormCode, version, cancellationToken);
            return NoContent();
        });
    }

    [HttpPost("CreateAdmissionForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> CreateAdmissionForm(
        [FromBody] CreateAdmissionFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.CreateVersionAsync(
                NormalizeAdmissionCode(request.FormCode),
                request.Form,
                cancellationToken));
    }

    [HttpPost("SaveAsDraftAdmissionForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> SaveAsDraftAdmissionForm(
        [FromBody] CreateAdmissionFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.CreateVersionAsync(
                NormalizeAdmissionCode(request.FormCode),
                ToDraftRequest(request.Form),
                cancellationToken));
    }

    [HttpPost("EditAdmissionForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> EditAdmissionForm(
        [FromBody] EditAdmissionFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.EditVersionAsync(
                NormalizeAdmissionCode(request.FormCode),
                request.SourceVersion,
                request.Form,
                cancellationToken));
    }

    [HttpPost("EditAsDraftAdmissionForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> EditAsDraftAdmissionForm(
        [FromBody] EditAdmissionFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.EditVersionAsync(
                NormalizeAdmissionCode(request.FormCode),
                request.SourceVersion,
                ToDraftRequest(request.Form),
                cancellationToken));
    }

    [HttpDelete("DeleteAdmissionForm/{formCode}/{version:int}")]
    public async Task<IActionResult> DeleteAdmissionForm(
        string formCode,
        int version,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _formConfigurationService.SoftDeleteVersionAsync(
                NormalizeAdmissionCode(formCode),
                version,
                cancellationToken);
            return NoContent();
        });
    }

    [HttpPost("CreateSurveyForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> CreateSurveyForm(
        [FromBody] CreateSurveyFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.CreateVersionAsync(
                NormalizeSurveyCode(request.SurveyCode),
                request.Form,
                cancellationToken));
    }

    [HttpPost("SaveAsDraftSurveyForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> SaveAsDraftSurveyForm(
        [FromBody] CreateSurveyFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.CreateVersionAsync(
                NormalizeSurveyCode(request.SurveyCode),
                ToDraftRequest(request.Form),
                cancellationToken));
    }

    [HttpPost("EditSurveyForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> EditSurveyForm(
        [FromBody] EditSurveyFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.EditVersionAsync(
                NormalizeSurveyCode(request.SurveyCode),
                request.SourceVersion,
                request.Form,
                cancellationToken));
    }

    [HttpPost("EditAsDraftSurveyForm")]
    public async Task<ActionResult<FormConfigurationVersionDto>> EditAsDraftSurveyForm(
        [FromBody] EditSurveyFormRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.EditVersionAsync(
                NormalizeSurveyCode(request.SurveyCode),
                request.SourceVersion,
                ToDraftRequest(request.Form),
                cancellationToken));
    }

    [HttpDelete("DeleteSurveyForm/{surveyCode}/{version:int}")]
    public async Task<IActionResult> DeleteSurveyForm(
        string surveyCode,
        int version,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _formConfigurationService.SoftDeleteVersionAsync(
                NormalizeSurveyCode(surveyCode),
                version,
                cancellationToken);
            return NoContent();
        });
    }

    [HttpPost("forms/{formCode}/activate/{version:int}")]
    public async Task<ActionResult<FormConfigurationVersionDto>> ActivateFormVersion(
        string formCode,
        int version,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.ActivateVersionAsync(formCode, version, cancellationToken));
    }

    [HttpGet("forms/{formCode}/versions")]
    public async Task<ActionResult<IReadOnlyList<FormConfigurationVersionDto>>> GetFormVersions(
        string formCode,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _formConfigurationService.GetVersionsAsync(formCode, cancellationToken));
    }

    [HttpGet("elements-library")]
    public async Task<ActionResult<ElementLibraryResponseDto>> GetElementsLibrary(CancellationToken cancellationToken = default)
    {
        return Ok(await _elementLibraryService.GetLibraryAsync(cancellationToken));
    }

    [HttpGet("units")]
    public async Task<ActionResult<IReadOnlyList<UnitConfigurationDto>>> GetUnits(
        [FromQuery] bool includeInactive = true,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetUnitsAsync(includeInactive, cancellationToken));
    }

    [HttpGet("centres")]
    public async Task<ActionResult<IReadOnlyList<CentreConfigurationDto>>> GetCentres(
        [FromQuery] bool includeInactive = true,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetCentresAsync(includeInactive, cancellationToken));
    }

    [HttpPost("centres")]
    public async Task<ActionResult<CentreConfigurationDto>> CreateCentre(
        [FromBody] UpsertCentreRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateCentreAsync(request, cancellationToken));
    }

    [HttpPut("centres/{centreId:guid}")]
    public async Task<ActionResult<CentreConfigurationDto>> UpdateCentre(
        Guid centreId,
        [FromBody] UpsertCentreRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateCentreAsync(centreId, request, cancellationToken));
    }

    [HttpDelete("centres/{centreId:guid}")]
    public async Task<IActionResult> ArchiveCentre(Guid centreId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchiveCentreAsync(centreId, cancellationToken);
            return NoContent();
        });
    }

    [HttpPost("units")]
    public async Task<ActionResult<UnitConfigurationDto>> CreateUnit(
        [FromBody] UpsertUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateUnitAsync(request, cancellationToken));
    }

    [HttpPut("units/{unitId:guid}")]
    public async Task<ActionResult<UnitConfigurationDto>> UpdateUnit(
        Guid unitId,
        [FromBody] UpsertUnitRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateUnitAsync(unitId, request, cancellationToken));
    }

    [HttpDelete("units/{unitId:guid}")]
    public async Task<IActionResult> ArchiveUnit(Guid unitId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchiveUnitAsync(unitId, cancellationToken);
            return NoContent();
        });
    }

    [HttpGet("programmes")]
    public async Task<ActionResult<IReadOnlyList<ProgrammeDefinitionDto>>> GetProgrammeDefinitions(
        [FromQuery] bool includeInactive = true,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetProgrammeDefinitionsAsync(includeInactive, cancellationToken));
    }

    [HttpPost("programmes")]
    public async Task<ActionResult<ProgrammeDefinitionDto>> CreateProgrammeDefinition(
        [FromBody] UpsertProgrammeDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateProgrammeDefinitionAsync(request, cancellationToken));
    }

    [HttpPut("programmes/{programmeDefinitionId:guid}")]
    public async Task<ActionResult<ProgrammeDefinitionDto>> UpdateProgrammeDefinition(
        Guid programmeDefinitionId,
        [FromBody] UpsertProgrammeDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateProgrammeDefinitionAsync(programmeDefinitionId, request, cancellationToken));
    }

    [HttpDelete("programmes/{programmeDefinitionId:guid}")]
    public async Task<IActionResult> ArchiveProgrammeDefinition(Guid programmeDefinitionId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchiveProgrammeDefinitionAsync(programmeDefinitionId, cancellationToken);
            return NoContent();
        });
    }

    [HttpGet("schedule-templates")]
    public async Task<ActionResult<IReadOnlyList<ScheduleTemplateDto>>> GetScheduleTemplates(
        [FromQuery] bool includeInactive = true,
        CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetScheduleTemplatesAsync(includeInactive, cancellationToken));
    }

    [HttpPost("schedule-templates")]
    public async Task<ActionResult<ScheduleTemplateDto>> CreateScheduleTemplate(
        [FromBody] UpsertScheduleTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateScheduleTemplateAsync(request, cancellationToken));
    }

    [HttpPut("schedule-templates/{scheduleTemplateId:guid}")]
    public async Task<ActionResult<ScheduleTemplateDto>> UpdateScheduleTemplate(
        Guid scheduleTemplateId,
        [FromBody] UpsertScheduleTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateScheduleTemplateAsync(scheduleTemplateId, request, cancellationToken));
    }

    [HttpDelete("schedule-templates/{scheduleTemplateId:guid}")]
    public async Task<IActionResult> ArchiveScheduleTemplate(Guid scheduleTemplateId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchiveScheduleTemplateAsync(scheduleTemplateId, cancellationToken);
            return NoContent();
        });
    }

    [HttpGet("schedule-occurrences")]
    public async Task<ActionResult<IReadOnlyList<ScheduleOccurrenceDto>>> GetScheduleOccurrences(CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetScheduleOccurrencesAsync(cancellationToken));
    }

    [HttpPost("schedule-occurrences")]
    public async Task<ActionResult<ScheduleOccurrenceDto>> CreateScheduleOccurrence(
        [FromBody] UpsertScheduleOccurrenceRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateScheduleOccurrenceAsync(request, cancellationToken));
    }

    [HttpPut("schedule-occurrences/{scheduleOccurrenceId:guid}")]
    public async Task<ActionResult<ScheduleOccurrenceDto>> UpdateScheduleOccurrence(
        Guid scheduleOccurrenceId,
        [FromBody] UpsertScheduleOccurrenceRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateScheduleOccurrenceAsync(scheduleOccurrenceId, request, cancellationToken));
    }

    [HttpDelete("schedule-occurrences/{scheduleOccurrenceId:guid}")]
    public async Task<IActionResult> ArchiveScheduleOccurrence(Guid scheduleOccurrenceId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchiveScheduleOccurrenceAsync(scheduleOccurrenceId, cancellationToken);
            return NoContent();
        });
    }

    [HttpGet("permissions")]
    public async Task<ActionResult<IReadOnlyList<AppPermissionDto>>> GetPermissions(CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetPermissionsAsync(cancellationToken));
    }

    [HttpPost("permissions")]
    public async Task<ActionResult<AppPermissionDto>> CreatePermission(
        [FromBody] UpsertAppPermissionRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreatePermissionAsync(request, cancellationToken));
    }

    [HttpPut("permissions/{permissionId:guid}")]
    public async Task<ActionResult<AppPermissionDto>> UpdatePermission(
        Guid permissionId,
        [FromBody] UpsertAppPermissionRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _globalConfigurationService.UpdatePermissionAsync(permissionId, request, cancellationToken));
    }

    [HttpDelete("permissions/{permissionId:guid}")]
    public async Task<IActionResult> ArchivePermission(Guid permissionId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchivePermissionAsync(permissionId, cancellationToken);
            return NoContent();
        });
    }

    [HttpGet("roles")]
    public async Task<ActionResult<IReadOnlyList<AppRoleDto>>> GetRoles(CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetRolesAsync(cancellationToken));
    }

    [HttpPost("roles")]
    public async Task<ActionResult<AppRoleDto>> CreateRole(
        [FromBody] UpsertAppRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateRoleAsync(request, cancellationToken));
    }

    [HttpPut("roles/{roleId:guid}")]
    public async Task<ActionResult<AppRoleDto>> UpdateRole(
        Guid roleId,
        [FromBody] UpsertAppRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateRoleAsync(roleId, request, cancellationToken));
    }

    [HttpDelete("roles/{roleId:guid}")]
    public async Task<IActionResult> ArchiveRole(Guid roleId, CancellationToken cancellationToken = default)
    {
        return await ExecuteNonQuery(async () =>
        {
            await _globalConfigurationService.ArchiveRoleAsync(roleId, cancellationToken);
            return NoContent();
        });
    }

    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<AppUserDto>>> GetUsers(CancellationToken cancellationToken = default)
    {
        return Ok(await _globalConfigurationService.GetUsersAsync(cancellationToken));
    }

    [HttpPost("users")]
    public async Task<ActionResult<AppUserDto>> CreateUser(
        [FromBody] UpsertAppUserRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.CreateUserAsync(request, cancellationToken));
    }

    [HttpPut("users/{userId:guid}")]
    public async Task<ActionResult<AppUserDto>> UpdateUser(
        Guid userId,
        [FromBody] UpsertAppUserRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () => await _globalConfigurationService.UpdateUserAsync(userId, request, cancellationToken));
    }

    [HttpPut("users/{userId:guid}/assignments")]
    public async Task<ActionResult<IReadOnlyList<AppUserRoleAssignmentDto>>> ReplaceUserAssignments(
        Guid userId,
        [FromBody] ReplaceUserRoleAssignmentsRequest request,
        CancellationToken cancellationToken = default)
    {
        return await Execute(async () =>
            await _globalConfigurationService.ReplaceUserAssignmentsAsync(userId, request, cancellationToken));
    }

    private async Task<ActionResult<T>> Execute<T>(Func<Task<T>> action)
    {
        try
        {
            return Ok(await action());
        }
        catch (ArgumentException exception)
        {
            return new BadRequestObjectResult(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return new NotFoundObjectResult(exception.Message);
        }
    }

    private async Task<IActionResult> ExecuteNonQuery(Func<Task<IActionResult>> action)
    {
        try
        {
            return await action();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
    }

    private static string NormalizeAdmissionCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Admission form code is required.", nameof(code));
        }

        var normalized = code.Trim().ToLowerInvariant();
        return normalized.StartsWith(AdmissionFormPrefix, StringComparison.Ordinal)
            ? normalized
            : $"{AdmissionFormPrefix}{normalized}";
    }

    private static string NormalizeSurveyCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Survey code is required.", nameof(code));
        }

        var normalized = code.Trim().ToLowerInvariant();
        return normalized.StartsWith(SurveyFormPrefix, StringComparison.Ordinal)
            ? normalized
            : $"{SurveyFormPrefix}{normalized}";
    }

    private static UpsertFormDefinitionRequest ToDraftRequest(UpsertFormDefinitionRequest request)
    {
        return new UpsertFormDefinitionRequest
        {
            TitleKey = request.TitleKey,
            DescriptionKey = request.DescriptionKey,
            SchemaJson = request.SchemaJson,
            UiJson = request.UiJson,
            RulesJson = request.RulesJson,
            MakeActive = false
        };
    }
}
