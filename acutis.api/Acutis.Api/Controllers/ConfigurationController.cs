using Acutis.Api.Contracts;
using Acutis.Api.Services.Forms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/configuration")]
[Authorize]
public sealed class ConfigurationController : ControllerBase
{
    private const string AlcoholScreeningFormCode = "alcohol_screening_call";
    private const string AdmissionFormPrefix = "admission_";
    private const string SurveyFormPrefix = "survey_";

    private readonly IFormConfigurationService _formConfigurationService;

    public ConfigurationController(IFormConfigurationService formConfigurationService)
    {
        _formConfigurationService = formConfigurationService;
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
