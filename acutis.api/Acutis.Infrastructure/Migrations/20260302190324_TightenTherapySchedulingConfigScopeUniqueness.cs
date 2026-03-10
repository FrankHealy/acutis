using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TightenTherapySchedulingConfigScopeUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TherapySchedulingConfig_CentreId",
                table: "TherapySchedulingConfig",
                column: "CentreId",
                unique: true,
                filter: "[UnitId] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TherapySchedulingConfig_CentreId",
                table: "TherapySchedulingConfig");
        }
    }
}
