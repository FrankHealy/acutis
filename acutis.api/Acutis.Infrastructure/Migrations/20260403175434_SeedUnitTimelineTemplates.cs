using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedUnitTimelineTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ScheduleTemplate",
                columns: new[] { "Id", "AudienceType", "Category", "CentreId", "Code", "CohortId", "CreatedAtUtc", "CreatedByUserId", "Description", "EndTime", "ExternalResourceName", "FacilitatorRole", "FacilitatorType", "IsActive", "Name", "ProgrammeDefinitionId", "RecurrenceType", "ResidentId", "StartTime", "UnitId", "UpdatedAtUtc", "UpdatedByUserId", "WeeklyDayOfWeek" },
                values: new object[,]
                {
                    { new Guid("66666666-1000-1000-1000-100000000001"), "UnitResidents", "routine", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "wake_up_bell", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Morning wake up call for all residents", null, null, null, "None", true, "Wake Up Bell", null, "Daily", null, new TimeSpan(0, 6, 30, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000002"), "UnitResidents", "attendance", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "roll_call_morning", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Morning roll call followed by guided meditation session", new TimeSpan(0, 7, 45, 0, 0), null, null, "None", true, "Roll Call", null, "Daily", null, new TimeSpan(0, 7, 15, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000003"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "works_group", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Works Meeting (Mon) or Group Therapy (Tue-Fri).", new TimeSpan(0, 8, 30, 0, 0), null, null, "None", true, "Works/Group", null, "Daily", null, new TimeSpan(0, 7, 45, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000004"), "UnitResidents", "checks", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "room_check", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Daily room inspection and tidiness check", null, null, null, "None", true, "Room Check", null, "Daily", null, new TimeSpan(0, 8, 30, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000005"), "UnitResidents", "refreshments", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "coffee_morning", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Morning coffee and social time", null, null, null, "None", true, "Coffee", null, "Daily", null, new TimeSpan(0, 8, 45, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000006"), "UnitResidents", "therapy", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "ot_morning", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Morning Occupational Therapy - skills development", new TimeSpan(0, 12, 30, 0, 0), null, null, "None", true, "OT", null, "Daily", null, new TimeSpan(0, 9, 5, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000007"), "UnitResidents", "meals", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "lunch", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Midday meal service", null, null, null, "None", true, "Lunch", null, "Daily", null, new TimeSpan(0, 12, 30, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000008"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "gambling_aware", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Gambling Awareness Meeting", new TimeSpan(0, 14, 45, 0, 0), null, null, "None", true, "Gambling Aware", null, "Daily", null, new TimeSpan(0, 14, 0, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000009"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "focus_meeting", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Focus Meeting", new TimeSpan(0, 14, 45, 0, 0), null, null, "None", true, "Focus Meeting", null, "Daily", null, new TimeSpan(0, 14, 0, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000010"), "UnitResidents", "therapy", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "ot_afternoon", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Afternoon Occupational Therapy", new TimeSpan(0, 16, 0, 0, 0), null, null, "None", true, "OT", null, "Daily", null, new TimeSpan(0, 14, 45, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000011"), "UnitResidents", "refreshments", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "coffee_afternoon", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Afternoon coffee break", null, null, null, "None", true, "Coffee", null, "Daily", null, new TimeSpan(0, 16, 0, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000012"), "UnitResidents", "therapy", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "ot_focus", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "OT or Focus Meeting session", new TimeSpan(0, 17, 15, 0, 0), null, null, "None", true, "OT/Focus", null, "Daily", null, new TimeSpan(0, 16, 30, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000013"), "UnitResidents", "meals", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "tea", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Evening meal service", null, null, null, "None", true, "Tea", null, "Daily", null, new TimeSpan(0, 17, 30, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000014"), "UnitResidents", "attendance", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "roll_call_evening", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Evening roll call and meditation", null, null, null, "None", true, "Roll Call", null, "Daily", null, new TimeSpan(0, 18, 15, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000015"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "group_a", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Evening group therapy session - Cohort A", new TimeSpan(0, 19, 45, 0, 0), null, null, "None", true, "Group A", null, "Daily", null, new TimeSpan(0, 18, 45, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000016"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "group_b", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Evening group therapy session - Cohort B", new TimeSpan(0, 19, 45, 0, 0), null, null, "None", true, "Group B", null, "Daily", null, new TimeSpan(0, 18, 45, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000017"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "group_c", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Evening group therapy session - Cohort C", new TimeSpan(0, 19, 45, 0, 0), null, null, "None", true, "Group C", null, "Daily", null, new TimeSpan(0, 18, 45, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000018"), "UnitResidents", "spiritual", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "rosary", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Evening prayer service", null, null, null, "None", true, "Rosary", null, "Daily", null, new TimeSpan(0, 20, 0, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000019"), "UnitResidents", "group", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "support_meeting", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Support group meetings", new TimeSpan(0, 21, 30, 0, 0), null, null, "None", true, "AA/NA/GA", null, "Daily", null, new TimeSpan(0, 20, 30, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null },
                    { new Guid("66666666-1000-1000-1000-100000000020"), "UnitResidents", "routine", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "bedtime", null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, "Lights out - rest time", null, null, null, "None", true, "Bedtime", null, "Daily", null, new TimeSpan(0, 22, 0, 0, 0), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000001"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000002"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000003"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000004"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000005"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000006"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000007"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000008"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000009"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000010"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000011"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000012"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000013"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000014"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000015"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000016"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000017"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000018"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000019"));

            migrationBuilder.DeleteData(
                table: "ScheduleTemplate",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1000-1000-1000-100000000020"));
        }
    }
}
