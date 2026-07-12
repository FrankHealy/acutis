using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitDefaultResidentWeekNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DefaultResidentWeekNumber",
                table: "Unit",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "DefaultResidentWeekNumber",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "DefaultResidentWeekNumber",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "DefaultResidentWeekNumber",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "DefaultResidentWeekNumber",
                value: 1);

            migrationBuilder.Sql(
                """
                ;WITH DetoxResidents AS (
                    SELECT
                        r.Id,
                        ROW_NUMBER() OVER (
                            ORDER BY
                                CASE
                                    WHEN TRY_CONVERT(int, SUBSTRING(ISNULL(r.RoomNumber, ''), 2, 10)) IS NULL THEN 9999
                                    ELSE TRY_CONVERT(int, SUBSTRING(ISNULL(r.RoomNumber, ''), 2, 10))
                                END,
                                ISNULL(r.RoomNumber, ''),
                                r.Surname,
                                r.FirstName,
                                r.Id
                        ) AS ResidentOrdinal
                    FROM Resident r
                    INNER JOIN Unit u ON u.Id = r.UnitId
                    WHERE u.Code = 'detox'
                )
                UPDATE r
                SET
                    r.WeekNumber = dr.ResidentOrdinal,
                    r.Psn = CONCAT('BRU-DET-26-', RIGHT(CONCAT('0', CONVERT(varchar(2), dr.ResidentOrdinal)), 2), '-', RIGHT(CONCAT('0', CONVERT(varchar(2), dr.ResidentOrdinal)), 2)),
                    r.AdmissionDate = DATEADD(day, (dr.ResidentOrdinal - 1) * 7, CAST('2026-01-05' AS date)),
                    r.ExpectedCompletionDate = DATEADD(day, (dr.ResidentOrdinal + 11) * 7, CAST('2026-01-05' AS date)),
                    r.UpdatedAtUtc = SYSUTCDATETIME()
                FROM Resident r
                INNER JOIN DetoxResidents dr ON dr.Id = r.Id;

                UPDATE episode
                SET
                    episode.CurrentWeekNumber = resident.WeekNumber
                FROM ResidentProgrammeEpisode episode
                INNER JOIN Resident resident ON resident.Id = episode.ResidentId
                INNER JOIN Unit u ON u.Id = resident.UnitId
                WHERE u.Code = 'detox';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultResidentWeekNumber",
                table: "Unit");
        }
    }
}
