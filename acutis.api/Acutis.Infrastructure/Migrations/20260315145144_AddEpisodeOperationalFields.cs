using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEpisodeOperationalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpectedCompletionDate",
                table: "ResidentProgrammeEpisode",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryAddiction",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomNumber",
                table: "ResidentProgrammeEpisode",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE episode
                SET
                    episode.RoomNumber = COALESCE(episode.RoomNumber, resident.RoomNumber),
                    episode.ExpectedCompletionDate = COALESCE(episode.ExpectedCompletionDate, resident.ExpectedCompletionDate),
                    episode.PrimaryAddiction = COALESCE(episode.PrimaryAddiction, resident.PrimaryAddiction)
                FROM ResidentProgrammeEpisode episode
                INNER JOIN Resident resident ON resident.Id = episode.ResidentId;
                """);

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D01" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D04" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D05" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D02" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D07" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D06" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D11" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D09" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D10" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D08" });

            migrationBuilder.UpdateData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("fea40a2b-3f71-7899-e64d-da9418382288"),
                columns: new[] { "ExpectedCompletionDate", "PrimaryAddiction", "RoomNumber" },
                values: new object[] { new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Alcohol", "D03" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpectedCompletionDate",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "PrimaryAddiction",
                table: "ResidentProgrammeEpisode");

            migrationBuilder.DropColumn(
                name: "RoomNumber",
                table: "ResidentProgrammeEpisode");
        }
    }
}
