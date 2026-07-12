using Acutis.Api.Services.Screening;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Acutis.Api.Tests.Services.Screening;

public sealed class FormServiceTests
{
    private static readonly Guid LegacyHseFormId = Guid.Parse("6d433f0d-7701-49db-adc4-71fb6557f6a6");

    [Fact]
    public async Task GetLatestPublishedAsync_ReturnsCanonicalCommunityAssessment_WhenSeeded()
    {
        await using var dbContext = CreateDbContext(nameof(GetLatestPublishedAsync_ReturnsCanonicalCommunityAssessment_WhenSeeded));
        dbContext.FormDefinitions.Add(CreateForm("community_initial_assessment", 1, "active", "Canonical HSE"));
        dbContext.FormDefinitions.Add(CreateForm("alcohol_screening_call", 6, "active", "Legacy HSE"));
        await dbContext.SaveChangesAsync();

        var service = new FormService(dbContext);

        var form = await service.GetLatestPublishedAsync("community_initial_assessment");

        Assert.NotNull(form);
        Assert.Equal("community_initial_assessment", form.Code);
        Assert.Equal(1, form.Version);
        Assert.Equal("Canonical HSE", form.TitleKey);
    }

    [Fact]
    public async Task GetLatestPublishedAsync_FallsBackToLegacyHseForm_WhenCanonicalIsMissing()
    {
        await using var dbContext = CreateDbContext(nameof(GetLatestPublishedAsync_FallsBackToLegacyHseForm_WhenCanonicalIsMissing));
        dbContext.FormDefinitions.Add(CreateForm("alcohol_screening_call", 6, "active", "Legacy HSE"));
        await dbContext.SaveChangesAsync();

        var service = new FormService(dbContext);

        var form = await service.GetLatestPublishedAsync("community_initial_assessment");

        Assert.NotNull(form);
        Assert.Equal("community_initial_assessment", form.Code);
        Assert.Equal(6, form.Version);
        Assert.Equal("Legacy HSE", form.TitleKey);
    }

    [Fact]
    public async Task GetPublishedAsync_ResolvesCommunityAssessmentAlias_ForSaveRequests()
    {
        await using var dbContext = CreateDbContext(nameof(GetPublishedAsync_ResolvesCommunityAssessmentAlias_ForSaveRequests));
        dbContext.FormDefinitions.Add(CreateForm("community_initial_assessment", 1, "active", "Canonical HSE"));
        await dbContext.SaveChangesAsync();

        var service = new FormService(dbContext);

        var form = await service.GetPublishedAsync("community_initial_assessment", 1);

        Assert.NotNull(form);
        Assert.Equal("community_initial_assessment", form.Code);
        Assert.Equal(1, form.Version);
    }

    private static FormDefinition CreateForm(string code, int version, string status, string titleKey)
    {
        return new FormDefinition
        {
            Id = Guid.NewGuid(),
            Code = code,
            Version = version,
            Status = status,
            TitleKey = titleKey,
            DescriptionKey = "Test form",
            SchemaJson = """
                {
                  "type": "object",
                  "properties": {},
                  "required": []
                }
                """,
            UiJson = """
                {
                  "sections": [],
                  "widgets": {},
                  "labelKeys": {},
                  "helpKeys": {}
                }
                """,
            RulesJson = "[]",
            CreatedAt = new DateTime(2026, 6, 18, 19, 45, 0, DateTimeKind.Utc)
        };
    }

    [Fact]
    public async Task ExistingFormSeedIds_CanBeMovedToCanonicalLegacyVersion()
    {
        await using var dbContext = CreateDbContext(nameof(ExistingFormSeedIds_CanBeMovedToCanonicalLegacyVersion));
        dbContext.FormDefinitions.Add(new FormDefinition
        {
            Id = LegacyHseFormId,
            Code = "alcohol_screening_call",
            Version = 1,
            Status = "published",
            TitleKey = "Old seed",
            DescriptionKey = "Old seed",
            SchemaJson = "{}",
            UiJson = "{}",
            RulesJson = "[]",
            CreatedAt = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc)
        });
        await dbContext.SaveChangesAsync();

        var existing = await dbContext.FormDefinitions
            .FirstOrDefaultAsync(form => form.Code == "alcohol_screening_call" && form.Version == 6);
        existing ??= await dbContext.FormDefinitions.FirstOrDefaultAsync(form => form.Id == LegacyHseFormId);

        Assert.NotNull(existing);
        existing.Code = "alcohol_screening_call";
        existing.Version = 6;
        existing.Status = "active";
        existing.TitleKey = "Canonical legacy";

        await dbContext.SaveChangesAsync();

        var forms = await dbContext.FormDefinitions.ToListAsync();
        Assert.Single(forms);
        Assert.Equal(LegacyHseFormId, forms[0].Id);
        Assert.Equal("alcohol_screening_call", forms[0].Code);
        Assert.Equal(6, forms[0].Version);
        Assert.Equal("active", forms[0].Status);
    }

    private static AcutisDbContext CreateDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AcutisDbContext(options);
    }
}
