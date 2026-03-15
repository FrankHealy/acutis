using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Migrations
{
    public partial class RefactorResidentLifecycle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // -------------------------------
            // 1. Add ResidentCase
            // -------------------------------
            migrationBuilder.CreateTable(
                name: "ResidentCase",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    ResidentId = table.Column<Guid>(nullable: false),
                    ReferralSource = table.Column<string>(maxLength: 200, nullable: true),
                    Status = table.Column<string>(maxLength: 50, nullable: false, defaultValue: "Open"),
                    CreatedAtUtc = table.Column<DateTime>(nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentCase", x => x.Id);
                });

            // -------------------------------
            // 2. Add Episode operational code
            // -------------------------------
            migrationBuilder.AddColumn<string>(
                name: "CentreEpisodeCode",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntryYear",
                table: "ResidentProgrammeEpisode",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntryWeek",
                table: "ResidentProgrammeEpisode",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntrySequence",
                table: "ResidentProgrammeEpisode",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EpisodeStatus",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(30)",
                nullable: false,
                defaultValue: "Active");

            // -------------------------------
            // 3. Move admission fields from Resident
            // -------------------------------
            migrationBuilder.AddColumn<string>(
                name: "RoomNumber",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(20)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AdmissionDate",
                table: "ResidentProgrammeEpisode",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpectedCompletionDate",
                table: "ResidentProgrammeEpisode",
                nullable: true);

            // -------------------------------
            // 4. Backfill episode code
            // -------------------------------
            migrationBuilder.Sql(@"
                UPDATE e
                SET
                    EntryYear = YEAR(e.StartDate),
                    EntryWeek = DATEPART(ISO_WEEK, e.StartDate),
                    EntrySequence = 1
                FROM ResidentProgrammeEpisode e
                WHERE EntryYear IS NULL
            ");

            migrationBuilder.Sql(@"
                UPDATE e
                SET CentreEpisodeCode =
                    'BRU-' +
                    CAST(EntryYear AS varchar(4)) +
                    RIGHT('0' + CAST(EntryWeek AS varchar(2)),2) +
                    '-' +
                    RIGHT('00' + CAST(EntrySequence AS varchar(3)),3)
                FROM ResidentProgrammeEpisode e
                WHERE CentreEpisodeCode IS NULL
            ");

            // -------------------------------
            // 5. Create ResidentAssessmentProfile
            // -------------------------------
            migrationBuilder.CreateTable(
                name: "ResidentAssessmentProfile",
                columns: table => new
                {
                    ResidentId = table.Column<Guid>(nullable: false),
                    PrimaryAddiction = table.Column<string>(maxLength: 100, nullable: true),
                    IsDrug = table.Column<bool>(nullable: false, defaultValue: false),
                    IsGambeler = table.Column<bool>(nullable: false, defaultValue: false),
                    DietaryNeedsCode = table.Column<int>(nullable: true),
                    IsSnorer = table.Column<bool>(nullable: false, defaultValue: false),
                    HasCriminalHistory = table.Column<bool>(nullable: false, defaultValue: false),
                    IsOnProbation = table.Column<bool>(nullable: false, defaultValue: false),
                    ArgumentativeScale = table.Column<int>(nullable: true),
                    LearningDifficultyScale = table.Column<int>(nullable: true),
                    LiteracyScale = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentAssessmentProfile", x => x.ResidentId);
                });

            // -------------------------------
            // 6. Backfill assessment profile
            // -------------------------------
            migrationBuilder.Sql(@"
                INSERT INTO ResidentAssessmentProfile (
                    ResidentId,
                    PrimaryAddiction,
                    IsDrug,
                    IsGambeler,
                    DietaryNeedsCode,
                    IsSnorer,
                    HasCriminalHistory,
                    IsOnProbation,
                    ArgumentativeScale,
                    LearningDifficultyScale,
                    LiteracyScale
                )
                SELECT
                    Id,
                    PrimaryAddiction,
                    IsDrug,
                    IsGambeler,
                    DietaryNeedsCode,
                    IsSnorer,
                    HasCriminalHistory,
                    IsOnProbation,
                    ArgumentativeScale,
                    LearningDifficultyScale,
                    LiteracyScale
                FROM Resident
            ");

            // -------------------------------
            // 7. Remove duplicated fields
            // -------------------------------
            migrationBuilder.DropColumn(name: "PrimaryAddiction", table: "Resident");
            migrationBuilder.DropColumn(name: "IsDrug", table: "Resident");
            migrationBuilder.DropColumn(name: "IsGambeler", table: "Resident");
            migrationBuilder.DropColumn(name: "DietaryNeedsCode", table: "Resident");
            migrationBuilder.DropColumn(name: "IsSnorer", table: "Resident");
            migrationBuilder.DropColumn(name: "HasCriminalHistory", table: "Resident");
            migrationBuilder.DropColumn(name: "IsOnProbation", table: "Resident");
            migrationBuilder.DropColumn(name: "ArgumentativeScale", table: "Resident");
            migrationBuilder.DropColumn(name: "LearningDifficultyScale", table: "Resident");
            migrationBuilder.DropColumn(name: "LiteracyScale", table: "Resident");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ResidentCase");
            migrationBuilder.DropTable(name: "ResidentAssessmentProfile");

            migrationBuilder.DropColumn(name: "CentreEpisodeCode", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EntryYear", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EntryWeek", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EntrySequence", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EpisodeStatus", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "RoomNumber", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "AdmissionDate", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "ExpectedCompletionDate", table: "ResidentProgrammeEpisode");

            migrationBuilder.AddColumn<string>(name: "PrimaryAddiction", table: "Resident", type: "nvarchar(100)", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "IsDrug", table: "Resident", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsGambeler", table: "Resident", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<int>(name: "DietaryNeedsCode", table: "Resident", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "IsSnorer", table: "Resident", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "HasCriminalHistory", table: "Resident", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsOnProbation", table: "Resident", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<int>(name: "ArgumentativeScale", table: "Resident", nullable: true);
            migrationBuilder.AddColumn<int>(name: "LearningDifficultyScale", table: "Resident", nullable: true);
            migrationBuilder.AddColumn<int>(name: "LiteracyScale", table: "Resident", nullable: true);
        }
    }
}
