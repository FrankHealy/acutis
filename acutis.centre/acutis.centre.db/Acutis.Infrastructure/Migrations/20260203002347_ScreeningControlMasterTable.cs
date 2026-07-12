using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ScreeningControlMasterTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScreeningControl",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UnitName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UnitCapacity = table.Column<int>(type: "int", nullable: false),
                    CurrentOccupancy = table.Column<int>(type: "int", nullable: false),
                    CapacityWarningThreshold = table.Column<int>(type: "int", nullable: false),
                    CallLogsCacheSeconds = table.Column<int>(type: "int", nullable: false),
                    EvaluationQueueCacheSeconds = table.Column<int>(type: "int", nullable: false),
                    LocalizationCacheSeconds = table.Column<int>(type: "int", nullable: false),
                    EnableClientCacheOverride = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScreeningControl", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ScreeningControl",
                columns: new[] { "Id", "CallLogsCacheSeconds", "CapacityWarningThreshold", "CurrentOccupancy", "EnableClientCacheOverride", "EvaluationQueueCacheSeconds", "LocalizationCacheSeconds", "UnitCapacity", "UnitCode", "UnitName", "UpdatedAt" },
                values: new object[] { new Guid("9df9c2b5-e728-4327-8a6b-f22f73dcd22d"), 15, 96, 92, true, 30, 300, 120, "alcohol", "Alcohol Unit", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.CreateIndex(
                name: "IX_ScreeningControl_UnitCode",
                table: "ScreeningControl",
                column: "UnitCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScreeningControl");
        }
    }
}
