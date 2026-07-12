using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitStaffRosterAndTimelineFacilitatorAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedFacilitatorUserId",
                table: "ScheduleOccurrence",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UnitStaffRosterAssignment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ShiftType = table.Column<string>(type: "nvarchar(48)", maxLength: 48, nullable: false),
                    AssignedAppUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitStaffRosterAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UnitStaffRosterAssignment_AppUser_AssignedAppUserId",
                        column: x => x.AssignedAppUserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UnitStaffRosterAssignment_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleOccurrence_AssignedFacilitatorUserId",
                table: "ScheduleOccurrence",
                column: "AssignedFacilitatorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitStaffRosterAssignment_AssignedAppUserId",
                table: "UnitStaffRosterAssignment",
                column: "AssignedAppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitStaffRosterAssignment_UnitId_ScheduledDate",
                table: "UnitStaffRosterAssignment",
                columns: new[] { "UnitId", "ScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_UnitStaffRosterAssignment_UnitId_ScheduledDate_ShiftType",
                table: "UnitStaffRosterAssignment",
                columns: new[] { "UnitId", "ScheduledDate", "ShiftType" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduleOccurrence_AppUser_AssignedFacilitatorUserId",
                table: "ScheduleOccurrence",
                column: "AssignedFacilitatorUserId",
                principalTable: "AppUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ScheduleOccurrence_AppUser_AssignedFacilitatorUserId",
                table: "ScheduleOccurrence");

            migrationBuilder.DropTable(
                name: "UnitStaffRosterAssignment");

            migrationBuilder.DropIndex(
                name: "IX_ScheduleOccurrence_AssignedFacilitatorUserId",
                table: "ScheduleOccurrence");

            migrationBuilder.DropColumn(
                name: "AssignedFacilitatorUserId",
                table: "ScheduleOccurrence");
        }
    }
}
