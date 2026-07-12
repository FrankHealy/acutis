using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations.Ambulatory
{
    /// <inheritdoc />
    public partial class InitialAmbulatorySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AmbulatoryParticipant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProgrammeType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    PreferredName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    ReferralSource = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    CounsellorUserId = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    CounsellorDisplayName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmbulatoryParticipant", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AmbulatoryAppointment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProgrammeType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CounsellorUserId = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    CounsellorDisplayName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    AppointmentType = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndsAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeliveryMode = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvProvider = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    AvRoomName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    AvJoinUrl = table.Column<string>(type: "nvarchar(600)", maxLength: 600, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmbulatoryAppointment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AmbulatoryAppointment_AmbulatoryParticipant_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "AmbulatoryParticipant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "AmbulatoryAssessment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssessmentType = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    PresentingNeeds = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RiskSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Strengths = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubstanceOrBehaviourSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GoalsDiscussed = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Outcome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedByUserId = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmbulatoryAssessment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AmbulatoryAssessment_AmbulatoryParticipant_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "AmbulatoryParticipant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AmbulatoryCarePlan",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParticipantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Needs = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Strengths = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Risks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Goals = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Actions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReviewNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReviewDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AmbulatoryCarePlan", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AmbulatoryCarePlan_AmbulatoryParticipant_ParticipantId",
                        column: x => x.ParticipantId,
                        principalTable: "AmbulatoryParticipant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AmbulatoryAppointment_ParticipantId",
                table: "AmbulatoryAppointment",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_AmbulatoryAppointment_ProgrammeType_CounsellorUserId_StartsAtUtc",
                table: "AmbulatoryAppointment",
                columns: new[] { "ProgrammeType", "CounsellorUserId", "StartsAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_AmbulatoryAssessment_ParticipantId",
                table: "AmbulatoryAssessment",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_AmbulatoryCarePlan_ParticipantId",
                table: "AmbulatoryCarePlan",
                column: "ParticipantId");

            migrationBuilder.CreateIndex(
                name: "IX_AmbulatoryParticipant_ProgrammeType_CounsellorUserId_Status",
                table: "AmbulatoryParticipant",
                columns: new[] { "ProgrammeType", "CounsellorUserId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AmbulatoryAppointment");

            migrationBuilder.DropTable(
                name: "AmbulatoryAssessment");

            migrationBuilder.DropTable(
                name: "AmbulatoryCarePlan");

            migrationBuilder.DropTable(
                name: "AmbulatoryParticipant");
        }
    }
}
