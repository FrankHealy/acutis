using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ScreeningFormV3BoundedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FormDefinition",
                columns: new[] { "Id", "Code", "CreatedAt", "DescriptionKey", "RulesJson", "SchemaJson", "Status", "TitleKey", "UiJson", "Version" },
                values: new object[] { new Guid("1159096f-504f-4892-bcce-b4e3245a99ab"), "alcohol_screening_call", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "screening.form.alcohol_screening_call.description", "[\n  {\n    \"if\": { \"field\": \"withdrawalHistory\", \"equals\": false },\n    \"then\": {},\n    \"else\": {}\n  }\n]", "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"callerName\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 120 },\n    \"phoneNumber\": { \"type\": \"string\", \"minLength\": 8, \"maxLength\": 20, \"pattern\": \"^[+0-9()\\\\-\\\\s]+$\", \"format\": \"phone\" },\n    \"emailAddress\": { \"type\": \"string\", \"maxLength\": 120, \"format\": \"email\" },\n    \"age\": { \"type\": \"integer\", \"minimum\": 16, \"maximum\": 120 },\n    \"drinksPerDay\": { \"type\": \"number\", \"minimum\": 0, \"maximum\": 100 },\n    \"daysDrinkingPerWeek\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 7 },\n    \"lastDrinkDate\": { \"type\": \"date\" },\n    \"withdrawalHistory\": { \"type\": \"boolean\" },\n    \"historyOfSeizures\": { \"type\": \"boolean\" },\n    \"currentlyUnsafe\": { \"type\": \"boolean\" },\n    \"suicidalIdeation\": { \"type\": \"boolean\" },\n    \"referralSource\": { \"type\": \"enum\", \"optionSetKey\": \"referral_source\" },\n    \"housingStatus\": { \"type\": \"string\", \"maxLength\": 120 },\n    \"supportNetwork\": { \"type\": \"string\", \"maxLength\": 300 },\n    \"medicalNotes\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"assessorNotes\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"nextSteps\": { \"type\": \"text\", \"maxLength\": 1000 }\n  },\n  \"required\": [ \"callerName\", \"phoneNumber\", \"age\", \"drinksPerDay\", \"referralSource\" ]\n}", "published", "screening.form.alcohol_screening_call.title", "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"phoneNumber\", \"emailAddress\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"daysDrinkingPerWeek\", \"lastDrinkDate\", \"withdrawalHistory\", \"historyOfSeizures\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"suicidalIdeation\", \"housingStatus\", \"supportNetwork\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"medicalNotes\", \"assessorNotes\", \"nextSteps\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"phoneNumber\": \"input\",\n    \"emailAddress\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"daysDrinkingPerWeek\": \"number\",\n    \"lastDrinkDate\": \"input\",\n    \"withdrawalHistory\": \"toggle\",\n    \"historyOfSeizures\": \"toggle\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"suicidalIdeation\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"housingStatus\": \"input\",\n    \"supportNetwork\": \"input\",\n    \"medicalNotes\": \"textarea\",\n    \"assessorNotes\": \"textarea\",\n    \"nextSteps\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"phoneNumber\": \"screening.field.phone_number.label\",\n    \"emailAddress\": \"screening.field.email_address.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"daysDrinkingPerWeek\": \"screening.field.days_drinking_per_week.label\",\n    \"lastDrinkDate\": \"screening.field.last_drink_date.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"historyOfSeizures\": \"screening.field.history_of_seizures.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"suicidalIdeation\": \"screening.field.suicidal_ideation.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"supportNetwork\": \"screening.field.support_network.label\",\n    \"medicalNotes\": \"screening.field.medical_notes.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\",\n    \"nextSteps\": \"screening.field.next_steps.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\",\n    \"nextSteps\": \"screening.field.next_steps.help\"\n  }\n}", 3 });

            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "screening.field.days_drinking_per_week.label", "Days Drinking Per Week" },
                    { "screening.field.email_address.label", "Email Address" },
                    { "screening.field.history_of_seizures.label", "History Of Seizures" },
                    { "screening.field.last_drink_date.label", "Last Drink Date" },
                    { "screening.field.medical_notes.label", "Medical Notes" },
                    { "screening.field.next_steps.help", "Capture agreed actions and ownership." },
                    { "screening.field.next_steps.label", "Next Steps" },
                    { "screening.field.phone_number.label", "Phone Number" },
                    { "screening.field.suicidal_ideation.label", "Suicidal Ideation" },
                    { "screening.field.support_network.label", "Support Network" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("1159096f-504f-4892-bcce-b4e3245a99ab"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.days_drinking_per_week.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.email_address.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.history_of_seizures.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.last_drink_date.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.medical_notes.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.next_steps.help");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.next_steps.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.phone_number.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.suicidal_ideation.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.support_network.label");
        }
    }
}
