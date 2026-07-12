using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ScreeningFormV4DrinkTypeArabic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FormDefinition",
                columns: new[] { "Id", "Code", "CreatedAt", "DescriptionKey", "RulesJson", "SchemaJson", "Status", "TitleKey", "UiJson", "Version" },
                values: new object[] { new Guid("e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028"), "alcohol_screening_call", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), "screening.form.alcohol_screening_call.description", "[\n  {\n    \"if\": { \"field\": \"drinkType\", \"equals\": \"other\" },\n    \"then\": { \"show\": [ \"drinkTypeOther\" ], \"enable\": [ \"drinkTypeOther\" ] },\n    \"else\": { \"hide\": [ \"drinkTypeOther\" ], \"disable\": [ \"drinkTypeOther\" ], \"clear\": [ \"drinkTypeOther\" ] }\n  }\n]", "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"callerName\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 120 },\n    \"phoneNumber\": { \"type\": \"string\", \"minLength\": 8, \"maxLength\": 20, \"pattern\": \"^[+0-9()\\\\-\\\\s]+$\", \"format\": \"phone\" },\n    \"emailAddress\": { \"type\": \"string\", \"maxLength\": 120, \"format\": \"email\" },\n    \"age\": { \"type\": \"integer\", \"minimum\": 16, \"maximum\": 120 },\n    \"drinkType\": { \"type\": \"enum\", \"optionSetKey\": \"drink_type\" },\n    \"drinkTypeOther\": { \"type\": \"string\", \"maxLength\": 80 },\n    \"drinksPerDay\": { \"type\": \"number\", \"minimum\": 0, \"maximum\": 100 },\n    \"daysDrinkingPerWeek\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 7 },\n    \"lastDrinkDate\": { \"type\": \"date\" },\n    \"withdrawalHistory\": { \"type\": \"boolean\" },\n    \"historyOfSeizures\": { \"type\": \"boolean\" },\n    \"currentlyUnsafe\": { \"type\": \"boolean\" },\n    \"suicidalIdeation\": { \"type\": \"boolean\" },\n    \"referralSource\": { \"type\": \"enum\", \"optionSetKey\": \"referral_source\" },\n    \"housingStatus\": { \"type\": \"string\", \"maxLength\": 120 },\n    \"supportNetwork\": { \"type\": \"string\", \"maxLength\": 300 },\n    \"medicalNotes\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"assessorNotes\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"nextSteps\": { \"type\": \"text\", \"maxLength\": 1000 }\n  },\n  \"required\": [ \"callerName\", \"phoneNumber\", \"age\", \"drinkType\", \"drinksPerDay\", \"referralSource\" ]\n}", "published", "screening.form.alcohol_screening_call.title", "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"phoneNumber\", \"emailAddress\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinkType\", \"drinksPerDay\", \"drinkTypeOther\", \"daysDrinkingPerWeek\", \"lastDrinkDate\", \"withdrawalHistory\", \"historyOfSeizures\", \"referralSource\" ] },\n    { \"titleKey\": \"screening.section.stability\", \"items\": [ \"currentlyUnsafe\", \"suicidalIdeation\", \"housingStatus\", \"supportNetwork\" ] },\n    { \"titleKey\": \"screening.section.follow_up\", \"items\": [ \"medicalNotes\", \"assessorNotes\", \"nextSteps\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"phoneNumber\": \"input\",\n    \"emailAddress\": \"input\",\n    \"age\": \"number\",\n    \"drinkType\": \"select\",\n    \"drinkTypeOther\": \"input\",\n    \"drinksPerDay\": \"number\",\n    \"daysDrinkingPerWeek\": \"number\",\n    \"lastDrinkDate\": \"input\",\n    \"withdrawalHistory\": \"toggle\",\n    \"historyOfSeizures\": \"toggle\",\n    \"currentlyUnsafe\": \"toggle\",\n    \"suicidalIdeation\": \"toggle\",\n    \"referralSource\": \"select\",\n    \"housingStatus\": \"input\",\n    \"supportNetwork\": \"input\",\n    \"medicalNotes\": \"textarea\",\n    \"assessorNotes\": \"textarea\",\n    \"nextSteps\": \"textarea\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"phoneNumber\": \"screening.field.phone_number.label\",\n    \"emailAddress\": \"screening.field.email_address.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinkType\": \"screening.field.drink_type.label\",\n    \"drinkTypeOther\": \"screening.field.drink_type_other.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"daysDrinkingPerWeek\": \"screening.field.days_drinking_per_week.label\",\n    \"lastDrinkDate\": \"screening.field.last_drink_date.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"historyOfSeizures\": \"screening.field.history_of_seizures.label\",\n    \"currentlyUnsafe\": \"screening.field.currently_unsafe.label\",\n    \"suicidalIdeation\": \"screening.field.suicidal_ideation.label\",\n    \"referralSource\": \"screening.field.referral_source.label\",\n    \"housingStatus\": \"screening.field.housing_status.label\",\n    \"supportNetwork\": \"screening.field.support_network.label\",\n    \"medicalNotes\": \"screening.field.medical_notes.label\",\n    \"assessorNotes\": \"screening.field.assessor_notes.label\",\n    \"nextSteps\": \"screening.field.next_steps.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\",\n    \"assessorNotes\": \"screening.field.assessor_notes.help\",\n    \"nextSteps\": \"screening.field.next_steps.help\"\n  }\n}", 4 });

            migrationBuilder.InsertData(
                table: "OptionSet",
                columns: new[] { "Id", "Key" },
                values: new object[] { new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"), "drink_type" });

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.currently_unsafe.label",
                column: "DefaultText",
                value: "Is immediate concern?");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day.label",
                column: "DefaultText",
                value: "Drinks Per Day (for selected type)");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.history_of_seizures.label",
                column: "DefaultText",
                value: "Has seizure history?");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.withdrawal_history.label",
                column: "DefaultText",
                value: "Has withdrawal history?");

            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "screening.field.drink_type_other.label", "If other, specify drink type" },
                    { "screening.field.drink_type.label", "Drink Type" },
                    { "screening.options.drink_type.beer", "Beer" },
                    { "screening.options.drink_type.cider", "Cider" },
                    { "screening.options.drink_type.other", "Other" },
                    { "screening.options.drink_type.spirits", "Spirits" },
                    { "screening.options.drink_type.wine", "Wine" }
                });

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("16d7f20f-2ab8-4325-b24b-0ee04a1ce44c"),
                column: "Text",
                value: "Drinks Per Day (for selected type)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"),
                column: "Text",
                value: "LogÃ¡ilte isteach mar");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"),
                column: "Text",
                value: "LogÃ¡il isteach mar ÃºsÃ¡ideoir eile");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b"),
                column: "Text",
                value: "Deochanna sa LÃ¡");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87"),
                column: "Text",
                value: "FÃ©in");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e89eb3-0dff-4f27-a4f7-dde66f8ef067"),
                column: "Text",
                value: "SonraÃ­ an Ghlaoiteora");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"),
                column: "Text",
                value: "MeastÃ³ireacht");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"),
                column: "Text",
                value: "Gabh sonraÃ­ scagtha Ã³n gcÃ©ad ghlao.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18"),
                column: "Text",
                value: "DochtÃºir Teaghlaigh");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9"),
                column: "Text",
                value: "ÃšsÃ¡id AlcÃ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"),
                column: "Text",
                value: "Ionad CÃ³ireÃ¡la BrÃº RÃ­");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"),
                column: "Text",
                value: "LogÃ¡il Glaonna");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d17f0d3f-f9bc-4b37-8427-f5340bd6ea2e"),
                column: "Text",
                value: "Has withdrawal history?");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"),
                column: "Text",
                value: "Scagadh Glao AlcÃ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"),
                column: "Text",
                value: "LogÃ¡il amach");

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("1a19939b-9f4c-4783-b43b-86a4d8c4dbd9"), "header.signed_in_as", "ar", "Signed in as" },
                    { new Guid("1e7f1d6c-bdb5-4e89-90e2-970336aeb586"), "screening.field.withdrawal_history.label", "ar", "هل لديه تاريخ أعراض انسحاب؟" },
                    { new Guid("20ef3681-0b10-4526-8919-f3f18c1a0b43"), "header.login_different_user", "ar", "Log in as different user" },
                    { new Guid("272a7260-95ef-4d73-b656-cc48d72e09c2"), "header.logout", "ar", "Log out" },
                    { new Guid("2f88fd06-b8bd-4d8c-b744-0c0591f45a99"), "screening.field.currently_unsafe.label", "ar", "هل توجد خطورة فورية؟" },
                    { new Guid("66f4f9bf-1f15-4c9f-a59f-317b0b7c4f19"), "screening.field.history_of_seizures.label", "en-IE", "Has seizure history?" },
                    { new Guid("9713a4d9-8d94-47d8-9f90-4e5af6847e11"), "screening.tab.scheduling", "ar", "Scheduling" },
                    { new Guid("9e0ddd4f-3339-46e1-8ab8-d485be7fca8d"), "screening.field.currently_unsafe.label", "en-IE", "Is immediate concern?" },
                    { new Guid("a0c33630-5d24-4cb8-af88-b66bf166fdd0"), "screening.form.alcohol_screening_call.title", "ar", "Alcohol Screening Call" },
                    { new Guid("b3f0a417-2cf8-4b91-806f-e6f42c9d9f19"), "app.centre.bruree", "ar", "Bruree Treatment Center" },
                    { new Guid("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"), "screening.field.drinks_per_day.label", "ar", "عدد المشروبات يوميا (حسب النوع)" },
                    { new Guid("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"), "screening.section.follow_up", "ar", "Follow Up Notes" },
                    { new Guid("c2de6b57-2080-4b71-9f6b-50f2a23a66f7"), "header.capacity", "ar", "Capacity" },
                    { new Guid("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"), "screening.tab.evaluation", "ar", "Evaluation" },
                    { new Guid("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"), "screening.section.stability", "ar", "Stability & Safety" },
                    { new Guid("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"), "screening.section.alcohol_use", "ar", "Alcohol Use" },
                    { new Guid("e9abb6e3-58b1-4171-85dc-0fec30ff6a2c"), "screening.field.history_of_seizures.label", "ar", "هل لديه تاريخ نوبات صرع؟" },
                    { new Guid("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"), "screening.section.caller_details", "ar", "Caller Details" },
                    { new Guid("f3ed034f-87d6-4734-af96-2f7778e4cafa"), "header.current_time", "ar", "Current Time" },
                    { new Guid("fd0a7865-43f1-4cc3-b57f-4c4b5ca47c57"), "app.brand", "ar", "Acutis" },
                    { new Guid("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"), "screening.tab.calls", "ar", "Call Logging" }
                });

            migrationBuilder.InsertData(
                table: "OptionItem",
                columns: new[] { "Id", "Code", "IsActive", "LabelKey", "OptionSetId", "SortOrder", "ValidFrom", "ValidTo" },
                values: new object[,]
                {
                    { new Guid("1f0fca56-5f9a-49a5-b4df-3f8c7f413d32"), "other", true, "screening.options.drink_type.other", new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"), 5, null, null },
                    { new Guid("44f81460-88f7-4d58-9fd2-2f86f9f55f3d"), "spirits", true, "screening.options.drink_type.spirits", new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"), 3, null, null },
                    { new Guid("7a607ff4-0a82-4402-a85a-4b8ed64d09c0"), "cider", true, "screening.options.drink_type.cider", new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"), 4, null, null },
                    { new Guid("7d71172d-38bf-46fd-b4ec-8258ab2bf389"), "beer", true, "screening.options.drink_type.beer", new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"), 1, null, null },
                    { new Guid("8f5ef9ba-3853-48f9-9f8a-dd99f6ebf5f4"), "wine", true, "screening.options.drink_type.wine", new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"), 2, null, null }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("46648eca-e4fd-4f91-95c1-21f4419df2c6"), "screening.field.drink_type.label", "ar", "نوع المشروب" },
                    { new Guid("53f00dd8-5fc4-45f5-afeb-21d68eeb4228"), "screening.field.drink_type_other.label", "en-IE", "If other, specify drink type" },
                    { new Guid("59229ca1-a056-4f56-b6f4-c72ef1906e63"), "screening.options.drink_type.beer", "en-IE", "Beer" },
                    { new Guid("7694c676-287f-4509-969e-c8de65c89a0d"), "screening.options.drink_type.other", "en-IE", "Other" },
                    { new Guid("886f313a-d179-4f6d-a1c6-d00de9cb1521"), "screening.options.drink_type.wine", "en-IE", "Wine" },
                    { new Guid("9f306145-c17e-4234-ae46-aaf8e22c6205"), "screening.field.drink_type.label", "en-IE", "Drink Type" },
                    { new Guid("bf9ac4ba-c73e-45f4-af54-b0e56f5addfe"), "screening.options.drink_type.spirits", "en-IE", "Spirits" },
                    { new Guid("cb8f1cb3-f093-4f42-b867-48c26127fcdd"), "screening.field.drink_type_other.label", "ar", "إذا كان غير ذلك، حدده" },
                    { new Guid("ea12f2ff-b9de-4f6d-a237-3f68f812283b"), "screening.options.drink_type.cider", "en-IE", "Cider" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("1f0fca56-5f9a-49a5-b4df-3f8c7f413d32"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("44f81460-88f7-4d58-9fd2-2f86f9f55f3d"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("7a607ff4-0a82-4402-a85a-4b8ed64d09c0"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("7d71172d-38bf-46fd-b4ec-8258ab2bf389"));

            migrationBuilder.DeleteData(
                table: "OptionItem",
                keyColumn: "Id",
                keyValue: new Guid("8f5ef9ba-3853-48f9-9f8a-dd99f6ebf5f4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1a19939b-9f4c-4783-b43b-86a4d8c4dbd9"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1e7f1d6c-bdb5-4e89-90e2-970336aeb586"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("20ef3681-0b10-4526-8919-f3f18c1a0b43"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("272a7260-95ef-4d73-b656-cc48d72e09c2"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2f88fd06-b8bd-4d8c-b744-0c0591f45a99"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46648eca-e4fd-4f91-95c1-21f4419df2c6"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("53f00dd8-5fc4-45f5-afeb-21d68eeb4228"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("59229ca1-a056-4f56-b6f4-c72ef1906e63"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("66f4f9bf-1f15-4c9f-a59f-317b0b7c4f19"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7694c676-287f-4509-969e-c8de65c89a0d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("886f313a-d179-4f6d-a1c6-d00de9cb1521"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9713a4d9-8d94-47d8-9f90-4e5af6847e11"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9e0ddd4f-3339-46e1-8ab8-d485be7fca8d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9f306145-c17e-4234-ae46-aaf8e22c6205"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a0c33630-5d24-4cb8-af88-b66bf166fdd0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b3f0a417-2cf8-4b91-806f-e6f42c9d9f19"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bf9ac4ba-c73e-45f4-af54-b0e56f5addfe"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c2de6b57-2080-4b71-9f6b-50f2a23a66f7"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cb8f1cb3-f093-4f42-b867-48c26127fcdd"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e9abb6e3-58b1-4171-85dc-0fec30ff6a2c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ea12f2ff-b9de-4f6d-a237-3f68f812283b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3ed034f-87d6-4734-af96-2f7778e4cafa"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("fd0a7865-43f1-4cc3-b57f-4c4b5ca47c57"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"));

            migrationBuilder.DeleteData(
                table: "OptionSet",
                keyColumn: "Id",
                keyValue: new Guid("5215043d-b92f-47c8-9650-f39f4f9fd7ca"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drink_type_other.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drink_type.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_type.beer");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_type.cider");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_type.other");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_type.spirits");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.options.drink_type.wine");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.currently_unsafe.label",
                column: "DefaultText",
                value: "Immediate Safety Concern");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.drinks_per_day.label",
                column: "DefaultText",
                value: "Drinks Per Day");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.history_of_seizures.label",
                column: "DefaultText",
                value: "History Of Seizures");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.field.withdrawal_history.label",
                column: "DefaultText",
                value: "Withdrawal History");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("16d7f20f-2ab8-4325-b24b-0ee04a1ce44c"),
                column: "Text",
                value: "Drinks Per Day");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"),
                column: "Text",
                value: "Logáilte isteach mar");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"),
                column: "Text",
                value: "Logáil isteach mar úsáideoir eile");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b"),
                column: "Text",
                value: "Deochanna sa Lá");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87"),
                column: "Text",
                value: "Féin");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e89eb3-0dff-4f27-a4f7-dde66f8ef067"),
                column: "Text",
                value: "Sonraí an Ghlaoiteora");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"),
                column: "Text",
                value: "Meastóireacht");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"),
                column: "Text",
                value: "Gabh sonraí scagtha ón gcéad ghlao.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18"),
                column: "Text",
                value: "Dochtúir Teaghlaigh");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9"),
                column: "Text",
                value: "Úsáid Alcóil");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"),
                column: "Text",
                value: "Ionad Cóireála Brú Rí");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"),
                column: "Text",
                value: "Logáil Glaonna");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d17f0d3f-f9bc-4b37-8427-f5340bd6ea2e"),
                column: "Text",
                value: "Withdrawal History");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"),
                column: "Text",
                value: "Scagadh Glao Alcóil");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"),
                column: "Text",
                value: "Logáil amach");
        }
    }
}
