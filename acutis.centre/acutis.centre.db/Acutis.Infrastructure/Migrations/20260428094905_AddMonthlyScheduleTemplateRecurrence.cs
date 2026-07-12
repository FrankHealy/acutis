using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMonthlyScheduleTemplateRecurrence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MonthlyDayOfMonth",
                table: "ScheduleTemplate",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "RecurrenceStartDate",
                table: "ScheduleTemplate",
                type: "date",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000001"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000002"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000003"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000004"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000005"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000006"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000007"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000008"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000009"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000010"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000011"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000012"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000013"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000014"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000015"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000016"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000017"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000018"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000019"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000020"),
                columns: new[] { "MonthlyDayOfMonth", "RecurrenceStartDate" },
                values: new object[] { null, null });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduleTemplate_UnitId_ProgrammeDefinitionId_MonthlyDayOfMonth_RecurrenceStartDate",
                table: "ScheduleTemplate",
                columns: new[] { "UnitId", "ProgrammeDefinitionId", "MonthlyDayOfMonth", "RecurrenceStartDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ScheduleTemplate_UnitId_ProgrammeDefinitionId_MonthlyDayOfMonth_RecurrenceStartDate",
                table: "ScheduleTemplate");

            migrationBuilder.DropColumn(
                name: "MonthlyDayOfMonth",
                table: "ScheduleTemplate");

            migrationBuilder.DropColumn(
                name: "RecurrenceStartDate",
                table: "ScheduleTemplate");
        }
    }
}
