using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFormSubmissionStatusLookupId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StatusLookupValueId",
                table: "FormSubmission",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupType",
                columns: new[] { "LookupTypeId", "DefaultLocale", "IsActive", "Key", "Version" },
                values: new object[] { new Guid("ba44c209-bb7e-4c25-a722-49af6fc40b61"), "en-IE", true, "form_submission_status", 1 });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValue",
                columns: new[] { "LookupValueId", "Code", "IsActive", "LookupTypeId", "SortOrder", "UnitId" },
                values: new object[,]
                {
                    { new Guid("b62c1e73-9a3c-4975-b9f2-2d51b88ccbb0"), "in_progress", true, new Guid("ba44c209-bb7e-4c25-a722-49af6fc40b61"), 10, null },
                    { new Guid("e682df6a-1797-4ce1-95f1-a95a3745859c"), "submitted", true, new Guid("ba44c209-bb7e-4c25-a722-49af6fc40b61"), 20, null }
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValueLabel",
                columns: new[] { "Locale", "LookupValueId", "Label" },
                values: new object[,]
                {
                    { "en-IE", new Guid("b62c1e73-9a3c-4975-b9f2-2d51b88ccbb0"), "In Progress" },
                    { "en-IE", new Guid("e682df6a-1797-4ce1-95f1-a95a3745859c"), "Submitted" }
                });

            migrationBuilder.Sql(
                """
                UPDATE dbo.FormSubmission
                SET StatusLookupValueId = CASE LOWER(LTRIM(RTRIM(Status)))
                    WHEN 'in_progress' THEN 'B62C1E73-9A3C-4975-B9F2-2D51B88CCBB0'
                    WHEN 'submitted' THEN 'E682DF6A-1797-4CE1-95F1-A95A3745859C'
                    ELSE NULL
                END
                WHERE StatusLookupValueId IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "StatusLookupValueId",
                table: "FormSubmission",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmission_FormCode_FormVersion_SubjectType_SubjectId_StatusLookupValueId",
                table: "FormSubmission",
                columns: new[] { "FormCode", "FormVersion", "SubjectType", "SubjectId", "StatusLookupValueId" });

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmission_StatusLookupValueId",
                table: "FormSubmission",
                column: "StatusLookupValueId");

            migrationBuilder.AddForeignKey(
                name: "FK_FormSubmission_LookupValue_StatusLookupValueId",
                table: "FormSubmission",
                column: "StatusLookupValueId",
                principalSchema: "dbo",
                principalTable: "LookupValue",
                principalColumn: "LookupValueId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormSubmission_LookupValue_StatusLookupValueId",
                table: "FormSubmission");

            migrationBuilder.DropIndex(
                name: "IX_FormSubmission_FormCode_FormVersion_SubjectType_SubjectId_StatusLookupValueId",
                table: "FormSubmission");

            migrationBuilder.DropIndex(
                name: "IX_FormSubmission_StatusLookupValueId",
                table: "FormSubmission");

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("b62c1e73-9a3c-4975-b9f2-2d51b88ccbb0") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("e682df6a-1797-4ce1-95f1-a95a3745859c") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("b62c1e73-9a3c-4975-b9f2-2d51b88ccbb0"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("e682df6a-1797-4ce1-95f1-a95a3745859c"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("ba44c209-bb7e-4c25-a722-49af6fc40b61"));

            migrationBuilder.DropColumn(
                name: "StatusLookupValueId",
                table: "FormSubmission");
        }
    }
}
