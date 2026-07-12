using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixIrishTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"),
                column: "Text",
                value: "Logáilte isteach mar");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"),
                column: "Text",
                value: "Logáil isteach mar úsáideoir eile");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b"),
                column: "Text",
                value: "Deochanna sa Lá");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87"),
                column: "Text",
                value: "Féin");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e89eb3-0dff-4f27-a4f7-dde66f8ef067"),
                column: "Text",
                value: "Sonraí an Ghlaoiteora");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"),
                column: "Text",
                value: "Meastóireacht");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"),
                column: "Text",
                value: "Gabh sonraí scagtha ón gcéad ghlao.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18"),
                column: "Text",
                value: "Dochtúir Teaghlaigh");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9"),
                column: "Text",
                value: "Úsáid Alcóil");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"),
                column: "Text",
                value: "Ionad Cóireála Brú Rí");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"),
                column: "Text",
                value: "Logáil Glaonna");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"),
                column: "Text",
                value: "Scagadh Glao Alcóil");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"),
                column: "Text",
                value: "Logáil amach");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"),
                column: "Text",
                value: "LogÃ¡ilte isteach mar");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"),
                column: "Text",
                value: "LogÃ¡il isteach mar ÃºsÃ¡ideoir eile");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b"),
                column: "Text",
                value: "Deochanna sa LÃ¡");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87"),
                column: "Text",
                value: "FÃ©in");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e89eb3-0dff-4f27-a4f7-dde66f8ef067"),
                column: "Text",
                value: "SonraÃ­ an Ghlaoiteora");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"),
                column: "Text",
                value: "MeastÃ³ireacht");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"),
                column: "Text",
                value: "Gabh sonraÃ­ scagtha Ã³n gcÃ©ad ghlao.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18"),
                column: "Text",
                value: "DochtÃºir Teaghlaigh");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9"),
                column: "Text",
                value: "ÃšsÃ¡id AlcÃ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"),
                column: "Text",
                value: "Ionad CÃ³ireÃ¡la BrÃº RÃ­");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"),
                column: "Text",
                value: "LogÃ¡il Glaonna");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"),
                column: "Text",
                value: "Scagadh Glao AlcÃ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"),
                column: "Text",
                value: "LogÃ¡il amach");
        }
    }
}
