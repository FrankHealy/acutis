using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIncidentModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IncidentType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    DefaultName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncidentType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Incident",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IncidentTypeId = table.Column<int>(type: "int", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ResidentCaseId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OccurredAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DetailsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incident", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Incident_AppUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AppUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Incident_Centre_CentreId",
                        column: x => x.CentreId,
                        principalTable: "Centre",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Incident_IncidentType_IncidentTypeId",
                        column: x => x.IncidentTypeId,
                        principalTable: "IncidentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Incident_ResidentCase_ResidentCaseId",
                        column: x => x.ResidentCaseId,
                        principalTable: "ResidentCase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Incident_ResidentProgrammeEpisode_EpisodeId",
                        column: x => x.EpisodeId,
                        principalTable: "ResidentProgrammeEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Incident_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Incident_Unit_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Unit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "IncidentType",
                columns: new[] { "Id", "Code", "DefaultName", "IsActive" },
                values: new object[,]
                {
                    { 1, "BEHAVIOURAL_INCIDENT", "Behavioural incident", true },
                    { 2, "MEDICAL_ISSUE", "Medical issue", true },
                    { 3, "SMOKING_BREACH", "Smoking in non-designated area", true },
                    { 4, "BOUNDARY_BREACH", "Boundary breach", true },
                    { 5, "FIRE_ALARM", "Fire alarm", true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incident_CentreId_OccurredAtUtc",
                table: "Incident",
                columns: new[] { "CentreId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Incident_CreatedByUserId",
                table: "Incident",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Incident_EpisodeId_OccurredAtUtc",
                table: "Incident",
                columns: new[] { "EpisodeId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Incident_IncidentTypeId_OccurredAtUtc",
                table: "Incident",
                columns: new[] { "IncidentTypeId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Incident_ResidentCaseId",
                table: "Incident",
                column: "ResidentCaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Incident_ResidentId_OccurredAtUtc",
                table: "Incident",
                columns: new[] { "ResidentId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Incident_UnitId_OccurredAtUtc",
                table: "Incident",
                columns: new[] { "UnitId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_IncidentType_Code",
                table: "IncidentType",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Incident");

            migrationBuilder.DropTable(
                name: "IncidentType");
        }
    }
}
