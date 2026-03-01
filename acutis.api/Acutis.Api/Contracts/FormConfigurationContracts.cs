namespace Acutis.Api.Contracts;

public sealed class UpsertFormDefinitionRequest
{
    public required string TitleKey { get; set; }
    public string? DescriptionKey { get; set; }
    public required string SchemaJson { get; set; }
    public required string UiJson { get; set; }
    public required string RulesJson { get; set; }
    public bool MakeActive { get; set; } = true;
}

public sealed class CreateAlcoholScreeningFormRequest
{
    public required UpsertFormDefinitionRequest Form { get; set; }
}

public sealed class EditAlcoholScreeningFormRequest
{
    public required int SourceVersion { get; set; }
    public required UpsertFormDefinitionRequest Form { get; set; }
}

public sealed class CreateAdmissionFormRequest
{
    public required string FormCode { get; set; }
    public required UpsertFormDefinitionRequest Form { get; set; }
}

public sealed class EditAdmissionFormRequest
{
    public required string FormCode { get; set; }
    public required int SourceVersion { get; set; }
    public required UpsertFormDefinitionRequest Form { get; set; }
}

public sealed class CreateSurveyFormRequest
{
    public required string SurveyCode { get; set; }
    public required UpsertFormDefinitionRequest Form { get; set; }
}

public sealed class EditSurveyFormRequest
{
    public required string SurveyCode { get; set; }
    public required int SourceVersion { get; set; }
    public required UpsertFormDefinitionRequest Form { get; set; }
}

public sealed class FormConfigurationVersionDto
{
    public required string Code { get; set; }
    public required int Version { get; set; }
    public required string Status { get; set; }
    public required string TitleKey { get; set; }
    public string? DescriptionKey { get; set; }
    public required DateTime CreatedAt { get; set; }
}
