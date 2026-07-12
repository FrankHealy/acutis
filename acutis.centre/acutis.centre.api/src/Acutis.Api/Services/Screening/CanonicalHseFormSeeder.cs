using System.Text.Json;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public sealed class CanonicalHseFormSeeder
{
    private const string SeedDirectory = "SeedData/Forms/HseInitialAssessment";
    private const string ExtendedSeedDirectory = "SeedData/Forms/HseExtendedAssessment";
    private const string CarePlan1SeedDirectory = "SeedData/Forms/CarePlan1";
    private const string CarePlan2SeedDirectory = "SeedData/Forms/CarePlan2";
    private const string CanonicalCode = "community_initial_assessment";
    private const string ExtendedCode = "hse_extended_assessment";
    private const string CarePlan1Code = "care_plan_1";
    private const string CarePlan2Code = "care_plan_2";
    private const string LegacyCode = "alcohol_screening_call";
    private const int CanonicalVersion = 1;
    private const int ExtendedVersion = 1;
    private const int LegacyVersion = 6;
    private const string CanonicalStatus = "active";

    private static readonly Guid CanonicalId = Guid.Parse("8fc0426a-1a3c-41c1-b7a4-9867801efa8d");
    private static readonly Guid ExtendedId = Guid.Parse("0936ac8c-e0d3-47ce-92b7-2ddcf7f0f42a");
    private static readonly Guid CarePlan1Id = Guid.Parse("ae2fe179-2f7d-4b1a-a0c3-6ddcd61a5895");
    private static readonly Guid CarePlan2Id = Guid.Parse("a6cd92f7-73a6-49f7-97de-3bbf21c1ab87");
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
            ? "Internal Admissions Form"
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

        await SeedStandaloneFormAsync(
            ExtendedSeedDirectory,
            ExtendedId,
            ExtendedCode,
            new DateTime(2026, 7, 4, 12, 0, 0, DateTimeKind.Utc),
            cancellationToken);

        await SeedStandaloneFormAsync(
            CarePlan1SeedDirectory,
            CarePlan1Id,
            CarePlan1Code,
            new DateTime(2026, 7, 4, 13, 0, 0, DateTimeKind.Utc),
            cancellationToken);

        await SeedStandaloneFormAsync(
            CarePlan2SeedDirectory,
            CarePlan2Id,
            CarePlan2Code,
            new DateTime(2026, 7, 4, 13, 15, 0, DateTimeKind.Utc),
            cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Canonical HSE assessment form is seeded as {Code} v{Version}, extended form {ExtendedCode} v{ExtendedVersion}, and legacy alias {LegacyCode} v{LegacyVersion}.", CanonicalCode, CanonicalVersion, ExtendedCode, ExtendedVersion, LegacyCode, LegacyVersion);
    }

    private async Task SeedStandaloneFormAsync(
        string seedDirectory,
        Guid id,
        string expectedCode,
        DateTime createdAt,
        CancellationToken cancellationToken)
    {
        var seedRoot = Path.Combine(_environment.ContentRootPath, seedDirectory);
        var meta = await ReadJsonAsync<FormSeedMetadata>(seedRoot, "meta.json", cancellationToken);
        var schemaJson = await ReadTextAsync(seedRoot, "schema.json", cancellationToken);
        var uiJson = await ReadTextAsync(seedRoot, "ui.json", cancellationToken);
        var rulesJson = await ReadTextAsync(seedRoot, "rules.json", cancellationToken);
        var code = string.IsNullOrWhiteSpace(meta.Code) ? expectedCode : meta.Code;

        await UpsertFormDefinitionAsync(
            id,
            code,
            meta.Version,
            string.IsNullOrWhiteSpace(meta.Status) ? CanonicalStatus : meta.Status,
            createdAt,
            meta.TitleKey,
            meta.DescriptionKey ?? string.Empty,
            schemaJson,
            uiJson,
            rulesJson,
            cancellationToken);

        await _dbContext.FormDefinitions
            .Where(form => form.Code == code && form.Version != meta.Version && form.Status == CanonicalStatus)
            .ExecuteUpdateAsync(updates => updates.SetProperty(form => form.Status, "published"), cancellationToken);
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
                CreatedAt = createdAt,
                ActiveFrom = createdAt
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
            if (existing.ActiveFrom == default)
            {
                existing.ActiveFrom = existing.CreatedAt == default ? createdAt : existing.CreatedAt;
            }
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
