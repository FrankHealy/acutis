using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ArabicFormTitlesFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9713a4d9-8d94-47d8-9f90-4e5af6847e11"),
                column: "Text",
                value: "الجدولة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a0c33630-5d24-4cb8-af88-b66bf166fdd0"),
                column: "Text",
                value: "مكالمة فحص تعاطي الكحول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"),
                column: "Text",
                value: "ملاحظات المتابعة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"),
                column: "Text",
                value: "التقييم");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"),
                column: "Text",
                value: "الاستقرار والسلامة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"),
                column: "Text",
                value: "استخدام الكحول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"),
                column: "Text",
                value: "بيانات المتصل");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"),
                column: "Text",
                value: "تسجيل المكالمات");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9713a4d9-8d94-47d8-9f90-4e5af6847e11"),
                column: "Text",
                value: "Scheduling");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a0c33630-5d24-4cb8-af88-b66bf166fdd0"),
                column: "Text",
                value: "Alcohol Screening Call");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"),
                column: "Text",
                value: "Follow Up Notes");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"),
                column: "Text",
                value: "Evaluation");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"),
                column: "Text",
                value: "Stability & Safety");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"),
                column: "Text",
                value: "Alcohol Use");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"),
                column: "Text",
                value: "Caller Details");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"),
                column: "Text",
                value: "Call Logging");
        }
    }
}
