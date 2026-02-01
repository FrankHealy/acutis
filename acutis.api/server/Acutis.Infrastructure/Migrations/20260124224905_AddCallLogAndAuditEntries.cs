using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCallLogAndAuditEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.EnsureSchema(
                name: "Audit");

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[Audit].[AuditEntries]', 'U') IS NULL
BEGIN
    CREATE TABLE [Audit].[AuditEntries] (
        [Id] uniqueidentifier NOT NULL,
        [EntityName] nvarchar(128) NOT NULL,
        [EntityId] uniqueidentifier NULL,
        [Action] nvarchar(32) NOT NULL,
        [KeyValues] nvarchar(max) NULL,
        [OriginalValues] nvarchar(max) NULL,
        [CurrentValues] nvarchar(max) NULL,
        [ChangedColumns] nvarchar(max) NULL,
        [CorrelationId] nvarchar(64) NULL,
        [IpAddress] nvarchar(64) NULL,
        [CreatedAt] datetimeoffset NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [ModifiedAt] datetimeoffset NULL,
        [ModifiedBy] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_AuditEntries] PRIMARY KEY ([Id])
    );
END");

            migrationBuilder.CreateTable(
                name: "CallLog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Surname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CallerType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ConcernType = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    TimestampUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Urgency = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    ModifiedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CallLog", x => x.Id);
                });

            migrationBuilder.Sql(@"
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_AuditEntries_EntityName_EntityId'
      AND object_id = OBJECT_ID(N'[Audit].[AuditEntries]')
)
BEGIN
    CREATE INDEX [IX_AuditEntries_EntityName_EntityId]
    ON [Audit].[AuditEntries] ([EntityName], [EntityId]);
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // AuditEntries may pre-exist; avoid dropping it on rollback.

            migrationBuilder.DropTable(
                name: "CallLog");
        }
    }
}
