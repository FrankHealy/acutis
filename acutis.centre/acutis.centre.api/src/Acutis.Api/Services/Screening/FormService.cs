using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public interface IFormService
{
    Task<FormDefinitionDto?> GetLatestPublishedAsync(string formCode, CancellationToken cancellationToken = default);
    Task<FormDefinition?> GetPublishedAsync(string formCode, int version, CancellationToken cancellationToken = default);
}

public sealed class FormService : IFormService
{
    private const string StatusDeleted = "deleted";
    private const string StatusDraft = "draft";
    private const string StatusActive = "active";
    private const string StatusPublished = "published";
    private const string CanonicalHseFormCode = "community_initial_assessment";
    private const string LegacyHseFormCode = "alcohol_screening_call";

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly AcutisDbContext _dbContext;

    public FormService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<FormDefinitionDto?> GetLatestPublishedAsync(string formCode, CancellationToken cancellationToken = default)
    {
        FormDefinition? definition = null;

        if (TryGetAliasSourceCode(formCode, out var sourceCode))
        {
            definition = await FindLatestPublishedEntityAsync(sourceCode, cancellationToken);
            definition ??= await FindLatestPublishedEntityAsync(LegacyHseFormCode, cancellationToken);
        }

        definition ??= await FindLatestPublishedEntityAsync(formCode, cancellationToken);

        return definition is null ? null : Map(definition, formCode);
    }

    public async Task<FormDefinition?> GetPublishedAsync(string formCode, int version, CancellationToken cancellationToken = default)
    {
        FormDefinition? definition = null;

        if (TryGetAliasSourceCode(formCode, out var sourceCode))
        {
            definition = await _dbContext.FormDefinitions
                .FirstOrDefaultAsync(
                    form => form.Code == sourceCode
                        && form.Version == version
                        && form.Status != StatusDeleted
                        && form.Status != StatusDraft,
                    cancellationToken);

            definition ??= await _dbContext.FormDefinitions
                .FirstOrDefaultAsync(
                    form => form.Code == LegacyHseFormCode
                        && form.Version == version
                        && form.Status != StatusDeleted
                        && form.Status != StatusDraft,
                    cancellationToken);
        }

        definition ??= await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(
                form => form.Code == formCode
                    && form.Version == version
                    && form.Status != StatusDeleted
                    && form.Status != StatusDraft,
                cancellationToken);

        return definition;
    }

    private async Task<FormDefinition?> FindLatestPublishedEntityAsync(string formCode, CancellationToken cancellationToken)
    {
        var active = await _dbContext.FormDefinitions
            .AsNoTracking()
            .Where(form => form.Code == formCode && form.Status == StatusActive)
            .OrderByDescending(form => form.Version)
            .FirstOrDefaultAsync(cancellationToken);

        var definition = active;
        if (definition is null)
        {
            definition = await _dbContext.FormDefinitions
                .AsNoTracking()
                .Where(form => form.Code == formCode && form.Status == StatusPublished)
                .OrderByDescending(form => form.Version)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return definition;
    }

    private static bool TryGetAliasSourceCode(string formCode, out string sourceCode)
    {
        sourceCode = string.Empty;
        if (string.IsNullOrWhiteSpace(formCode))
        {
            return false;
        }

        var normalized = formCode.Trim().ToLowerInvariant();
        if (normalized is "community_initial_assessment" or "admission_alcohol" or "admission_detox" or "admission_drugs" or "admission_ladies")
        {
            sourceCode = CanonicalHseFormCode;
            return true;
        }

        return false;
    }

    public static FormDefinitionDto Map(FormDefinition definition, string? codeOverride = null)
    {
        var schema = JsonSerializer.Deserialize<JsonSchemaDto>(definition.SchemaJson, JsonOptions) ?? new JsonSchemaDto
        {
            Type = "object",
            Properties = new Dictionary<string, JsonSchemaPropertyDto>(),
            Required = new List<string>()
        };

        var ui = JsonSerializer.Deserialize<UiLayoutDto>(definition.UiJson, JsonOptions) ?? new UiLayoutDto
        {
            Sections = new List<UiSectionDto>(),
            Widgets = new Dictionary<string, string>(),
            LabelKeys = new Dictionary<string, string>(),
            HelpKeys = new Dictionary<string, string>(),
            SelectOptions = new Dictionary<string, List<UiSelectOptionDto>>()
        };

        var rules = JsonSerializer.Deserialize<List<RuleDto>>(definition.RulesJson, JsonOptions) ?? new List<RuleDto>();

        return new FormDefinitionDto
        {
            Code = string.IsNullOrWhiteSpace(codeOverride) ? definition.Code : codeOverride,
            Version = definition.Version,
            Status = definition.Status,
            TitleKey = definition.TitleKey,
            DescriptionKey = definition.DescriptionKey,
            Schema = schema,
            Ui = ui,
            Rules = rules
        };
    }
}
