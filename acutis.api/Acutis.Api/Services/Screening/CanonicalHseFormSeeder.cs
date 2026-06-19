using System.Text.Json;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Screening;

public sealed class CanonicalHseFormSeeder
{
    private const string SeedDirectory = "SeedData/Forms/HseInitialAssessment";
    private const string CanonicalCode = "community_initial_assessment";
    private const int CanonicalVersion = 1;
    private const string CanonicalStatus = "active";

    private static readonly Guid CanonicalId = Guid.Parse("8fc0426a-1a3c-41c1-b7a4-9867801efa8d");
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

        var existing = await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(
                form => form.Code == CanonicalCode && form.Version == CanonicalVersion,
                cancellationToken);

        if (existing is null)
        {
            _dbContext.FormDefinitions.Add(new FormDefinition
            {
                Id = CanonicalId,
                Code = CanonicalCode,
                Version = CanonicalVersion,
                Status = CanonicalStatus,
                TitleKey = titleKey,
                DescriptionKey = descriptionKey,
                SchemaJson = schemaJson,
                UiJson = uiJson,
                RulesJson = rulesJson,
                CreatedAt = new DateTime(2026, 6, 18, 19, 45, 0, DateTimeKind.Utc)
            });
        }
        else
        {
            existing.Status = CanonicalStatus;
            existing.TitleKey = titleKey;
            existing.DescriptionKey = descriptionKey;
            existing.SchemaJson = schemaJson;
            existing.UiJson = uiJson;
            existing.RulesJson = rulesJson;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Canonical HSE assessment form is seeded as {Code} v{Version}.", CanonicalCode, CanonicalVersion);
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
