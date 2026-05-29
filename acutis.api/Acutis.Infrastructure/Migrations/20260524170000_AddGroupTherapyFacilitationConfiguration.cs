using System;
using Acutis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AcutisDbContext))]
    [Migration("20260524170000_AddGroupTherapyFacilitationConfiguration")]
    public partial class AddGroupTherapyFacilitationConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GroupTherapyConversationTheme",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProgramCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapyConversationTheme", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroupTherapyFacilitationConfig",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ProgramCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CounsellorStyle = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsTimingEnabled = table.Column<bool>(type: "bit", nullable: false),
                    SessionDurationMinutes = table.Column<int>(type: "int", nullable: true),
                    ResidentDurationMinutes = table.Column<int>(type: "int", nullable: true),
                    ResidentTimeMultiplier = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapyFacilitationConfig", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GroupTherapyObservationConversationTheme",
                columns: table => new
                {
                    ObservationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationThemeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupTherapyObservationConversationTheme", x => new { x.ObservationId, x.ConversationThemeId });
                    table.ForeignKey(
                        name: "FK_GroupTherapyObservationConversationTheme_GroupTherapyConversationTheme_ConversationThemeId",
                        column: x => x.ConversationThemeId,
                        principalTable: "GroupTherapyConversationTheme",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupTherapyObservationConversationTheme_GroupTherapyResidentObservation_ObservationId",
                        column: x => x.ObservationId,
                        principalTable: "GroupTherapyResidentObservation",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "GroupTherapyConversationTheme",
                columns: new[] { "Id", "Code", "CreatedAtUtc", "Description", "IsActive", "Label", "ProgramCode", "SortOrder", "UnitCode", "UpdatedAtUtc" },
                columnTypes: new[] { "uniqueidentifier", "nvarchar(100)", "datetime2", "nvarchar(1000)", "bit", "nvarchar(160)", "nvarchar(100)", "int", "nvarchar(100)", "datetime2" },
                values: new object[,]
                {
                    { new Guid("b0d87830-2202-b9bf-b914-186da3dfdd98"), "past-trauma", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Historic trauma or adverse experiences that shape recovery, trust, or emotional safety.", true, "Past trauma", "bruree_alcohol_gt", 1, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("800da038-61c0-2970-cd45-3bdde6665863"), "family-bereavement", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Death of a family member, friend, or important support person.", true, "Family death or bereavement", "bruree_alcohol_gt", 2, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("4dc3d501-8ec8-824f-6b26-2bb4e60150ab"), "personal-injury", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Accident, injury, chronic pain, or physical limitation affecting wellbeing.", true, "Personal injury", "bruree_alcohol_gt", 3, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("75adb449-b25c-61ab-0a31-3fb648cea86f"), "relationship-breakdown", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Separation, divorce, conflict, loss of trust, or significant relationship rupture.", true, "Marriage or relationship breakdown", "bruree_alcohol_gt", 4, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("a9cc7257-40ad-e3cb-7928-cbf1a586c274"), "bullying", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Bullying, intimidation, humiliation, coercion, or exclusion.", true, "Bullying", "bruree_alcohol_gt", 5, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("71de2af2-1e7c-1097-cbbd-d342bd187f23"), "neurodivergence", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ADHD, autism, dyslexia, sensory processing, attention, or communication needs.", true, "Neurodivergence", "bruree_alcohol_gt", 6, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ef02c36b-044c-b08d-01e7-e81dba455112"), "financial-problems", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Debt, income pressure, benefits issues, gambling losses, or financial insecurity.", true, "Financial problems", "bruree_alcohol_gt", 7, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("8286fda9-142f-bee2-1fcd-222cbc05dc72"), "family-conflict", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Ongoing conflict, estrangement, boundaries, or family-system stress.", true, "Family conflict", "bruree_alcohol_gt", 8, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("f9a41735-e395-cc9a-4ebe-79f8873fc205"), "children-parenting", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Parenting strain, access to children, custody, guilt, or repair work.", true, "Children or parenting", "bruree_alcohol_gt", 9, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("26f6b875-5d99-1e83-5a96-d7a6872e2036"), "housing-insecurity", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Homelessness, unsafe housing, unstable tenancy, or returning to a high-risk home.", true, "Housing insecurity", "bruree_alcohol_gt", 10, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("8347c112-e4be-7f06-2b31-f9e9a65354be"), "legal-court", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Court dates, probation, criminal justice stress, or legal consequences.", true, "Legal or court issues", "bruree_alcohol_gt", 11, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("94b276a0-1f9b-e0ca-23ad-006d5138ac5a"), "employment", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Job loss, work stress, employability, training, or return-to-work concerns.", true, "Work or employment", "bruree_alcohol_gt", 12, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("13810ea7-5c86-c755-ad59-df673b8513f7"), "mental-health", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Anxiety, depression, panic, low mood, emotional regulation, or psychiatric support.", true, "Mental health", "bruree_alcohol_gt", 13, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("8814edcd-efbd-f5ae-7202-45cda180b2c6"), "shame-guilt", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Self-blame, regret, secrecy, stigma, or difficulty accepting compassion.", true, "Shame or guilt", "bruree_alcohol_gt", 14, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("9d8f04de-e13c-f8ff-f8be-79acce248d48"), "anger-conflict", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Anger, resentment, interpersonal conflict, impulse control, or repair attempts.", true, "Anger or conflict", "bruree_alcohol_gt", 15, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("b52c6dc8-0afc-0e07-baae-d38ac1623c14"), "loneliness-isolation", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Disconnection, lack of sober supports, social anxiety, or feeling excluded.", true, "Loneliness or isolation", "bruree_alcohol_gt", 16, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ae5954ce-c515-2901-19c3-3c2edd9b5a5d"), "relapse-triggers", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "People, places, emotions, cravings, routines, or situations linked to relapse risk.", true, "Relapse triggers", "bruree_alcohol_gt", 17, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("ff20b5de-4494-d668-4e7f-53ff0b3e2c94"), "identity-self-worth", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Self-image, purpose, dignity, values, confidence, or rebuilding identity in recovery.", true, "Identity or self-worth", "bruree_alcohol_gt", 18, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "GroupTherapyFacilitationConfig",
                columns: new[] { "Id", "CounsellorStyle", "CreatedAtUtc", "IsActive", "IsTimingEnabled", "ProgramCode", "ResidentDurationMinutes", "ResidentTimeMultiplier", "SessionDurationMinutes", "SortOrder", "UnitCode", "UpdatedAtUtc" },
                columnTypes: new[] { "uniqueidentifier", "nvarchar(100)", "datetime2", "bit", "bit", "nvarchar(100)", "int", "decimal(5,2)", "int", "int", "nvarchar(100)", "datetime2" },
                values: new object[,]
                {
                    { new Guid("de357ab1-3d59-a647-0f84-3d1828d12bab"), "Balanced", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), true, true, "bruree_alcohol_gt", null, 1.0m, 60, 1, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("34022e50-533d-a563-6e18-75255034529a"), "Deep Dive", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), true, true, "bruree_alcohol_gt", null, 1.35m, 60, 2, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("566878c1-f5bd-c3df-9eac-79e055729b2c"), "Rapid Round", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), true, true, "bruree_alcohol_gt", null, 0.75m, 45, 3, null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyObservationConversationTheme_ConversationThemeId",
                table: "GroupTherapyObservationConversationTheme",
                column: "ConversationThemeId");

            migrationBuilder.CreateIndex(
                name: "UQ_GroupTherapyConversationTheme_Scope_Code",
                table: "GroupTherapyConversationTheme",
                columns: new[] { "UnitCode", "ProgramCode", "Code" },
                unique: true,
                filter: "[UnitCode] IS NOT NULL AND [ProgramCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyConversationTheme_UnitCode_ProgramCode_IsActive_SortOrder",
                table: "GroupTherapyConversationTheme",
                columns: new[] { "UnitCode", "ProgramCode", "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "UQ_GroupTherapyFacilitationConfig_Scope_Style",
                table: "GroupTherapyFacilitationConfig",
                columns: new[] { "UnitCode", "ProgramCode", "CounsellorStyle" },
                unique: true,
                filter: "[UnitCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_GroupTherapyFacilitationConfig_UnitCode_ProgramCode_IsActive_SortOrder",
                table: "GroupTherapyFacilitationConfig",
                columns: new[] { "UnitCode", "ProgramCode", "IsActive", "SortOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "GroupTherapyObservationConversationTheme");
            migrationBuilder.DropTable(name: "GroupTherapyFacilitationConfig");
            migrationBuilder.DropTable(name: "GroupTherapyConversationTheme");
        }
    }
}
