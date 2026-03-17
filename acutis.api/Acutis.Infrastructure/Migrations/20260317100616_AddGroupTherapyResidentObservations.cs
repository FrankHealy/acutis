using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupTherapyResidentObservations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GroupTherapyResidentObservation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProgramCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ModuleKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SessionNumber = table.Column<int>(type: "int", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentCaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EpisodeEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ObserverUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ObservedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SelectedTermsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapyResidentObservation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupTherapyResidentObservation_AppUser_ObserverUserId",
                        column: x => x.ObserverUserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupTherapyResidentObservation_EpisodeEvent_EpisodeEventId",
                        column: x => x.EpisodeEventId,
                        principalTable: "EpisodeEvent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupTherapyResidentObservation_ResidentCase_ResidentCaseId",
                        column: x => x.ResidentCaseId,
                        principalTable: "ResidentCase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupTherapyResidentObservation_ResidentProgrammeEpisode_EpisodeId",
                        column: x => x.EpisodeId,
                        principalTable: "ResidentProgrammeEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupTherapyResidentObservation_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyResidentObservation_EpisodeEventId",
                table: "GroupTherapyResidentObservation",
                column: "EpisodeEventId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyResidentObservation_EpisodeId",
                table: "GroupTherapyResidentObservation",
                column: "EpisodeId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyResidentObservation_ObserverUserId",
                table: "GroupTherapyResidentObservation",
                column: "ObserverUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyResidentObservation_ResidentCaseId",
                table: "GroupTherapyResidentObservation",
                column: "ResidentCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyResidentObservation_ResidentId",
                table: "GroupTherapyResidentObservation",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "UQ_GroupTherapyResidentObservation_SessionResident",
                table: "GroupTherapyResidentObservation",
                columns: new[] { "UnitCode", "ProgramCode", "ModuleKey", "SessionNumber", "ResidentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupTherapyResidentObservation");
        }
    }
}
