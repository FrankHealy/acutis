using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTherapySchedulingAudited : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActorRole = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    BeforeJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AfterJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RequestPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    RequestMethod = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClientIp = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EpisodeEvent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EpisodeEvent", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResidentProgrammeEpisode",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ProgrammeType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CurrentWeekNumber = table.Column<int>(type: "int", nullable: false),
                    ParticipationMode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CohortId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentProgrammeEpisode", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResidentWeeklyTherapyAssignment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TherapyTopicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignmentSource = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    OverrideReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SupersedesAssignmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentWeeklyTherapyAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentWeeklyTherapyAssignment_ResidentWeeklyTherapyAssignment_SupersedesAssignmentId",
                        column: x => x.SupersedesAssignmentId,
                        principalTable: "ResidentWeeklyTherapyAssignment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TherapySchedulingConfig",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IntakeDayPreference = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShiftIntakeIfPublicHoliday = table.Column<bool>(type: "bit", nullable: false),
                    DetoxWeeks = table.Column<int>(type: "int", nullable: false),
                    TotalWeeks = table.Column<int>(type: "int", nullable: false),
                    MainProgrammeWeeks = table.Column<int>(type: "int", nullable: false),
                    TopicsRequired = table.Column<int>(type: "int", nullable: false),
                    TopicsRunningPerWeek = table.Column<int>(type: "int", nullable: false),
                    WeekDefinition = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    HolidayCalendarCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AllowDuplicateCompletionsInEpisode = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TherapySchedulingConfig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TherapyTopic",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DefaultName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TherapyTopic", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TherapyTopicCompletion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TherapyTopicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompletedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    EvidenceNoteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TherapyTopicCompletion", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WeeklyTherapyRun",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WeekStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    WeekEndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TopicsRunningJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GeneratedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublishedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeeklyTherapyRun", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "TherapyTopic",
                columns: new[] { "Id", "Code", "DefaultName", "IsActive" },
                values: new object[,]
                {
                    { new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), "TOPIC_08", "Topic 8 (TBD)", true },
                    { new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), "TOPIC_06", "Topic 6 (TBD)", true },
                    { new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), "COPING_SKILLS", "Coping Skills", true },
                    { new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), "TOPIC_05", "Topic 5 (TBD)", true },
                    { new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), "TRIGGERS_AND_CRAVINGS", "Triggers and Cravings", true },
                    { new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), "TOPIC_04", "Topic 4 (TBD)", true },
                    { new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), "TOPIC_07", "Topic 7 (TBD)", true },
                    { new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), "TOPIC_10", "Topic 10 (TBD)", true },
                    { new Guid("f43ace7e-1961-422e-9af2-800a70990380"), "RELAPSE_PREVENTION", "Relapse Prevention", true },
                    { new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), "TOPIC_09", "Topic 9 (TBD)", true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_CorrelationId",
                table: "AuditLog",
                column: "CorrelationId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_EntityType_EntityId_OccurredAt",
                table: "AuditLog",
                columns: new[] { "EntityType", "EntityId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_EpisodeEvent_EpisodeId_EventDate_CreatedAt",
                table: "EpisodeEvent",
                columns: new[] { "EpisodeId", "EventDate", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentProgrammeEpisode_CentreId_UnitId_ProgrammeType",
                table: "ResidentProgrammeEpisode",
                columns: new[] { "CentreId", "UnitId", "ProgrammeType" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentProgrammeEpisode_ResidentId_StartDate",
                table: "ResidentProgrammeEpisode",
                columns: new[] { "ResidentId", "StartDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentWeeklyTherapyAssignment_ResidentId_EpisodeId_WeekStartDate_CreatedAt",
                table: "ResidentWeeklyTherapyAssignment",
                columns: new[] { "ResidentId", "EpisodeId", "WeekStartDate", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentWeeklyTherapyAssignment_SupersedesAssignmentId",
                table: "ResidentWeeklyTherapyAssignment",
                column: "SupersedesAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_TherapySchedulingConfig_CentreId_UnitId",
                table: "TherapySchedulingConfig",
                columns: new[] { "CentreId", "UnitId" },
                unique: true,
                filter: "[UnitId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_TherapyTopic_Code",
                table: "TherapyTopic",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TherapyTopicCompletion_EpisodeId_TherapyTopicId_CompletedOn",
                table: "TherapyTopicCompletion",
                columns: new[] { "EpisodeId", "TherapyTopicId", "CompletedOn" });

            migrationBuilder.CreateIndex(
                name: "IX_WeeklyTherapyRun_CentreId_UnitId_WeekStartDate",
                table: "WeeklyTherapyRun",
                columns: new[] { "CentreId", "UnitId", "WeekStartDate" },
                unique: true,
                filter: "[UnitId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLog");

            migrationBuilder.DropTable(
                name: "EpisodeEvent");

            migrationBuilder.DropTable(
                name: "ResidentProgrammeEpisode");

            migrationBuilder.DropTable(
                name: "ResidentWeeklyTherapyAssignment");

            migrationBuilder.DropTable(
                name: "TherapySchedulingConfig");

            migrationBuilder.DropTable(
                name: "TherapyTopic");

            migrationBuilder.DropTable(
                name: "TherapyTopicCompletion");

            migrationBuilder.DropTable(
                name: "WeeklyTherapyRun");
        }
    }
}
