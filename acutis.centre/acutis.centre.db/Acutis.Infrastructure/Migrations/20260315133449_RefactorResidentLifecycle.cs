using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorResidentLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CentreEpisodeCode",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntrySequence",
                table: "ResidentProgrammeEpisode",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EntryWeek",
                table: "ResidentProgrammeEpisode",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EntryYear",
                table: "ResidentProgrammeEpisode",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ResidentCaseId",
                table: "ResidentProgrammeEpisode",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ResidentCase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CaseStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CasePhase = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ReferralSource = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ReferralReference = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    RequiresComprehensiveAssessment = table.Column<bool>(type: "bit", nullable: false),
                    ComprehensiveAssessmentCompleted = table.Column<bool>(type: "bit", nullable: false),
                    OpenedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastContactAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SummaryNotes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentCase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentCase_Centre_CentreId",
                        column: x => x.CentreId,
                        principalTable: "Centre",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResidentCase_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ResidentCase_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql(
                """
                ;WITH EpisodeSeed AS (
                    SELECT
                        e.Id,
                        EntryYear = DATEPART(year, COALESCE(CONVERT(date, r.AdmissionDate), e.StartDate)),
                        EntryWeek = DATEPART(ISO_WEEK, COALESCE(CONVERT(date, r.AdmissionDate), e.StartDate)),
                        EntrySequence = ROW_NUMBER() OVER (
                            PARTITION BY
                                e.CentreId,
                                DATEPART(year, COALESCE(CONVERT(date, r.AdmissionDate), e.StartDate)),
                                DATEPART(ISO_WEEK, COALESCE(CONVERT(date, r.AdmissionDate), e.StartDate))
                            ORDER BY COALESCE(CONVERT(date, r.AdmissionDate), e.StartDate), e.Id)
                    FROM ResidentProgrammeEpisode e
                    INNER JOIN Resident r ON r.Id = e.ResidentId
                )
                UPDATE e
                SET
                    e.EntryYear = s.EntryYear,
                    e.EntryWeek = s.EntryWeek,
                    e.EntrySequence = s.EntrySequence,
                    e.CentreEpisodeCode = UPPER(LEFT(c.Code, 3))
                        + '-' + CONVERT(varchar(4), s.EntryYear)
                        + 'W' + RIGHT('00' + CONVERT(varchar(2), s.EntryWeek), 2)
                        + '-' + RIGHT('000' + CONVERT(varchar(3), s.EntrySequence), 3)
                FROM ResidentProgrammeEpisode e
                INNER JOIN EpisodeSeed s ON s.Id = e.Id
                INNER JOIN Centre c ON c.Id = e.CentreId;
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO ResidentCase (
                    Id,
                    ResidentId,
                    CentreId,
                    UnitId,
                    CaseStatus,
                    CasePhase,
                    ReferralSource,
                    ReferralReference,
                    RequiresComprehensiveAssessment,
                    ComprehensiveAssessmentCompleted,
                    OpenedAtUtc,
                    LastContactAtUtc,
                    ClosedAtUtc,
                    SummaryNotes)
                SELECT
                    e.Id,
                    e.ResidentId,
                    e.CentreId,
                    e.UnitId,
                    CASE WHEN e.EndDate IS NULL THEN 'admitted' ELSE 'closed' END,
                    CASE WHEN e.EndDate IS NULL THEN 'admission' ELSE 'discharged' END,
                    NULL,
                    NULL,
                    0,
                    0,
                    COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate), r.CreatedAtUtc),
                    r.UpdatedAtUtc,
                    CASE WHEN e.EndDate IS NULL THEN NULL ELSE CONVERT(datetime2, e.EndDate) END,
                    NULL
                FROM ResidentProgrammeEpisode e
                INNER JOIN Resident r ON r.Id = e.ResidentId
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM ResidentCase rc
                    WHERE rc.Id = e.Id);
                """);

            migrationBuilder.Sql(
                """
                INSERT INTO ResidentCase (
                    Id,
                    ResidentId,
                    CentreId,
                    UnitId,
                    CaseStatus,
                    CasePhase,
                    ReferralSource,
                    ReferralReference,
                    RequiresComprehensiveAssessment,
                    ComprehensiveAssessmentCompleted,
                    OpenedAtUtc,
                    LastContactAtUtc,
                    ClosedAtUtc,
                    SummaryNotes)
                SELECT
                    r.Id,
                    r.Id,
                    c.Id,
                    r.UnitId,
                    'referred',
                    'intake',
                    NULL,
                    NULL,
                    0,
                    0,
                    COALESCE(r.CreatedAtUtc, SYSUTCDATETIME()),
                    r.UpdatedAtUtc,
                    NULL,
                    NULL
                FROM Resident r
                CROSS JOIN (
                    SELECT TOP (1) Id
                    FROM Centre
                    ORDER BY DisplayOrder, Name, Id
                ) c
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM ResidentProgrammeEpisode e
                    WHERE e.ResidentId = r.Id)
                  AND NOT EXISTS (
                    SELECT 1
                    FROM ResidentCase rc
                    WHERE rc.Id = r.Id);
                """);

            migrationBuilder.Sql(
                """
                UPDATE ResidentProgrammeEpisode
                SET ResidentCaseId = Id
                WHERE ResidentCaseId IS NULL;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_ResidentProgrammeEpisode_CentreEpisodeCode",
                table: "ResidentProgrammeEpisode",
                column: "CentreEpisodeCode",
                unique: true,
                filter: "[CentreEpisodeCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentProgrammeEpisode_CentreId_EntryYear_EntryWeek_EntrySequence",
                table: "ResidentProgrammeEpisode",
                columns: new[] { "CentreId", "EntryYear", "EntryWeek", "EntrySequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResidentProgrammeEpisode_ResidentCaseId",
                table: "ResidentProgrammeEpisode",
                column: "ResidentCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CentreId_CaseStatus_OpenedAtUtc",
                table: "ResidentCase",
                columns: new[] { "CentreId", "CaseStatus", "OpenedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_ResidentId_OpenedAtUtc",
                table: "ResidentCase",
                columns: new[] { "ResidentId", "OpenedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_UnitId",
                table: "ResidentCase",
                column: "UnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentProgrammeEpisode_ResidentCase_ResidentCaseId",
                table: "ResidentProgrammeEpisode",
                column: "ResidentCaseId",
                principalTable: "ResidentCase",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResidentProgrammeEpisode_ResidentCase_ResidentCaseId",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropTable(
                name: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentProgrammeEpisode_CentreEpisodeCode",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropIndex(
                name: "IX_ResidentProgrammeEpisode_CentreId_EntryYear_EntryWeek_EntrySequence",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropIndex(
                name: "IX_ResidentProgrammeEpisode_ResidentCaseId",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "CentreEpisodeCode",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "EntrySequence",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "EntryWeek",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "EntryYear",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "ResidentCaseId",
                table: "ResidentProgrammeEpisode");
        }
    }
}
