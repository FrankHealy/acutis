using Acutis.Api.Contracts;
using Acutis.Api.Services.TherapyScheduling;
using Acutis.Domain.Entities;
using Acutis.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Xunit;

namespace Acutis.Api.Tests.Services.TherapyScheduling;

public sealed class TherapySchedulingServiceTests
{
    [Fact]
    public async Task CreateWeeklyRunAsync_GeneratesDraftAssignments_AndWritesAudit()
    {
        await using var dbContext = CreateDbContext(nameof(CreateWeeklyRunAsync_GeneratesDraftAssignments_AndWritesAudit));
        var centreId = Guid.NewGuid();
        var topicIds = await SeedTopicsAsync(dbContext);
        await SeedEpisodeAsync(dbContext, centreId, Guid.NewGuid(), 3, ParticipationMode.FullProgramme);
        await SeedEpisodeAsync(dbContext, centreId, Guid.NewGuid(), 4, ParticipationMode.FullProgramme);

        var service = CreateService(dbContext);
        var result = await service.CreateWeeklyRunAsync(
            centreId,
            new CreateWeeklyTherapyRunRequest
            {
                WeekStartDate = new DateOnly(2026, 3, 2),
                TopicsRunning = topicIds
            });

        Assert.Equal("Draft", result.Status);
        Assert.Equal(2, result.AssignmentSummary.EligibleResidents);
        Assert.Equal(2, result.AssignmentSummary.Assigned);
        Assert.Equal(0, result.AssignmentSummary.Skipped);

        var auditRows = await dbContext.AuditLogs.AsNoTracking().ToListAsync();
        Assert.Equal(3, auditRows.Count);
        Assert.Contains(auditRows, x => x.EntityType == nameof(WeeklyTherapyRun) && x.Action == "Create");
        Assert.Equal(2, auditRows.Count(x => x.EntityType == nameof(ResidentWeeklyTherapyAssignment) && x.Action == "Create"));
    }

    [Fact]
    public async Task OverrideAssignmentAsync_CreatesSupersedingAppendOnlyRecord()
    {
        await using var dbContext = CreateDbContext(nameof(OverrideAssignmentAsync_CreatesSupersedingAppendOnlyRecord));
        var centreId = Guid.NewGuid();
        var residentId = Guid.NewGuid();
        var topicIds = await SeedTopicsAsync(dbContext);
        var episode = await SeedEpisodeAsync(dbContext, centreId, residentId, 5, ParticipationMode.FullProgramme);

        var service = CreateService(dbContext);
        await service.CreateWeeklyRunAsync(
            centreId,
            new CreateWeeklyTherapyRunRequest
            {
                WeekStartDate = new DateOnly(2026, 3, 2),
                TopicsRunning = topicIds
            });

        var original = await dbContext.ResidentWeeklyTherapyAssignments.SingleAsync();
        var overridden = await service.OverrideAssignmentAsync(
            centreId,
            new OverrideResidentWeeklyTherapyAssignmentRequest
            {
                ResidentId = residentId,
                EpisodeId = episode.Id,
                WeekStartDate = new DateOnly(2026, 3, 2),
                TherapyTopicId = topicIds[1],
                OverrideReason = "Clinical judgement for resident needs."
            });

        Assert.Equal(original.Id, overridden.SupersedesAssignmentId);
        Assert.Equal("ManualOverride", overridden.AssignmentSource);
        Assert.Equal(2, await dbContext.ResidentWeeklyTherapyAssignments.CountAsync());
    }

    [Fact]
    public async Task CreateWeeklyRunAsync_ExcludesNonFullParticipationModes()
    {
        await using var dbContext = CreateDbContext(nameof(CreateWeeklyRunAsync_ExcludesNonFullParticipationModes));
        var centreId = Guid.NewGuid();
        var topicIds = await SeedTopicsAsync(dbContext);
        await SeedEpisodeAsync(dbContext, centreId, Guid.NewGuid(), 3, ParticipationMode.FullProgramme);
        await SeedEpisodeAsync(dbContext, centreId, Guid.NewGuid(), 3, ParticipationMode.RoleCallOnly);
        await SeedEpisodeAsync(dbContext, centreId, Guid.NewGuid(), 3, ParticipationMode.Paused);

        var service = CreateService(dbContext);
        var result = await service.CreateWeeklyRunAsync(
            centreId,
            new CreateWeeklyTherapyRunRequest
            {
                WeekStartDate = new DateOnly(2026, 3, 2),
                TopicsRunning = topicIds
            });

        Assert.Equal(1, result.AssignmentSummary.EligibleResidents);
        Assert.Equal(1, result.AssignmentSummary.Assigned);
        Assert.Equal(1, await dbContext.ResidentWeeklyTherapyAssignments.CountAsync());
    }

    [Fact]
    public async Task DetoxWeeks_AreAvoidedByDefault_ButManualOverrideAllowed()
    {
        await using var dbContext = CreateDbContext(nameof(DetoxWeeks_AreAvoidedByDefault_ButManualOverrideAllowed));
        var centreId = Guid.NewGuid();
        var residentId = Guid.NewGuid();
        var topicIds = await SeedTopicsAsync(dbContext);
        var episode = await SeedEpisodeAsync(dbContext, centreId, residentId, 1, ParticipationMode.FullProgramme);

        var service = CreateService(dbContext);
        var run = await service.CreateWeeklyRunAsync(
            centreId,
            new CreateWeeklyTherapyRunRequest
            {
                WeekStartDate = new DateOnly(2026, 3, 2),
                TopicsRunning = topicIds
            });

        Assert.Equal(1, run.AssignmentSummary.Skipped);
        var warning = Assert.Single(run.AssignmentSummary.Warnings);
        Assert.Equal("DETOX_WEEK_AVOIDED", warning.Code);

        var manual = await service.OverrideAssignmentAsync(
            centreId,
            new OverrideResidentWeeklyTherapyAssignmentRequest
            {
                ResidentId = residentId,
                EpisodeId = episode.Id,
                WeekStartDate = new DateOnly(2026, 3, 2),
                TherapyTopicId = topicIds[0],
                OverrideReason = "Detox clinical exception."
            });

        Assert.Equal("ManualOverride", manual.AssignmentSource);
    }

    [Fact]
    public async Task CreateCompletionAsync_PreventsDuplicateCreditByDefault()
    {
        await using var dbContext = CreateDbContext(nameof(CreateCompletionAsync_PreventsDuplicateCreditByDefault));
        var centreId = Guid.NewGuid();
        var residentId = Guid.NewGuid();
        var topicIds = await SeedTopicsAsync(dbContext);
        var episode = await SeedEpisodeAsync(dbContext, centreId, residentId, 4, ParticipationMode.FullProgramme);

        var service = CreateService(dbContext);
        await service.CreateCompletionAsync(
            centreId,
            new CreateTherapyTopicCompletionRequest
            {
                ResidentId = residentId,
                EpisodeId = episode.Id,
                TherapyTopicId = topicIds[0],
                CompletedOn = new DateOnly(2026, 3, 2)
            });

        await Assert.ThrowsAsync<DuplicateCompletionException>(() => service.CreateCompletionAsync(
            centreId,
            new CreateTherapyTopicCompletionRequest
            {
                ResidentId = residentId,
                EpisodeId = episode.Id,
                TherapyTopicId = topicIds[0],
                CompletedOn = new DateOnly(2026, 3, 3)
            }));
    }

    [Fact]
    public async Task CreateEpisodeEventAsync_WritesEventAndDerivedEpisodeAuditRows()
    {
        await using var dbContext = CreateDbContext(nameof(CreateEpisodeEventAsync_WritesEventAndDerivedEpisodeAuditRows));
        var centreId = Guid.NewGuid();
        var episode = await SeedEpisodeAsync(dbContext, centreId, Guid.NewGuid(), 5, ParticipationMode.FullProgramme);
        var service = CreateService(dbContext);

        var payload = JsonSerializer.Deserialize<JsonElement>("{\"currentWeekNumber\":7}");
        await service.CreateEpisodeEventAsync(
            centreId,
            episode.Id,
            new CreateEpisodeEventRequest
            {
                EventType = "WeekRepositioned",
                EventDate = new DateOnly(2026, 3, 4),
                Reason = "Clinical progress update",
                Payload = payload
            });

        var auditRows = await dbContext.AuditLogs.AsNoTracking().ToListAsync();
        Assert.Contains(auditRows, x => x.EntityType == nameof(EpisodeEvent) && x.Action == "Event");
        Assert.Contains(auditRows, x => x.EntityType == nameof(ResidentProgrammeEpisode) && x.Action == "Update");
    }

    private static TherapySchedulingService CreateService(AcutisDbContext dbContext)
    {
        var httpContextAccessor = new HttpContextAccessor();
        var auditService = new AuditService(dbContext, httpContextAccessor);
        return new TherapySchedulingService(dbContext, auditService, httpContextAccessor);
    }

    private static async Task<List<Guid>> SeedTopicsAsync(AcutisDbContext dbContext)
    {
        if (await dbContext.TherapyTopics.AnyAsync())
        {
            return await dbContext.TherapyTopics
                .OrderBy(x => x.Code)
                .Take(3)
                .Select(x => x.Id)
                .ToListAsync();
        }

        var topics = Enumerable.Range(1, 3)
            .Select(index => new TherapyTopic
            {
                Id = Guid.NewGuid(),
                Code = $"TOPIC_{index:00}",
                DefaultName = $"Topic {index}",
                IsActive = true
            })
            .ToList();

        dbContext.TherapyTopics.AddRange(topics);
        await dbContext.SaveChangesAsync();
        return topics.Select(x => x.Id).ToList();
    }

    private static async Task<ResidentProgrammeEpisode> SeedEpisodeAsync(
        AcutisDbContext dbContext,
        Guid centreId,
        Guid residentId,
        int currentWeekNumber,
        ParticipationMode mode)
    {
        var episode = new ResidentProgrammeEpisode
        {
            Id = Guid.NewGuid(),
            ResidentId = residentId,
            CentreId = centreId,
            StartDate = new DateOnly(2026, 2, 1),
            EndDate = null,
            ProgrammeType = ProgrammeType.Alcohol,
            CurrentWeekNumber = currentWeekNumber,
            ParticipationMode = mode
        };

        dbContext.ResidentProgrammeEpisodes.Add(episode);
        await dbContext.SaveChangesAsync();
        return episode;
    }

    private static AcutisDbContext CreateDbContext(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AcutisDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AcutisDbContext(options);
    }
}
