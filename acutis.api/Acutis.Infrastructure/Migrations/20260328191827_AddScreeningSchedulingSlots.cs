using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScreeningSchedulingSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScreeningScheduleSlot",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScreeningScheduleSlot", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScreeningScheduleSlot_Centre_CentreId",
                        column: x => x.CentreId,
                        principalTable: "Centre",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ScreeningScheduleSlot_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.entity_missing",
                column: "DefaultText",
                value: "Awaiting Scheduling");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2c5919be-4289-4727-9845-8d94b404bf0f"),
                column: "Text",
                value: "بانتظار الجدولة");

            migrationBuilder.CreateIndex(
                name: "IX_ScreeningScheduleSlot_CentreId",
                table: "ScreeningScheduleSlot",
                column: "CentreId");

            migrationBuilder.CreateIndex(
                name: "IX_ScreeningScheduleSlot_UnitId_ScheduledDate",
                table: "ScreeningScheduleSlot",
                columns: new[] { "UnitId", "ScheduledDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScreeningScheduleSlot");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.entity_missing",
                column: "DefaultText",
                value: "Entity Missing");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2c5919be-4289-4727-9845-8d94b404bf0f"),
                column: "Text",
                value: "الكيان مفقود");
        }
    }
}
