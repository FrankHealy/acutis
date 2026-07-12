using System;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AcutisDbContext))]
    [Migration("20260524160000_SeedClinicalScheduleTemplates")]
    public partial class SeedClinicalScheduleTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ScheduleTemplate",
                columns: new[]
                {
                    "Id",
                    "AudienceType",
                    "CaptureRequirement",
                    "Category",
                    "CentreId",
                    "Code",
                    "CreatedAtUtc",
                    "Description",
                    "EndTime",
                    "ExternalResourceName",
                    "FacilitatorRole",
                    "FacilitatorType",
                    "IsActive",
                    "Name",
                    "RecurrenceType",
                    "ResidentSubsetType",
                    "StartTime",
                    "UpdatedAtUtc"
                },
                columnTypes: new[]
                {
                    "uniqueidentifier",
                    "nvarchar(24)",
                    "nvarchar(32)",
                    "nvarchar(80)",
                    "uniqueidentifier",
                    "nvarchar(100)",
                    "datetime2",
                    "nvarchar(500)",
                    "time",
                    "nvarchar(120)",
                    "nvarchar(80)",
                    "nvarchar(24)",
                    "bit",
                    "nvarchar(160)",
                    "nvarchar(24)",
                    "nvarchar(24)",
                    "time",
                    "datetime2"
                },
                values: new object[,]
                {
                    {
                        new Guid("66666666-1000-1000-1000-100000000021"),
                        "UnitResidents",
                        "None",
                        "health",
                        new Guid("aaaaaaaa-1111-1111-1111-111111111111"),
                        "doctor_visit",
                        new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Doctor clinic or visit for residents from this unit.",
                        new TimeSpan(0, 11, 0, 0, 0),
                        "Doctor",
                        null,
                        "External",
                        true,
                        "Doctor Visit",
                        "Daily",
                        "None",
                        new TimeSpan(0, 10, 0, 0, 0),
                        new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc)
                    },
                    {
                        new Guid("66666666-1000-1000-1000-100000000022"),
                        "UnitResidents",
                        "None",
                        "medication",
                        new Guid("aaaaaaaa-1111-1111-1111-111111111111"),
                        "medication_dispensation",
                        new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc),
                        "Medication dispensation round for residents from this unit.",
                        new TimeSpan(0, 8, 30, 0, 0),
                        null,
                        "Nurse",
                        "Staff",
                        true,
                        "Medication Dispensation",
                        "Daily",
                        "None",
                        new TimeSpan(0, 8, 0, 0, 0),
                        new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc)
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000021"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000022"));
        }
    }
}
