using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCancelledScreeningCaseStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValue",
                columns: new[] { "LookupValueId", "Code", "IsActive", "LookupTypeId", "SortOrder", "UnitId" },
                values: new object[] { new Guid("ec2d1b83-2ea2-4418-a0bd-f7ba92525553"), "cancelled", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 100, null });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValueLabel",
                columns: new[] { "Locale", "LookupValueId", "Label" },
                values: new object[] { "en-IE", new Guid("ec2d1b83-2ea2-4418-a0bd-f7ba92525553"), "Cancelled" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("ec2d1b83-2ea2-4418-a0bd-f7ba92525553") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("ec2d1b83-2ea2-4418-a0bd-f7ba92525553"));
        }
    }
}
