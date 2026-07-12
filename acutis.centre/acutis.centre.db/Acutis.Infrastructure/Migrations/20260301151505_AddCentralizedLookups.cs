using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCentralizedLookups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "LookupType",
                schema: "dbo",
                columns: table => new
                {
                    LookupTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DefaultLocale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "en-IE"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Version = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupType", x => x.LookupTypeId);
                });

            migrationBuilder.CreateTable(
                name: "LookupValue",
                schema: "dbo",
                columns: table => new
                {
                    LookupValueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LookupTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupValue", x => x.LookupValueId);
                    table.ForeignKey(
                        name: "FK_LookupValue_LookupType_LookupTypeId",
                        column: x => x.LookupTypeId,
                        principalSchema: "dbo",
                        principalTable: "LookupType",
                        principalColumn: "LookupTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LookupValueLabel",
                schema: "dbo",
                columns: table => new
                {
                    LookupValueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Locale = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupValueLabel", x => new { x.LookupValueId, x.Locale });
                    table.ForeignKey(
                        name: "FK_LookupValueLabel_LookupValue_LookupValueId",
                        column: x => x.LookupValueId,
                        principalSchema: "dbo",
                        principalTable: "LookupValue",
                        principalColumn: "LookupValueId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "UQ_LookupType_Key",
                schema: "dbo",
                table: "LookupType",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LookupValue_LookupTypeId",
                schema: "dbo",
                table: "LookupValue",
                column: "LookupTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_LookupValue_Type_Unit_Sort_IsActive",
                schema: "dbo",
                table: "LookupValue",
                columns: new[] { "LookupTypeId", "UnitId", "SortOrder", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "UQ_LookupValue_Type_Unit_Code",
                schema: "dbo",
                table: "LookupValue",
                columns: new[] { "LookupTypeId", "UnitId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LookupValueLabel_Locale",
                schema: "dbo",
                table: "LookupValueLabel",
                column: "Locale");

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupType",
                columns: new[] { "LookupTypeId", "Key", "DefaultLocale", "IsActive", "Version" },
                values: new object[,]
                {
                    { new Guid("5cd3b49b-0f73-497d-bc43-e03eb3fdb0d2"), "discharge_reason", "en-IE", true, 1 },
                    { new Guid("9f3e64f8-2ce3-4d08-b178-2648a7ee7f28"), "county", "en-IE", true, 1 }
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValue",
                columns: new[] { "LookupValueId", "LookupTypeId", "UnitId", "Code", "SortOrder", "IsActive" },
                values: new object[,]
                {
                    { new Guid("78b20c38-ff48-4a03-a61b-37c7c1708d04"), new Guid("5cd3b49b-0f73-497d-bc43-e03eb3fdb0d2"), null, "LEFT_AGAINST_ADVICE", 10, true },
                    { new Guid("4ef269f2-b84b-48af-8f6e-8e8fc15e6de8"), new Guid("5cd3b49b-0f73-497d-bc43-e03eb3fdb0d2"), null, "COMPLETED_PROGRAM", 20, true },
                    { new Guid("8af03e5b-5282-473f-9068-0039f788f4b5"), new Guid("5cd3b49b-0f73-497d-bc43-e03eb3fdb0d2"), null, "TRANSFERRED", 30, true },
                    { new Guid("eb7d4dd2-5eb5-4f3f-b923-77b5601771d7"), new Guid("9f3e64f8-2ce3-4d08-b178-2648a7ee7f28"), null, "CORK", 10, true },
                    { new Guid("fa0cd18a-90e5-41f6-a0de-666c8e2ca4f4"), new Guid("9f3e64f8-2ce3-4d08-b178-2648a7ee7f28"), null, "LIMERICK", 20, true },
                    { new Guid("e5599e7d-c4f4-4767-9af3-08de1d44f0cc"), new Guid("9f3e64f8-2ce3-4d08-b178-2648a7ee7f28"), null, "DUBLIN", 30, true }
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValueLabel",
                columns: new[] { "LookupValueId", "Locale", "Label" },
                values: new object[,]
                {
                    { new Guid("78b20c38-ff48-4a03-a61b-37c7c1708d04"), "en-IE", "Left Against Advice" },
                    { new Guid("78b20c38-ff48-4a03-a61b-37c7c1708d04"), "ga-IE", "Imithe i gcoinne comhairle" },
                    { new Guid("4ef269f2-b84b-48af-8f6e-8e8fc15e6de8"), "en-IE", "Completed Program" },
                    { new Guid("4ef269f2-b84b-48af-8f6e-8e8fc15e6de8"), "ga-IE", "Clár críochnaithe" },
                    { new Guid("8af03e5b-5282-473f-9068-0039f788f4b5"), "en-IE", "Transferred" },
                    { new Guid("8af03e5b-5282-473f-9068-0039f788f4b5"), "ga-IE", "Aistrithe" },
                    { new Guid("eb7d4dd2-5eb5-4f3f-b923-77b5601771d7"), "en-IE", "Cork" },
                    { new Guid("eb7d4dd2-5eb5-4f3f-b923-77b5601771d7"), "ga-IE", "Corcaigh" },
                    { new Guid("fa0cd18a-90e5-41f6-a0de-666c8e2ca4f4"), "en-IE", "Limerick" },
                    { new Guid("fa0cd18a-90e5-41f6-a0de-666c8e2ca4f4"), "ga-IE", "Luimneach" },
                    { new Guid("e5599e7d-c4f4-4767-9af3-08de1d44f0cc"), "en-IE", "Dublin" },
                    { new Guid("e5599e7d-c4f4-4767-9af3-08de1d44f0cc"), "ga-IE", "Baile Atha Cliath" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("78b20c38-ff48-4a03-a61b-37c7c1708d04"), "en-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("78b20c38-ff48-4a03-a61b-37c7c1708d04"), "ga-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("4ef269f2-b84b-48af-8f6e-8e8fc15e6de8"), "en-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("4ef269f2-b84b-48af-8f6e-8e8fc15e6de8"), "ga-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("8af03e5b-5282-473f-9068-0039f788f4b5"), "en-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("8af03e5b-5282-473f-9068-0039f788f4b5"), "ga-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("eb7d4dd2-5eb5-4f3f-b923-77b5601771d7"), "en-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("eb7d4dd2-5eb5-4f3f-b923-77b5601771d7"), "ga-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("fa0cd18a-90e5-41f6-a0de-666c8e2ca4f4"), "en-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("fa0cd18a-90e5-41f6-a0de-666c8e2ca4f4"), "ga-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("e5599e7d-c4f4-4767-9af3-08de1d44f0cc"), "en-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "LookupValueId", "Locale" },
                keyValues: new object[] { new Guid("e5599e7d-c4f4-4767-9af3-08de1d44f0cc"), "ga-IE" });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("78b20c38-ff48-4a03-a61b-37c7c1708d04"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("4ef269f2-b84b-48af-8f6e-8e8fc15e6de8"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("8af03e5b-5282-473f-9068-0039f788f4b5"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("eb7d4dd2-5eb5-4f3f-b923-77b5601771d7"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("fa0cd18a-90e5-41f6-a0de-666c8e2ca4f4"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("e5599e7d-c4f4-4767-9af3-08de1d44f0cc"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("5cd3b49b-0f73-497d-bc43-e03eb3fdb0d2"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("9f3e64f8-2ce3-4d08-b178-2648a7ee7f28"));

            migrationBuilder.DropTable(
                name: "LookupValueLabel",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LookupValue",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "LookupType",
                schema: "dbo");
        }
    }
}
