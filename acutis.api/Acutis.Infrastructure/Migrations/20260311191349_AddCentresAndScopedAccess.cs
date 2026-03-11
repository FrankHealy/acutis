using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCentresAndScopedAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("IF OBJECT_ID(N'[Prescription]', N'U') IS NOT NULL DROP TABLE [Prescription];");
            migrationBuilder.Sql("IF OBJECT_ID(N'[ResidentAddiction]', N'U') IS NOT NULL DROP TABLE [ResidentAddiction];");
            migrationBuilder.Sql("IF OBJECT_ID(N'[ResidentDocument]', N'U') IS NOT NULL DROP TABLE [ResidentDocument];");
            migrationBuilder.Sql("IF OBJECT_ID(N'[ResidentPhoto]', N'U') IS NOT NULL DROP TABLE [ResidentPhoto];");

            migrationBuilder.DropTable(
                name: "Resident");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoleAssignment_AppUserId_AppRoleId_UnitId",
                table: "AppUserRoleAssignment");

            migrationBuilder.AddColumn<Guid>(
                name: "CentreId",
                table: "Unit",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CentreId",
                table: "AppUserRoleAssignment",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "ScopeType",
                table: "AppUserRoleAssignment",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DefaultScopeType",
                table: "AppRole",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Centre",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Centre", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Resident",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Psn = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UnitCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Surname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Nationality = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    WeekNumber = table.Column<int>(type: "int", nullable: false),
                    RoomNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PhotoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AdmissionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedCompletionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PrimaryAddiction = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDrug = table.Column<bool>(type: "bit", nullable: false),
                    IsGambeler = table.Column<bool>(type: "bit", nullable: false),
                    IsPreviousResident = table.Column<bool>(type: "bit", nullable: false),
                    DietaryNeedsCode = table.Column<int>(type: "int", nullable: false),
                    IsSnorer = table.Column<bool>(type: "bit", nullable: false),
                    HasCriminalHistory = table.Column<bool>(type: "bit", nullable: false),
                    IsOnProbation = table.Column<bool>(type: "bit", nullable: false),
                    ArgumentativeScale = table.Column<int>(type: "int", nullable: false),
                    LearningDifficultyScale = table.Column<int>(type: "int", nullable: false),
                    LiteracyScale = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resident", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AppRole",
                keyColumn: "Id",
                keyValue: new Guid("66666666-1111-1111-1111-111111111111"),
                column: "DefaultScopeType",
                value: "centre");

            migrationBuilder.UpdateData(
                table: "AppRole",
                keyColumn: "Id",
                keyValue: new Guid("66666666-2222-2222-2222-222222222222"),
                column: "DefaultScopeType",
                value: "unit");

            migrationBuilder.InsertData(
                table: "Centre",
                columns: new[] { "Id", "Code", "CreatedAtUtc", "Description", "DisplayOrder", "IsActive", "Name", "UpdatedAtUtc" },
                values: new object[] { new Guid("aaaaaaaa-1111-1111-1111-111111111111"), "bruree", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Primary centre used for the current unit configuration.", 1, true, "Bruree", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.Sql("""
                UPDATE [AppRole]
                SET [DefaultScopeType] = CASE
                    WHEN [Id] = '66666666-1111-1111-1111-111111111111' THEN 'centre'
                    ELSE 'unit'
                END
                WHERE [DefaultScopeType] = '';
                """);

            migrationBuilder.Sql("""
                UPDATE [Unit]
                SET [CentreId] = 'aaaaaaaa-1111-1111-1111-111111111111'
                WHERE [CentreId] = '00000000-0000-0000-0000-000000000000';
                """);

            migrationBuilder.Sql("""
                UPDATE ura
                SET
                    [CentreId] = COALESCE(u.[CentreId], 'aaaaaaaa-1111-1111-1111-111111111111'),
                    [ScopeType] = CASE WHEN ura.[UnitId] IS NULL THEN 'centre' ELSE 'unit' END
                FROM [AppUserRoleAssignment] ura
                LEFT JOIN [Unit] u ON u.[Id] = ura.[UnitId]
                WHERE ura.[CentreId] = '00000000-0000-0000-0000-000000000000'
                   OR ura.[ScopeType] = '';
                """);

            migrationBuilder.InsertData(
                table: "Resident",
                columns: new[] { "Id", "AdmissionDate", "ArgumentativeScale", "CreatedAtUtc", "DateOfBirth", "DietaryNeedsCode", "ExpectedCompletionDate", "FirstName", "HasCriminalHistory", "IsDrug", "IsGambeler", "IsOnProbation", "IsPreviousResident", "IsSnorer", "LearningDifficultyScale", "LiteracyScale", "Nationality", "PhotoUrl", "PrimaryAddiction", "Psn", "RoomNumber", "Surname", "UnitCode", "UnitId", "UpdatedAtUtc", "WeekNumber" },
                values: new object[,]
                {
                    { new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), new DateTime(2026, 3, 9, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1986, 10, 18, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "John", false, false, true, false, false, true, 2, 1, "Irish", null, "Alcohol", "BRU-DET-26-10-10", "D10", "McCarthy", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1986, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Brian", false, false, false, false, false, true, 2, 2, "Irish", null, "Alcohol", "BRU-DET-26-02-02", "D02", "O'Neill", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 9, 17, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Ian", true, false, false, false, false, false, 1, 0, "Irish", null, "Alcohol", "BRU-DET-26-09-09", "D09", "Fitzgerald", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1984, 8, 16, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Hugh", false, false, false, true, true, true, 0, 2, "Irish", null, "Alcohol", "BRU-DET-26-08-08", "D08", "Kavanagh", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Aidan", false, false, false, false, false, false, 1, 1, "Irish", null, "Alcohol", "BRU-DET-26-01-01", "D01", "Byrne", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1989, 5, 13, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Eoin", false, false, true, false, false, false, 1, 2, "Irish", null, "Alcohol", "BRU-DET-26-05-05", "D05", "Ryan", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1990, 6, 14, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Fintan", true, false, false, false, false, true, 2, 0, "Irish", null, "Alcohol", "BRU-DET-26-06-06", "D06", "Hayes", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { new Guid("9390d075-2a03-a0af-6054-474038a9541c"), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1991, 7, 15, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Gavin", false, false, false, false, false, false, 3, 1, "Irish", null, "Alcohol", "BRU-DET-26-07-07", "D07", "Doyle", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1988, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Darragh", false, false, false, true, true, true, 0, 1, "Irish", null, "Alcohol", "BRU-DET-26-04-04", "D04", "Walsh", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4 },
                    { new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), new DateTime(2026, 3, 16, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 11, 19, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Kevin", false, false, false, false, false, false, 3, 2, "Irish", null, "Alcohol", "BRU-DET-26-11-11", "D11", "Power", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Cian", true, false, false, false, false, false, 3, 0, "Irish", null, "Alcohol", "BRU-DET-26-03-03", "D03", "Murphy", "detox", new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 }
                });

            migrationBuilder.InsertData(
                table: "ResidentProgrammeEpisode",
                columns: new[] { "Id", "CentreId", "CohortId", "CurrentWeekNumber", "EndDate", "ParticipationMode", "ProgrammeType", "ResidentId", "StartDate", "UnitId" },
                values: new object[,]
                {
                    { new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, "FullProgramme", "Alcohol", new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 4, null, "FullProgramme", "Alcohol", new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 5, null, "FullProgramme", "Alcohol", new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, "FullProgramme", "Alcohol", new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 7, null, "FullProgramme", "Alcohol", new Guid("9390d075-2a03-a0af-6054-474038a9541c"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 6, null, "FullProgramme", "Alcohol", new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 11, null, "FullProgramme", "Alcohol", new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 9, null, "FullProgramme", "Alcohol", new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 10, null, "FullProgramme", "Alcohol", new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 8, null, "FullProgramme", "Alcohol", new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") },
                    { new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, "FullProgramme", "Alcohol", new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), new DateOnly(2026, 1, 5), new Guid("22222222-2222-2222-2222-222222222222") }
                });

            migrationBuilder.InsertData(
                table: "ResidentWeeklyTherapyAssignment",
                columns: new[] { "Id", "AssignmentSource", "CreatedAt", "CreatedByUserId", "EpisodeId", "OverrideReason", "ResidentId", "SupersedesAssignmentId", "TherapyTopicId", "WeekStartDate" },
                values: new object[,]
                {
                    { new Guid("00ee4bc0-4b16-9aa8-ff13-14e923a2e893"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("054a6679-51f0-9153-cf7f-b12d6317f327"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("062e43b6-32ad-e572-c7b2-485f3194108a"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("0b97e7ed-b84e-d836-f339-9e382e411912"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("0cc020bf-e62f-4f75-3b6e-c0c4a0fccfad"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("0e17e251-cb58-5018-1422-cd0b468d5f85"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("0ec69717-ea9c-2fba-9f37-71870e9247c2"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("0f864351-4b27-4868-cb4d-f4bf8dbcfcd9"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("13910ff5-dac7-f4b7-3963-f65d84491888"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("15bbc4e6-e6df-a8de-2c60-f2a34a796ed7"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("16bb446c-af75-c9d1-37a7-937d454bb7a1"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("17b998e9-cb74-62f4-e877-828a9d40c05f"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("18428cd9-4d21-e7ef-f249-84c5d0a98f36"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("18f5c1eb-d82e-6ef0-90cf-b6dfdbb503a6"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("19c130d2-aa1e-bb12-44cc-ef3b38c29646"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("1eb7efc7-540d-73ee-fd61-84de3c408100"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("205fe148-01c4-7a0f-7e70-81c334455df3"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("23149963-47ef-fe4d-7528-affafe7ff315"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("26515a68-5b8e-6829-26f3-85295ec1eb08"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("2eebbea3-366d-cbca-07bb-815f06d135a3"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("2f98df55-09db-1e9e-875b-82224bb2f788"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("2fb5391a-dd38-b255-f217-fb2620f8399a"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("35feb3dc-0566-d14a-aeef-e2d203e8b84d"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("36c0af77-287f-8e09-f2cd-cbd673135373"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("3b28604c-cf26-d625-4c91-f86cb5d2202c"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("3c0665bc-f02c-743a-a554-20f058cf3df6"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("4325a9d1-71c4-8037-f5b0-08dc79b5b778"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("451b83ba-3cae-05f8-bf13-8049441980d3"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("46bbd9aa-1627-a22d-d3b6-c82b05ae588a"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("46bf0642-c2c8-72c6-0549-35c72a9b5445"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("46d13567-40a0-f1a3-3b9f-66ff6e7da6f9"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("4be53f54-4686-d458-cb32-81f0c8375e6a"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("4d8d6bfc-a41b-cc95-74be-c38624cc0141"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("4d96ab7c-2997-6738-892b-cad896480575"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("4e24ea31-757a-3960-ec1e-67e7fd5839d7"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("4fe84d69-d5ef-b893-d7e4-3a014ce5c486"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("50e81039-c7b0-8726-887e-e5d03238b9a3"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("52886b5f-3e9d-422a-1cf1-9d9e9f3822fe"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("558ce371-85f1-181a-77b2-fffea0857a1f"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("56510e07-d531-4c79-7e23-907671989c70"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("57c6f9e1-25c3-2df1-48cc-23bbb128a825"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("57d9ce6b-e754-e67b-9406-ead8f1ec9bdd"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("5ced13d6-66ae-818d-2042-411f22e4162c"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("5d91f5fd-aac4-0d34-30d2-51b38e113efc"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("62730c23-fcc5-2490-4d97-353585dee455"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("6609235f-5acd-3cf7-8457-b7f61ce3adc1"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("675b0c85-df21-b64f-148b-21567390afac"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("68fe85a2-8344-6c3f-2402-57ee5313356b"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("6b54adbb-0cbc-4971-1bc9-009ec893755e"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("6d9154ec-2b7a-18c8-1f29-71050b6eff4a"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("6f983672-33b9-c26f-c3b2-026bd1a3bc05"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("6fa7e31d-6ff9-e645-61f8-d65ca831055d"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("70b51e70-b669-d9fa-516e-69c87bf9bc12"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("717922dc-fe23-0377-44af-b0448f9a8ecd"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("71f53880-bfc7-c990-4c38-7cc5fb8b29bd"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("72c056db-22f6-5595-5b0e-c6f8c434dcf5"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("73d0757c-289a-3811-fae6-9bf5639037f1"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("73fc6759-13af-ea6d-9061-df7c2e32972a"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("75fc3130-f7c2-f808-f0b4-3d0ee9cf1758"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("77ca1c89-9ed3-5260-486a-415efffcf1bf"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("79ae954f-78ea-6c67-0517-7b4fabfdfc97"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("7a161e2f-8980-e3f2-83c9-e26b70638a4d"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("7d19942d-4a19-5829-999a-a503f8976b61"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("7e4b95a9-faa0-2cc2-1b35-193e16b033dc"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("81e517d5-056c-5372-14ec-3e293fc9cf27"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("862094b7-a2c0-ad0b-e53e-e51d4887896b"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("879ef645-bf3d-81ba-49ac-b2e2bdeb77a3"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("8c39c408-c40e-6c45-6d58-651f86df9ab8"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("8d74d197-c2db-3017-94d4-16e6c705ece9"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("8e1062fb-da0e-7681-9d47-d84229b137a9"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("90863d2f-19d4-f964-243d-4869012a2961"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("91d85ede-383a-02f2-a575-b672b334939f"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("92521cfe-1583-d0d7-b1c7-4728e7b0ef2d"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("953d212e-1944-fe43-491f-10cf0c489e51"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("96c9c611-810b-066f-11d3-c6f217e87342"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("9bd7ea2c-a17f-c918-41c8-ce3ee4eadee9"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("9d5ae623-84ed-45e1-f73b-d1e4a203e3d1"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("9e8fc4d1-217f-72f2-bf00-95bc325e46f7"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("9f233f92-b356-5491-d01f-3540b57e7809"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("9fe0a44f-e918-a1bc-fd17-53348275b7c9"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("a0c075cf-833a-4553-271f-dd21bd8a1ea3"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("a39a41fc-eaae-b209-d676-c0402ed4a795"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("a78cef33-a0a5-57ea-0936-7565c4d273d9"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("ab01d893-18e9-7932-812d-af4ff0e87fda"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("acf85048-61bf-10eb-3bc7-8c8a2bee285e"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("ad5b000b-eeaa-179c-ec4f-91b1f10d95f1"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("ad5df2eb-b274-7410-903c-f498b8dff201"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("b22ccf4b-22c9-2837-5cad-1821d6d58337"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("b22d0774-8a11-024b-555a-c1b30df81606"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("b33665aa-55f8-7dff-8ca4-3552bcf19699"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("b57b32c7-5905-5e1d-8009-6aa1eb4396d0"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("b64709ba-0081-53f7-6e48-168e3fb8c7d1"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("b66b6bf0-ea29-3f0a-f22f-6b1cf22d7392"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("b81ab005-0e3b-737a-79fe-9cb64ded1af3"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("c1472349-f8bb-f6b5-a69f-8124978566d5"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("c2193b87-497b-7a3e-38d3-bbd6e7ccb00b"), "Auto", new DateTime(2026, 2, 13, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 3, 23) },
                    { new Guid("c4cd114e-8616-5798-75b6-563603f9c54e"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("cb2c20c8-9671-5d44-1822-cffb7f6899dd"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("cb79f725-0355-4869-e7ac-cdf9945eda22"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("cbdab110-ac14-ee6e-e622-a01973eba7ee"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("cbe914e2-fd56-4801-60b8-a4250438b8e7"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("cc4015e6-8cc7-0f47-9420-7841646f9770"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("cd3f70bd-a622-f8a0-5e63-5fcdce4f4e9b"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("d0ed35b8-a2ab-3326-a2b1-84fb5d6a853c"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("d51d4acc-a70f-2133-4162-0f0a16e6cb1d"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("d5534106-bb67-25f2-e484-94bb6da60a08"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("d55890a3-3e5b-860f-be63-28945d026e7c"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("d79b6ef2-cd1c-6cb3-df2a-979d5289271f"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("df3a627d-c3dd-b229-96b7-33f56f5b556e"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("df5aa11b-2437-f914-0a03-996c9b8049ff"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("e25dba7a-76ed-9264-efa6-f51ed1f7760c"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"), null, new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("e287dd7e-a301-315c-138c-7db2263de9c9"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("e29040f4-f8f8-253f-fa17-151adeb07955"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"), null, new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) },
                    { new Guid("e29405c7-c2be-80d1-0edb-e3c7f97472e6"), "Auto", new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("31ccb2f3-a964-6bab-edb1-740213a554cd"), new DateOnly(2026, 2, 9) },
                    { new Guid("e3ed6300-0cfb-1459-3f11-0c5f92badf9d"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("e67dabfd-350f-6020-ee1f-5302f5a4a1e9"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("e7aaad4f-f627-7990-4f42-a2ca49e98ad1"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"), null, new Guid("9390d075-2a03-a0af-6054-474038a9541c"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("e7b162cf-1f5e-ba9e-ddfa-c0e8eb9d04d7"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("e7dba6ac-59e8-81b7-dce5-6e5941a669f3"), "Auto", new DateTime(2026, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("b46654f7-a7ec-6bf5-1c48-a59779561a67"), new DateOnly(2026, 2, 2) },
                    { new Guid("e946e9a7-24e6-107f-3a5e-dfaee197ff40"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("eef027fe-7227-3fad-7b4a-b0d9670e2c30"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("efa85ad9-4f6c-dd6d-62aa-140c496e0317"), "Auto", new DateTime(2026, 2, 3, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"), null, new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"), null, new Guid("42658b0f-a24d-9051-0c05-f90d957eeb0b"), new DateOnly(2026, 1, 12) },
                    { new Guid("f001809b-7dde-0c65-6017-bc6145fc9b9f"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("f0ea1c99-2ecd-d131-8624-835d28fe6135"), "Auto", new DateTime(2026, 2, 12, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 3, 16) },
                    { new Guid("f1e1fe5b-3632-81d4-d21d-a0d98b591026"), "Auto", new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("256fb56f-91d4-10e4-c0dd-c737d7f41cf1"), new DateOnly(2026, 2, 23) },
                    { new Guid("f420f0f5-3ac3-7d2e-0808-2278f2452133"), "Auto", new DateTime(2026, 2, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"), null, new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"), null, new Guid("d61798b0-206d-b3fb-7289-dcbcf27603d1"), new DateOnly(2026, 2, 16) },
                    { new Guid("f5624a0b-619a-6923-4b90-eed0cbeafdf7"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"), null, new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("f6ef1853-f381-a367-767e-f8293dbef4b4"), "Auto", new DateTime(2026, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"), null, new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"), null, new Guid("f702f030-6394-caf8-3c0d-c37965976b6d"), new DateOnly(2026, 3, 2) },
                    { new Guid("f9dd60ec-6f0f-3bed-c934-90f96bc2d486"), "Auto", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("fea40a2b-3f71-7899-e64d-da9418382288"), null, new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"), null, new Guid("f43ace7e-1961-422e-9af2-800a70990380"), new DateOnly(2026, 1, 5) },
                    { new Guid("fcf2fe1f-e2d1-8464-6073-ed70ccc87f62"), "Auto", new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"), null, new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"), null, new Guid("befe578a-55c3-bd49-ee5a-f1317faab488"), new DateOnly(2026, 1, 19) },
                    { new Guid("fd2a06df-31d5-cf6d-7269-2275e6b2e6ac"), "Auto", new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"), null, new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"), null, new Guid("d3c3f738-a063-88fb-883e-fec1fba1032b"), new DateOnly(2026, 1, 26) },
                    { new Guid("feeff701-3a1c-6c6c-7ea8-8fd19794de7a"), "Auto", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("80161798-9708-1a26-fadd-41f994fb23d8"), new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"), null, new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"), null, new Guid("dfbcad90-bc1b-b2b7-3cb8-5f0008b0caef"), new DateOnly(2026, 3, 9) }
                });

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("060098f3-091e-426c-a6a7-4d2bffb09ff8"),
                column: "Text",
                value: "قيد الانتظار");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c25f5e8-cc6d-4ae2-8475-b4591bce426c"),
                column: "Text",
                value: "قيد الانتظار");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"),
                column: "Text",
                value: "LogÃ¡ilte isteach mar");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1e7f1d6c-bdb5-4e89-90e2-970336aeb586"),
                column: "Text",
                value: "هل لديه تاريخ أعراض انسحاب؟");

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
                keyValue: new Guid("2f88fd06-b8bd-4d8c-b744-0c0591f45a99"),
                column: "Text",
                value: "هل توجد خطورة فورية؟");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3194c14a-e73f-4fbe-8f3f-5b17445bd128"),
                column: "Text",
                value: "لا توجد حالات تقييم متاحة.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3b977d28-f3d9-4766-8ffb-573df38cbeb4"),
                column: "Text",
                value: "قائمة التقييم");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("4556f72e-ebce-4a18-b61d-fd614b43f78f"),
                column: "Text",
                value: "مكتمل");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46648eca-e4fd-4f91-95c1-21f4419df2c6"),
                column: "Text",
                value: "نوع المشروب");

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
                keyValue: new Guid("5701e3ea-fec4-4f5c-ab4a-f75c1e23a334"),
                column: "Text",
                value: "تاريخ آخر مكالمة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"),
                column: "Text",
                value: "MeastÃ³ireacht");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("61685d4e-6ef8-4477-95f5-77ff4ab690d4"),
                column: "Text",
                value: "اللقب");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"),
                column: "Text",
                value: "Gabh sonraÃ­ scagtha Ã³n gcÃ©ad ghlao.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("697d0e4f-4fd8-4978-aebd-f19a5fbd7d2f"),
                column: "Text",
                value: "جار تحميل قائمة التقييم...");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ad7f2dd-0c03-4bb8-a398-f00f80518f95"),
                column: "Text",
                value: "عدد المكالمات");

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
                keyValue: new Guid("7f1f55d9-6d09-4075-9d6b-c54c14490515"),
                column: "Text",
                value: "مكتمل");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("86ef317b-1afd-4714-a620-6f81d174ec0a"),
                column: "Text",
                value: "الوحدة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("887273d1-9f36-4af0-b8c8-20006830b54d"),
                column: "Text",
                value: "قيد التنفيذ");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("95f3a857-7c59-4eef-a6ca-8e1ca02610e2"),
                column: "Text",
                value: "مجدول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9713a4d9-8d94-47d8-9f90-4e5af6847e11"),
                column: "Text",
                value: "الجدولة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a0c33630-5d24-4cb8-af88-b66bf166fdd0"),
                column: "Text",
                value: "مكالمة فحص تعاطي الكحول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a2f1f7ee-f45c-4ca9-a233-ce6197f09d48"),
                column: "Text",
                value: "الحالة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"),
                column: "Text",
                value: "LogÃ¡il Glaonna");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"),
                column: "Text",
                value: "عدد المشروبات يوميا (حسب النوع)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"),
                column: "Text",
                value: "ملاحظات المتابعة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c2727290-34ec-4a5d-9c78-cfca7191d2de"),
                column: "Text",
                value: "إجراء");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c562be30-0d52-43f4-bef7-c7ca01a61ac0"),
                column: "Text",
                value: "Sceidealú");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cb8f1cb3-f093-4f42-b867-48c26127fcdd"),
                column: "Text",
                value: "إذا كان غير ذلك، حدده");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cc93ab8e-7c97-46c5-8ee4-e85ce391f3ff"),
                column: "Text",
                value: "عرض");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cd374ce7-c9be-40ac-a8de-157e1f5ef8a6"),
                column: "Text",
                value: "تقييم هاتفي");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"),
                column: "Text",
                value: "التقييم");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dbbd3650-7578-48eb-8ff1-850f4494de2c"),
                column: "Text",
                value: "مجدول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"),
                column: "Text",
                value: "الاستقرار والسلامة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"),
                column: "Text",
                value: "استخدام الكحول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"),
                column: "Text",
                value: "Scagadh Glao AlcÃ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e9abb6e3-58b1-4171-85dc-0fec30ff6a2c"),
                column: "Text",
                value: "هل لديه تاريخ نوبات صرع؟");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f022f542-c0af-4339-a85a-f1c840b4ac4a"),
                column: "Text",
                value: "لا يوجد نموذج تقييم متاح.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"),
                column: "Text",
                value: "LogÃ¡il amach");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"),
                column: "Text",
                value: "بيانات المتصل");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f58fca32-e6d6-4ea1-a81e-c52ca3108e04"),
                column: "Text",
                value: "الاسم");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f66d9b1d-3871-4cd2-b15e-e100db7c9b3f"),
                column: "Text",
                value: "قيد التنفيذ");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("fd2bf3bf-8c66-4422-b965-c8ca1f4f74d8"),
                column: "Text",
                value: "جار تحميل نموذج التقييم...");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"),
                column: "Text",
                value: "تسجيل المكالمات");

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CentreId",
                value: new Guid("aaaaaaaa-1111-1111-1111-111111111111"));

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "CentreId", "CurrentOccupancy" },
                values: new object[] { new Guid("aaaaaaaa-1111-1111-1111-111111111111"), 11 });

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CentreId",
                value: new Guid("aaaaaaaa-1111-1111-1111-111111111111"));

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CentreId",
                value: new Guid("aaaaaaaa-1111-1111-1111-111111111111"));

            migrationBuilder.CreateIndex(
                name: "IX_Unit_CentreId_DisplayOrder_Name",
                table: "Unit",
                columns: new[] { "CentreId", "DisplayOrder", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_Resident_Psn",
                table: "Resident",
                column: "Psn",
                unique: true,
                filter: "[Psn] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Resident_UnitCode_RoomNumber",
                table: "Resident",
                columns: new[] { "UnitCode", "RoomNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoleAssignment_AppUserId_AppRoleId_ScopeType_CentreId",
                table: "AppUserRoleAssignment",
                columns: new[] { "AppUserId", "AppRoleId", "ScopeType", "CentreId" },
                unique: true,
                filter: "[UnitId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoleAssignment_AppUserId_AppRoleId_ScopeType_CentreId_UnitId",
                table: "AppUserRoleAssignment",
                columns: new[] { "AppUserId", "AppRoleId", "ScopeType", "CentreId", "UnitId" },
                unique: true,
                filter: "[UnitId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoleAssignment_CentreId",
                table: "AppUserRoleAssignment",
                column: "CentreId");

            migrationBuilder.CreateIndex(
                name: "IX_Centre_Code",
                table: "Centre",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Centre_IsActive_DisplayOrder_Name",
                table: "Centre",
                columns: new[] { "IsActive", "DisplayOrder", "Name" });

            migrationBuilder.AddForeignKey(
                name: "FK_AppUserRoleAssignment_Centre_CentreId",
                table: "AppUserRoleAssignment",
                column: "CentreId",
                principalTable: "Centre",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Unit_Centre_CentreId",
                table: "Unit",
                column: "CentreId",
                principalTable: "Centre",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppUserRoleAssignment_Centre_CentreId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropForeignKey(
                name: "FK_Unit_Centre_CentreId",
                table: "Unit");

            migrationBuilder.DropTable(
                name: "Centre");

            migrationBuilder.DropIndex(
                name: "IX_Unit_CentreId_DisplayOrder_Name",
                table: "Unit");

            migrationBuilder.DropIndex(
                name: "IX_Resident_Psn",
                table: "Resident");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoleAssignment_AppUserId_AppRoleId_ScopeType_CentreId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoleAssignment_AppUserId_AppRoleId_ScopeType_CentreId_UnitId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropIndex(
                name: "IX_AppUserRoleAssignment_CentreId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("191d3618-6770-d7c8-9b12-ec85d663d197"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("1c2e4089-bdce-1c37-9e9d-f403a5e2ffe3"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2c0f81c6-5d98-e779-10eb-8d12b898d3ea"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("441f3e3b-3b70-9852-34fb-f5b65e9d1240"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5711d7ec-b87f-237d-69bc-921ae521b99a"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5e319048-9738-bdfa-0955-62f01c480bf3"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("89b2f72b-a1c7-7a5d-1d5d-fbaaf88ee8fd"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("9390d075-2a03-a0af-6054-474038a9541c"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("bd9adb8f-ae9a-1e40-bb61-7d0c64e674e4"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("dab0d39b-ef80-0dc0-00da-a1fad79b2685"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("f4a51f22-5473-38c7-745c-98fc845e874d"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("1cc85180-fc5a-28b1-33ad-7803be7ba365"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("1db3c933-3469-71cf-edfa-fbf2c7373a69"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("612d8b81-c7b0-e6dd-c03c-c3cca658710f"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("6707cf6a-b4cf-6c54-c0fb-d4a126a829c5"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("6ca58ca7-ad11-947e-9f1d-e453e03825b0"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("70d3084e-a990-5311-e1a1-e8831afd7db0"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("afa87d08-5dfa-38d1-1673-cda88ba623e2"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("bbb8892a-a06e-d5c1-8594-9502940320b2"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("c7d129a5-a796-2cb3-f907-977ab7413219"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("eb64c55e-6f09-3277-9ac5-2ce8c8cab3b3"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("fea40a2b-3f71-7899-e64d-da9418382288"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("00ee4bc0-4b16-9aa8-ff13-14e923a2e893"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("054a6679-51f0-9153-cf7f-b12d6317f327"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("062e43b6-32ad-e572-c7b2-485f3194108a"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("0b97e7ed-b84e-d836-f339-9e382e411912"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("0cc020bf-e62f-4f75-3b6e-c0c4a0fccfad"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("0e17e251-cb58-5018-1422-cd0b468d5f85"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("0ec69717-ea9c-2fba-9f37-71870e9247c2"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("0f864351-4b27-4868-cb4d-f4bf8dbcfcd9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("13910ff5-dac7-f4b7-3963-f65d84491888"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("15bbc4e6-e6df-a8de-2c60-f2a34a796ed7"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("16bb446c-af75-c9d1-37a7-937d454bb7a1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("17b998e9-cb74-62f4-e877-828a9d40c05f"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("18428cd9-4d21-e7ef-f249-84c5d0a98f36"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("18f5c1eb-d82e-6ef0-90cf-b6dfdbb503a6"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("19c130d2-aa1e-bb12-44cc-ef3b38c29646"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("1eb7efc7-540d-73ee-fd61-84de3c408100"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("205fe148-01c4-7a0f-7e70-81c334455df3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("23149963-47ef-fe4d-7528-affafe7ff315"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("26515a68-5b8e-6829-26f3-85295ec1eb08"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("2eebbea3-366d-cbca-07bb-815f06d135a3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("2f98df55-09db-1e9e-875b-82224bb2f788"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("2fb5391a-dd38-b255-f217-fb2620f8399a"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("35feb3dc-0566-d14a-aeef-e2d203e8b84d"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("36c0af77-287f-8e09-f2cd-cbd673135373"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("3b28604c-cf26-d625-4c91-f86cb5d2202c"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("3c0665bc-f02c-743a-a554-20f058cf3df6"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("4325a9d1-71c4-8037-f5b0-08dc79b5b778"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("451b83ba-3cae-05f8-bf13-8049441980d3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("46bbd9aa-1627-a22d-d3b6-c82b05ae588a"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("46bf0642-c2c8-72c6-0549-35c72a9b5445"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("46d13567-40a0-f1a3-3b9f-66ff6e7da6f9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("4be53f54-4686-d458-cb32-81f0c8375e6a"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("4d8d6bfc-a41b-cc95-74be-c38624cc0141"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("4d96ab7c-2997-6738-892b-cad896480575"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("4e24ea31-757a-3960-ec1e-67e7fd5839d7"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("4fe84d69-d5ef-b893-d7e4-3a014ce5c486"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("50e81039-c7b0-8726-887e-e5d03238b9a3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("52886b5f-3e9d-422a-1cf1-9d9e9f3822fe"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("558ce371-85f1-181a-77b2-fffea0857a1f"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("56510e07-d531-4c79-7e23-907671989c70"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("57c6f9e1-25c3-2df1-48cc-23bbb128a825"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("57d9ce6b-e754-e67b-9406-ead8f1ec9bdd"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("5ced13d6-66ae-818d-2042-411f22e4162c"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("5d91f5fd-aac4-0d34-30d2-51b38e113efc"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("62730c23-fcc5-2490-4d97-353585dee455"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("6609235f-5acd-3cf7-8457-b7f61ce3adc1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("675b0c85-df21-b64f-148b-21567390afac"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("68fe85a2-8344-6c3f-2402-57ee5313356b"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("6b54adbb-0cbc-4971-1bc9-009ec893755e"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("6d9154ec-2b7a-18c8-1f29-71050b6eff4a"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("6f983672-33b9-c26f-c3b2-026bd1a3bc05"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("6fa7e31d-6ff9-e645-61f8-d65ca831055d"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("70b51e70-b669-d9fa-516e-69c87bf9bc12"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("717922dc-fe23-0377-44af-b0448f9a8ecd"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("71f53880-bfc7-c990-4c38-7cc5fb8b29bd"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("72c056db-22f6-5595-5b0e-c6f8c434dcf5"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("73d0757c-289a-3811-fae6-9bf5639037f1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("73fc6759-13af-ea6d-9061-df7c2e32972a"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("75fc3130-f7c2-f808-f0b4-3d0ee9cf1758"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("77ca1c89-9ed3-5260-486a-415efffcf1bf"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("79ae954f-78ea-6c67-0517-7b4fabfdfc97"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("7a161e2f-8980-e3f2-83c9-e26b70638a4d"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("7d19942d-4a19-5829-999a-a503f8976b61"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("7e4b95a9-faa0-2cc2-1b35-193e16b033dc"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("81e517d5-056c-5372-14ec-3e293fc9cf27"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("862094b7-a2c0-ad0b-e53e-e51d4887896b"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("879ef645-bf3d-81ba-49ac-b2e2bdeb77a3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("8c39c408-c40e-6c45-6d58-651f86df9ab8"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("8d74d197-c2db-3017-94d4-16e6c705ece9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("8e1062fb-da0e-7681-9d47-d84229b137a9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("90863d2f-19d4-f964-243d-4869012a2961"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("91d85ede-383a-02f2-a575-b672b334939f"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("92521cfe-1583-d0d7-b1c7-4728e7b0ef2d"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("953d212e-1944-fe43-491f-10cf0c489e51"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("96c9c611-810b-066f-11d3-c6f217e87342"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("9bd7ea2c-a17f-c918-41c8-ce3ee4eadee9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("9d5ae623-84ed-45e1-f73b-d1e4a203e3d1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("9e8fc4d1-217f-72f2-bf00-95bc325e46f7"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("9f233f92-b356-5491-d01f-3540b57e7809"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("9fe0a44f-e918-a1bc-fd17-53348275b7c9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("a0c075cf-833a-4553-271f-dd21bd8a1ea3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("a39a41fc-eaae-b209-d676-c0402ed4a795"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("a78cef33-a0a5-57ea-0936-7565c4d273d9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("ab01d893-18e9-7932-812d-af4ff0e87fda"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("acf85048-61bf-10eb-3bc7-8c8a2bee285e"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("ad5b000b-eeaa-179c-ec4f-91b1f10d95f1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("ad5df2eb-b274-7410-903c-f498b8dff201"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b22ccf4b-22c9-2837-5cad-1821d6d58337"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b22d0774-8a11-024b-555a-c1b30df81606"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b33665aa-55f8-7dff-8ca4-3552bcf19699"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b57b32c7-5905-5e1d-8009-6aa1eb4396d0"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b64709ba-0081-53f7-6e48-168e3fb8c7d1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b66b6bf0-ea29-3f0a-f22f-6b1cf22d7392"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("b81ab005-0e3b-737a-79fe-9cb64ded1af3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("c1472349-f8bb-f6b5-a69f-8124978566d5"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("c2193b87-497b-7a3e-38d3-bbd6e7ccb00b"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("c4cd114e-8616-5798-75b6-563603f9c54e"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("cb2c20c8-9671-5d44-1822-cffb7f6899dd"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("cb79f725-0355-4869-e7ac-cdf9945eda22"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("cbdab110-ac14-ee6e-e622-a01973eba7ee"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("cbe914e2-fd56-4801-60b8-a4250438b8e7"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("cc4015e6-8cc7-0f47-9420-7841646f9770"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("cd3f70bd-a622-f8a0-5e63-5fcdce4f4e9b"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("d0ed35b8-a2ab-3326-a2b1-84fb5d6a853c"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("d51d4acc-a70f-2133-4162-0f0a16e6cb1d"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("d5534106-bb67-25f2-e484-94bb6da60a08"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("d55890a3-3e5b-860f-be63-28945d026e7c"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("d79b6ef2-cd1c-6cb3-df2a-979d5289271f"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("df3a627d-c3dd-b229-96b7-33f56f5b556e"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("df5aa11b-2437-f914-0a03-996c9b8049ff"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e25dba7a-76ed-9264-efa6-f51ed1f7760c"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e287dd7e-a301-315c-138c-7db2263de9c9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e29040f4-f8f8-253f-fa17-151adeb07955"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e29405c7-c2be-80d1-0edb-e3c7f97472e6"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e3ed6300-0cfb-1459-3f11-0c5f92badf9d"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e67dabfd-350f-6020-ee1f-5302f5a4a1e9"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e7aaad4f-f627-7990-4f42-a2ca49e98ad1"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e7b162cf-1f5e-ba9e-ddfa-c0e8eb9d04d7"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e7dba6ac-59e8-81b7-dce5-6e5941a669f3"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("e946e9a7-24e6-107f-3a5e-dfaee197ff40"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("eef027fe-7227-3fad-7b4a-b0d9670e2c30"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("efa85ad9-4f6c-dd6d-62aa-140c496e0317"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f001809b-7dde-0c65-6017-bc6145fc9b9f"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f0ea1c99-2ecd-d131-8624-835d28fe6135"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f1e1fe5b-3632-81d4-d21d-a0d98b591026"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f420f0f5-3ac3-7d2e-0808-2278f2452133"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f5624a0b-619a-6923-4b90-eed0cbeafdf7"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f6ef1853-f381-a367-767e-f8293dbef4b4"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("f9dd60ec-6f0f-3bed-c934-90f96bc2d486"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("fcf2fe1f-e2d1-8464-6073-ed70ccc87f62"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("fd2a06df-31d5-cf6d-7269-2275e6b2e6ac"));

            migrationBuilder.DeleteData(
                table: "ResidentWeeklyTherapyAssignment",
                keyColumn: "Id",
                keyValue: new Guid("feeff701-3a1c-6c6c-7ea8-8fd19794de7a"));

            migrationBuilder.DropColumn(
                name: "CentreId",
                table: "Unit");

            migrationBuilder.DropColumn(
                name: "CentreId",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropColumn(
                name: "ScopeType",
                table: "AppUserRoleAssignment");

            migrationBuilder.DropColumn(
                name: "DefaultScopeType",
                table: "AppRole");

            migrationBuilder.AlterColumn<string>(
                name: "UnitCode",
                table: "Resident",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Surname",
                table: "Resident",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RoomNumber",
                table: "Resident",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Psn",
                table: "Resident",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PrimaryAddiction",
                table: "Resident",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nationality",
                table: "Resident",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Resident",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "ExpectedCompletionDate",
                table: "Resident",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "DateOfBirth",
                table: "Resident",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "AdmissionDate",
                table: "Resident",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Resident",
                type: "int",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier")
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("060098f3-091e-426c-a6a7-4d2bffb09ff8"),
                column: "Text",
                value: "??? ????????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c25f5e8-cc6d-4ae2-8475-b4591bce426c"),
                column: "Text",
                value: "??? ????????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1c920635-c1b3-4f25-9033-f104ace6192c"),
                column: "Text",
                value: "LogÃƒÂ¡ilte isteach mar");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1e7f1d6c-bdb5-4e89-90e2-970336aeb586"),
                column: "Text",
                value: "?? ???? ????? ????? ???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("28f2d9e0-2c6f-453f-bd0a-adce33d28153"),
                column: "Text",
                value: "LogÃƒÂ¡il isteach mar ÃƒÂºsÃƒÂ¡ideoir eile");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b"),
                column: "Text",
                value: "Deochanna sa LÃƒÂ¡");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2f88fd06-b8bd-4d8c-b744-0c0591f45a99"),
                column: "Text",
                value: "?? ???? ????? ??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3194c14a-e73f-4fbe-8f3f-5b17445bd128"),
                column: "Text",
                value: "?? ???? ????? ????? ?????.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("3b977d28-f3d9-4766-8ffb-573df38cbeb4"),
                column: "Text",
                value: "????? ???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("4556f72e-ebce-4a18-b61d-fd614b43f78f"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46648eca-e4fd-4f91-95c1-21f4419df2c6"),
                column: "Text",
                value: "??? ???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87"),
                column: "Text",
                value: "FÃƒÂ©in");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("46e89eb3-0dff-4f27-a4f7-dde66f8ef067"),
                column: "Text",
                value: "SonraÃƒÂ­ an Ghlaoiteora");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5701e3ea-fec4-4f5c-ab4a-f75c1e23a334"),
                column: "Text",
                value: "????? ??? ??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6138db68-8907-4f99-8ca9-188f9eea6d01"),
                column: "Text",
                value: "MeastÃƒÂ³ireacht");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("61685d4e-6ef8-4477-95f5-77ff4ab690d4"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d"),
                column: "Text",
                value: "Gabh sonraÃƒÂ­ scagtha ÃƒÂ³n gcÃƒÂ©ad ghlao.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("697d0e4f-4fd8-4978-aebd-f19a5fbd7d2f"),
                column: "Text",
                value: "??? ????? ????? ???????...");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ad7f2dd-0c03-4bb8-a398-f00f80518f95"),
                column: "Text",
                value: "??? ?????????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18"),
                column: "Text",
                value: "DochtÃƒÂºir Teaghlaigh");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9"),
                column: "Text",
                value: "ÃƒÅ¡sÃƒÂ¡id AlcÃƒÂ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("722449a8-6b10-4c6f-aa79-8734aef62e3d"),
                column: "Text",
                value: "Ionad CÃƒÂ³ireÃƒÂ¡la BrÃƒÂº RÃƒÂ­");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7f1f55d9-6d09-4075-9d6b-c54c14490515"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("86ef317b-1afd-4714-a620-6f81d174ec0a"),
                column: "Text",
                value: "??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("887273d1-9f36-4af0-b8c8-20006830b54d"),
                column: "Text",
                value: "??? ???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("95f3a857-7c59-4eef-a6ca-8e1ca02610e2"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9713a4d9-8d94-47d8-9f90-4e5af6847e11"),
                column: "Text",
                value: "???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a0c33630-5d24-4cb8-af88-b66bf166fdd0"),
                column: "Text",
                value: "?????? ??? ????? ??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a2f1f7ee-f45c-4ca9-a233-ce6197f09d48"),
                column: "Text",
                value: "??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b"),
                column: "Text",
                value: "LogÃƒÂ¡il Glaonna");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"),
                column: "Text",
                value: "??? ????????? ????? (??? ?????)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"),
                column: "Text",
                value: "??????? ????????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c2727290-34ec-4a5d-9c78-cfca7191d2de"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c562be30-0d52-43f4-bef7-c7ca01a61ac0"),
                column: "Text",
                value: "SceidealÃº");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cb8f1cb3-f093-4f42-b867-48c26127fcdd"),
                column: "Text",
                value: "??? ??? ??? ???? ????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cc93ab8e-7c97-46c5-8ee4-e85ce391f3ff"),
                column: "Text",
                value: "???");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cd374ce7-c9be-40ac-a8de-157e1f5ef8a6"),
                column: "Text",
                value: "????? ?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"),
                column: "Text",
                value: "???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dbbd3650-7578-48eb-8ff1-850f4494de2c"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"),
                column: "Text",
                value: "????????? ????????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"),
                column: "Text",
                value: "??????? ??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4"),
                column: "Text",
                value: "Scagadh Glao AlcÃƒÂ³il");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e9abb6e3-58b1-4171-85dc-0fec30ff6a2c"),
                column: "Text",
                value: "?? ???? ????? ????? ????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f022f542-c0af-4339-a85a-f1c840b4ac4a"),
                column: "Text",
                value: "?? ???? ????? ????? ????.");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb"),
                column: "Text",
                value: "LogÃƒÂ¡il amach");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"),
                column: "Text",
                value: "?????? ??????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f58fca32-e6d6-4ea1-a81e-c52ca3108e04"),
                column: "Text",
                value: "?????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f66d9b1d-3871-4cd2-b15e-e100db7c9b3f"),
                column: "Text",
                value: "??? ???????");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("fd2bf3bf-8c66-4422-b965-c8ca1f4f74d8"),
                column: "Text",
                value: "??? ????? ????? ???????...");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"),
                column: "Text",
                value: "????? ?????????");

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CurrentOccupancy",
                value: 12);

            migrationBuilder.CreateIndex(
                name: "IX_Resident_Psn",
                table: "Resident",
                column: "Psn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppUserRoleAssignment_AppUserId_AppRoleId_UnitId",
                table: "AppUserRoleAssignment",
                columns: new[] { "AppUserId", "AppRoleId", "UnitId" },
                unique: true);
        }
    }
}
