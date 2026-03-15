using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEpisodeEventTypeLookup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EpisodeEventType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DefaultName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EpisodeEventType", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "EpisodeEventType",
                columns: new[] { "Id", "Code", "DefaultName", "IsActive" },
                values: new object[,]
                {
                    { 1, "PAUSED", "Paused", true },
                    { 2, "RESUMED", "Resumed", true },
                    { 3, "WEEKREPOSITIONED", "WeekRepositioned", true },
                    { 4, "COHORTCHANGED", "CohortChanged", true },
                    { 5, "PARTICIPATIONMODECHANGED", "ParticipationModeChanged", true },
                    { 6, "EJECTED", "Ejected", true },
                    { 7, "COMPLETED", "Completed", true },
                    { 8, "SELFDISCHARGE", "SelfDischarge", true },
                    { 9, "EXTENDEDSTAY", "ExtendedStay", true },
                    { 10, "CLINICALDISCHARGE", "ClinicalDischarge", true }
                });

            migrationBuilder.AddColumn<int>(
                name: "EventTypeId",
                table: "EpisodeEvent",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE EpisodeEvent
                SET EventTypeId =
                    CASE EventType
                        WHEN 'Paused' THEN 1
                        WHEN 'Resumed' THEN 2
                        WHEN 'WeekRepositioned' THEN 3
                        WHEN 'CohortChanged' THEN 4
                        WHEN 'ParticipationModeChanged' THEN 5
                        WHEN 'Ejected' THEN 6
                        WHEN 'Completed' THEN 7
                        WHEN 'SelfDischarge' THEN 8
                        WHEN 'ExtendedStay' THEN 9
                        WHEN 'ClinicalDischarge' THEN 10
                    END
                """);

            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM EpisodeEvent WHERE EventTypeId IS NULL)
                    THROW 50000, 'EpisodeEvent contains EventType values that cannot be mapped to EpisodeEventType.', 1;
                """);

            migrationBuilder.AlterColumn<int>(
                name: "EventTypeId",
                table: "EpisodeEvent",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "EventType",
                table: "EpisodeEvent");

            migrationBuilder.CreateIndex(
                name: "IX_EpisodeEvent_EventTypeId",
                table: "EpisodeEvent",
                column: "EventTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_EpisodeEventType_Code",
                table: "EpisodeEventType",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_EpisodeEvent_EpisodeEventType_EventTypeId",
                table: "EpisodeEvent",
                column: "EventTypeId",
                principalTable: "EpisodeEventType",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EpisodeEvent_EpisodeEventType_EventTypeId",
                table: "EpisodeEvent");

            migrationBuilder.DropIndex(
                name: "IX_EpisodeEvent_EventTypeId",
                table: "EpisodeEvent");

            migrationBuilder.AddColumn<string>(
                name: "EventType",
                table: "EpisodeEvent",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE EpisodeEvent
                SET EventType =
                    CASE EventTypeId
                        WHEN 1 THEN 'Paused'
                        WHEN 2 THEN 'Resumed'
                        WHEN 3 THEN 'WeekRepositioned'
                        WHEN 4 THEN 'CohortChanged'
                        WHEN 5 THEN 'ParticipationModeChanged'
                        WHEN 6 THEN 'Ejected'
                        WHEN 7 THEN 'Completed'
                        WHEN 8 THEN 'SelfDischarge'
                        WHEN 9 THEN 'ExtendedStay'
                        WHEN 10 THEN 'ClinicalDischarge'
                    END
                """);

            migrationBuilder.AlterColumn<string>(
                name: "EventType",
                table: "EpisodeEvent",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "EventTypeId",
                table: "EpisodeEvent");

            migrationBuilder.DropTable(
                name: "EpisodeEventType");
        }
    }
}
