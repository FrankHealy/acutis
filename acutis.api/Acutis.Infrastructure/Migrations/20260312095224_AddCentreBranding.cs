using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCentreBranding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BrandLogoUrl",
                table: "Centre",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BrandName",
                table: "Centre",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BrandSubtitle",
                table: "Centre",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Centre",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-1111-1111-1111-111111111111"),
                columns: new[] { "BrandLogoUrl", "BrandName", "BrandSubtitle" },
                values: new object[] { "/acutis-icon.svg", "Acutis", "Bruree Centre" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrandLogoUrl",
                table: "Centre");

            migrationBuilder.DropColumn(
                name: "BrandName",
                table: "Centre");

            migrationBuilder.DropColumn(
                name: "BrandSubtitle",
                table: "Centre");
        }
    }
}
