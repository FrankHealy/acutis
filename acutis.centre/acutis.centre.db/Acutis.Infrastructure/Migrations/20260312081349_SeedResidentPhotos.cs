using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedResidentPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=10");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=2");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=9");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=8");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=1");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=5");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=6");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("9390d075-2a03-a0af-6054-474038a9541c"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=7");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=4");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=11");

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"),
                column: "PhotoUrl",
                value: "https://i.pravatar.cc/300?img=3");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("9390d075-2a03-a0af-6054-474038a9541c"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"),
                column: "PhotoUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"),
                column: "PhotoUrl",
                value: null);
        }
    }
}
