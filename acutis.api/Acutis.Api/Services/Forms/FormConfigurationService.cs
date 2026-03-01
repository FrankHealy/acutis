using System.Text.Json;
using Acutis.Api.Contracts;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Acutis.Api.Services.Forms;

public interface IFormConfigurationService
{
    Task<FormConfigurationVersionDto> CreateVersionAsync(string formCode, UpsertFormDefinitionRequest request, CancellationToken cancellationToken = default);
    Task<FormConfigurationVersionDto> EditVersionAsync(string formCode, int sourceVersion, UpsertFormDefinitionRequest request, CancellationToken cancellationToken = default);
    Task<FormConfigurationVersionDto> ActivateVersionAsync(string formCode, int version, CancellationToken cancellationToken = default);
    Task SoftDeleteVersionAsync(string formCode, int version, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FormConfigurationVersionDto>> GetVersionsAsync(string formCode, CancellationToken cancellationToken = default);
}

public sealed class FormConfigurationService : IFormConfigurationService
{
    private const string StatusDraft = "draft";
    private const string StatusActive = "active";
    private const string StatusArchived = "archived";
    private const string StatusDeleted = "deleted";

    private readonly AcutisDbContext _dbContext;

    public FormConfigurationService(AcutisDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<FormConfigurationVersionDto> CreateVersionAsync(
        string formCode,
        UpsertFormDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateUpsertRequest(request);

        var normalizedCode = NormalizeCode(formCode);
        var nextVersion = await GetNextVersionAsync(normalizedCode, cancellationToken);
        var status = request.MakeActive ? StatusActive : StatusDraft;

        if (request.MakeActive)
        {
            await DemoteActiveVersionsAsync(normalizedCode, cancellationToken);
        }

        var definition = new FormDefinition
        {
            Id = Guid.NewGuid(),
            Code = normalizedCode,
            Version = nextVersion,
            Status = status,
            TitleKey = request.TitleKey.Trim(),
            DescriptionKey = string.IsNullOrWhiteSpace(request.DescriptionKey) ? null : request.DescriptionKey.Trim(),
            SchemaJson = request.SchemaJson,
            UiJson = request.UiJson,
            RulesJson = request.RulesJson,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.FormDefinitions.Add(definition);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(definition);
    }

    public async Task<FormConfigurationVersionDto> EditVersionAsync(
        string formCode,
        int sourceVersion,
        UpsertFormDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = NormalizeCode(formCode);
        var source = await _dbContext.FormDefinitions
            .AsNoTracking()
            .FirstOrDefaultAsync(
                form => form.Code == normalizedCode && form.Version == sourceVersion && form.Status != StatusDeleted,
                cancellationToken);

        if (source is null)
        {
            throw new KeyNotFoundException($"Form '{normalizedCode}' version '{sourceVersion}' was not found.");
        }

        return await CreateVersionAsync(normalizedCode, request, cancellationToken);
    }

    public async Task<FormConfigurationVersionDto> ActivateVersionAsync(
        string formCode,
        int version,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = NormalizeCode(formCode);
        var target = await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(
                form => form.Code == normalizedCode && form.Version == version && form.Status != StatusDeleted,
                cancellationToken);

        if (target is null)
        {
            throw new KeyNotFoundException($"Form '{normalizedCode}' version '{version}' was not found.");
        }

        await DemoteActiveVersionsAsync(normalizedCode, cancellationToken);
        target.Status = StatusActive;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return Map(target);
    }

    public async Task SoftDeleteVersionAsync(
        string formCode,
        int version,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = NormalizeCode(formCode);
        var target = await _dbContext.FormDefinitions
            .FirstOrDefaultAsync(
                form => form.Code == normalizedCode && form.Version == version && form.Status != StatusDeleted,
                cancellationToken);

        if (target is null)
        {
            throw new KeyNotFoundException($"Form '{normalizedCode}' version '{version}' was not found.");
        }

        var wasActive = string.Equals(target.Status, StatusActive, StringComparison.OrdinalIgnoreCase);
        target.Status = StatusDeleted;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (wasActive)
        {
            var fallback = await _dbContext.FormDefinitions
                .Where(form => form.Code == normalizedCode && form.Status != StatusDeleted)
                .OrderByDescending(form => form.Version)
                .FirstOrDefaultAsync(cancellationToken);

            if (fallback is not null)
            {
                await ActivateVersionAsync(normalizedCode, fallback.Version, cancellationToken);
            }
        }
    }

    public async Task<IReadOnlyList<FormConfigurationVersionDto>> GetVersionsAsync(
        string formCode,
        CancellationToken cancellationToken = default)
    {
        var normalizedCode = NormalizeCode(formCode);

        return await _dbContext.FormDefinitions
            .AsNoTracking()
            .Where(form => form.Code == normalizedCode)
            .OrderByDescending(form => form.Version)
            .Select(form => new FormConfigurationVersionDto
            {
                Code = form.Code,
                Version = form.Version,
                Status = form.Status,
                TitleKey = form.TitleKey,
                DescriptionKey = form.DescriptionKey,
                CreatedAt = form.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<int> GetNextVersionAsync(string formCode, CancellationToken cancellationToken)
    {
        var currentMax = await _dbContext.FormDefinitions
            .Where(form => form.Code == formCode)
            .Select(form => (int?)form.Version)
            .MaxAsync(cancellationToken);

        return (currentMax ?? 0) + 1;
    }

    private async Task DemoteActiveVersionsAsync(string formCode, CancellationToken cancellationToken)
    {
        var activeRows = await _dbContext.FormDefinitions
            .Where(form => form.Code == formCode && form.Status == StatusActive)
            .ToListAsync(cancellationToken);

        foreach (var active in activeRows)
        {
            active.Status = StatusArchived;
        }
    }

    private static void ValidateUpsertRequest(UpsertFormDefinitionRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.TitleKey))
        {
            throw new ArgumentException("TitleKey is required.", nameof(request));
        }

        EnsureValidJson(request.SchemaJson, nameof(request.SchemaJson));
        EnsureValidJson(request.UiJson, nameof(request.UiJson));
        EnsureValidJson(request.RulesJson, nameof(request.RulesJson));
    }

    private static void EnsureValidJson(string json, string fieldName)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            throw new ArgumentException($"{fieldName} is required.", fieldName);
        }

        try
        {
            using var _ = JsonDocument.Parse(json);
        }
        catch (JsonException exception)
        {
            throw new ArgumentException($"{fieldName} is not valid JSON: {exception.Message}", fieldName, exception);
        }
    }

    private static string NormalizeCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Form code is required.", nameof(code));
        }

        return code.Trim().ToLowerInvariant();
    }

    private static FormConfigurationVersionDto Map(FormDefinition definition)
    {
        return new FormConfigurationVersionDto
        {
            Code = definition.Code,
            Version = definition.Version,
            Status = definition.Status,
            TitleKey = definition.TitleKey,
            DescriptionKey = definition.DescriptionKey,
            CreatedAt = definition.CreatedAt
        };
    }
}
