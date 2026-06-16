using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AcutisDbContext))]
    [Migration("20260616120000_BackfillMissingAuditMetadataColumns")]
    public partial class BackfillMissingAuditMetadataColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DECLARE @systemActorUserId uniqueidentifier = '00000000-0000-0000-0000-000000000001';
                DECLARE @sql nvarchar(max) = N'';

                SELECT @sql = @sql + N'
                IF COL_LENGTH(N''' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N''', N''CreatedAtUtc'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N'
                    ADD [CreatedAtUtc] datetime2 NOT NULL
                        CONSTRAINT ' + QUOTENAME(N'DF_' + tableRow.name + N'_CreatedAtUtc_Backfill') + N' DEFAULT SYSUTCDATETIME();
                END;

                IF COL_LENGTH(N''' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N''', N''UpdatedAtUtc'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N'
                    ADD [UpdatedAtUtc] datetime2 NOT NULL
                        CONSTRAINT ' + QUOTENAME(N'DF_' + tableRow.name + N'_UpdatedAtUtc_Backfill') + N' DEFAULT SYSUTCDATETIME();
                END;

                IF COL_LENGTH(N''' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N''', N''CreatedByUserId'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N'
                    ADD [CreatedByUserId] uniqueidentifier NOT NULL
                        CONSTRAINT ' + QUOTENAME(N'DF_' + tableRow.name + N'_CreatedByUserId_Backfill') + N' DEFAULT ''' + CONVERT(nvarchar(36), @systemActorUserId) + N''';
                END;

                IF COL_LENGTH(N''' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N''', N''UpdatedByUserId'') IS NULL
                BEGIN
                    ALTER TABLE ' + QUOTENAME(schemaRow.name) + N'.' + QUOTENAME(tableRow.name) + N'
                    ADD [UpdatedByUserId] uniqueidentifier NOT NULL
                        CONSTRAINT ' + QUOTENAME(N'DF_' + tableRow.name + N'_UpdatedByUserId_Backfill') + N' DEFAULT ''' + CONVERT(nvarchar(36), @systemActorUserId) + N''';
                END;
                '
                FROM sys.tables tableRow
                INNER JOIN sys.schemas schemaRow ON schemaRow.schema_id = tableRow.schema_id
                WHERE tableRow.is_ms_shipped = 0
                  AND tableRow.name <> N'__EFMigrationsHistory';

                EXEC sp_executesql @sql;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
