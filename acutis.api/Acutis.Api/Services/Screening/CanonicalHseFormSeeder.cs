using System.Text.Json;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public sealed class CanonicalHseFormSeeder
{
    private const string SeedDirectory = "SeedData/Forms/HseInitialAssessment";
    private const string CanonicalCode = "community_initial_assessment";
    private const string LegacyCode = "alcohol_screening_call";
    private const int CanonicalVersion = 1;
    private const int LegacyVersion = 6;
    private const string CanonicalStatus = "active";

    private static readonly Guid CanonicalId = Guid.Parse("8fc0426a-1a3c-41c1-b7a4-9867801efa8d");
    private static readonly Guid LegacyId = Guid.Parse("6d433f0d-7701-49db-adc4-71fb6557f6a6");
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly AcutisDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<CanonicalHseFormSeeder> _logger;

    public CanonicalHseFormSeeder(
        AcutisDbContext dbContext,
        IWebHostEnvironment environment,
        ILogger<CanonicalHseFormSeeder> logger)
    {
        _dbContext = dbContext;
        _environment = environment;
        _logger = logger;
    }

    public async Task EnsureSeededAsync(CancellationToken cancellationToken = default)
    {
        var seedRoot = Path.Combine(_environment.ContentRootPath, SeedDirectory);
        var meta = await ReadJsonAsync<FormSeedMetadata>(seedRoot, "meta.json", cancellationToken);
        var schemaJson = await ReadTextAsync(seedRoot, "schema.json", cancellationToken);
        var uiJson = await ReadTextAsync(seedRoot, "ui.json", cancellationToken);
        var rulesJson = await ReadTextAsync(seedRoot, "rules.json", cancellationToken);

        var titleKey = string.IsNullOrWhiteSpace(meta.TitleKey)
            ? "Initial Assessment and Service User Consent Form"
            : meta.TitleKey;
        var descriptionKey = string.IsNullOrWhiteSpace(meta.DescriptionKey)
            ? "HSE Addiction and Primary Homeless Services bounded initial assessment."
            : meta.DescriptionKey;

        await UpsertFormDefinitionAsync(
            CanonicalId,
            CanonicalCode,
            CanonicalVersion,
            CanonicalStatus,
            new DateTime(2026, 6, 18, 19, 45, 0, DateTimeKind.Utc),
            titleKey,
            descriptionKey,
            schemaJson,
            uiJson,
            rulesJson,
            cancellationToken);

        await UpsertFormDefinitionAsync(
            LegacyId,
            LegacyCode,
            LegacyVersion,
            CanonicalStatus,
            new DateTime(2026, 6, 18, 19, 15, 0, DateTimeKind.Utc),
            titleKey,
            descriptionKey,
            schemaJson,
            uiJson,
            rulesJson,
            cancellationToken);

        await _dbContext.FormDefinitions
            .Where(form => form.Code == CanonicalCode && form.Version != CanonicalVersion && form.Status == CanonicalStatus)
            .ExecuteUpdateAsync(updates => updates.SetProperty(form => form.Status, "published"), cancellationToken);

        await _dbContext.FormDefinitions
            .Where(form => form.Code == LegacyCode && form.Version != LegacyVersion && form.Status == CanonicalStatus)
            .ExecuteUpdateAsync(updates => updates.SetProperty(form => form.Status, "published"), cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Canonical HSE assessment form is seeded as {Code} v{Version} and legacy alias {LegacyCode} v{LegacyVersion}.", CanonicalCode, CanonicalVersion, LegacyCode, LegacyVersion);
    }

    private async Task UpsertFormDefinitionAsync(
        Guid id,
        string code,
        int version,
        string status,
        DateTime createdAt,
        string titleKey,
        string descriptionKey,
        string schemaJson,
        string uiJson,
        string rulesJson,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(
                form => form.Code == code && form.Version == version,
                cancellationToken);

        existing ??= await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(form => form.Id == id, cancellationToken);

        if (existing is null)
        {
            _dbContext.FormDefinitions.Add(new FormDefinition
            {
                Id = id,
                Code = code,
                Version = version,
                Status = status,
                TitleKey = titleKey,
                DescriptionKey = descriptionKey,
                SchemaJson = schemaJson,
                UiJson = uiJson,
                RulesJson = rulesJson,
                CreatedAt = createdAt
            });
        }
        else
        {
            existing.Status = status;
            existing.TitleKey = titleKey;
            existing.DescriptionKey = descriptionKey;
            existing.SchemaJson = schemaJson;
            existing.UiJson = uiJson;
            existing.RulesJson = rulesJson;
        }
    }

    private static async Task<T> ReadJsonAsync<T>(string seedRoot, string fileName, CancellationToken cancellationToken)
    {
        var json = await ReadTextAsync(seedRoot, fileName, cancellationToken);
        return JsonSerializer.Deserialize<T>(json, JsonOptions)
            ?? throw new InvalidOperationException($"Seed file '{fileName}' did not contain valid JSON.");
    }

    private static async Task<string> ReadTextAsync(string seedRoot, string fileName, CancellationToken cancellationToken)
    {
        var path = Path.Combine(seedRoot, fileName);
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Required HSE form seed file was not found: {path}", path);
        }

        return await File.ReadAllTextAsync(path, cancellationToken);
    }

    private sealed record FormSeedMetadata(
        string Code,
        int Version,
        string Status,
        string TitleKey,
        string? DescriptionKey);
}
