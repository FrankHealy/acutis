using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EvaluationQueueLocalizationArabic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "evaluation.action.view", "View" },
                    { "evaluation.empty.form", "No evaluation form available." },
                    { "evaluation.empty.queue", "No evaluation candidates available." },
                    { "evaluation.loading.form", "Loading evaluation form..." },
                    { "evaluation.loading.queue", "Loading evaluation queue..." },
                    { "evaluation.modal.subtitle", "Phone Evaluation" },
                    { "evaluation.queue.title", "Evaluation Queue" },
                    { "evaluation.stats.completed", "Completed" },
                    { "evaluation.stats.in_progress", "In Progress" },
                    { "evaluation.stats.pending", "Pending" },
                    { "evaluation.stats.scheduled", "Scheduled" },
                    { "evaluation.status.completed", "Completed" },
                    { "evaluation.status.in_progress", "In Progress" },
                    { "evaluation.status.pending", "Pending" },
                    { "evaluation.status.scheduled", "Scheduled" },
                    { "evaluation.table.action", "Action" },
                    { "evaluation.table.last_call_date", "Last Call Date" },
                    { "evaluation.table.name", "Name" },
                    { "evaluation.table.num_calls", "Num Calls" },
                    { "evaluation.table.status", "Status" },
                    { "evaluation.table.surname", "Surname" },
                    { "evaluation.table.unit", "Unit" }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("060098f3-091e-426c-a6a7-4d2bffb09ff8"), "evaluation.status.pending", "ar", "قيد الانتظار" },
                    { new Guid("1c25f5e8-cc6d-4ae2-8475-b4591bce426c"), "evaluation.stats.pending", "ar", "قيد الانتظار" },
                    { new Guid("3194c14a-e73f-4fbe-8f3f-5b17445bd128"), "evaluation.empty.queue", "ar", "لا توجد حالات تقييم متاحة." },
                    { new Guid("3b977d28-f3d9-4766-8ffb-573df38cbeb4"), "evaluation.queue.title", "ar", "قائمة التقييم" },
                    { new Guid("4556f72e-ebce-4a18-b61d-fd614b43f78f"), "evaluation.stats.completed", "ar", "مكتمل" },
                    { new Guid("5701e3ea-fec4-4f5c-ab4a-f75c1e23a334"), "evaluation.table.last_call_date", "ar", "تاريخ آخر مكالمة" },
                    { new Guid("61685d4e-6ef8-4477-95f5-77ff4ab690d4"), "evaluation.table.surname", "ar", "اللقب" },
                    { new Guid("697d0e4f-4fd8-4978-aebd-f19a5fbd7d2f"), "evaluation.loading.queue", "ar", "جار تحميل قائمة التقييم..." },
                    { new Guid("6ad7f2dd-0c03-4bb8-a398-f00f80518f95"), "evaluation.table.num_calls", "ar", "عدد المكالمات" },
                    { new Guid("7f1f55d9-6d09-4075-9d6b-c54c14490515"), "evaluation.status.completed", "ar", "مكتمل" },
                    { new Guid("86ef317b-1afd-4714-a620-6f81d174ec0a"), "evaluation.table.unit", "ar", "الوحدة" },
                    { new Guid("887273d1-9f36-4af0-b8c8-20006830b54d"), "evaluation.stats.in_progress", "ar", "قيد التنفيذ" },
                    { new Guid("95f3a857-7c59-4eef-a6ca-8e1ca02610e2"), "evaluation.stats.scheduled", "ar", "مجدول" },
                    { new Guid("a2f1f7ee-f45c-4ca9-a233-ce6197f09d48"), "evaluation.table.status", "ar", "الحالة" },
                    { new Guid("c2727290-34ec-4a5d-9c78-cfca7191d2de"), "evaluation.table.action", "ar", "إجراء" },
                    { new Guid("cc93ab8e-7c97-46c5-8ee4-e85ce391f3ff"), "evaluation.action.view", "ar", "عرض" },
                    { new Guid("cd374ce7-c9be-40ac-a8de-157e1f5ef8a6"), "evaluation.modal.subtitle", "ar", "تقييم هاتفي" },
                    { new Guid("dbbd3650-7578-48eb-8ff1-850f4494de2c"), "evaluation.status.scheduled", "ar", "مجدول" },
                    { new Guid("f022f542-c0af-4339-a85a-f1c840b4ac4a"), "evaluation.empty.form", "ar", "لا يوجد نموذج تقييم متاح." },
                    { new Guid("f58fca32-e6d6-4ea1-a81e-c52ca3108e04"), "evaluation.table.name", "ar", "الاسم" },
                    { new Guid("f66d9b1d-3871-4cd2-b15e-e100db7c9b3f"), "evaluation.status.in_progress", "ar", "قيد التنفيذ" },
                    { new Guid("fd2bf3bf-8c66-4422-b965-c8ca1f4f74d8"), "evaluation.loading.form", "ar", "جار تحميل نموذج التقييم..." }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("060098f3-091e-426c-a6a7-4d2bffb09ff8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c25f5e8-cc6d-4ae2-8475-b4591bce426c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3194c14a-e73f-4fbe-8f3f-5b17445bd128"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3b977d28-f3d9-4766-8ffb-573df38cbeb4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("4556f72e-ebce-4a18-b61d-fd614b43f78f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5701e3ea-fec4-4f5c-ab4a-f75c1e23a334"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("61685d4e-6ef8-4477-95f5-77ff4ab690d4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("697d0e4f-4fd8-4978-aebd-f19a5fbd7d2f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ad7f2dd-0c03-4bb8-a398-f00f80518f95"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7f1f55d9-6d09-4075-9d6b-c54c14490515"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("86ef317b-1afd-4714-a620-6f81d174ec0a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("887273d1-9f36-4af0-b8c8-20006830b54d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("95f3a857-7c59-4eef-a6ca-8e1ca02610e2"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a2f1f7ee-f45c-4ca9-a233-ce6197f09d48"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c2727290-34ec-4a5d-9c78-cfca7191d2de"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cc93ab8e-7c97-46c5-8ee4-e85ce391f3ff"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cd374ce7-c9be-40ac-a8de-157e1f5ef8a6"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dbbd3650-7578-48eb-8ff1-850f4494de2c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f022f542-c0af-4339-a85a-f1c840b4ac4a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f58fca32-e6d6-4ea1-a81e-c52ca3108e04"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f66d9b1d-3871-4cd2-b15e-e100db7c9b3f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("fd2bf3bf-8c66-4422-b965-c8ca1f4f74d8"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.action.view");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.empty.form");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.empty.queue");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.loading.form");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.loading.queue");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.modal.subtitle");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.title");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.stats.completed");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.stats.in_progress");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.stats.pending");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.stats.scheduled");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.completed");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.in_progress");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.pending");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.status.scheduled");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.action");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.last_call_date");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.name");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.num_calls");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.status");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.surname");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.unit");
        }
    }
}
