using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduleCaptureRequirement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CaptureRequirement",
                table: "ScheduleTemplate",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<string>(
                name: "CaptureRequirement",
                table: "ScheduleOccurrence",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000001"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000002"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000003"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000004"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000005"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000006"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000007"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000008"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000009"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000010"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000011"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000012"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000013"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000014"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000015"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000016"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000017"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000018"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000019"),
                column: "CaptureRequirement",
                value: "None");

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000020"),
                column: "CaptureRequirement",
                value: "None");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaptureRequirement",
                table: "ScheduleTemplate");

            migrationBuilder.DropColumn(
                name: "CaptureRequirement",
                table: "ScheduleOccurrence");
        }
    }
}
