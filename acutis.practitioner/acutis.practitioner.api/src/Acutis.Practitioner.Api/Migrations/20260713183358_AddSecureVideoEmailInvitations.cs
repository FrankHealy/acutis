using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Practitioner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSecureVideoEmailInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Legacy invitations used signed bearer links and cannot be safely upgraded
            // because their raw value was intentionally never stored. Appointments and
            // consultations are retained; staff can issue new opaque invitations.
            migrationBuilder.Sql("DELETE FROM [VideoInvitations]");

            migrationBuilder.RenameColumn(
                name: "UsedAtUtc",
                table: "VideoInvitations",
                newName: "VerificationExpiresAtUtc");

            migrationBuilder.RenameColumn(
                name: "TenantId",
                table: "VideoInvitations",
                newName: "OrganisationId");

            migrationBuilder.AddColumn<Guid>(
                name: "AppointmentId",
                table: "VideoInvitations",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ClientId",
                table: "VideoInvitations",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "VideoInvitations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "FailedIdentityAttemptCount",
                table: "VideoInvitations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstOpenedAtUtc",
                table: "VideoInvitations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "IdentityLockedUntilUtc",
                table: "VideoInvitations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "IdentityVerifiedAtUtc",
                table: "VideoInvitations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastOpenedAtUtc",
                table: "VideoInvitations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSentAtUtc",
                table: "VideoInvitations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProviderMessageId",
                table: "VideoInvitations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecipientEmail",
                table: "VideoInvitations",
                type: "nvarchar(254)",
                maxLength: 254,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ReplacedByInvitationId",
                table: "VideoInvitations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RevokedByUserId",
                table: "VideoInvitations",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "VideoInvitations",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "SanitisedSendFailureReason",
                table: "VideoInvitations",
                type: "nvarchar(240)",
                maxLength: 240,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SendAttemptCount",
                table: "VideoInvitations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SendFailureCategory",
                table: "VideoInvitations",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SendStatus",
                table: "VideoInvitations",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<byte[]>(
                name: "VerificationTokenHash",
                table: "VideoInvitations",
                type: "binary(32)",
                fixedLength: true,
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Clients",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Surname",
                table: "Clients",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_VideoInvitations_AppointmentId",
                table: "VideoInvitations",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoInvitations_ClientId",
                table: "VideoInvitations",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoInvitations_OrganisationId_AppointmentId",
                table: "VideoInvitations",
                columns: new[] { "OrganisationId", "AppointmentId" });

            migrationBuilder.AddForeignKey(
                name: "FK_VideoInvitations_Appointments_AppointmentId",
                table: "VideoInvitations",
                column: "AppointmentId",
                principalTable: "Appointments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VideoInvitations_Clients_ClientId",
                table: "VideoInvitations",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VideoInvitations_Appointments_AppointmentId",
                table: "VideoInvitations");

            migrationBuilder.DropForeignKey(
                name: "FK_VideoInvitations_Clients_ClientId",
                table: "VideoInvitations");

            migrationBuilder.DropIndex(
                name: "IX_VideoInvitations_AppointmentId",
                table: "VideoInvitations");

            migrationBuilder.DropIndex(
                name: "IX_VideoInvitations_ClientId",
                table: "VideoInvitations");

            migrationBuilder.DropIndex(
                name: "IX_VideoInvitations_OrganisationId_AppointmentId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "AppointmentId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "FailedIdentityAttemptCount",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "FirstOpenedAtUtc",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "IdentityLockedUntilUtc",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "IdentityVerifiedAtUtc",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "LastOpenedAtUtc",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "LastSentAtUtc",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "ProviderMessageId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "RecipientEmail",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "ReplacedByInvitationId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "RevokedByUserId",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "SanitisedSendFailureReason",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "SendAttemptCount",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "SendFailureCategory",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "SendStatus",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "VerificationTokenHash",
                table: "VideoInvitations");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Surname",
                table: "Clients");

            migrationBuilder.RenameColumn(
                name: "VerificationExpiresAtUtc",
                table: "VideoInvitations",
                newName: "UsedAtUtc");

            migrationBuilder.RenameColumn(
                name: "OrganisationId",
                table: "VideoInvitations",
                newName: "TenantId");
        }
    }
}
