using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupTherapyResidentRemarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GroupTherapyResidentRemark",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProgramCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ResidentId = table.Column<int>(type: "int", nullable: false),
                    ModuleKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NoteLinesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FreeText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapyResidentRemark", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "GroupTherapyResidentRemark",
                columns: new[] { "Id", "CreatedAtUtc", "FreeText", "ModuleKey", "NoteLinesJson", "ProgramCode", "ResidentId", "UnitCode", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { new Guid("17a1b864-4a2c-8538-e8ee-4e8c87c4bee9"), new DateTime(2026, 3, 1, 9, 0, 0, 0, DateTimeKind.Utc), "Resident engaged well and linked gratitude practice to daily recovery structure.", "spirituality", "[\"Excellent insight\",\"Reflective Awareness [Strength]: Can identify personal meaning and values.\"]", "bruree_alcohol_gt", 1, "alcohol", new DateTime(2026, 3, 1, 9, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("c39b9c50-d423-d96c-4925-9a5d68c1d586"), new DateTime(2026, 3, 1, 9, 2, 0, 0, DateTimeKind.Utc), "Agreed to write and carry an emergency contact plan before next session.", "relapse-prevention", "[\"Needs encouragement\",\"Trigger Awareness [Developing]: Identifies high-risk cues but hesitates to activate support.\"]", "bruree_alcohol_gt", 3, "alcohol", new DateTime(2026, 3, 1, 9, 2, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ca9dc4b1-8dba-15f5-dd27-4d70004b878a"), new DateTime(2026, 3, 1, 9, 1, 0, 0, DateTimeKind.Utc), "Shows motivation but needs reminders to turn intentions into concrete same-day actions.", "change", "[\"Good participation\",\"Behavioral Flexibility [Developing]: Acknowledges old patterns and can name one replacement behaviour.\"]", "bruree_alcohol_gt", 2, "alcohol", new DateTime(2026, 3, 1, 9, 1, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "UQ_GroupTherapyResidentRemark_Unit_Program_Module_Resident",
                table: "GroupTherapyResidentRemark",
                columns: new[] { "UnitCode", "ProgramCode", "ModuleKey", "ResidentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GroupTherapyResidentRemark");
        }
    }
}
