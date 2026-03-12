using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddThemeManagePermission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AppPermission",
                columns: new[] { "Id", "Category", "Description", "IsActive", "Key", "Name" },
                values: new object[] { new Guid("55555555-1212-1212-1212-121212121212"), "configuration", "Choose and override application themes where allowed.", true, "theme.manage", "Manage theme" });

            migrationBuilder.InsertData(
                table: "AppRolePermission",
                columns: new[] { "AppPermissionId", "AppRoleId" },
                values: new object[] { new Guid("55555555-1212-1212-1212-121212121212"), new Guid("66666666-1111-1111-1111-111111111111") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AppRolePermission",
                keyColumns: new[] { "AppPermissionId", "AppRoleId" },
                keyValues: new object[] { new Guid("55555555-1212-1212-1212-121212121212"), new Guid("66666666-1111-1111-1111-111111111111") });

            migrationBuilder.DeleteData(
                table: "AppPermission",
                keyColumn: "Id",
                keyValue: new Guid("55555555-1212-1212-1212-121212121212"));
        }
    }
}
