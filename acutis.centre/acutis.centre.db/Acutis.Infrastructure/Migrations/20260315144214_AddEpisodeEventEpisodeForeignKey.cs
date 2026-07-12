using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEpisodeEventEpisodeForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_EpisodeEvent_ResidentProgrammeEpisode_EpisodeId",
                table: "EpisodeEvent",
                column: "EpisodeId",
                principalTable: "ResidentProgrammeEpisode",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EpisodeEvent_ResidentProgrammeEpisode_EpisodeId",
                table: "EpisodeEvent");
        }
    }
}
