using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExtendResidentCaseWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AdmissionDecisionAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdmissionDecisionReason",
                table: "ResidentCase",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdmissionDecisionStatus",
                table: "ResidentCase",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedWithoutAdmissionAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReferralReceivedAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScreeningCompletedAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScreeningStartedAtUtc",
                table: "ResidentCase",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CentreId_AdmissionDecisionStatus_AdmissionDecisionAtUtc",
                table: "ResidentCase",
                columns: new[] { "CentreId", "AdmissionDecisionStatus", "AdmissionDecisionAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CentreId_ScreeningCompletedAtUtc",
                table: "ResidentCase",
                columns: new[] { "CentreId", "ScreeningCompletedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CentreId_AdmissionDecisionStatus_AdmissionDecisionAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CentreId_ScreeningCompletedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "AdmissionDecisionAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "AdmissionDecisionReason",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "AdmissionDecisionStatus",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "ClosedWithoutAdmissionAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "ReferralReceivedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "ScreeningCompletedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "ScreeningStartedAtUtc",
                table: "ResidentCase");
        }
    }
}
