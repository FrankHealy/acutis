using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScreeningAcceptAndEntityMissingLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "evaluation.status.awaiting", "Awaiting" },
                    { "evaluation.status.entity_missing", "Entity Missing" },
                    { "form.action.accept", "Accept" },
                    { "form.action.accepting", "Accepting..." },
                    { "form.action.cancel", "Cancel" },
                    { "form.modal.reject.confirm", "Confirm Reject" },
                    { "form.modal.reject.title", "Reject Assessment" },
                    { "form.status.accepted", "Accepted." }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("1fa62ace-f077-4357-86c4-bff00d66fd3f"), "form.modal.reject.title", "ar", "رفض التقييم" },
                    { new Guid("2c5919be-4289-4727-9845-8d94b404bf0f"), "evaluation.status.entity_missing", "ar", "الكيان مفقود" },
                    { new Guid("420b766e-69be-4ef4-88be-6d75c2eeccf4"), "form.modal.reject.confirm", "ar", "تأكيد الرفض" },
                    { new Guid("54d5b060-2b3d-4d42-ad3b-7be3467d953a"), "form.action.accepting", "ar", "جار القبول..." },
                    { new Guid("5fe57bbf-cd34-4f82-84ec-6727ea241f05"), "form.status.accepted", "ar", "تم القبول." },
                    { new Guid("84ef093f-f27a-4977-9b06-80af1e0fb027"), "form.action.accept", "ar", "قبول" },
                    { new Guid("dc5b7061-a7e2-4422-a5c4-0c4949c363fe"), "evaluation.status.awaiting", "ar", "بانتظار" },
                    { new Guid("f177ea1d-0c2c-4aa1-b11a-97cb3e2d8574"), "form.action.cancel", "ar", "إلغاء" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1fa62ace-f077-4357-86c4-bff00d66fd3f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2c5919be-4289-4727-9845-8d94b404bf0f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("420b766e-69be-4ef4-88be-6d75c2eeccf4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("54d5b060-2b3d-4d42-ad3b-7be3467d953a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5fe57bbf-cd34-4f82-84ec-6727ea241f05"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("84ef093f-f27a-4977-9b06-80af1e0fb027"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dc5b7061-a7e2-4422-a5c4-0c4949c363fe"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f177ea1d-0c2c-4aa1-b11a-97cb3e2d8574"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.awaiting");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.entity_missing");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.accept");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.accepting");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.cancel");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.modal.reject.confirm");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.modal.reject.title");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.accepted");
        }
    }
}
