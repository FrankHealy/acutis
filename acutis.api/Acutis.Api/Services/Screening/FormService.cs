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

        return definition is null ? null : Map(definition);
    }

    public async Task<FormDefinition?> GetPublishedAsync(string formCode, int version, CancellationToken cancellationToken = default)
    {
        return await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(
                form => form.Code == formCode
                    && form.Version == version
                    && form.Status != StatusDeleted
                    && form.Status != StatusDraft,
                cancellationToken);
    }

    public static FormDefinitionDto Map(FormDefinition definition)
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
            Code = definition.Code,
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
