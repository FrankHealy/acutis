using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduleResidentSubsetType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResidentSubsetType",
                table: "ScheduleTemplate",
                type: "nvarchar(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<string>(
                name: "ResidentSubsetType",
                table: "ScheduleOccurrence",
                type: "nvarchar(24)",
                maxLength: 24,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000001"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000002"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000003"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000004"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000005"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000006"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000007"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000008"),
                columns: new[] { "AudienceType", "ResidentSubsetType" },
                values: new object[] { "ResidentSubset", "Gambling" });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000009"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000010"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000011"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000012"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000013"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000014"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000015"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000016"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000017"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000018"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000019"),
                column: "ResidentSubsetType",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000020"),
                column: "ResidentSubsetType",
                value: "None");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResidentSubsetType",
                table: "ScheduleTemplate");

            migrationBuilder.DropColumn(
                name: "ResidentSubsetType",
                table: "ScheduleOccurrence");
        }
    }
}
