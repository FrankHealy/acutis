using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdjustOtRoleDefinitionIndexesForUnitScopedConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OtRoleDefinition_CentreId_Name",
                table: "OtRoleDefinition");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "OtRoleDefinition",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsOneOff",
                table: "OtRoleDefinition",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ScheduledDate",
                table: "OtRoleDefinition",
                type: "date",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OtRoleDefinition_CentreId_UnitId_IsOneOff_ScheduledDate",
                table: "OtRoleDefinition",
                columns: new[] { "CentreId", "UnitId", "IsOneOff", "ScheduledDate" });

            migrationBuilder.CreateIndex(
                name: "IX_OtRoleDefinition_CentreId_UnitId_Name",
                table: "OtRoleDefinition",
                columns: new[] { "CentreId", "UnitId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_OtRoleDefinition_UnitId",
                table: "OtRoleDefinition",
                column: "UnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_OtRoleDefinition_Centre_CentreId",
                table: "OtRoleDefinition",
                column: "CentreId",
                principalTable: "Centre",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OtRoleDefinition_Unit_UnitId",
                table: "OtRoleDefinition",
                column: "UnitId",
                principalTable: "Unit",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OtRoleDefinition_Centre_CentreId",
                table: "OtRoleDefinition");

            migrationBuilder.DropForeignKey(
                name: "FK_OtRoleDefinition_Unit_UnitId",
                table: "OtRoleDefinition");

            migrationBuilder.DropIndex(
                name: "IX_OtRoleDefinition_CentreId_UnitId_IsOneOff_ScheduledDate",
                table: "OtRoleDefinition");

            migrationBuilder.DropIndex(
                name: "IX_OtRoleDefinition_CentreId_UnitId_Name",
                table: "OtRoleDefinition");

            migrationBuilder.DropIndex(
                name: "IX_OtRoleDefinition_UnitId",
                table: "OtRoleDefinition");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "OtRoleDefinition");

            migrationBuilder.DropColumn(
                name: "IsOneOff",
                table: "OtRoleDefinition");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "OtRoleDefinition");

            migrationBuilder.CreateIndex(
                name: "IX_OtRoleDefinition_CentreId_Name",
                table: "OtRoleDefinition",
                columns: new[] { "CentreId", "Name" },
                unique: true);
        }
    }
}
