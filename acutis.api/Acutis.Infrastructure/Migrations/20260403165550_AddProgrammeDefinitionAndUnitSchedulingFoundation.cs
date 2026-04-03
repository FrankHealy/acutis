using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProgrammeDefinitionAndUnitSchedulingFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProgrammeDefinitionId",
                table: "Unit",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProgrammeDefinition",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TotalDurationValue = table.Column<int>(type: "int", nullable: false),
                    TotalDurationUnit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DetoxPhaseDurationValue = table.Column<int>(type: "int", nullable: true),
                    DetoxPhaseDurationUnit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    MainPhaseDurationValue = table.Column<int>(type: "int", nullable: true),
                    MainPhaseDurationUnit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgrammeDefinition", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgrammeDefinition_Centre_CentreId",
                        column: x => x.CentreId,
                        principalTable: "Centre",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ScheduleTemplate",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProgrammeDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RecurrenceType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    WeeklyDayOfWeek = table.Column<int>(type: "int", nullable: true),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    AudienceType = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    CohortId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FacilitatorType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FacilitatorRole = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ExternalResourceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleTemplate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduleTemplate_Centre_CentreId",
                        column: x => x.CentreId,
                        principalTable: "Centre",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduleTemplate_ProgrammeDefinition_ProgrammeDefinitionId",
                        column: x => x.ProgrammeDefinitionId,
                        principalTable: "ProgrammeDefinition",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduleTemplate_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ScheduleTemplate_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ScheduleOccurrence",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProgrammeDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    AudienceType = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    CohortId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FacilitatorType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FacilitatorRole = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    ExternalResourceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduleOccurrence", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduleOccurrence_Centre_CentreId",
                        column: x => x.CentreId,
                        principalTable: "Centre",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduleOccurrence_ProgrammeDefinition_ProgrammeDefinitionId",
                        column: x => x.ProgrammeDefinitionId,
                        principalTable: "ProgrammeDefinition",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScheduleOccurrence_ResidentProgrammeEpisode_EpisodeId",
                        column: x => x.EpisodeId,
                        principalTable: "ResidentProgrammeEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ScheduleOccurrence_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ScheduleOccurrence_ScheduleTemplate_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "ScheduleTemplate",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ScheduleOccurrence_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "ProgrammeDefinition",
                columns: new[] { "Id", "CentreId", "Code", "CreatedAtUtc", "CreatedByUserId", "Description", "DetoxPhaseDurationUnit", "DetoxPhaseDurationValue", "IsActive", "MainPhaseDurationUnit", "MainPhaseDurationValue", "Name", "TotalDurationUnit", "TotalDurationValue", "UpdatedAtUtc", "UpdatedByUserId" },
                values: new object[] { new Guid("55555555-5555-5555-5555-555555555555"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "cm_alcohol_gambling_12_week", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Twelve week programme with two detox weeks followed by ten module weeks.", "Weeks", 2, true, "Weeks", 10, "12 Week Alcohol & Gambling Programme", "Weeks", 12, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null });

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "ProgrammeDefinitionId",
                value: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "ProgrammeDefinitionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "ProgrammeDefinitionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "ProgrammeDefinitionId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Unit_ProgrammeDefinitionId",
                table: "Unit",
                column: "ProgrammeDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgrammeDefinition_CentreId_Code",
                table: "ProgrammeDefinition",
                columns: new[] { "CentreId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProgrammeDefinition_CentreId_IsActive_Name",
                table: "ProgrammeDefinition",
                columns: new[] { "CentreId", "IsActive", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_CentreId_UnitId_ScheduledDate_StartTime",
                table: "ScheduleOccurrence",
                columns: new[] { "CentreId", "UnitId", "ScheduledDate", "StartTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_EpisodeId_ScheduledDate",
                table: "ScheduleOccurrence",
                columns: new[] { "EpisodeId", "ScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_ProgrammeDefinitionId",
                table: "ScheduleOccurrence",
                column: "ProgrammeDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_ResidentId",
                table: "ScheduleOccurrence",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_TemplateId",
                table: "ScheduleOccurrence",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_UnitId_ProgrammeDefinitionId_ScheduledDate",
                table: "ScheduleOccurrence",
                columns: new[] { "UnitId", "ProgrammeDefinitionId", "ScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleTemplate_CentreId_UnitId_Code",
                table: "ScheduleTemplate",
                columns: new[] { "CentreId", "UnitId", "Code" },
                unique: true,
                filter: "[UnitId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleTemplate_CentreId_UnitId_IsActive_Name",
                table: "ScheduleTemplate",
                columns: new[] { "CentreId", "UnitId", "IsActive", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleTemplate_ProgrammeDefinitionId",
                table: "ScheduleTemplate",
                column: "ProgrammeDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleTemplate_ResidentId",
                table: "ScheduleTemplate",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleTemplate_UnitId_ProgrammeDefinitionId_WeeklyDayOfWeek",
                table: "ScheduleTemplate",
                columns: new[] { "UnitId", "ProgrammeDefinitionId", "WeeklyDayOfWeek" });

            migrationBuilder.AddForeignKey(
                name: "FK_Unit_ProgrammeDefinition_ProgrammeDefinitionId",
                table: "Unit",
                column: "ProgrammeDefinitionId",
                principalTable: "ProgrammeDefinition",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Unit_ProgrammeDefinition_ProgrammeDefinitionId",
                table: "Unit");

            migrationBuilder.DropTable(
                name: "ScheduleOccurrence");

            migrationBuilder.DropTable(
                name: "ScheduleTemplate");

            migrationBuilder.DropTable(
                name: "ProgrammeDefinition");

            migrationBuilder.DropIndex(
                name: "IX_Unit_ProgrammeDefinitionId",
                table: "Unit");

            migrationBuilder.DropColumn(
                name: "ProgrammeDefinitionId",
                table: "Unit");
        }
    }
}
