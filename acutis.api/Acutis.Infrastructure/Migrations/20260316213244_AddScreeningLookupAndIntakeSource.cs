using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScreeningLookupAndIntakeSource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IntakeSource",
                table: "ResidentCase",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028"),
                columns: new[] { "SchemaJson", "UiJson" },
                values: new object[] { "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"callerName\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 120 },\n    \"phoneNumber\": { \"type\": \"string\", \"minLength\": 8, \"maxLength\": 20, \"pattern\": \"^\\\\+?[1-9][0-9()\\\\-\\\\s]{7,19}$\", \"format\": \"phone\" },\n    \"emailAddress\": { \"type\": \"string\", \"maxLength\": 120, \"pattern\": \"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}$\", \"format\": \"email\" },\n    \"age\": { \"type\": \"integer\", \"minimum\": 16, \"maximum\": 120 },\n    \"drinkType\": { \"type\": \"enum\", \"optionSetKey\": \"drink_type\" },\n    \"drinkTypeOther\": { \"type\": \"string\", \"maxLength\": 80 },\n    \"drinksPerDay\": { \"type\": \"number\", \"minimum\": 0, \"maximum\": 100 },\n    \"drinksPerDayUnit\": { \"type\": \"enum\", \"optionSetKey\": \"drink_measure_unit\" },\n    \"daysDrinkingPerWeek\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 7 },\n    \"lastDrinkDate\": { \"type\": \"date\" },\n    \"withdrawalHistory\": { \"type\": \"boolean\" },\n    \"historyOfSeizures\": { \"type\": \"boolean\" },\n    \"currentlyUnsafe\": { \"type\": \"boolean\" },\n    \"suicidalIdeation\": { \"type\": \"boolean\" },\n    \"referralSource\": { \"type\": \"enum\", \"optionSetKey\": \"referral_source\" },\n    \"housingStatus\": { \"type\": \"enum\", \"optionSetKey\": \"housing_status\" },\n    \"supportNetwork\": { \"type\": \"string\", \"maxLength\": 300 },\n    \"medicalNotes\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"assessorNotes\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"nextSteps\": { \"type\": \"text\", \"maxLength\": 1000 }\n  },\n  \"required\": [ \"callerName\", \"phoneNumber\", \"age\", \"drinkType\", \"drinksPerDay\", \"drinksPerDayUnit\", \"referralSource\", \"housingStatus\" ]\n}", "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"phoneNumber\", \"emailAddress\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinkType\", \"drinksPerDay\", \"drinksPerDayUnit\", \"drinkTypeOther\", \"daysDrinkingPerWeek\", \"lastDrinkDate\", \"withdrawalHistory\", \"historyOfSeizures\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"suicidalIdeation\", \"housingStatus\", \"supportNetwork\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"medicalNotes\", \"assessorNotes\", \"nextSteps\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"phoneNumber\": \"input\",\n    \"emailAddress\": \"input\",\n    \"age\": \"number\",\n    \"drinkType\": \"select\",\n    \"drinkTypeOther\": \"input\",\n    \"drinksPerDay\": \"number\",\n    \"drinksPerDayUnit\": \"select\",\n    \"daysDrinkingPerWeek\": \"number\",\n    \"lastDrinkDate\": \"input\",\n    \"withdrawalHistory\": \"toggle\",\n    \"historyOfSeizures\": \"toggle\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"suicidalIdeation\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"housingStatus\": \"select\",\n    \"supportNetwork\": \"input\",\n    \"medicalNotes\": \"textarea\",\n    \"assessorNotes\": \"textarea\",\n    \"nextSteps\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"phoneNumber\": \"screening.field.phone_number.label\",\n    \"emailAddress\": \"screening.field.email_address.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinkType\": \"screening.field.drink_type.label\",\n    \"drinkTypeOther\": \"screening.field.drink_type_other.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"drinksPerDayUnit\": \"screening.field.drinks_per_day_unit.label\",\n    \"daysDrinkingPerWeek\": \"screening.field.days_drinking_per_week.label\",\n    \"lastDrinkDate\": \"screening.field.last_drink_date.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"historyOfSeizures\": \"screening.field.history_of_seizures.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"suicidalIdeation\": \"screening.field.suicidal_ideation.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"supportNetwork\": \"screening.field.support_network.label\",\n    \"medicalNotes\": \"screening.field.medical_notes.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\",\n    \"nextSteps\": \"screening.field.next_steps.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"drinksPerDayUnit\": \"screening.field.drinks_per_day_unit.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\",\n    \"nextSteps\": \"screening.field.next_steps.help\"\n  }\n}" });

            migrationBuilder.InsertData(
                table: "OptionSet",
                columns: new[] { "Id", "Key" },
                values: new object[,]
                {
                    { new Guid("0d16b802-9dc1-4c8b-819a-52e0d41a6f59"), "drink_measure_unit" },
                    { new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"), "housing_status" }
                });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("02d5cf68-9ba3-8414-b815-04bfcf3d00cc"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("05ac25af-20b9-cb10-1970-f222fc63f33c"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("067a031b-64f3-f757-3b13-bcc7696bc492"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("0cbe447b-6bdf-d70b-5959-ea464cb4309a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("14dd0381-2265-6a21-9a42-c71ca226e43b"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("17e7a384-bd51-89c2-8193-bd3b7c020261"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("18e22be9-5d28-4bf1-1ba3-c22c4ffed5c2"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("1b828d21-1e5a-78f7-b39c-be261ba424b0"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("241662a4-9a12-435a-586e-af8ad6eef8a8"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2b567f24-2645-3563-6dc7-256da1a473f9"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2deef4a1-f6c0-4fe7-dc65-cc9b800eaf3e"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("34592d5e-2b32-2033-c42f-bcf9681240d7"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e079aca-4440-deb3-f5e9-96cb4218d983"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e545e34-2694-5967-8c89-cd5f6cbbb384"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("40459bcf-c396-f2ab-d069-8ded074a050e"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4892cd18-2942-732c-bd62-a53d80d6a3c2"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4a53240f-690c-44d4-bb22-9c47ba0fb78e"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4b320969-841e-d690-341f-58e6531fccee"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4c169242-6e08-6702-70f9-603ca34de470"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5af6689e-fa64-ff88-31fb-08102f12a834"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5b127d66-826c-3e6b-92b2-009ecf6329b2"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("613c5f0f-9465-d1cc-bb6b-8b0e334b5286"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("620a1279-0c69-662b-60ef-969ec6c3f016"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("66dbc7fb-4df0-aa06-41dd-d3ca1b342446"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("67aca680-ed16-0e43-aaa0-5e3c8fcf9224"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6aa7429c-32a8-4048-3444-87a42644a94a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6b32d043-a1ae-71f1-03f0-1df665103c8b"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6e0e43eb-d5ae-1bc7-a6cc-4f791e1ec83a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7044d7e8-2ec7-4382-9e99-e90e17408a53"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("707742c8-ad7a-1f60-94e5-3b738c07a01f"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7bf163f7-f62c-de3a-f0b3-b66153838322"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8692d172-9c54-c70f-0a4b-7531afdd5315"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("878bf789-24b9-7555-1fd9-eb230a0b377a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8f8c7165-dd27-62f3-5f2d-e4e6521c4495"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("929cc5b6-c4d2-aa3e-85c5-e096fdab1c73"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("99b1f5fa-05de-faa8-3f0a-6b0209525bbe"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("9c950c36-e912-12dd-aa43-0ee5632279e5"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a026c6d0-c585-bc5a-7b57-86a02ae7f77a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a116e44f-e59a-c4fd-cfa5-0d80091b9cc8"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a96bec8b-0a57-23e2-fadb-e6ece8c4fc44"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b1fafa6e-9779-5c14-52c7-63d89bbf884a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b4fa3353-9e0e-78de-0449-d755225314f2"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9278ec8-7e71-33f9-76bf-867c4533e6bf"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9d2af6f-d8fa-92be-e08c-881148a79a9b"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bacf6983-0d3b-ab2a-2543-5da3ede2b7cd"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bc1af24a-7d55-b046-ccca-14ecc5bd2801"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bedece19-6736-e923-2862-96210b55e498"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("c81d7bbf-e761-983c-9ed0-04671b5e64b1"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ce939943-00c8-dcbd-d42d-e2ac46db190a"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d2221dec-071c-d380-b6f3-2515239f07aa"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d55b80ed-b3f5-4db9-bd93-4f4a782a9b75"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d64353b1-93e1-a496-26ff-691787c8e81e"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d735d3ef-77d8-66a2-47f5-2dce715eaf13"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("db38eb15-818c-c146-8716-ee7785b75260"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e41f4a3a-c68c-d34e-fd10-63d0bd4cda91"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e641d55e-25f9-d223-0541-7b89a46233db"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e7b29d33-22b4-f43f-6c1d-3ea2552c5f11"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ebf094cc-d4f6-2fee-71e9-89382875c905"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f1674ab5-6b49-716d-b8c8-cb768c002aeb"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f2ead506-547d-8eeb-2dd0-075d2fa36dfe"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f4f01740-f6a4-2e29-5a7f-ab5ae460bc8e"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f8dcb0ea-b18e-2eae-cb9c-92ff5adc2aef"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("fa11406b-65af-f777-c35e-5b733790670d"),
                column: "IntakeSource",
                value: "screening_call");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day.help",
                column: "DefaultText",
                value: "Approximate average on drinking days. Select the unit used for this quantity.");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day.label",
                column: "DefaultText",
                value: "Drinks Per Day");

            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "evaluation.table.source", "Source" },
                    { "screening.field.drinks_per_day_unit.help", "Record whether the quantity is in pints, litres or bottles." },
                    { "screening.field.drinks_per_day_unit.label", "Drink Unit" },
                    { "screening.options.drink_measure_unit.bottles", "Bottles" },
                    { "screening.options.drink_measure_unit.litres", "Litres" },
                    { "screening.options.drink_measure_unit.pints", "Pints" },
                    { "screening.options.housing_status.homeless", "Homeless" },
                    { "screening.options.housing_status.other", "Other" },
                    { "screening.options.housing_status.stable", "Stable Accommodation" },
                    { "screening.options.housing_status.supported", "Supported Accommodation" },
                    { "screening.options.housing_status.temporary", "Temporary Accommodation" }
                });

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("16d7f20f-2ab8-4325-b24b-0ee04a1ce44c"),
                column: "Text",
                value: "Drinks Per Day");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"),
                column: "Text",
                value: "عدد المشروبات يوميا");

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("0220c221-3807-4d17-9894-9f7404824de4"), "screening.field.drinks_per_day.help", "ar", "المتوسط التقريبي في أيام الشرب. اختر الوحدة المستخدمة لهذه الكمية." },
                    { new Guid("1035cb17-ebaa-4856-b3dd-1c9f91ba69d0"), "screening.field.drinks_per_day.help", "en-IE", "Approximate average on drinking days. Select the unit used for this quantity." },
                    { new Guid("55f4cbcf-81ef-4f9b-836a-88ca2b85b33e"), "screening.field.drinks_per_day.help", "ga-IE", "Meán garbh ar laethanta óil. Roghnaigh an t-aonad a úsáideadh don chainníocht seo." }
                });

            migrationBuilder.InsertData(
                table: "OptionItem",
                columns: new[] { "Id", "Code", "IsActive", "LabelKey", "OptionSetId", "SortOrder", "ValidFrom", "ValidTo" },
                values: new object[,]
                {
                    { new Guid("0a2f5ceb-fe3b-420f-a4df-95f1bff9342c"), "pints", true, "screening.options.drink_measure_unit.pints", new Guid("0d16b802-9dc1-4c8b-819a-52e0d41a6f59"), 1, null, null },
                    { new Guid("17691e58-8ab8-482e-b9df-5f5f35ad4865"), "stable", true, "screening.options.housing_status.stable", new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"), 1, null, null },
                    { new Guid("31279df6-9f65-4ceb-9d32-f3b0f1bf066c"), "litres", true, "screening.options.drink_measure_unit.litres", new Guid("0d16b802-9dc1-4c8b-819a-52e0d41a6f59"), 2, null, null },
                    { new Guid("4cc93a6b-60bd-44d8-a2d4-e0a11c79b1f9"), "homeless", true, "screening.options.housing_status.homeless", new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"), 3, null, null },
                    { new Guid("77e32289-2589-494a-9636-ad727ba907fe"), "bottles", true, "screening.options.drink_measure_unit.bottles", new Guid("0d16b802-9dc1-4c8b-819a-52e0d41a6f59"), 3, null, null },
                    { new Guid("953f699e-640b-4583-a6ec-af800aa2cbf5"), "temporary", true, "screening.options.housing_status.temporary", new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"), 2, null, null },
                    { new Guid("b223fa1f-3d8f-4c11-900f-e73c684ffdfa"), "other", true, "screening.options.housing_status.other", new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"), 5, null, null },
                    { new Guid("cc4ce33c-5bc9-45a4-b128-35cf2a4722ae"), "supported", true, "screening.options.housing_status.supported", new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"), 4, null, null }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("0b63ed08-b49d-4381-a918-a5b7a208ed1a"), "screening.options.drink_measure_unit.bottles", "ga-IE", "Buidéil" },
                    { new Guid("0bec25c1-749d-4edf-9ba1-bc95176206c1"), "screening.field.drinks_per_day_unit.label", "ga-IE", "Aonad Dí" },
                    { new Guid("23fc56e2-c146-4bc9-b214-c9c30cf18f01"), "screening.options.housing_status.supported", "ar", "سكن مدعوم" },
                    { new Guid("28c66812-cc83-4456-bb50-2ef5ded6e48e"), "screening.options.drink_measure_unit.pints", "ar", "باينت" },
                    { new Guid("2e639d62-1f38-48f8-abaf-28baf60c31fd"), "screening.options.housing_status.supported", "en-IE", "Supported Accommodation" },
                    { new Guid("2ee869f2-6efd-421a-b956-8836a99cb1d5"), "screening.field.drinks_per_day_unit.help", "en-IE", "Record whether the quantity is in pints, litres or bottles." },
                    { new Guid("3bc4532a-c13a-4d14-a184-68fc3707eec4"), "screening.field.drinks_per_day_unit.help", "ga-IE", "Taifead an bhfuil an chainníocht i bpiontaí, i lítear nó i mbuidéil." },
                    { new Guid("3c750a0f-7db5-4d1b-b0d7-f53d4ce5d426"), "screening.options.housing_status.homeless", "en-IE", "Homeless" },
                    { new Guid("3c9bf986-b9e7-47bb-a907-991b89b09e20"), "screening.options.housing_status.temporary", "ar", "سكن مؤقت" },
                    { new Guid("4269e3d4-d0aa-4b0c-858a-044de3b2c5f1"), "evaluation.table.source", "en-IE", "Source" },
                    { new Guid("45c3b5fd-66dd-45ee-acf1-5d1bc3bb1d8f"), "screening.options.housing_status.supported", "ga-IE", "Cóiríocht Thacaithe" },
                    { new Guid("46d87e14-f05d-49d2-bf58-c1df236704b8"), "screening.options.housing_status.stable", "ga-IE", "Cóiríocht Chobhsaí" },
                    { new Guid("484d26d9-f2ea-42dc-85db-1f6762f67288"), "screening.options.drink_measure_unit.bottles", "ar", "زجاجات" },
                    { new Guid("48eabf4d-5e05-48ef-a2b5-d0e6fe78fe0f"), "screening.options.housing_status.stable", "en-IE", "Stable Accommodation" },
                    { new Guid("4e9dc7d2-99fe-4e1d-9ba3-5f3d8b00d121"), "screening.options.housing_status.temporary", "en-IE", "Temporary Accommodation" },
                    { new Guid("558d984c-a398-45b4-8782-d8921a7ea3c7"), "screening.options.drink_measure_unit.pints", "ga-IE", "Piontaí" },
                    { new Guid("632d6f38-31bb-4ad8-9cca-260f13fe4219"), "screening.options.housing_status.homeless", "ga-IE", "Gan Dídean" },
                    { new Guid("72357518-4d77-49e6-802a-4c5dc11e9547"), "screening.options.drink_measure_unit.litres", "ga-IE", "Lítear" },
                    { new Guid("7fcf3345-9d76-4f40-a13c-5590ae74d0ec"), "screening.field.drinks_per_day_unit.label", "ar", "وحدة المشروب" },
                    { new Guid("8cc436ab-cc73-44aa-b3b6-b4cfb48bce1b"), "evaluation.table.source", "ga-IE", "Foinse" },
                    { new Guid("901beca6-df0d-4e43-b7b4-d5b7e6eb9d7a"), "screening.options.drink_measure_unit.pints", "en-IE", "Pints" },
                    { new Guid("90442b48-cf66-4736-b8ca-297ec7757627"), "screening.options.drink_measure_unit.litres", "en-IE", "Litres" },
                    { new Guid("9472301b-33f4-40f0-8238-e597553fb2e9"), "screening.options.housing_status.stable", "ar", "سكن مستقر" },
                    { new Guid("94cc584c-e4c3-4269-b477-5aa98768bb12"), "screening.options.housing_status.homeless", "ar", "بلا مأوى" },
                    { new Guid("97b5d82c-8238-45cb-ab63-a2dc560d0aad"), "screening.field.drinks_per_day_unit.label", "en-IE", "Drink Unit" },
                    { new Guid("9a865c81-0bb6-4d54-9240-7376ea28a90a"), "screening.options.housing_status.other", "ar", "أخرى" },
                    { new Guid("9de7ce65-d77d-426f-ab43-519c6ec5f180"), "screening.field.drinks_per_day_unit.help", "ar", "سجل ما إذا كانت الكمية بالباينت أو اللترات أو الزجاجات." },
                    { new Guid("a7dc7a55-80e6-4a14-8b06-1f1ea99e2f0f"), "screening.options.drink_measure_unit.litres", "ar", "لترات" },
                    { new Guid("b170fe66-550e-4d77-9de9-c67bdde23357"), "screening.options.housing_status.other", "ga-IE", "Eile" },
                    { new Guid("c719b3eb-1df5-43fc-b65f-2a1c4fbf2df8"), "evaluation.table.source", "ar", "المصدر" },
                    { new Guid("d72a6db0-2378-46ca-b7da-bcd08464f61a"), "screening.options.housing_status.other", "en-IE", "Other" },
                    { new Guid("e7d8d088-d5fd-4680-8dd4-b92f1423014a"), "screening.options.housing_status.temporary", "ga-IE", "Cóiríocht Shealadach" },
                    { new Guid("f47ee5fd-986d-4201-bd12-6337ec372cae"), "screening.options.drink_measure_unit.bottles", "en-IE", "Bottles" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("0a2f5ceb-fe3b-420f-a4df-95f1bff9342c"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("17691e58-8ab8-482e-b9df-5f5f35ad4865"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("31279df6-9f65-4ceb-9d32-f3b0f1bf066c"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("4cc93a6b-60bd-44d8-a2d4-e0a11c79b1f9"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("77e32289-2589-494a-9636-ad727ba907fe"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("953f699e-640b-4583-a6ec-af800aa2cbf5"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("b223fa1f-3d8f-4c11-900f-e73c684ffdfa"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("cc4ce33c-5bc9-45a4-b128-35cf2a4722ae"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0220c221-3807-4d17-9894-9f7404824de4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0b63ed08-b49d-4381-a918-a5b7a208ed1a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0bec25c1-749d-4edf-9ba1-bc95176206c1"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1035cb17-ebaa-4856-b3dd-1c9f91ba69d0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("23fc56e2-c146-4bc9-b214-c9c30cf18f01"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28c66812-cc83-4456-bb50-2ef5ded6e48e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2e639d62-1f38-48f8-abaf-28baf60c31fd"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2ee869f2-6efd-421a-b956-8836a99cb1d5"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3bc4532a-c13a-4d14-a184-68fc3707eec4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3c750a0f-7db5-4d1b-b0d7-f53d4ce5d426"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3c9bf986-b9e7-47bb-a907-991b89b09e20"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("4269e3d4-d0aa-4b0c-858a-044de3b2c5f1"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("45c3b5fd-66dd-45ee-acf1-5d1bc3bb1d8f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46d87e14-f05d-49d2-bf58-c1df236704b8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("484d26d9-f2ea-42dc-85db-1f6762f67288"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("48eabf4d-5e05-48ef-a2b5-d0e6fe78fe0f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("4e9dc7d2-99fe-4e1d-9ba3-5f3d8b00d121"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("558d984c-a398-45b4-8782-d8921a7ea3c7"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("55f4cbcf-81ef-4f9b-836a-88ca2b85b33e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("632d6f38-31bb-4ad8-9cca-260f13fe4219"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("72357518-4d77-49e6-802a-4c5dc11e9547"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7fcf3345-9d76-4f40-a13c-5590ae74d0ec"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8cc436ab-cc73-44aa-b3b6-b4cfb48bce1b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("901beca6-df0d-4e43-b7b4-d5b7e6eb9d7a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("90442b48-cf66-4736-b8ca-297ec7757627"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9472301b-33f4-40f0-8238-e597553fb2e9"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("94cc584c-e4c3-4269-b477-5aa98768bb12"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("97b5d82c-8238-45cb-ab63-a2dc560d0aad"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9a865c81-0bb6-4d54-9240-7376ea28a90a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9de7ce65-d77d-426f-ab43-519c6ec5f180"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a7dc7a55-80e6-4a14-8b06-1f1ea99e2f0f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b170fe66-550e-4d77-9de9-c67bdde23357"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c719b3eb-1df5-43fc-b65f-2a1c4fbf2df8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d72a6db0-2378-46ca-b7da-bcd08464f61a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e7d8d088-d5fd-4680-8dd4-b92f1423014a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f47ee5fd-986d-4201-bd12-6337ec372cae"));

            migrationBuilder.DeleteData(
                table: "OptionSet",
                keyColumn: "Id",
                keyValue: new Guid("0d16b802-9dc1-4c8b-819a-52e0d41a6f59"));

            migrationBuilder.DeleteData(
                table: "OptionSet",
                keyColumn: "Id",
                keyValue: new Guid("7598f1ce-65c6-4245-af64-5aeb4be2c3b2"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.source");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day_unit.help");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day_unit.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_measure_unit.bottles");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_measure_unit.litres");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_measure_unit.pints");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.housing_status.homeless");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.housing_status.other");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.housing_status.stable");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.housing_status.supported");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.housing_status.temporary");

            migrationBuilder.DropColumn(
                name: "IntakeSource",
                table: "ResidentCase");

            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028"),
                columns: new[] { "SchemaJson", "UiJson" },
                values: new object[] { "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"callerName\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 120 },\n    \"phoneNumber\": { \"type\": \"string\", \"minLength\": 8, \"maxLength\": 20, \"pattern\": \"^[+0-9()\\\\-\\\\s]+$\", \"format\": \"phone\" },\n    \"emailAddress\": { \"type\": \"string\", \"maxLength\": 120, \"format\": \"email\" },\n    \"age\": { \"type\": \"integer\", \"minimum\": 16, \"maximum\": 120 },\n    \"drinkType\": { \"type\": \"enum\", \"optionSetKey\": \"drink_type\" },\n    \"drinkTypeOther\": { \"type\": \"string\", \"maxLength\": 80 },\n    \"drinksPerDay\": { \"type\": \"number\", \"minimum\": 0, \"maximum\": 100 },\n    \"daysDrinkingPerWeek\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 7 },\n    \"lastDrinkDate\": { \"type\": \"date\" },\n    \"withdrawalHistory\": { \"type\": \"boolean\" },\n    \"historyOfSeizures\": { \"type\": \"boolean\" },\n    \"currentlyUnsafe\": { \"type\": \"boolean\" },\n    \"suicidalIdeation\": { \"type\": \"boolean\" },\n    \"referralSource\": { \"type\": \"enum\", \"optionSetKey\": \"referral_source\" },\n    \"housingStatus\": { \"type\": \"string\", \"maxLength\": 120 },\n    \"supportNetwork\": { \"type\": \"string\", \"maxLength\": 300 },\n    \"medicalNotes\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"assessorNotes\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"nextSteps\": { \"type\": \"text\", \"maxLength\": 1000 }\n  },\n  \"required\": [ \"callerName\", \"phoneNumber\", \"age\", \"drinkType\", \"drinksPerDay\", \"referralSource\" ]\n}", "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"phoneNumber\", \"emailAddress\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinkType\", \"drinksPerDay\", \"drinkTypeOther\", \"daysDrinkingPerWeek\", \"lastDrinkDate\", \"withdrawalHistory\", \"historyOfSeizures\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"suicidalIdeation\", \"housingStatus\", \"supportNetwork\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"medicalNotes\", \"assessorNotes\", \"nextSteps\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"phoneNumber\": \"input\",\n    \"emailAddress\": \"input\",\n    \"age\": \"number\",\n    \"drinkType\": \"select\",\n    \"drinkTypeOther\": \"input\",\n    \"drinksPerDay\": \"number\",\n    \"daysDrinkingPerWeek\": \"number\",\n    \"lastDrinkDate\": \"input\",\n    \"withdrawalHistory\": \"toggle\",\n    \"historyOfSeizures\": \"toggle\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"suicidalIdeation\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"housingStatus\": \"input\",\n    \"supportNetwork\": \"input\",\n    \"medicalNotes\": \"textarea\",\n    \"assessorNotes\": \"textarea\",\n    \"nextSteps\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"phoneNumber\": \"screening.field.phone_number.label\",\n    \"emailAddress\": \"screening.field.email_address.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinkType\": \"screening.field.drink_type.label\",\n    \"drinkTypeOther\": \"screening.field.drink_type_other.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"daysDrinkingPerWeek\": \"screening.field.days_drinking_per_week.label\",\n    \"lastDrinkDate\": \"screening.field.last_drink_date.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"historyOfSeizures\": \"screening.field.history_of_seizures.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"suicidalIdeation\": \"screening.field.suicidal_ideation.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"supportNetwork\": \"screening.field.support_network.label\",\n    \"medicalNotes\": \"screening.field.medical_notes.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\",\n    \"nextSteps\": \"screening.field.next_steps.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\",\n    \"nextSteps\": \"screening.field.next_steps.help\"\n  }\n}" });

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day.help",
                column: "DefaultText",
                value: "Approximate average on drinking days.");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day.label",
                column: "DefaultText",
                value: "Drinks Per Day (for selected type)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("16d7f20f-2ab8-4325-b24b-0ee04a1ce44c"),
                column: "Text",
                value: "Drinks Per Day (for selected type)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"),
                column: "Text",
                value: "عدد المشروبات يوميا (حسب النوع)");
        }
    }
}
