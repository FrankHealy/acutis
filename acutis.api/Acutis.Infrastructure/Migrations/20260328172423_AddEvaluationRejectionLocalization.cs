using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEvaluationRejectionLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "form.action.reject", "Reject" },
                    { "form.error.rejection_failed", "Rejection failed." },
                    { "form.error.rejection_reason_required", "Rejection reason is required." },
                    { "form.field.rejection_reason", "Reason for rejection" },
                    { "form.field.rejection_reason_placeholder", "Enter the reason for rejection" },
                    { "form.status.rejected", "Rejected." }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("26b6854b-f11f-49bb-9f3e-f535fdbf62a0"), "form.status.rejected", "ar", "تم الرفض." },
                    { new Guid("6593a7e7-dcef-4a7d-b3fe-6c8900c36849"), "form.error.rejection_reason_required", "ar", "سبب الرفض مطلوب." },
                    { new Guid("7ab92c1b-49cc-43c6-a812-63bf0b8fe1ef"), "form.field.rejection_reason_placeholder", "ar", "أدخل سبب الرفض" },
                    { new Guid("9cda1c6a-00de-4f45-a2cb-6c2f3061fe59"), "form.action.reject", "ar", "رفض" },
                    { new Guid("9f03d4ec-5582-4ccd-87b7-64dd5e817d57"), "form.error.rejection_failed", "ar", "فشل الرفض." },
                    { new Guid("c52a6bf9-fc9f-45e4-92ea-e46dfbd66b35"), "form.field.rejection_reason", "ar", "سبب الرفض" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("26b6854b-f11f-49bb-9f3e-f535fdbf62a0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6593a7e7-dcef-4a7d-b3fe-6c8900c36849"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7ab92c1b-49cc-43c6-a812-63bf0b8fe1ef"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9cda1c6a-00de-4f45-a2cb-6c2f3061fe59"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9f03d4ec-5582-4ccd-87b7-64dd5e817d57"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c52a6bf9-fc9f-45e4-92ea-e46dfbd66b35"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.reject");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.error.rejection_failed");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.error.rejection_reason_required");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.field.rejection_reason");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.field.rejection_reason_placeholder");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.rejected");
        }
    }
}
