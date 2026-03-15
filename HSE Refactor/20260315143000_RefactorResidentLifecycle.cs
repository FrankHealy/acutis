using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    public partial class RefactorResidentLifecycle : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. New case/intake layer
            migrationBuilder.CreateTable(
                name: "ResidentCase",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CaseStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "open"),
                    CasePhase = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "intake"),
                    ReferralSource = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ReferralReference = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    IsNewTreatmentEpisode = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequiresComprehensiveAssessment = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ComprehensiveAssessmentCompleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
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

            migrationBuilder.CreateTable(
                name: "ResidentCaseConsent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConsentType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ConsentStatus = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "granted"),
                    GrantedToName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SignedByResidentAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SignedByStaffAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EffectiveFromUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WithdrawnAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentCaseConsent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentCaseConsent_ResidentCase_CaseId",
                        column: x => x.CaseId,
                        principalTable: "ResidentCase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ResidentCaseAction",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "open"),
                    AssignedToUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RaisedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentCaseAction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentCaseAction_ResidentCase_CaseId",
                        column: x => x.CaseId,
                        principalTable: "ResidentCase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResidentCaseAction_AppUser_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ResidentAssessmentProfile",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProfileType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false, defaultValue: "initial"),
                    IsDrug = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsGambler = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DietaryNeedsCode = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsSnorer = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    HasCriminalHistory = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    IsOnProbation = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    ArgumentativeScale = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LearningDifficultyScale = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LiteracyScale = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    PrimaryAddiction = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsPreviousResident = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AssessedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssessedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentAssessmentProfile", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentAssessmentProfile_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ResidentAssessmentProfile_ResidentCase_CaseId",
                        column: x => x.CaseId,
                        principalTable: "ResidentCase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ResidentAssessmentProfile_ResidentProgrammeEpisode_EpisodeId",
                        column: x => x.EpisodeId,
                        principalTable: "ResidentProgrammeEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ResidentAssessmentProfile_AppUser_AssessedByUserId",
                        column: x => x.AssessedByUserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            // 2. Extend episode with human-safe operational identifier + move stay fields off Resident
            migrationBuilder.AddColumn<string>(
                name: "CentreEpisodeCode",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EntryYear",
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
                name: "EntrySequence",
                table: "ResidentProgrammeEpisode",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EpisodeStatus",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "active");

            migrationBuilder.AddColumn<DateTime>(
                name: "AdmissionDateUtc",
                table: "ResidentProgrammeEpisode",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpectedCompletionDateUtc",
                table: "ResidentProgrammeEpisode",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomNumber",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            // 3. Backfill episode identity and move operational stay data from Resident to Episode
            migrationBuilder.Sql(@"
;WITH EpisodeSeed AS (
    SELECT
        e.Id,
        c.Code AS CentreCode,
        COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate)) AS AdmissionDateUtc,
        r.ExpectedCompletionDate,
        r.RoomNumber,
        DATEPART(year, COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate))) AS EntryYear,
        DATEPART(ISO_WEEK, COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate))) AS EntryWeek,
        ROW_NUMBER() OVER (
            PARTITION BY e.CentreId,
                         DATEPART(year, COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate))),
                         DATEPART(ISO_WEEK, COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate)))
            ORDER BY COALESCE(r.AdmissionDate, CONVERT(datetime2, e.StartDate)), e.Id
        ) AS EntrySequence
    FROM ResidentProgrammeEpisode e
    INNER JOIN Resident r ON r.Id = e.ResidentId
    INNER JOIN Centre c ON c.Id = e.CentreId
)
UPDATE e
SET
    e.AdmissionDateUtc = s.AdmissionDateUtc,
    e.ExpectedCompletionDateUtc = s.ExpectedCompletionDate,
    e.RoomNumber = s.RoomNumber,
    e.EntryYear = s.EntryYear,
    e.EntryWeek = s.EntryWeek,
    e.EntrySequence = s.EntrySequence,
    e.CentreEpisodeCode = UPPER(LEFT(s.CentreCode, 3)) + '-' + CAST(s.EntryYear AS varchar(4)) + 'W' + RIGHT('00' + CAST(s.EntryWeek AS varchar(2)), 2) + '-' + RIGHT('000' + CAST(s.EntrySequence AS varchar(3)), 3)
FROM ResidentProgrammeEpisode e
INNER JOIN EpisodeSeed s ON s.Id = e.Id;
");

            // 4. Create a 1st-pass case for every historical resident/episode pair.
            migrationBuilder.Sql(@"
INSERT INTO ResidentCase (
    Id,
    ResidentId,
    CentreId,
    UnitId,
    CaseStatus,
    CasePhase,
    ReferralSource,
    ReferralReference,
    IsNewTreatmentEpisode,
    RequiresComprehensiveAssessment,
    ComprehensiveAssessmentCompleted,
    OpenedAtUtc,
    LastContactAtUtc,
    ClosedAtUtc,
    SummaryNotes)
SELECT
    NEWID(),
    r.Id,
    e.CentreId,
    e.UnitId,
    CASE WHEN e.Id IS NOT NULL THEN 'admitted' ELSE 'open' END,
    CASE WHEN e.Id IS NOT NULL THEN 'decision' ELSE 'assessment' END,
    NULL,
    NULL,
    CASE WHEN EXISTS (
        SELECT 1
        FROM ResidentProgrammeEpisode prev
        WHERE prev.ResidentId = r.Id
          AND prev.Id <> e.Id
          AND prev.StartDate < e.StartDate
    ) THEN 0 ELSE 1 END,
    0,
    0,
    COALESCE(r.AdmissionDate, r.CreatedAtUtc),
    r.UpdatedAtUtc,
    CASE WHEN e.EndDate IS NOT NULL THEN CONVERT(datetime2, e.EndDate) ELSE NULL END,
    NULL
FROM Resident r
LEFT JOIN ResidentProgrammeEpisode e ON e.ResidentId = r.Id;
");

            // 5. Backfill assessment profile from the old Resident composite columns.
            migrationBuilder.Sql(@"
INSERT INTO ResidentAssessmentProfile (
    Id,
    ResidentId,
    CaseId,
    EpisodeId,
    ProfileType,
    IsDrug,
    IsGambler,
    DietaryNeedsCode,
    IsSnorer,
    HasCriminalHistory,
    IsOnProbation,
    ArgumentativeScale,
    LearningDifficultyScale,
    LiteracyScale,
    PrimaryAddiction,
    IsPreviousResident,
    AssessedAtUtc,
    AssessedByUserId)
SELECT
    NEWID(),
    r.Id,
    rc.Id,
    e.Id,
    'initial',
    r.IsDrug,
    r.IsGambeler,
    r.DietaryNeedsCode,
    r.IsSnorer,
    r.HasCriminalHistory,
    r.IsOnProbation,
    r.ArgumentativeScale,
    r.LearningDifficultyScale,
    r.LiteracyScale,
    r.PrimaryAddiction,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM ResidentProgrammeEpisode prev
            WHERE prev.ResidentId = r.Id
              AND prev.Id <> e.Id
              AND prev.StartDate < e.StartDate
        ) THEN 1
        ELSE r.IsPreviousResident
    END,
    COALESCE(r.AdmissionDate, r.CreatedAtUtc),
    NULL
FROM Resident r
LEFT JOIN ResidentProgrammeEpisode e ON e.ResidentId = r.Id
LEFT JOIN ResidentCase rc ON rc.ResidentId = r.Id AND rc.CentreId = e.CentreId AND ((rc.UnitId = e.UnitId) OR (rc.UnitId IS NULL AND e.UnitId IS NULL));
");

            // 6. Enforce lifecycle FKs that are currently only logical references.
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

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCaseConsent_CaseId_ConsentType_EffectiveFromUtc",
                table: "ResidentCaseConsent",
                columns: new[] { "CaseId", "ConsentType", "EffectiveFromUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCaseAction_AssignedToUserId",
                table: "ResidentCaseAction",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCaseAction_CaseId_Status_RaisedAtUtc",
                table: "ResidentCaseAction",
                columns: new[] { "CaseId", "Status", "RaisedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentAssessmentProfile_AssessedByUserId",
                table: "ResidentAssessmentProfile",
                column: "AssessedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentAssessmentProfile_CaseId_ProfileType",
                table: "ResidentAssessmentProfile",
                columns: new[] { "CaseId", "ProfileType" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentAssessmentProfile_EpisodeId_ProfileType",
                table: "ResidentAssessmentProfile",
                columns: new[] { "EpisodeId", "ProfileType" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentAssessmentProfile_ResidentId_AssessedAtUtc",
                table: "ResidentAssessmentProfile",
                columns: new[] { "ResidentId", "AssessedAtUtc" });

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

            migrationBuilder.AddForeignKey(
                name: "FK_EpisodeEvent_ResidentProgrammeEpisode_EpisodeId",
                table: "EpisodeEvent",
                column: "EpisodeId",
                principalTable: "ResidentProgrammeEpisode",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EpisodeEvent_AppUser_CreatedByUserId",
                table: "EpisodeEvent",
                column: "CreatedByUserId",
                principalTable: "AppUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentProgrammeEpisode_Resident_ResidentId",
                table: "ResidentProgrammeEpisode",
                column: "ResidentId",
                principalTable: "Resident",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentProgrammeEpisode_Centre_CentreId",
                table: "ResidentProgrammeEpisode",
                column: "CentreId",
                principalTable: "Centre",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentProgrammeEpisode_Unit_UnitId",
                table: "ResidentProgrammeEpisode",
                column: "UnitId",
                principalTable: "Unit",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentWeeklyTherapyAssignment_Resident_ResidentId",
                table: "ResidentWeeklyTherapyAssignment",
                column: "ResidentId",
                principalTable: "Resident",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentWeeklyTherapyAssignment_ResidentProgrammeEpisode_EpisodeId",
                table: "ResidentWeeklyTherapyAssignment",
                column: "EpisodeId",
                principalTable: "ResidentProgrammeEpisode",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentWeeklyTherapyAssignment_TherapyTopic_TherapyTopicId",
                table: "ResidentWeeklyTherapyAssignment",
                column: "TherapyTopicId",
                principalTable: "TherapyTopic",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentWeeklyTherapyAssignment_AppUser_CreatedByUserId",
                table: "ResidentWeeklyTherapyAssignment",
                column: "CreatedByUserId",
                principalTable: "AppUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TherapyTopicCompletion_Resident_ResidentId",
                table: "TherapyTopicCompletion",
                column: "ResidentId",
                principalTable: "Resident",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TherapyTopicCompletion_ResidentProgrammeEpisode_EpisodeId",
                table: "TherapyTopicCompletion",
                column: "EpisodeId",
                principalTable: "ResidentProgrammeEpisode",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TherapyTopicCompletion_TherapyTopic_TherapyTopicId",
                table: "TherapyTopicCompletion",
                column: "TherapyTopicId",
                principalTable: "TherapyTopic",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TherapyTopicCompletion_AppUser_CreatedByUserId",
                table: "TherapyTopicCompletion",
                column: "CreatedByUserId",
                principalTable: "AppUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 7. Widen FormSubmission.SubjectType a touch so it comfortably carries case/episode semantics.
            migrationBuilder.AlterColumn<string>(
                name: "SubjectType",
                table: "FormSubmission",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            // 8. Introduce additional event types for the new operating model.
            migrationBuilder.InsertData(
                table: "EpisodeEventType",
                columns: new[] { "Id", "Code", "DefaultName", "IsActive" },
                values: new object[,]
                {
                    { 11, "ROOM_CHECK", "RoomCheck", true },
                    { 12, "WELFARE_CHECK", "WelfareCheck", true },
                    { 13, "KEYWORKER_MEETING", "KeyworkerMeeting", true },
                    { 14, "ASSESSMENT_COMPLETED", "AssessmentCompleted", true },
                    { 15, "CONSENT_CAPTURED", "ConsentCaptured", true },
                    { 16, "ACTION_RAISED", "ActionRaised", true },
                    { 17, "ADMISSION_APPROVED", "AdmissionApproved", true },
                    { 18, "ROOM_CHANGE", "RoomChange", true }
                });

            // 9. Drop the legacy composite resident columns now that the data has been moved.
            migrationBuilder.DropIndex(name: "IX_Resident_UnitCode_RoomNumber", table: "Resident");

            migrationBuilder.DropColumn(name: "AdmissionDate", table: "Resident");
            migrationBuilder.DropColumn(name: "ArgumentativeScale", table: "Resident");
            migrationBuilder.DropColumn(name: "DietaryNeedsCode", table: "Resident");
            migrationBuilder.DropColumn(name: "ExpectedCompletionDate", table: "Resident");
            migrationBuilder.DropColumn(name: "HasCriminalHistory", table: "Resident");
            migrationBuilder.DropColumn(name: "IsDrug", table: "Resident");
            migrationBuilder.DropColumn(name: "IsGambeler", table: "Resident");
            migrationBuilder.DropColumn(name: "IsOnProbation", table: "Resident");
            migrationBuilder.DropColumn(name: "IsPreviousResident", table: "Resident");
            migrationBuilder.DropColumn(name: "IsSnorer", table: "Resident");
            migrationBuilder.DropColumn(name: "LearningDifficultyScale", table: "Resident");
            migrationBuilder.DropColumn(name: "LiteracyScale", table: "Resident");
            migrationBuilder.DropColumn(name: "PrimaryAddiction", table: "Resident");
            migrationBuilder.DropColumn(name: "RoomNumber", table: "Resident");
            migrationBuilder.DropColumn(name: "UnitCode", table: "Resident");
            migrationBuilder.DropColumn(name: "UnitId", table: "Resident");
            migrationBuilder.DropColumn(name: "WeekNumber", table: "Resident");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(name: "AdmissionDate", table: "Resident", type: "datetime2", nullable: true);
            migrationBuilder.AddColumn<int>(name: "ArgumentativeScale", table: "Resident", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<int>(name: "DietaryNeedsCode", table: "Resident", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<DateTime>(name: "ExpectedCompletionDate", table: "Resident", type: "datetime2", nullable: true);
            migrationBuilder.AddColumn<bool>(name: "HasCriminalHistory", table: "Resident", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsDrug", table: "Resident", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsGambeler", table: "Resident", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsOnProbation", table: "Resident", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsPreviousResident", table: "Resident", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsSnorer", table: "Resident", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<int>(name: "LearningDifficultyScale", table: "Resident", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<int>(name: "LiteracyScale", table: "Resident", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.AddColumn<string>(name: "PrimaryAddiction", table: "Resident", type: "nvarchar(100)", maxLength: 100, nullable: true);
            migrationBuilder.AddColumn<string>(name: "RoomNumber", table: "Resident", type: "nvarchar(20)", maxLength: 20, nullable: true);
            migrationBuilder.AddColumn<string>(name: "UnitCode", table: "Resident", type: "nvarchar(20)", maxLength: 20, nullable: true);
            migrationBuilder.AddColumn<Guid>(name: "UnitId", table: "Resident", type: "uniqueidentifier", nullable: true);
            migrationBuilder.AddColumn<int>(name: "WeekNumber", table: "Resident", type: "int", nullable: false, defaultValue: 0);
            migrationBuilder.CreateIndex(name: "IX_Resident_UnitCode_RoomNumber", table: "Resident", columns: new[] { "UnitCode", "RoomNumber" });

            migrationBuilder.Sql(@"
UPDATE r
SET
    r.AdmissionDate = e.AdmissionDateUtc,
    r.ExpectedCompletionDate = e.ExpectedCompletionDateUtc,
    r.RoomNumber = e.RoomNumber,
    r.UnitId = e.UnitId,
    r.WeekNumber = e.CurrentWeekNumber,
    r.PrimaryAddiction = p.PrimaryAddiction,
    r.IsDrug = p.IsDrug,
    r.IsGambeler = p.IsGambler,
    r.IsPreviousResident = p.IsPreviousResident,
    r.DietaryNeedsCode = p.DietaryNeedsCode,
    r.IsSnorer = p.IsSnorer,
    r.HasCriminalHistory = p.HasCriminalHistory,
    r.IsOnProbation = p.IsOnProbation,
    r.ArgumentativeScale = p.ArgumentativeScale,
    r.LearningDifficultyScale = p.LearningDifficultyScale,
    r.LiteracyScale = p.LiteracyScale
FROM Resident r
LEFT JOIN ResidentProgrammeEpisode e ON e.ResidentId = r.Id
LEFT JOIN ResidentAssessmentProfile p ON p.ResidentId = r.Id AND p.EpisodeId = e.Id;
");

            migrationBuilder.DeleteData(
                table: "EpisodeEventType",
                keyColumn: "Id",
                keyValues: new object[] { 11, 12, 13, 14, 15, 16, 17, 18 });

            migrationBuilder.AlterColumn<string>(
                name: "SubjectType",
                table: "FormSubmission",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40);

            migrationBuilder.DropForeignKey(name: "FK_EpisodeEvent_ResidentProgrammeEpisode_EpisodeId", table: "EpisodeEvent");
            migrationBuilder.DropForeignKey(name: "FK_EpisodeEvent_AppUser_CreatedByUserId", table: "EpisodeEvent");
            migrationBuilder.DropForeignKey(name: "FK_ResidentProgrammeEpisode_Resident_ResidentId", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropForeignKey(name: "FK_ResidentProgrammeEpisode_Centre_CentreId", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropForeignKey(name: "FK_ResidentProgrammeEpisode_Unit_UnitId", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropForeignKey(name: "FK_ResidentWeeklyTherapyAssignment_Resident_ResidentId", table: "ResidentWeeklyTherapyAssignment");
            migrationBuilder.DropForeignKey(name: "FK_ResidentWeeklyTherapyAssignment_ResidentProgrammeEpisode_EpisodeId", table: "ResidentWeeklyTherapyAssignment");
            migrationBuilder.DropForeignKey(name: "FK_ResidentWeeklyTherapyAssignment_TherapyTopic_TherapyTopicId", table: "ResidentWeeklyTherapyAssignment");
            migrationBuilder.DropForeignKey(name: "FK_ResidentWeeklyTherapyAssignment_AppUser_CreatedByUserId", table: "ResidentWeeklyTherapyAssignment");
            migrationBuilder.DropForeignKey(name: "FK_TherapyTopicCompletion_Resident_ResidentId", table: "TherapyTopicCompletion");
            migrationBuilder.DropForeignKey(name: "FK_TherapyTopicCompletion_ResidentProgrammeEpisode_EpisodeId", table: "TherapyTopicCompletion");
            migrationBuilder.DropForeignKey(name: "FK_TherapyTopicCompletion_TherapyTopic_TherapyTopicId", table: "TherapyTopicCompletion");
            migrationBuilder.DropForeignKey(name: "FK_TherapyTopicCompletion_AppUser_CreatedByUserId", table: "TherapyTopicCompletion");

            migrationBuilder.DropIndex(name: "IX_ResidentProgrammeEpisode_CentreEpisodeCode", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropIndex(name: "IX_ResidentProgrammeEpisode_CentreId_EntryYear_EntryWeek_EntrySequence", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "CentreEpisodeCode", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EntryYear", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EntryWeek", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EntrySequence", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "EpisodeStatus", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "AdmissionDateUtc", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "ExpectedCompletionDateUtc", table: "ResidentProgrammeEpisode");
            migrationBuilder.DropColumn(name: "RoomNumber", table: "ResidentProgrammeEpisode");

            migrationBuilder.DropTable(name: "ResidentCaseAction");
            migrationBuilder.DropTable(name: "ResidentCaseConsent");
            migrationBuilder.DropTable(name: "ResidentAssessmentProfile");
            migrationBuilder.DropTable(name: "ResidentCase");
        }
    }
}
