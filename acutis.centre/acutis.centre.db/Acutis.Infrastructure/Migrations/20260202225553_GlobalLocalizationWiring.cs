using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GlobalLocalizationWiring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "app.brand", "Acutis" },
                    { "app.centre.bruree", "Bruree Treatment Center" },
                    { "header.capacity", "Capacity" },
                    { "header.current_time", "Current Time" },
                    { "header.login_different_user", "Log in as different user" },
                    { "header.logout", "Log out" },
                    { "header.signed_in_as", "Signed in as" },
                    { "screening.tab.calls", "Call Logging" },
                    { "screening.tab.evaluation", "Evaluation" },
                    { "screening.tab.scheduling", "Scheduling" }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("1baab78d-fe35-4465-bcae-978043cca9b5"), "header.current_time", "en-IE", "Current Time" },
                    { new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"), "header.signed_in_as", "ga-IE", "Logáilte isteach mar" },
                    { new Guid("23b0507e-4dbc-4a89-96e3-07936db8bac3"), "screening.tab.calls", "en-IE", "Call Logging" },
                    { new Guid("250dca2f-c7a5-4b2e-a620-90980db0f64c"), "header.capacity", "ga-IE", "Acmhainn" },
                    { new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"), "header.login_different_user", "ga-IE", "Logáil isteach mar úsáideoir eile" },
                    { new Guid("32fe6f4f-f5df-4fe2-8712-3ee3ec39f536"), "header.current_time", "ga-IE", "Am Reatha" },
                    { new Guid("5987cdb5-f425-406a-9152-ea7f30f90918"), "header.logout", "en-IE", "Log out" },
                    { new Guid("5f0f60da-b1b7-47f3-a83b-15980885cf15"), "header.capacity", "en-IE", "Capacity" },
                    { new Guid("5f980db7-64be-4249-89a7-38497a4a1602"), "app.brand", "en-IE", "Acutis" },
                    { new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"), "screening.tab.evaluation", "ga-IE", "Meastóireacht" },
                    { new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"), "app.centre.bruree", "ga-IE", "Ionad Cóireála Brú Rí" },
                    { new Guid("9fbf3e9a-64db-4a96-b559-8528d272cd0c"), "screening.tab.evaluation", "en-IE", "Evaluation" },
                    { new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"), "screening.tab.calls", "ga-IE", "Logáil Glaonna" },
                    { new Guid("c4d6c866-1a33-447e-9d7f-0f1d365088d5"), "app.centre.bruree", "en-IE", "Bruree Treatment Center" },
                    { new Guid("c562be30-0d52-43f4-bef7-c7ca01a61ac0"), "screening.tab.scheduling", "ga-IE", "Sceidealú" },
                    { new Guid("ca3f25d7-e3bf-4d17-b659-d72d48168f94"), "header.signed_in_as", "en-IE", "Signed in as" },
                    { new Guid("d7963194-b40b-43fe-8ebf-0c4f09b6139e"), "header.login_different_user", "en-IE", "Log in as different user" },
                    { new Guid("ec0552e9-c6dc-4eb5-a80d-62f5548f252f"), "screening.tab.scheduling", "en-IE", "Scheduling" },
                    { new Guid("f2f7bc01-26ef-4eb3-924b-a62ed84065f4"), "app.brand", "ga-IE", "Acutis" },
                    { new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"), "header.logout", "ga-IE", "Logáil amach" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1baab78d-fe35-4465-bcae-978043cca9b5"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("23b0507e-4dbc-4a89-96e3-07936db8bac3"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("250dca2f-c7a5-4b2e-a620-90980db0f64c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("32fe6f4f-f5df-4fe2-8712-3ee3ec39f536"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5987cdb5-f425-406a-9152-ea7f30f90918"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5f0f60da-b1b7-47f3-a83b-15980885cf15"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5f980db7-64be-4249-89a7-38497a4a1602"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9fbf3e9a-64db-4a96-b559-8528d272cd0c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c4d6c866-1a33-447e-9d7f-0f1d365088d5"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c562be30-0d52-43f4-bef7-c7ca01a61ac0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ca3f25d7-e3bf-4d17-b659-d72d48168f94"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d7963194-b40b-43fe-8ebf-0c4f09b6139e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ec0552e9-c6dc-4eb5-a80d-62f5548f252f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f2f7bc01-26ef-4eb3-924b-a62ed84065f4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "app.brand");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "app.centre.bruree");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "header.capacity");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "header.current_time");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "header.login_different_user");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "header.logout");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "header.signed_in_as");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.tab.calls");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.tab.evaluation");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.tab.scheduling");
        }
    }
}
