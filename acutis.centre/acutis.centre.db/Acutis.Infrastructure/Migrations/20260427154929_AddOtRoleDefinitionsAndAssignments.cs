using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOtRoleDefinitionsAndAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OtRoleDefinition",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    RoleType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: true),
                    RequiresTraining = table.Column<bool>(type: "bit", nullable: false),
                    StaffMemberInChargeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValue: new Guid("00000000-0000-0000-0000-000000000001")),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValue: new Guid("00000000-0000-0000-0000-000000000001"))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OtRoleDefinition", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResidentOtRoleAssignment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OtRoleDefinitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EpisodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssignedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ReleasedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReleasedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValue: new Guid("00000000-0000-0000-0000-000000000001")),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "SYSUTCDATETIME()"),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValue: new Guid("00000000-0000-0000-0000-000000000001"))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentOtRoleAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentOtRoleAssignment_OtRoleDefinition_OtRoleDefinitionId",
                        column: x => x.OtRoleDefinitionId,
                        principalTable: "OtRoleDefinition",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResidentOtRoleAssignment_ResidentProgrammeEpisode_EpisodeId",
                        column: x => x.EpisodeId,
                        principalTable: "ResidentProgrammeEpisode",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResidentOtRoleAssignment_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "OtRoleDefinition",
                columns: new[] { "Id", "CentreId", "UnitId", "Name", "RoleType", "Capacity", "RequiresTraining", "StaffMemberInChargeId", "IsActive", "DisplayOrder" },
                values: new object[,]
                {
                    { new Guid("9c59b5c4-d62b-4468-a1fd-4333e5f534a1"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Security Hut", "Split", 2, false, null, true, 1 },
                    { new Guid("2ee02528-00f0-4871-957a-3e6261eb8819"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Kitchen", "Internal", 3, false, null, true, 2 },
                    { new Guid("18288d4e-e31f-4c1c-b2f7-37a2cbecff85"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Dining Room", "Internal", 4, false, null, true, 3 },
                    { new Guid("76195a95-f174-4998-864a-935d06095f67"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Coffee Bar", "Internal", 2, false, null, true, 4 },
                    { new Guid("34be12a0-96b2-4239-9be9-d54fa668af67"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Coffee Bar Cleaning", "Internal", 1, false, null, true, 5 },
                    { new Guid("2fd02b6d-047b-4c0f-b54a-a9f5ae935c67"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Main Corridor", "Internal", 1, false, null, true, 6 },
                    { new Guid("d54c6e57-75a2-4625-b4a4-f8ed75ccf5c5"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Small Kitchen", "Internal", 1, false, null, true, 7 },
                    { new Guid("62cf6364-6df7-4fce-a1ae-2027ce592ca2"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Upstairs Corridor", "Internal", 1, false, null, true, 8 },
                    { new Guid("5d223cbf-aac0-41af-aebe-d006f31beeb5"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Surgery Corridor", "Internal", 1, false, null, true, 9 },
                    { new Guid("534064f0-f97e-43fd-b4f9-33b8b0eff20d"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Detox Dining Room", "Internal", 2, false, null, true, 10 },
                    { new Guid("72568a87-aa2d-4ef1-96ad-1d3825077730"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Reception", "Internal", 2, false, null, true, 11 },
                    { new Guid("66a4d1c3-5820-4b26-91e0-29ddae434e54"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Detox Corridor", "Internal", 1, false, null, true, 12 },
                    { new Guid("f52bde8e-4ad6-4b3e-a14f-a515fa4677c4"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "St Josephs", "Internal", 1, false, null, true, 13 },
                    { new Guid("3f635e3d-ce7f-4c0f-bc4b-0a7222c3280b"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Laundry", "Mixed", 2, false, null, true, 14 },
                    { new Guid("3776f92a-8145-4c15-b23f-bf5e6fa5fcba"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Grounds Work", "External", null, false, null, true, 15 },
                    { new Guid("7de6c948-6330-4496-9834-0cf9a9df07bc"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Potato Shed", "External", 1, false, null, true, 16 },
                    { new Guid("bb646c03-ab63-4478-a233-8fca3d43a21e"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Wood Shed", "External", 1, false, null, true, 17 },
                    { new Guid("4989aaf8-7be4-4d76-a943-af8ae2d2cfca"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Tool Shed", "External", 1, false, null, true, 18 },
                    { new Guid("bf34ee72-7eca-45ee-8674-8ea99889cead"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Pottery", "External", null, false, null, true, 19 },
                    { new Guid("3b798967-73b7-4e1f-a313-f7bc32fe4291"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Art", "External", null, false, null, true, 20 },
                    { new Guid("4609db6d-dd5e-40c0-9d7a-6440b28ae7b6"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Painting", "External", null, false, null, true, 21 },
                    { new Guid("0e9a4e18-85f1-472f-8dd4-0ff5c9c4f136"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Pigs", "External", null, false, null, true, 22 },
                    { new Guid("cb92659d-b143-4ffd-8b4f-3de08e04c726"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Avenue", "External", 2, false, null, true, 23 },
                    { new Guid("55f0161d-aa35-4768-b499-26bb0e50cf5f"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Smoking Area", "External", 1, false, null, true, 24 },
                    { new Guid("d5df7bf7-43ce-484e-a9df-0e842ea8bd55"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Garden Centre", "Mixed", null, false, null, true, 25 },
                    { new Guid("f040f4e4-a95b-4a2b-9a8e-1f0a91baf6ca"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Reading Room", "Internal", 1, false, null, true, 26 },
                    { new Guid("df2bfbab-053e-465e-a0b8-2cb5e30f2f03"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, "Carpentry", "External", null, false, null, true, 27 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentOtRoleAssignment_EpisodeId_ReleasedAtUtc",
                table: "ResidentOtRoleAssignment",
                columns: new[] { "EpisodeId", "ReleasedAtUtc" },
                unique: true,
                filter: "[ReleasedAtUtc] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentOtRoleAssignment_OtRoleDefinitionId_ReleasedAtUtc",
                table: "ResidentOtRoleAssignment",
                columns: new[] { "OtRoleDefinitionId", "ReleasedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentOtRoleAssignment_ResidentId",
                table: "ResidentOtRoleAssignment",
                column: "ResidentId");

            migrationBuilder.CreateIndex(
                name: "IX_OtRoleDefinition_CentreId_Name",
                table: "OtRoleDefinition",
                columns: new[] { "CentreId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OtRoleDefinition_CentreId_UnitId_IsActive",
                table: "OtRoleDefinition",
                columns: new[] { "CentreId", "UnitId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResidentOtRoleAssignment");

            migrationBuilder.DropTable(
                name: "OtRoleDefinition");
        }
    }
}
