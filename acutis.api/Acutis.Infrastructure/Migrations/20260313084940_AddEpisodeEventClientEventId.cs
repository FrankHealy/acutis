using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEpisodeEventClientEventId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClientEventId",
                table: "EpisodeEvent",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EpisodeEvent_ClientEventId",
                table: "EpisodeEvent",
                column: "ClientEventId",
                unique: true,
                filter: "[ClientEventId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EpisodeEvent_ClientEventId",
                table: "EpisodeEvent");

            migrationBuilder.DropColumn(
                name: "ClientEventId",
                table: "EpisodeEvent");
        }
    }
}
