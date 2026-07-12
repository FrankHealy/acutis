using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeUnitQuoteCurationUnitIdToGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UnitQuoteCuration_UnitId_QuoteId",
                table: "UnitQuoteCuration");

            migrationBuilder.AddColumn<Guid>(
                name: "UnitIdGuid",
                table: "UnitQuoteCuration",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql(
                """
UPDATE [UnitQuoteCuration]
SET [UnitIdGuid] =
    CASE
        WHEN LOWER([UnitId]) = 'alcohol' THEN '11111111-1111-1111-1111-111111111111'
        WHEN LOWER([UnitId]) = 'detox'   THEN '22222222-2222-2222-2222-222222222222'
        WHEN LOWER([UnitId]) = 'drugs'   THEN '33333333-3333-3333-3333-333333333333'
        WHEN LOWER([UnitId]) = 'ladies'  THEN '44444444-4444-4444-4444-444444444444'
        WHEN TRY_CONVERT(uniqueidentifier, [UnitId]) IS NOT NULL THEN TRY_CONVERT(uniqueidentifier, [UnitId])
        ELSE NEWID()
    END;
""");

            migrationBuilder.AlterColumn<Guid>(
                name: "UnitIdGuid",
                table: "UnitQuoteCuration",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "UnitQuoteCuration");

            migrationBuilder.RenameColumn(
                name: "UnitIdGuid",
                table: "UnitQuoteCuration",
                newName: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitQuoteCuration_UnitId_QuoteId",
                table: "UnitQuoteCuration",
                columns: new[] { "UnitId", "QuoteId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UnitQuoteCuration_UnitId_QuoteId",
                table: "UnitQuoteCuration");

            migrationBuilder.AddColumn<string>(
                name: "UnitIdText",
                table: "UnitQuoteCuration",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.Sql(
                """
UPDATE [UnitQuoteCuration]
SET [UnitIdText] =
    CASE
        WHEN [UnitId] = '11111111-1111-1111-1111-111111111111' THEN 'alcohol'
        WHEN [UnitId] = '22222222-2222-2222-2222-222222222222' THEN 'detox'
        WHEN [UnitId] = '33333333-3333-3333-3333-333333333333' THEN 'drugs'
        WHEN [UnitId] = '44444444-4444-4444-4444-444444444444' THEN 'ladies'
        ELSE CONVERT(nvarchar(50), [UnitId])
    END;
""");

            migrationBuilder.AlterColumn<string>(
                name: "UnitIdText",
                table: "UnitQuoteCuration",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "UnitQuoteCuration");

            migrationBuilder.RenameColumn(
                name: "UnitIdText",
                table: "UnitQuoteCuration",
                newName: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitQuoteCuration_UnitId_QuoteId",
                table: "UnitQuoteCuration",
                columns: new[] { "UnitId", "QuoteId" },
                unique: true);
        }
    }
}
