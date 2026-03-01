using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Api.Services.Screening;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Acutis.Api.Controllers;

[ApiController]
[Route("api/screening")]
[Authorize]
public sealed class ScreeningController : ControllerBase
{
    private const string DefaultFormCode = "alcohol_screening_call";
    private const string DefaultSubjectType = "anonymous_call";

    private readonly IFormService _formService;
    private readonly IOptionService _optionService;
    private readonly ITranslationService _translationService;
    private readonly ISubmissionService _submissionService;
    private readonly IFormValidationService _validationService;
    private readonly IScreeningControlService _screeningControlService;

    public ScreeningController(
        IFormService formService,
        IOptionService optionService,
        ITranslationService translationService,
        ISubmissionService submissionService,
        IFormValidationService validationService,
        IScreeningControlService screeningControlService)
    {
        _formService = formService;
        _optionService = optionService;
        _translationService = translationService;
        _submissionService = submissionService;
        _validationService = validationService;
        _screeningControlService = screeningControlService;
    }

    [HttpGet("control")]
    public async Task<ActionResult<ScreeningControlDto>> GetControl(
        [FromQuery] string unitCode = "alcohol",
        CancellationToken cancellationToken = default)
    {
        var control = await _screeningControlService.GetByUnitCodeAsync(unitCode, cancellationToken);
        if (control is null)
        {
            return NotFound($"No screening control found for unit '{unitCode}'.");
        }

        return Ok(control);
    }

    [HttpGet("GetActiveForm")]
    public async Task<ActionResult<GetActiveFormResponse>> GetActiveForm(
        [FromQuery] string locale = "en-IE",
        [FromQuery] string subjectType = DefaultSubjectType,
        [FromQuery] string? subjectId = null,
        [FromQuery] string formCode = DefaultFormCode,
        CancellationToken cancellationToken = default)
    {
        var form = await _formService.GetLatestPublishedAsync(formCode, cancellationToken);
        if (form is null)
        {
            return NotFound($"No published form found for code '{formCode}'.");
        }

        var optionSetKeys = form.Schema.Properties.Values
            .Where(property => !string.IsNullOrWhiteSpace(property.OptionSetKey))
            .Select(property => property.OptionSetKey!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var optionSets = await _optionService.GetOptionSetsAsync(optionSetKeys, cancellationToken);

        var translationKeys = CollectTranslationKeys(form, optionSets);
        var translations = await _translationService.ResolveAsync(locale, translationKeys, cancellationToken);

        var draftSubmission = await _submissionService.FindInProgressAsync(
            form.Code,
            form.Version,
            subjectType,
            subjectId,
            cancellationToken);

        var draftAnswers = ParseAnswers(draftSubmission?.AnswersJson);

        return Ok(new GetActiveFormResponse
        {
            Form = form,
            OptionSets = optionSets,
            Translations = translations,
            SubmissionId = draftSubmission?.Id,
            DraftAnswers = draftAnswers
        });
    }

    [HttpPost("SaveProgress")]
    public async Task<ActionResult<SaveProgressResponse>> SaveProgress(
        [FromBody] SaveProgressRequest request,
        CancellationToken cancellationToken = default)
    {
        var definition = await _formService.GetPublishedAsync(request.FormCode, request.FormVersion, cancellationToken);
        if (definition is null)
        {
            return NotFound($"Published form '{request.FormCode}' version '{request.FormVersion}' was not found.");
        }

        var form = FormService.Map(definition);
        var validationErrors = _validationService.ValidateBasic(form.Schema, request.Answers);
        if (validationErrors.Count > 0)
        {
            return BadRequest(new SaveValidationProblem { Errors = validationErrors });
        }

        var submission = await _submissionService.UpsertProgressAsync(request, cancellationToken);
        return Ok(new SaveProgressResponse
        {
            SubmissionId = submission.Id,
            Status = submission.Status
        });
    }

    [HttpPost("Save")]
    public async Task<ActionResult<SaveResponse>> Save(
        [FromBody] SaveRequest request,
        CancellationToken cancellationToken = default)
    {
        var definition = await _formService.GetPublishedAsync(request.FormCode, request.FormVersion, cancellationToken);
        if (definition is null)
        {
            return NotFound($"Published form '{request.FormCode}' version '{request.FormVersion}' was not found.");
        }

        var form = FormService.Map(definition);
        var validationErrors = _validationService.ValidateStrict(form.Schema, request.Answers);
        validationErrors.AddRange(await ValidateOptionSetValuesAsync(form, request.Answers, cancellationToken));

        if (validationErrors.Count > 0)
        {
            return BadRequest(new SaveValidationProblem { Errors = validationErrors });
        }

        var submission = await _submissionService.SaveSubmittedAsync(request, cancellationToken);
        return Ok(new SaveResponse
        {
            SubmissionId = submission.Id,
            Status = submission.Status
        });
    }

    private static List<string> CollectTranslationKeys(FormDefinitionDto form, IEnumerable<OptionSetDto> optionSets)
    {
        var keys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            form.TitleKey
        };

        if (!string.IsNullOrWhiteSpace(form.DescriptionKey))
        {
            keys.Add(form.DescriptionKey);
        }

        foreach (var section in form.Ui.Sections)
        {
            keys.Add(section.TitleKey);
        }

        foreach (var labelKey in form.Ui.LabelKeys.Values)
        {
            keys.Add(labelKey);
        }

        foreach (var helpKey in form.Ui.HelpKeys.Values)
        {
            keys.Add(helpKey);
        }

        foreach (var labelKey in optionSets.SelectMany(set => set.Items).Select(item => item.LabelKey))
        {
            keys.Add(labelKey);
        }

        return keys.ToList();
    }

    private static Dictionary<string, JsonElement> ParseAnswers(string? answersJson)
    {
        if (string.IsNullOrWhiteSpace(answersJson))
        {
            return new Dictionary<string, JsonElement>();
        }

        return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(answersJson) ?? new Dictionary<string, JsonElement>();
    }

    private async Task<List<ValidationErrorDto>> ValidateOptionSetValuesAsync(
        FormDefinitionDto form,
        Dictionary<string, JsonElement> answers,
        CancellationToken cancellationToken)
    {
        var errors = new List<ValidationErrorDto>();
        var fieldOptionSetMap = form.Schema.Properties
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Value.OptionSetKey))
            .ToDictionary(pair => pair.Key, pair => pair.Value.OptionSetKey!, StringComparer.OrdinalIgnoreCase);

        if (fieldOptionSetMap.Count == 0)
        {
            return errors;
        }

        var optionSets = await _optionService.GetOptionSetsAsync(fieldOptionSetMap.Values, cancellationToken);
        var codeLookup = optionSets.ToDictionary(
            set => set.Key,
            set => set.Items.Where(item => item.IsActive).Select(item => item.Code).ToHashSet(StringComparer.OrdinalIgnoreCase),
            StringComparer.OrdinalIgnoreCase);

        foreach (var (fieldKey, optionSetKey) in fieldOptionSetMap)
        {
            if (!answers.TryGetValue(fieldKey, out var value) || value.ValueKind == JsonValueKind.Null)
            {
                continue;
            }

            if (!codeLookup.TryGetValue(optionSetKey, out var validCodes))
            {
                continue;
            }

            if (value.ValueKind == JsonValueKind.String)
            {
                var selectedCode = value.GetString();
                if (!string.IsNullOrWhiteSpace(selectedCode) && !validCodes.Contains(selectedCode))
                {
                    errors.Add(new ValidationErrorDto
                    {
                        FieldKey = fieldKey,
                        Message = $"Invalid option code '{selectedCode}'."
                    });
                }
            }
            else if (value.ValueKind == JsonValueKind.Array)
            {
                foreach (var element in value.EnumerateArray())
                {
                    var selectedCode = element.GetString();
                    if (!string.IsNullOrWhiteSpace(selectedCode) && !validCodes.Contains(selectedCode))
                    {
                        errors.Add(new ValidationErrorDto
                        {
                            FieldKey = fieldKey,
                            Message = $"Invalid option code '{selectedCode}'."
                        });
                    }
                }
            }
        }

        return errors;
    }
}
