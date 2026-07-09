using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFormDefinitionEffectiveDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ActiveFrom",
                table: "FormDefinition",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActiveTo",
                table: "FormDefinition",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE [FormDefinition]
                SET [ActiveFrom] = [CreatedAt]
                WHERE [ActiveFrom] IS NULL;
                """);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ActiveFrom",
                table: "FormDefinition",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "SYSUTCDATETIME()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActiveFrom",
                table: "FormDefinition");

            migrationBuilder.DropColumn(
                name: "ActiveTo",
                table: "FormDefinition");
        }
    }
}
