using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ScreeningFormV2Sections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FormDefinition",
                columns: new[] { "Id", "Code", "CreatedAt", "DescriptionKey", "RulesJson", "SchemaJson", "Status", "TitleKey", "UiJson", "Version" },
                values: new object[] { new Guid("9ed5438e-70f7-4567-a8f6-b8402b645a69"), "alcohol_screening_call", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), "screening.form.alcohol_screening_call.description", "[\n  {\n    \"if\": { \"field\": \"withdrawalHistory\", \"equals\": false },\n    \"then\": {},\n    \"else\": {}\n  }\n]", "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"callerName\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 120 },\n    \"age\": { \"type\": \"integer\", \"minimum\": 16, \"maximum\": 120 },\n    \"drinksPerDay\": { \"type\": \"number\", \"minimum\": 0, \"maximum\": 100 },\n    \"withdrawalHistory\": { \"type\": \"boolean\" },\n    \"referralSource\": { \"type\": \"enum\", \"optionSetKey\": \"referral_source\" },\n    \"currentlyUnsafe\": { \"type\": \"boolean\" },\n    \"housingStatus\": { \"type\": \"string\", \"maxLength\": 120 },\n    \"assessorNotes\": { \"type\": \"text\", \"maxLength\": 2000 }\n  },\n  \"required\": [ \"age\", \"drinksPerDay\", \"referralSource\" ]\n}", "published", "screening.form.alcohol_screening_call.title", "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"withdrawalHistory\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"housingStatus\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"assessorNotes\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"withdrawalHistory\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"housingStatus\": \"input\",\n    \"assessorNotes\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\"\n  }\n}", 2 });

            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "screening.field.assessor_notes.help", "Add contextual details for follow-up and handover." },
                    { "screening.field.assessor_notes.label", "Assessor Notes" },
                    { "screening.field.currently_unsafe.label", "Immediate Safety Concern" },
                    { "screening.field.housing_status.label", "Housing Status" },
                    { "screening.section.follow_up", "Follow Up Notes" },
                    { "screening.section.stability", "Stability & Safety" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("9ed5438e-70f7-4567-a8f6-b8402b645a69"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.assessor_notes.help");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.assessor_notes.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.currently_unsafe.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.housing_status.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.section.follow_up");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.section.stability");
        }
    }
}
