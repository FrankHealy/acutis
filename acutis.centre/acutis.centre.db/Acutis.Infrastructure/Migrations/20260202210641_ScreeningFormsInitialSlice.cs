using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ScreeningFormsInitialSlice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FormDefinition",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TitleKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SchemaJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UiJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RulesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormDefinition", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormSubmission",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FormVersion = table.Column<int>(type: "int", nullable: false),
                    SubjectType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SubjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AnswersJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormSubmission", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OptionSet",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionSet", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TextResource",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DefaultText = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextResource", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "OptionItem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OptionSetId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LabelKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValidTo = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OptionItem_OptionSet_OptionSetId",
                        column: x => x.OptionSetId,
                        principalTable: "OptionSet",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TextTranslation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Text = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextTranslation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TextTranslation_TextResource_Key",
                        column: x => x.Key,
                        principalTable: "TextResource",
                        principalColumn: "Key",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FormDefinition",
                columns: new[] { "Id", "Code", "CreatedAt", "DescriptionKey", "RulesJson", "SchemaJson", "Status", "TitleKey", "UiJson", "Version" },
                values: new object[] { new Guid("ed6af9de-1397-41f6-b165-b11b5d426f90"), "alcohol_screening_call", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "screening.form.alcohol_screening_call.description", "[\n  {\n    \"if\": { \"field\": \"withdrawalHistory\", \"equals\": false },\n    \"then\": {},\n    \"else\": {}\n  }\n]", "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"callerName\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 120 },\n    \"age\": { \"type\": \"integer\", \"minimum\": 16, \"maximum\": 120 },\n    \"drinksPerDay\": { \"type\": \"number\", \"minimum\": 0, \"maximum\": 100 },\n    \"withdrawalHistory\": { \"type\": \"boolean\" },\n    \"referralSource\": { \"type\": \"enum\", \"optionSetKey\": \"referral_source\" }\n  },\n  \"required\": [ \"age\", \"drinksPerDay\", \"referralSource\" ]\n}", "published", "screening.form.alcohol_screening_call.title", "{\n  \"sections\": [\n    { \"titleKey\": \"screening.section.caller_details\", \"items\": [ \"callerName\", \"age\" ] },\n    { \"titleKey\": \"screening.section.alcohol_use\", \"items\": [ \"drinksPerDay\", \"withdrawalHistory\", \"referralSource\" ] }\n  ],\n  \"widgets\": {\n    \"callerName\": \"input\",\n    \"age\": \"number\",\n    \"drinksPerDay\": \"number\",\n    \"withdrawalHistory\": \"toggle\",\n    \"referralSource\": \"select\"\n  },\n  \"labelKeys\": {\n    \"callerName\": \"screening.field.caller_name.label\",\n    \"age\": \"screening.field.age.label\",\n    \"drinksPerDay\": \"screening.field.drinks_per_day.label\",\n    \"withdrawalHistory\": \"screening.field.withdrawal_history.label\",\n    \"referralSource\": \"screening.field.referral_source.label\"\n  },\n  \"helpKeys\": {\n    \"drinksPerDay\": \"screening.field.drinks_per_day.help\"\n  }\n}", 1 });

            migrationBuilder.InsertData(
                table: "OptionSet",
                columns: new[] { "Id", "Key" },
                values: new object[] { new Guid("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5"), "referral_source" });

            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "screening.field.age.label", "Age" },
                    { "screening.field.caller_name.label", "Caller Name" },
                    { "screening.field.drinks_per_day.help", "Approximate average on drinking days." },
                    { "screening.field.drinks_per_day.label", "Drinks Per Day" },
                    { "screening.field.referral_source.label", "Referral Source" },
                    { "screening.field.withdrawal_history.label", "Withdrawal History" },
                    { "screening.form.alcohol_screening_call.description", "Capture first-call screening details." },
                    { "screening.form.alcohol_screening_call.title", "Alcohol Screening Call" },
                    { "screening.options.referral_source.family", "Family" },
                    { "screening.options.referral_source.gp", "GP" },
                    { "screening.options.referral_source.other", "Other" },
                    { "screening.options.referral_source.self", "Self" },
                    { "screening.section.alcohol_use", "Alcohol Use" },
                    { "screening.section.caller_details", "Caller Details" }
                });

            migrationBuilder.InsertData(
                table: "OptionItem",
                columns: new[] { "Id", "Code", "IsActive", "LabelKey", "OptionSetId", "SortOrder", "ValidFrom", "ValidTo" },
                values: new object[,]
                {
                    { new Guid("4167ea3e-95e1-4578-8dbf-1b04af0f87ce"), "family", true, "screening.options.referral_source.family", new Guid("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5"), 2, null, null },
                    { new Guid("4cdab4a6-537f-42dd-a88d-5cc04c4e9d03"), "gp", true, "screening.options.referral_source.gp", new Guid("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5"), 1, null, null },
                    { new Guid("6f2838eb-16ca-41c0-bb69-0bc6e7ba93f9"), "self", true, "screening.options.referral_source.self", new Guid("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5"), 3, null, null },
                    { new Guid("838674f5-05c6-4422-9515-6f92907f0963"), "other", true, "screening.options.referral_source.other", new Guid("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5"), 4, null, null }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("16d7f20f-2ab8-4325-b24b-0ee04a1ce44c"), "screening.field.drinks_per_day.label", "en-IE", "Drinks Per Day" },
                    { new Guid("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b"), "screening.field.drinks_per_day.label", "ga-IE", "Deochanna sa Lá" },
                    { new Guid("3de27e13-afd4-4f01-8fa1-a8df16f25880"), "screening.field.age.label", "ga-IE", "Aois" },
                    { new Guid("44fdd6e6-c3cd-4f5d-8268-4ca95d85f962"), "screening.field.referral_source.label", "en-IE", "Referral Source" },
                    { new Guid("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87"), "screening.options.referral_source.self", "ga-IE", "Féin" },
                    { new Guid("46e89eb3-0dff-4f27-a4f7-dde66f8ef067"), "screening.section.caller_details", "ga-IE", "Sonraí an Ghlaoiteora" },
                    { new Guid("47fb09a7-49a7-4a1c-b7c5-ac30e3a4fa2f"), "screening.field.withdrawal_history.label", "ga-IE", "Stair Aistarraingthe" },
                    { new Guid("4d66d847-8d32-4dd1-95ec-7cba0a6455fc"), "screening.options.referral_source.other", "en-IE", "Other" },
                    { new Guid("5dc539ca-2b43-4ed3-a9f9-923870b6d94f"), "screening.options.referral_source.gp", "en-IE", "GP" },
                    { new Guid("6285e2e3-40ce-4e61-a503-c7fecf6842dd"), "screening.options.referral_source.self", "en-IE", "Self" },
                    { new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"), "screening.form.alcohol_screening_call.description", "ga-IE", "Gabh sonraí scagtha ón gcéad ghlao." },
                    { new Guid("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18"), "screening.options.referral_source.gp", "ga-IE", "Dochtúir Teaghlaigh" },
                    { new Guid("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9"), "screening.section.alcohol_use", "ga-IE", "Úsáid Alcóil" },
                    { new Guid("7b5a2874-ec9f-466b-a2f4-6dc6a552d49a"), "screening.section.caller_details", "en-IE", "Caller Details" },
                    { new Guid("7f428f69-c2f7-48f9-a7f8-c5d3221d8f33"), "screening.form.alcohol_screening_call.title", "en-IE", "Alcohol Screening Call" },
                    { new Guid("813d456f-a9b8-44e8-bd9d-0dbf0e9bf338"), "screening.options.referral_source.family", "ga-IE", "Teaghlach" },
                    { new Guid("8c41630d-33b7-404d-9aa7-4cb57ea6d6c0"), "screening.field.referral_source.label", "ga-IE", "Foinse Atreoraithe" },
                    { new Guid("9c3c9ef4-bf2b-4482-8aa3-3628f0d9a769"), "screening.options.referral_source.other", "ga-IE", "Eile" },
                    { new Guid("aa669e44-a7a4-4f6f-9f37-0dd695f73790"), "screening.field.age.label", "en-IE", "Age" },
                    { new Guid("aeaf7968-0e8a-4931-a9d2-64a063169b84"), "screening.field.caller_name.label", "en-IE", "Caller Name" },
                    { new Guid("b6d49719-9a31-4fd5-82e8-96c13fd6e56a"), "screening.options.referral_source.family", "en-IE", "Family" },
                    { new Guid("d17f0d3f-f9bc-4b37-8427-f5340bd6ea2e"), "screening.field.withdrawal_history.label", "en-IE", "Withdrawal History" },
                    { new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"), "screening.form.alcohol_screening_call.title", "ga-IE", "Scagadh Glao Alcóil" },
                    { new Guid("e5f7cc59-675a-4e3d-b0f1-5d90ce7ed4c3"), "screening.field.caller_name.label", "ga-IE", "Ainm an Ghlaoiteora" },
                    { new Guid("f0b455f6-e4d7-4f5f-a639-9f4f3fc39978"), "screening.section.alcohol_use", "en-IE", "Alcohol Use" },
                    { new Guid("f3c1b6db-ffb8-41f3-84dd-c8738c75d977"), "screening.form.alcohol_screening_call.description", "en-IE", "Capture first-call screening details." }
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormDefinition_Code_Status",
                table: "FormDefinition",
                columns: new[] { "Code", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_FormDefinition_Code_Version",
                table: "FormDefinition",
                columns: new[] { "Code", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmission_FormCode_FormVersion_SubjectType_SubjectId_Status",
                table: "FormSubmission",
                columns: new[] { "FormCode", "FormVersion", "SubjectType", "SubjectId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_OptionItem_OptionSetId_Code",
                table: "OptionItem",
                columns: new[] { "OptionSetId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OptionSet_Key",
                table: "OptionSet",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TextTranslation_Key_Locale",
                table: "TextTranslation",
                columns: new[] { "Key", "Locale" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FormDefinition");

            migrationBuilder.DropTable(
                name: "FormSubmission");

            migrationBuilder.DropTable(
                name: "OptionItem");

            migrationBuilder.DropTable(
                name: "TextTranslation");

            migrationBuilder.DropTable(
                name: "OptionSet");

            migrationBuilder.DropTable(
                name: "TextResource");
        }
    }
}
