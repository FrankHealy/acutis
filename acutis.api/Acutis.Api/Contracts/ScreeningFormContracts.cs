using System.Text.Json;
using System.Text.Json.Serialization;

namespace Acutis.Api.Contracts;

public sealed class GetActiveFormResponse
{
    public required FormDefinitionDto Form { get; set; }
    public required List<OptionSetDto> OptionSets { get; set; }
    public required Dictionary<string, string> Translations { get; set; }
    public Guid? SubmissionId { get; set; }
    public required Dictionary<string, JsonElement> DraftAnswers { get; set; }
}

public sealed class FormDefinitionDto
{
    public required string Code { get; set; }
    public required int Version { get; set; }
    public required string Status { get; set; }
    public required string TitleKey { get; set; }
    public string? DescriptionKey { get; set; }
    public required JsonSchemaDto Schema { get; set; }
    public required UiLayoutDto Ui { get; set; }
    public required List<RuleDto> Rules { get; set; }
}

public sealed class JsonSchemaDto
{
    public required string Type { get; set; }
    public required Dictionary<string, JsonSchemaPropertyDto> Properties { get; set; }
    public required List<string> Required { get; set; }
}

public sealed class JsonSchemaPropertyDto
{
    public required string Type { get; set; }
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }
    public string? Pattern { get; set; }
    public decimal? Minimum { get; set; }
    public decimal? Maximum { get; set; }
    public string? OptionSetKey { get; set; }
    public string? Format { get; set; }
}

public sealed class UiLayoutDto
{
    public required List<UiSectionDto> Sections { get; set; }
    public required Dictionary<string, string> Widgets { get; set; }
    public required Dictionary<string, string> LabelKeys { get; set; }
    public required Dictionary<string, string> HelpKeys { get; set; }
}

public sealed class UiSectionDto
{
    public required string TitleKey { get; set; }
    public required List<string> Items { get; set; }
}

public sealed class RuleDto
{
    [JsonPropertyName("if")]
    public required RuleConditionDto If { get; set; }

    [JsonPropertyName("then")]
    public required RuleActionDto Then { get; set; }

    [JsonPropertyName("else")]
    public RuleActionDto? Else { get; set; }
}

public sealed class RuleConditionDto
{
    public required string Field { get; set; }

    [JsonPropertyName("equals")]
    public JsonElement EqualsValue { get; set; }
}

public sealed class RuleActionDto
{
    public List<string>? Show { get; set; }
    public List<string>? Hide { get; set; }
    public List<string>? Enable { get; set; }
    public List<string>? Disable { get; set; }
    public List<string>? Clear { get; set; }
}

public sealed class OptionSetDto
{
    public required string Key { get; set; }
    public required List<OptionItemDto> Items { get; set; }
}

public sealed class OptionItemDto
{
    public required string Code { get; set; }
    public required string LabelKey { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}

public sealed class SaveProgressRequest
{
    public required string FormCode { get; set; }
    public required int FormVersion { get; set; }
    public required string Locale { get; set; }
    public required string SubjectType { get; set; }
    public string? SubjectId { get; set; }
    public Guid? SubmissionId { get; set; }
    public required Dictionary<string, JsonElement> Answers { get; set; }
}

public sealed class SaveRequest
{
    public required string FormCode { get; set; }
    public required int FormVersion { get; set; }
    public required string Locale { get; set; }
    public required string SubjectType { get; set; }
    public string? SubjectId { get; set; }
    public Guid? SubmissionId { get; set; }
    public required Dictionary<string, JsonElement> Answers { get; set; }
}

public sealed class SaveProgressResponse
{
    public required Guid SubmissionId { get; set; }
    public required string Status { get; set; }
}

public sealed class SaveResponse
{
    public required Guid SubmissionId { get; set; }
    public required string Status { get; set; }
}

public sealed class ValidationErrorDto
{
    public required string FieldKey { get; set; }
    public required string Message { get; set; }
}

public sealed class SaveValidationProblem
{
    public required List<ValidationErrorDto> Errors { get; set; }
}
