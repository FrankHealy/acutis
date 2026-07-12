using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddElementLibraryFoundations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ElementGroup",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SourceDocumentReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElementGroup", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ElementDefinition",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    HelpText = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ElementType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SourceKind = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CanonicalFieldKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OptionSetKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SourceDocumentReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    FieldConfigJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElementDefinition", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ElementDefinition_ElementGroup_GroupId",
                        column: x => x.GroupId,
                        principalTable: "ElementGroup",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "ElementGroup",
                columns: new[] { "Id", "CreatedAtUtc", "Description", "DisplayOrder", "IsActive", "Key", "Name", "SourceDocumentReference", "Status", "UpdatedAtUtc", "Version" },
                values: new object[,]
                {
                    { new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "JSON-backed safety and follow-up elements sourced from the alcohol screening form.", 3, true, "screening_safety_follow_up", "Screening Safety And Follow-Up", "alcohol_screening_call", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Canonical identity fields suitable for reusable intake and admission forms.", 1, true, "resident_identity", "Resident Identity", "resident", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "JSON-backed assessment elements sourced from the alcohol screening form.", 2, true, "screening_alcohol_pattern", "Screening Alcohol Pattern", "alcohol_screening_call", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("df21f89e-a03e-741b-c4a2-4cf5eb2bbce2"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Reusable unbound note-style elements without canonical persistence mapping.", 4, true, "unbound_notes", "Unbound Notes", "library_seed", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.InsertData(
                table: "ElementDefinition",
                columns: new[] { "Id", "CanonicalFieldKey", "CreatedAtUtc", "Description", "DisplayOrder", "ElementType", "FieldConfigJson", "GroupId", "HelpText", "IsActive", "Key", "Label", "OptionSetKey", "SourceDocumentReference", "SourceKind", "Status", "UpdatedAtUtc", "Version" },
                values: new object[,]
                {
                    { new Guid("38f88e06-ce48-de3d-0071-173e8c31604c"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Clinical follow-up notes captured during screening.", 2, "textarea", "{\"required\":false,\"validation\":{\"max\":2000}}", new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"), "Add contextual details for follow-up and handover.", true, "assessor_notes", "Assessor Notes", null, "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("475f7311-07d1-d94b-2043-3981b2a738b2"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Primary drink type reported in screening.", 1, "select", "{\"required\":true}", new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), "Links to the shared drink type option set.", true, "drink_type", "Drink Type", "drink_type", "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("6a306056-c421-6f8d-c49d-51405573e554"), "resident.firstName", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident first name.", 1, "text", "{\"required\":true,\"placeholder\":\"Enter first name\",\"validation\":{\"min\":2,\"max\":50}}", new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), "Matches resident identity first name.", true, "first_name", "First Name", null, "resident", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("85715f16-8002-8fd3-076e-de7bd84141ee"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Average quantity reported on drinking days.", 2, "number", "{\"required\":true,\"validation\":{\"min\":0,\"max\":100}}", new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), "Approximate average on drinking days.", true, "drinks_per_day", "Drinks Per Day", null, "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("92a94372-8286-a77a-d940-22e9e722c4f7"), "resident.dateOfBirth", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident date of birth.", 3, "date", "{\"required\":true}", new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), "Matches resident identity date of birth.", true, "date_of_birth", "Date of Birth", null, "resident", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("9ee102e3-1ab3-1cf0-b8dc-7c34c1a6c6ba"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Housing status captured during screening.", 1, "select", "{\"required\":true}", new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"), "Links to the shared housing status option set.", true, "housing_status", "Housing Status", "housing_status", "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d61eaf90-2915-09cd-8dc4-449dbdd596b4"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Referral source captured during screening.", 3, "select", "{\"required\":true}", new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), "Links to the shared referral source option set.", true, "referral_source", "Referral Source", "referral_source", "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("dad6e360-7afe-51ef-f174-8e359e1d6fdc"), "resident.surname", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident surname.", 2, "text", "{\"required\":true,\"placeholder\":\"Enter surname\",\"validation\":{\"min\":2,\"max\":50}}", new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), "Matches resident identity surname.", true, "surname", "Surname", null, "resident", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e75c5e7a-7c38-5a83-e178-6e20333ba2df"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Unbound reusable notes block.", 1, "textarea", "{\"required\":false,\"placeholder\":\"Enter notes\",\"validation\":{\"max\":2000}}", new Guid("df21f89e-a03e-741b-c4a2-4cf5eb2bbce2"), "Reusable long-form notes area without a canonical mapping.", true, "free_notes", "Free Notes", null, "library_seed", "unbound", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ElementDefinition_GroupId",
                table: "ElementDefinition",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ElementDefinition_Key",
                table: "ElementDefinition",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ElementGroup_Key",
                table: "ElementGroup",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ElementDefinition");

            migrationBuilder.DropTable(
                name: "ElementGroup");
        }
    }
}
