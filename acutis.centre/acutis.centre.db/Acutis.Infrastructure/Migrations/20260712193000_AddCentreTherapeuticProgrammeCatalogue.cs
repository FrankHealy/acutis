using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations;

[DbContext(typeof(AcutisDbContext))]
[Migration("20260712193000_AddCentreTherapeuticProgrammeCatalogue")]
public sealed class AddCentreTherapeuticProgrammeCatalogue : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // This migration is deliberately hand-authored and has no generated
        // designer/target model. Raw, idempotent SQL avoids EF attempting to
        // resolve InsertData column mappings against an empty migration model.
        migrationBuilder.Sql(
            """
            IF NOT EXISTS (SELECT 1 FROM [ProgrammeDefinition] WHERE [Id] = '55555555-5555-5555-5555-555555555556')
                INSERT INTO [ProgrammeDefinition] ([Id], [CentreId], [Code], [Name], [Description], [TotalDurationValue], [TotalDurationUnit], [DetoxPhaseDurationValue], [DetoxPhaseDurationUnit], [MainPhaseDurationValue], [MainPhaseDurationUnit], [IsActive], [CreatedAtUtc], [CreatedByUserId], [UpdatedAtUtc], [UpdatedByUserId])
                VALUES ('55555555-5555-5555-5555-555555555556', 'aaaaaaaa-1111-1111-1111-111111111111', 'cbt_skills_8_week', N'CBT Skills Programme', N'Eight-week CBT skills programme covering assessment and goals, thoughts-feelings-behaviours, unhelpful thinking, behavioural activation, problem solving, coping strategies, relapse prevention and review.', 8, 'Weeks', NULL, NULL, 8, 'Weeks', 1, '2026-02-02T00:00:00', NULL, '2026-02-02T00:00:00', NULL);

            IF NOT EXISTS (SELECT 1 FROM [ProgrammeDefinition] WHERE [Id] = '55555555-5555-5555-5555-555555555557')
                INSERT INTO [ProgrammeDefinition] ([Id], [CentreId], [Code], [Name], [Description], [TotalDurationValue], [TotalDurationUnit], [DetoxPhaseDurationValue], [DetoxPhaseDurationUnit], [MainPhaseDurationValue], [MainPhaseDurationUnit], [IsActive], [CreatedAtUtc], [CreatedByUserId], [UpdatedAtUtc], [UpdatedByUserId])
                VALUES ('55555555-5555-5555-5555-555555555557', 'aaaaaaaa-1111-1111-1111-111111111111', 'dbt_skills_16_week', N'DBT Skills Programme', N'Sixteen-week DBT skills programme covering orientation, mindfulness, distress tolerance, emotion regulation, interpersonal effectiveness and skills consolidation.', 16, 'Weeks', NULL, NULL, 16, 'Weeks', 1, '2026-02-02T00:00:00', NULL, '2026-02-02T00:00:00', NULL);

            IF NOT EXISTS (SELECT 1 FROM [ProgrammeDefinition] WHERE [Id] = '55555555-5555-5555-5555-555555555558')
                INSERT INTO [ProgrammeDefinition] ([Id], [CentreId], [Code], [Name], [Description], [TotalDurationValue], [TotalDurationUnit], [DetoxPhaseDurationValue], [DetoxPhaseDurationUnit], [MainPhaseDurationValue], [MainPhaseDurationUnit], [IsActive], [CreatedAtUtc], [CreatedByUserId], [UpdatedAtUtc], [UpdatedByUserId])
                VALUES ('55555555-5555-5555-5555-555555555558', 'aaaaaaaa-1111-1111-1111-111111111111', 'gambling_recovery_10_week', N'Gambling Recovery Programme', N'Ten-week gambling recovery programme covering motivation, gambling harms, triggers and urges, thinking patterns, financial safeguards, affected others, problem solving, relapse prevention and recovery planning.', 10, 'Weeks', NULL, NULL, 10, 'Weeks', 1, '2026-02-02T00:00:00', NULL, '2026-02-02T00:00:00', NULL);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            DELETE FROM [ProgrammeDefinition]
            WHERE [Id] IN (
                '55555555-5555-5555-5555-555555555556',
                '55555555-5555-5555-5555-555555555557',
                '55555555-5555-5555-5555-555555555558');
            """);
    }
}
