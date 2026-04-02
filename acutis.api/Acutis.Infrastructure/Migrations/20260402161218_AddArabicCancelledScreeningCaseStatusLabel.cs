using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddArabicCancelledScreeningCaseStatusLabel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValueLabel",
                columns: new[] { "Locale", "LookupValueId", "Label" },
                values: new object[] { "ar-EG", new Guid("ec2d1b83-2ea2-4418-a0bd-f7ba92525553"), "ملغى" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "ar-EG", new Guid("ec2d1b83-2ea2-4418-a0bd-f7ba92525553") });
        }
    }
}
