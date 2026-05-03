using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResidentEpisodeBedCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BedCode",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResidentProgrammeEpisode_UnitId_BedCode",
                table: "ResidentProgrammeEpisode",
                columns: new[] { "UnitId", "BedCode" },
                filter: "[BedCode] IS NOT NULL AND [EndDate] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResidentProgrammeEpisode_UnitId_BedCode",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "BedCode",
                table: "ResidentProgrammeEpisode");
        }
    }
}
