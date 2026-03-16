using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixScreeningHousingStatusWidget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [FormDefinition]
                SET [UiJson] = REPLACE([UiJson], '"housingStatus": "input"', '"housingStatus": "select"')
                WHERE [Id] = 'e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028';
                """);

            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("1159096f-504f-4892-bcce-b4e3245a99ab"),
                column: "UiJson",
                value: "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"phoneNumber\", \"emailAddress\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"daysDrinkingPerWeek\", \"lastDrinkDate\", \"withdrawalHistory\", \"historyOfSeizures\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"suicidalIdeation\", \"housingStatus\", \"supportNetwork\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"medicalNotes\", \"assessorNotes\", \"nextSteps\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"phoneNumber\": \"input\",\n    \"emailAddress\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"daysDrinkingPerWeek\": \"number\",\n    \"lastDrinkDate\": \"input\",\n    \"withdrawalHistory\": \"toggle\",\n    \"historyOfSeizures\": \"toggle\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"suicidalIdeation\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"housingStatus\": \"select\",\n    \"supportNetwork\": \"input\",\n    \"medicalNotes\": \"textarea\",\n    \"assessorNotes\": \"textarea\",\n    \"nextSteps\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"phoneNumber\": \"screening.field.phone_number.label\",\n    \"emailAddress\": \"screening.field.email_address.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"daysDrinkingPerWeek\": \"screening.field.days_drinking_per_week.label\",\n    \"lastDrinkDate\": \"screening.field.last_drink_date.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"historyOfSeizures\": \"screening.field.history_of_seizures.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"suicidalIdeation\": \"screening.field.suicidal_ideation.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"supportNetwork\": \"screening.field.support_network.label\",\n    \"medicalNotes\": \"screening.field.medical_notes.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\",\n    \"nextSteps\": \"screening.field.next_steps.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\",\n    \"nextSteps\": \"screening.field.next_steps.help\"\n  }\n}");

            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("9ed5438e-70f7-4567-a8f6-b8402b645a69"),
                column: "UiJson",
                value: "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"withdrawalHistory\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"housingStatus\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"assessorNotes\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"withdrawalHistory\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"housingStatus\": \"select\",\n    \"assessorNotes\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\"\n  }\n}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [FormDefinition]
                SET [UiJson] = REPLACE([UiJson], '"housingStatus": "select"', '"housingStatus": "input"')
                WHERE [Id] = 'e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028';
                """);

            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("1159096f-504f-4892-bcce-b4e3245a99ab"),
                column: "UiJson",
                value: "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"phoneNumber\", \"emailAddress\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"daysDrinkingPerWeek\", \"lastDrinkDate\", \"withdrawalHistory\", \"historyOfSeizures\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"suicidalIdeation\", \"housingStatus\", \"supportNetwork\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"medicalNotes\", \"assessorNotes\", \"nextSteps\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"phoneNumber\": \"input\",\n    \"emailAddress\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"daysDrinkingPerWeek\": \"number\",\n    \"lastDrinkDate\": \"input\",\n    \"withdrawalHistory\": \"toggle\",\n    \"historyOfSeizures\": \"toggle\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"suicidalIdeation\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"housingStatus\": \"input\",\n    \"supportNetwork\": \"input\",\n    \"medicalNotes\": \"textarea\",\n    \"assessorNotes\": \"textarea\",\n    \"nextSteps\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"phoneNumber\": \"screening.field.phone_number.label\",\n    \"emailAddress\": \"screening.field.email_address.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"daysDrinkingPerWeek\": \"screening.field.days_drinking_per_week.label\",\n    \"lastDrinkDate\": \"screening.field.last_drink_date.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"historyOfSeizures\": \"screening.field.history_of_seizures.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"suicidalIdeation\": \"screening.field.suicidal_ideation.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"supportNetwork\": \"screening.field.support_network.label\",\n    \"medicalNotes\": \"screening.field.medical_notes.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\",\n    \"nextSteps\": \"screening.field.next_steps.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\",\n    \"nextSteps\": \"screening.field.next_steps.help\"\n  }\n}");

            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("9ed5438e-70f7-4567-a8f6-b8402b645a69"),
                column: "UiJson",
                value: "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"withdrawalHistory\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"housingStatus\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"assessorNotes\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"withdrawalHistory\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"housingStatus\": \"input\",\n    \"assessorNotes\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\"\n  }\n}");
        }
    }
}
