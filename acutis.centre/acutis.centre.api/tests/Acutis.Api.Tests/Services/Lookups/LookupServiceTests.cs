using Acutis.Api.Services.Lookups;
using Acutis.Domain.Lookups;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Acutis.Api.Tests.Services.Lookups;

public sealed class LookupServiceTests
{
    [Fact]
    public async Task GetLookupsForUnitAsync_UsesUnitOverride_WhenPresent()
    {
        await using var dbContext = CreateDbContext(nameof(GetLookupsForUnitAsync_UsesUnitOverride_WhenPresent));
        var unitId = Guid.NewGuid();

        var lookupType = new LookupType
        {
            LookupTypeId = Guid.NewGuid(),
            Key = "discharge_reason",
            DefaultLocale = "en-IE",
            IsActive = true,
            Version = 3
        };

        var centreValue = new LookupValue
        {
            LookupValueId = Guid.NewGuid(),
            LookupTypeId = lookupType.LookupTypeId,
            UnitId = null,
            Code = "LEFT_AGAINST_ADVICE",
            SortOrder = 10,
            IsActive = true
        };

        var unitValue = new LookupValue
        {
            LookupValueId = Guid.NewGuid(),
            LookupTypeId = lookupType.LookupTypeId,
            UnitId = unitId,
            Code = "LEFT_AGAINST_ADVICE",
            SortOrder = 5,
            IsActive = true
        };

        dbContext.LookupTypes.Add(lookupType);
        dbContext.LookupValues.AddRange(centreValue, unitValue);
        dbContext.LookupValueLabels.AddRange(
            new LookupValueLabel
            {
                LookupValueId = centreValue.LookupValueId,
                Locale = "en-IE",
                Label = "Left Against Advice (Centre)"
            },
            new LookupValueLabel
            {
                LookupValueId = unitValue.LookupValueId,
                Locale = "en-IE",
                Label = "Left Against Advice (Unit)"
            });
        await dbContext.SaveChangesAsync();

        var service = new LookupService(dbContext);
        var result = await service.GetLookupsForUnitAsync(unitId, new[] { "discharge_reason" }, "en-IE");

        var items = Assert.Single(result.Lookups["discharge_reason"]);
        Assert.Equal("LEFT_AGAINST_ADVICE", items.Code);
        Assert.Equal("Left Against Advice (Unit)", items.Label);
        Assert.Equal(5, items.SortOrder);
    }

    [Fact]
    public async Task GetLookupsForUnitAsync_AppliesLocaleFallback_RequestedThenDefaultThenCode()
    {
        await using var dbContext = CreateDbContext(nameof(GetLookupsForUnitAsync_AppliesLocaleFallback_RequestedThenDefaultThenCode));
        var unitId = Guid.NewGuid();

        var lookupType = new LookupType
        {
            LookupTypeId = Guid.NewGuid(),
            Key = "county",
            DefaultLocale = "en-IE",
            IsActive = true,
            Version = 1
        };

        var corkValue = new LookupValue
        {
            LookupValueId = Guid.NewGuid(),
            LookupTypeId = lookupType.LookupTypeId,
            UnitId = null,
            Code = "CORK",
            SortOrder = 1,
            IsActive = true
        };

        var kerryValue = new LookupValue
        {
            LookupValueId = Guid.NewGuid(),
            LookupTypeId = lookupType.LookupTypeId,
            UnitId = null,
            Code = "KERRY",
            SortOrder = 2,
            IsActive = true
        };

        var unknownValue = new LookupValue
        {
            LookupValueId = Guid.NewGuid(),
            LookupTypeId = lookupType.LookupTypeId,
            UnitId = null,
            Code = "UNKNOWN_CODE",
            SortOrder = 3,
            IsActive = true
        };

        dbContext.LookupTypes.Add(lookupType);
        dbContext.LookupValues.AddRange(corkValue, kerryValue, unknownValue);
        dbContext.LookupValueLabels.AddRange(
            new LookupValueLabel
            {
                LookupValueId = corkValue.LookupValueId,
                Locale = "ga-IE",
                Label = "Corcaigh"
            },
            new LookupValueLabel
            {
                LookupValueId = corkValue.LookupValueId,
                Locale = "en-IE",
                Label = "Cork"
            },
            new LookupValueLabel
            {
                LookupValueId = kerryValue.LookupValueId,
                Locale = "en-IE",
                Label = "Kerry"
            });
        await dbContext.SaveChangesAsync();

        var service = new LookupService(dbContext);
        var result = await service.GetLookupsForUnitAsync(unitId, new[] { "county" }, "ga-IE");

        var items = result.Lookups["county"];
        Assert.Equal(3, items.Count);
        Assert.Equal("Corcaigh", items[0].Label);
        Assert.Equal("Kerry", items[1].Label);
        Assert.Equal("UNKNOWN_CODE", items[2].Label);
    }

    [Fact]
    public async Task GetLookupVersionsForUnitAsync_ReturnsKeyVersionMap()
    {
        await using var dbContext = CreateDbContext(nameof(GetLookupVersionsForUnitAsync_ReturnsKeyVersionMap));
        var unitId = Guid.NewGuid();

        dbContext.LookupTypes.AddRange(
            new LookupType
            {
                LookupTypeId = Guid.NewGuid(),
                Key = "county",
                DefaultLocale = "en-IE",
                IsActive = true,
                Version = 7
            },
            new LookupType
            {
                LookupTypeId = Guid.NewGuid(),
                Key = "discharge_reason",
                DefaultLocale = "en-IE",
                IsActive = true,
                Version = 2
            });
        await dbContext.SaveChangesAsync();

        var service = new LookupService(dbContext);
        var versions = await service.GetLookupVersionsForUnitAsync(unitId);

        Assert.Equal(unitId, versions.UnitId);
        Assert.Equal(2, versions.Versions.Count);
        Assert.Equal(7, versions.Versions["county"]);
        Assert.Equal(2, versions.Versions["discharge_reason"]);
    }

    private static AcutisDbContext CreateDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AcutisDbContext(options);
    }
}
