using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddResidentPreviousTreatments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ResidentPreviousTreatment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResidentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CentreName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TreatmentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartYear = table.Column<int>(type: "int", nullable: true),
                    DurationValue = table.Column<int>(type: "int", nullable: true),
                    DurationUnit = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CompletedTreatment = table.Column<bool>(type: "bit", nullable: true),
                    SobrietyAfterwardsValue = table.Column<int>(type: "int", nullable: true),
                    SobrietyAfterwardsUnit = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentPreviousTreatment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentPreviousTreatment_Resident_ResidentId",
                        column: x => x.ResidentId,
                        principalTable: "Resident",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentPreviousTreatment_ResidentId_StartYear",
                table: "ResidentPreviousTreatment",
                columns: new[] { "ResidentId", "StartYear" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResidentPreviousTreatment");
        }
    }
}
