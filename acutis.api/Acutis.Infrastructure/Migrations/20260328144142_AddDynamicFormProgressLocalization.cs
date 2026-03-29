using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDynamicFormProgressLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "form.boolean.applies", "Applies" },
                    { "form.boolean.not_applies", "Does not apply" },
                    { "form.progress.label", "Progress" },
                    { "form.progress.step", "Step {current} of {total}" },
                    { "form.status.draft_saved", "Draft saved." },
                    { "toast.action.close", "Close" }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("0f8b5f6c-f7fb-4eab-9694-2b301430c154"), "form.progress.step", "ar", "الخطوة {current} من {total}" },
                    { new Guid("241b3662-2a41-4f67-8769-d3bcf9dca9c2"), "form.boolean.applies", "ar", "ينطبق" },
                    { new Guid("3d9338d2-b2b8-4c6f-a9ec-1bf2336d3b9a"), "form.progress.label", "ar", "التقدم" },
                    { new Guid("61fd6f0d-0bb0-4cfc-9c0d-60f00998d950"), "form.boolean.not_applies", "ar", "لا ينطبق" },
                    { new Guid("d3fc7953-cbe0-41f8-9f15-948ad1d21f3c"), "form.status.draft_saved", "ar", "تم حفظ المسودة." },
                    { new Guid("e33731c2-0b64-496f-b4de-e561242cf65f"), "toast.action.close", "ar", "إغلاق" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0f8b5f6c-f7fb-4eab-9694-2b301430c154"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("241b3662-2a41-4f67-8769-d3bcf9dca9c2"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3d9338d2-b2b8-4c6f-a9ec-1bf2336d3b9a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("61fd6f0d-0bb0-4cfc-9c0d-60f00998d950"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d3fc7953-cbe0-41f8-9f15-948ad1d21f3c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e33731c2-0b64-496f-b4de-e561242cf65f"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.boolean.applies");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.boolean.not_applies");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.progress.label");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.progress.step");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.draft_saved");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "toast.action.close");
        }
    }
}
