using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedAlcoholResidents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Resident",
                columns: new[] { "Id", "AdmissionDate", "ArgumentativeScale", "CreatedAtUtc", "DateOfBirth", "DietaryNeedsCode", "ExpectedCompletionDate", "FirstName", "HasCriminalHistory", "IsDrug", "IsGambeler", "IsOnProbation", "IsPreviousResident", "IsSnorer", "LearningDifficultyScale", "LiteracyScale", "Nationality", "PhotoUrl", "PrimaryAddiction", "Psn", "RoomNumber", "Surname", "UnitCode", "UnitId", "UpdatedAtUtc", "WeekNumber" },
                values: new object[,]
                {
                    { new Guid("00b34d2a-2563-516d-beb4-9922b72c5759"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1993, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "James", false, false, false, false, false, true, 3, 0, "British", "https://i.pravatar.cc/300?img=62", "Alcohol", "BRU-ALC-26-03-51", "A51", "Ingram", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { new Guid("00b90bb0-8db2-1cfb-0327-be35fe8aacc1"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1995, 5, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Martin", false, false, false, false, false, false, 1, 2, "Romanian", "https://i.pravatar.cc/300?img=64", "Alcohol", "BRU-ALC-26-05-53", "A53", "Lawlor", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { new Guid("02646b52-5167-05b5-40ad-0cbc1892ac6d"), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1993, 9, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Niall", false, false, true, false, false, true, 1, 0, "British", "https://i.pravatar.cc/300?img=44", "Alcohol", "BRU-ALC-26-09-33", "A33", "Lennon", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { new Guid("04c3d3cf-9d5a-7dd7-1581-60b1cb718a3f"), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1981, 9, 21, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Ronan", false, false, false, false, false, true, 1, 0, "British", "https://i.pravatar.cc/300?img=68", "Alcohol", "BRU-ALC-26-09-57", "A57", "Phelan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { new Guid("07497de8-9368-c560-3cb7-d06346fe9b24"), new DateTime(2026, 3, 16, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1995, 11, 19, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Padraig", true, false, false, false, true, false, 3, 2, "Romanian", "https://i.pravatar.cc/300?img=46", "Alcohol", "BRU-ALC-26-11-35", "A35", "Nestor", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { new Guid("08120ced-a0f4-d723-2e3c-b56fb6fbd9f1"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1991, 1, 13, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Gerard", false, false, false, false, true, false, 1, 1, "Irish", "https://i.pravatar.cc/300?img=60", "Alcohol", "BRU-ALC-26-01-49", "A49", "Gannon", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("0dda78e5-00b7-393e-5a90-7f6859f285bc"), new DateTime(2026, 3, 16, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1983, 11, 7, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Brendan", false, false, false, false, false, false, 3, 2, "Romanian", "https://i.pravatar.cc/300?img=34", "Alcohol", "BRU-ALC-26-11-23", "A23", "Burke", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { new Guid("0f9f762e-44bc-6e58-2ca1-87dc67352e68"), new DateTime(2026, 3, 16, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1989, 11, 11, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Emmet", false, false, false, false, false, false, 3, 2, "Romanian", "https://i.pravatar.cc/300?img=58", "Alcohol", "BRU-ALC-26-11-47", "A47", "Evans", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { new Guid("13299c45-d2e6-84b6-4df4-f0d0f6c2d11e"), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1978, 6, 22, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Ultan", false, false, false, false, false, true, 2, 0, "Latvian", "https://i.pravatar.cc/300?img=29", "Alcohol", "BRU-ALC-26-06-18", "A18", "Sullivan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { new Guid("1341c05a-6afd-d1ce-952c-91176e737f72"), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1992, 8, 16, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Martin", false, false, false, true, false, false, 0, 2, "Polish", "https://i.pravatar.cc/300?img=43", "Alcohol", "BRU-ALC-26-08-32", "A32", "Kennedy", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { new Guid("14c795dc-b206-b1d9-8c6f-c1f5050da462"), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1986, 8, 12, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Harry", false, false, false, true, false, false, 0, 2, "Polish", "https://i.pravatar.cc/300?img=19", "Alcohol", "BRU-ALC-26-08-08", "A08", "Hickey", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { new Guid("15357db6-ebfe-1326-a885-6273969da2e9"), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1980, 8, 20, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Padraig", false, false, false, true, true, false, 0, 2, "Polish", "https://i.pravatar.cc/300?img=67", "Alcohol", "BRU-ALC-26-08-56", "A56", "O'Connor", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { new Guid("199a2d39-1c16-28a2-64d6-8e769b65e5d1"), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1990, 6, 14, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "James", true, false, false, false, false, true, 2, 0, "Latvian", "https://i.pravatar.cc/300?img=41", "Alcohol", "BRU-ALC-26-06-30", "A30", "Ivors", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { new Guid("1b12ae0e-ffa8-66e3-113b-03e62bc6b7cb"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Vincent", false, false, false, false, false, false, 1, 1, "Irish", "https://i.pravatar.cc/300?img=2", "Alcohol", "BRU-ALC-26-01-61", "A61", "Walsh", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("1f34a8d0-03c2-9f7c-e206-1c0c7a15fd97"), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1982, 4, 8, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Declan", false, false, false, false, false, false, 0, 1, "Lithuanian", "https://i.pravatar.cc/300?img=15", "Alcohol", "BRU-ALC-26-04-04", "A04", "Donovan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4 },
                    { new Guid("2124fc97-a309-0652-abc9-4fd0ed92d375"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 1, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Declan", true, false, false, false, false, false, 1, 1, "Irish", "https://i.pravatar.cc/300?img=36", "Alcohol", "BRU-ALC-26-01-25", "A25", "Dunne", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("2552a9d2-4ef1-7a45-34e6-6d563b69d158"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1991, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Oisin", false, false, false, false, false, false, 1, 1, "Irish", "https://i.pravatar.cc/300?img=24", "Alcohol", "BRU-ALC-26-01-13", "A13", "Mahon", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("2d914a98-cf47-8961-464c-12afa1ebd069"), new DateTime(2026, 3, 9, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1982, 10, 22, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Seamus", false, false, false, false, false, false, 2, 1, "Lithuanian", "https://i.pravatar.cc/300?img=69", "Alcohol", "BRU-ALC-26-10-58", "A58", "Reardon", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { new Guid("2e5a4001-36d4-593a-a79b-a9004917d5b6"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1980, 2, 22, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Thomas", false, false, false, false, false, false, 2, 2, "Polish", "https://i.pravatar.cc/300?img=49", "Alcohol", "BRU-ALC-26-02-38", "A38", "Roche", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("2fa10c48-6187-2fa7-3007-c901596d8db4"), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1986, 8, 8, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Brendan", false, false, true, false, false, false, 0, 2, "Polish", "https://i.pravatar.cc/300?img=55", "Alcohol", "BRU-ALC-26-08-44", "A44", "Boyle", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { new Guid("34340ac2-065d-dd6e-eb77-55fac19e80f1"), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1984, 6, 6, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Zach", false, false, false, false, true, true, 2, 0, "Latvian", "https://i.pravatar.cc/300?img=53", "Alcohol", "BRU-ALC-26-06-42", "A42", "White", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { new Guid("42714c52-cd70-d620-b3e3-371d2f12dc61"), new DateTime(2026, 3, 16, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1989, 11, 15, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Martin", false, false, true, false, false, false, 3, 2, "Romanian", "https://i.pravatar.cc/300?img=22", "Alcohol", "BRU-ALC-26-11-11", "A11", "Keane", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { new Guid("46e3ee33-fba9-6ab6-7cfe-7d161b6d2ae0"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1981, 3, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Ultan", false, false, false, false, false, true, 3, 0, "British", "https://i.pravatar.cc/300?img=50", "Alcohol", "BRU-ALC-26-03-39", "A39", "Shanahan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { new Guid("48b0b608-d5cf-d97f-3d9a-61dc75ece93a"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Zach", false, false, false, false, true, true, 3, 0, "British", "https://i.pravatar.cc/300?img=4", "Alcohol", "BRU-ALC-26-03-63", "A63", "Young", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { new Guid("4f4d37bb-9d24-c6c1-5c9d-142b0f11d6a9"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1986, 2, 10, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Emmet", false, false, false, false, false, false, 2, 2, "Polish", "https://i.pravatar.cc/300?img=37", "Alcohol", "BRU-ALC-26-02-26", "A26", "Egan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("503ca22c-bcb5-6afa-15f7-f33037656b43"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1995, 5, 21, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Thomas", false, false, false, false, false, false, 1, 2, "Romanian", "https://i.pravatar.cc/300?img=28", "Alcohol", "BRU-ALC-26-05-17", "A17", "Reilly", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { new Guid("51ea2e21-9e60-7135-4ea6-da9e26328416"), new DateTime(2026, 3, 16, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1983, 11, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Thomas", false, false, false, false, false, false, 3, 2, "Romanian", "https://i.pravatar.cc/300?img=70", "Alcohol", "BRU-ALC-26-11-59", "A59", "Scanlon", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 11 },
                    { new Guid("55b396a6-0dd1-3fa2-c58a-0f5a5d35e688"), new DateTime(2026, 3, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1988, 10, 10, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Declan", false, false, false, false, false, false, 2, 1, "Lithuanian", "https://i.pravatar.cc/300?img=57", "Alcohol", "BRU-ALC-26-10-46", "A46", "Delaney", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { new Guid("585d1677-ab72-1f47-5b20-b50777e425b8"), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1981, 9, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Zach", false, false, false, false, true, true, 1, 0, "British", "https://i.pravatar.cc/300?img=32", "Alcohol", "BRU-ALC-26-09-21", "A21", "Whelan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { new Guid("5dc2dc56-b4e2-c15c-3675-42207ebddf43"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1979, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Alan", false, false, false, false, false, false, 1, 1, "Irish", "https://i.pravatar.cc/300?img=12", "Alcohol", "BRU-ALC-26-01-01", "A01", "Allen", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("6312a599-defc-1b06-de3c-c2607597830d"), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1982, 4, 24, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Vincent", true, false, false, true, false, false, 0, 1, "Lithuanian", "https://i.pravatar.cc/300?img=51", "Alcohol", "BRU-ALC-26-04-40", "A40", "Tracey", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4 },
                    { new Guid("6537d6a1-e2cb-ab1c-e1ae-78bea44625e0"), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 7, 7, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Alan", false, false, false, false, false, false, 3, 1, "Irish", "https://i.pravatar.cc/300?img=54", "Alcohol", "BRU-ALC-26-07-43", "A43", "Aylward", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { new Guid("709b6da2-9bec-c416-64d6-2f49e2e56330"), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1979, 7, 19, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Oisin", true, false, true, false, false, false, 3, 1, "Irish", "https://i.pravatar.cc/300?img=66", "Alcohol", "BRU-ALC-26-07-55", "A55", "Noonan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { new Guid("713fe41e-9fa4-258d-b1e7-ef88517d84ea"), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1980, 8, 24, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "William", true, false, false, false, false, false, 0, 2, "Polish", "https://i.pravatar.cc/300?img=31", "Alcohol", "BRU-ALC-26-08-20", "A20", "Usher", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 8 },
                    { new Guid("714f646c-412d-bd28-f70e-99cb8922e121"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1983, 5, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Emmet", true, false, false, false, false, false, 1, 2, "Romanian", "https://i.pravatar.cc/300?img=16", "Alcohol", "BRU-ALC-26-05-05", "A05", "Ennis", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { new Guid("75c8778b-ad14-4a46-c947-b3a735af2f4f"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1992, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Harry", true, false, false, false, false, false, 2, 2, "Polish", "https://i.pravatar.cc/300?img=61", "Alcohol", "BRU-ALC-26-02-50", "A50", "Healy", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("77547a3f-3c0f-0b43-5ebf-8b2839b0cdda"), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1988, 4, 12, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Gerard", false, false, false, false, true, false, 0, 1, "Lithuanian", "https://i.pravatar.cc/300?img=39", "Alcohol", "BRU-ALC-26-04-28", "A28", "Gilmore", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4 },
                    { new Guid("7c4eb88a-13e4-a442-194e-9a6241a630ea"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1993, 3, 19, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Ronan", true, false, false, false, false, true, 3, 0, "British", "https://i.pravatar.cc/300?img=26", "Alcohol", "BRU-ALC-26-03-15", "A15", "Owens", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { new Guid("8038ea42-33e8-a836-f0e7-31a72ae613d7"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1980, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Brendan", false, false, false, false, false, false, 2, 2, "Polish", "https://i.pravatar.cc/300?img=13", "Alcohol", "BRU-ALC-26-02-02", "A02", "Brennan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("83c32ed7-b746-6f05-8544-91d0392cfbee"), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 9, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Cathal", true, false, false, false, false, true, 1, 0, "British", "https://i.pravatar.cc/300?img=56", "Alcohol", "BRU-ALC-26-09-45", "A45", "Coffey", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { new Guid("873516b9-97bb-9a9a-00d9-5b5cdbac4d27"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1983, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "William", false, false, false, false, false, false, 1, 2, "Romanian", "https://i.pravatar.cc/300?img=52", "Alcohol", "BRU-ALC-26-05-41", "A41", "Vaughan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { new Guid("9843b1b3-edbe-0455-e187-8e10b75ef922"), new DateTime(2026, 3, 9, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1988, 10, 14, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Liam", true, false, false, false, false, false, 2, 1, "Lithuanian", "https://i.pravatar.cc/300?img=21", "Alcohol", "BRU-ALC-26-10-10", "A10", "Joyce", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { new Guid("b0327f6c-dc52-299c-3d03-ac92a981fc49"), new DateTime(2026, 3, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1990, 12, 12, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Finbar", false, false, false, true, false, true, 0, 0, "Latvian", "https://i.pravatar.cc/300?img=59", "Alcohol", "BRU-ALC-26-12-48", "A48", "Fitzpatrick", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 12 },
                    { new Guid("b0c0273a-3d36-bd23-209a-fbe0470148d2"), new DateTime(2026, 3, 23, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1990, 12, 16, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Niall", false, false, false, false, false, true, 0, 0, "Latvian", "https://i.pravatar.cc/300?img=23", "Alcohol", "BRU-ALC-26-12-12", "A12", "Larkin", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 12 },
                    { new Guid("b1913701-307d-4ec1-08dd-7611688c321a"), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1979, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "Seamus", false, false, false, false, false, false, 1, 1, "Irish", "https://i.pravatar.cc/300?img=48", "Alcohol", "BRU-ALC-26-01-37", "A37", "Prendergast", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("b4e3dd74-5b14-5912-b5f9-8cab8b1f99b7"), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1978, 6, 18, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Niall", false, false, false, false, false, true, 2, 0, "Latvian", "https://i.pravatar.cc/300?img=65", "Alcohol", "BRU-ALC-26-06-54", "A54", "Maguire", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { new Guid("ba61d2b6-01fb-7047-ed50-fe22edb83c53"), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1991, 7, 15, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Liam", false, false, false, false, false, false, 3, 1, "Irish", "https://i.pravatar.cc/300?img=42", "Alcohol", "BRU-ALC-26-07-31", "A31", "Jordan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { new Guid("be0dd053-72d2-01fe-8c85-5c36587db2bf"), new DateTime(2026, 3, 9, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1982, 10, 6, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Alan", false, false, true, false, false, false, 2, 1, "Lithuanian", "https://i.pravatar.cc/300?img=33", "Alcohol", "BRU-ALC-26-10-22", "A22", "Archer", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { new Guid("c2ace2ed-67ea-60ef-187a-08e631552491"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1989, 5, 13, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Harry", false, false, false, false, false, false, 1, 2, "Romanian", "https://i.pravatar.cc/300?img=40", "Alcohol", "BRU-ALC-26-05-29", "A29", "Hogan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 5 },
                    { new Guid("c6fe9877-04b3-5d76-9d3f-145f73cdae56"), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1985, 7, 11, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Gerard", false, false, false, false, true, false, 3, 1, "Irish", "https://i.pravatar.cc/300?img=18", "Alcohol", "BRU-ALC-26-07-07", "A07", "Griffin", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { new Guid("cd3bb063-ab7a-6ea6-48f1-68976f952aff"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1992, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Padraig", false, false, false, false, true, false, 2, 2, "Polish", "https://i.pravatar.cc/300?img=25", "Alcohol", "BRU-ALC-26-02-14", "A14", "Nolan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("cfb4638f-5607-d48b-47db-0c3e3e856c4d"), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1994, 4, 16, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Liam", false, false, false, false, false, false, 0, 1, "Lithuanian", "https://i.pravatar.cc/300?img=63", "Alcohol", "BRU-ALC-26-04-52", "A52", "Keegan", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4 },
                    { new Guid("d76875ee-8566-0097-8bce-c7277dc71f0d"), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1984, 6, 10, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Finbar", false, false, false, false, false, true, 2, 0, "Latvian", "https://i.pravatar.cc/300?img=17", "Alcohol", "BRU-ALC-26-06-06", "A06", "Farrell", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 6 },
                    { new Guid("da3a9d48-3f78-db99-96e6-87bfc49bb10f"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Finbar", false, false, false, false, false, true, 3, 0, "British", "https://i.pravatar.cc/300?img=38", "Alcohol", "BRU-ALC-26-03-27", "A27", "Foley", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { new Guid("dd11f30c-4c61-7bbd-ddee-b6e6edc11f4b"), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1986, 2, 6, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "William", false, false, false, false, false, false, 2, 2, "Polish", "https://i.pravatar.cc/300?img=3", "Alcohol", "BRU-ALC-26-02-62", "A62", "Walton", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 2 },
                    { new Guid("de24069e-8297-9016-cc8d-155d271e8b7a"), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1981, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "Cathal", false, false, false, false, false, true, 3, 0, "British", "https://i.pravatar.cc/300?img=14", "Alcohol", "BRU-ALC-26-03-03", "A03", "Clarke", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 3 },
                    { new Guid("e16629ef-6ae9-5131-4bac-bbdc97570c6a"), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1979, 7, 23, 0, 0, 0, 0, DateTimeKind.Utc), 3, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Vincent", false, false, false, false, false, false, 3, 1, "Irish", "https://i.pravatar.cc/300?img=30", "Alcohol", "BRU-ALC-26-07-19", "A19", "Tierney", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 7 },
                    { new Guid("e263c185-81ec-8fc5-7322-1407afc5a283"), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1987, 9, 13, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "James", false, false, false, false, false, true, 1, 0, "British", "https://i.pravatar.cc/300?img=20", "Alcohol", "BRU-ALC-26-09-09", "A09", "Irwin", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 9 },
                    { new Guid("e7a1923e-1376-9d8b-4591-6fee240adcca"), new DateTime(2026, 3, 23, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1978, 12, 20, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Ronan", false, false, false, false, false, true, 0, 0, "Latvian", "https://i.pravatar.cc/300?img=47", "Alcohol", "BRU-ALC-26-12-36", "A36", "O'Brien", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 12 },
                    { new Guid("e984995c-6c92-17d0-4039-7502c1f948e6"), new DateTime(2026, 3, 23, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1984, 12, 8, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Cathal", false, false, false, true, false, true, 0, 0, "Latvian", "https://i.pravatar.cc/300?img=35", "Alcohol", "BRU-ALC-26-12-24", "A24", "Conway", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 12 },
                    { new Guid("f03cb7d7-2c91-d873-59f7-5656a5a66739"), new DateTime(2026, 3, 9, 0, 0, 0, 0, DateTimeKind.Utc), 4, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1994, 10, 18, 0, 0, 0, 0, DateTimeKind.Utc), 2, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Oisin", false, false, false, false, false, false, 2, 1, "Lithuanian", "https://i.pravatar.cc/300?img=45", "Alcohol", "BRU-ALC-26-10-34", "A34", "Mooney", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 10 },
                    { new Guid("f3ae12b7-0031-14dd-85aa-dec722cd3f81"), new DateTime(2026, 3, 23, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1984, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "Ultan", true, false, false, false, false, true, 0, 0, "Latvian", "https://i.pravatar.cc/300?img=1", "Alcohol", "BRU-ALC-26-12-60", "A60", "Tobin", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 12 },
                    { new Guid("fd66fc90-0601-b6f4-f4f2-38ca7aad4788"), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), 1, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(1994, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), 0, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "Seamus", false, false, false, true, false, false, 0, 1, "Lithuanian", "https://i.pravatar.cc/300?img=27", "Alcohol", "BRU-ALC-26-04-16", "A16", "Quinn", "alcohol", new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 4 }
                });

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CurrentOccupancy",
                value: 63);

            migrationBuilder.InsertData(
                table: "ResidentCase",
                columns: new[] { "Id", "AdmissionDecisionAtUtc", "AdmissionDecisionReason", "AdmissionDecisionStatus", "CasePhase", "CaseStatus", "CentreId", "ClosedAtUtc", "ClosedWithoutAdmissionAtUtc", "ComprehensiveAssessmentCompleted", "LastContactAtUtc", "OpenedAtUtc", "ReferralReceivedAtUtc", "ReferralReference", "ReferralSource", "RequiresComprehensiveAssessment", "ResidentId", "ScreeningCompletedAtUtc", "ScreeningStartedAtUtc", "SummaryNotes", "UnitId" },
                values: new object[,]
                {
                    { new Guid("02d5cf68-9ba3-8414-b815-04bfcf3d00cc"), new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-038", "family", false, new Guid("2e5a4001-36d4-593a-a79b-a9004917d5b6"), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("05ac25af-20b9-cb10-1970-f222fc63f33c"), new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-030", "self", false, new Guid("199a2d39-1c16-28a2-64d6-8e769b65e5d1"), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("067a031b-64f3-f757-3b13-bcc7696bc492"), new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-060", "self", false, new Guid("f3ae12b7-0031-14dd-85aa-dec722cd3f81"), new DateTime(2026, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("0cbe447b-6bdf-d70b-5959-ea464cb4309a"), new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-048", "self", false, new Guid("b0327f6c-dc52-299c-3d03-ac92a981fc49"), new DateTime(2026, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("14dd0381-2265-6a21-9a42-c71ca226e43b"), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-001", "gp", true, new Guid("5dc2dc56-b4e2-c15c-3675-42207ebddf43"), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("17e7a384-bd51-89c2-8193-bd3b7c020261"), new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-010", "gp", false, new Guid("9843b1b3-edbe-0455-e187-8e10b75ef922"), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("18e22be9-5d28-4bf1-1ba3-c22c4ffed5c2"), new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-016", "gp", false, new Guid("fd66fc90-0601-b6f4-f4f2-38ca7aad4788"), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("1b828d21-1e5a-78f7-b39c-be261ba424b0"), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-037", "gp", true, new Guid("b1913701-307d-4ec1-08dd-7611688c321a"), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("241662a4-9a12-435a-586e-af8ad6eef8a8"), new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-023", "family", false, new Guid("0dda78e5-00b7-393e-5a90-7f6859f285bc"), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("2b567f24-2645-3563-6dc7-256da1a473f9"), new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-036", "self", false, new Guid("e7a1923e-1376-9d8b-4591-6fee240adcca"), new DateTime(2026, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("2deef4a1-f6c0-4fe7-dc65-cc9b800eaf3e"), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-051", "self", false, new Guid("00b34d2a-2563-516d-beb4-9922b72c5759"), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("34592d5e-2b32-2033-c42f-bcf9681240d7"), new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-021", "self", true, new Guid("585d1677-ab72-1f47-5b20-b50777e425b8"), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("3e079aca-4440-deb3-f5e9-96cb4218d983"), new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-042", "self", false, new Guid("34340ac2-065d-dd6e-eb77-55fac19e80f1"), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("3e545e34-2694-5967-8c89-cd5f6cbbb384"), new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-018", "self", false, new Guid("13299c45-d2e6-84b6-4df4-f0d0f6c2d11e"), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("40459bcf-c396-f2ab-d069-8ded074a050e"), new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-009", "self", true, new Guid("e263c185-81ec-8fc5-7322-1407afc5a283"), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("4892cd18-2942-732c-bd62-a53d80d6a3c2"), new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-002", "family", false, new Guid("8038ea42-33e8-a836-f0e7-31a72ae613d7"), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("4a53240f-690c-44d4-bb22-9c47ba0fb78e"), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-063", "self", false, new Guid("48b0b608-d5cf-d97f-3d9a-61dc75ece93a"), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("4b320969-841e-d690-341f-58e6531fccee"), new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-022", "gp", false, new Guid("be0dd053-72d2-01fe-8c85-5c36587db2bf"), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("4c169242-6e08-6702-70f9-603ca34de470"), new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-058", "gp", false, new Guid("2d914a98-cf47-8961-464c-12afa1ebd069"), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("5af6689e-fa64-ff88-31fb-08102f12a834"), new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-055", "gp", false, new Guid("709b6da2-9bec-c416-64d6-2f49e2e56330"), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("5b127d66-826c-3e6b-92b2-009ecf6329b2"), new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-004", "gp", false, new Guid("1f34a8d0-03c2-9f7c-e206-1c0c7a15fd97"), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("613c5f0f-9465-d1cc-bb6b-8b0e334b5286"), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-013", "gp", true, new Guid("2552a9d2-4ef1-7a45-34e6-6d563b69d158"), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("620a1279-0c69-662b-60ef-969ec6c3f016"), new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-052", "gp", false, new Guid("cfb4638f-5607-d48b-47db-0c3e3e856c4d"), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("66dbc7fb-4df0-aa06-41dd-d3ca1b342446"), new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-050", "family", false, new Guid("75c8778b-ad14-4a46-c947-b3a735af2f4f"), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("67aca680-ed16-0e43-aaa0-5e3c8fcf9224"), new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-008", "family", false, new Guid("14c795dc-b206-b1d9-8c6f-c1f5050da462"), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("6aa7429c-32a8-4048-3444-87a42644a94a"), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-049", "gp", true, new Guid("08120ced-a0f4-d723-2e3c-b56fb6fbd9f1"), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("6b32d043-a1ae-71f1-03f0-1df665103c8b"), new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-045", "self", true, new Guid("83c32ed7-b746-6f05-8544-91d0392cfbee"), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("6e0e43eb-d5ae-1bc7-a6cc-4f791e1ec83a"), new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-043", "gp", false, new Guid("6537d6a1-e2cb-ab1c-e1ae-78bea44625e0"), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("7044d7e8-2ec7-4382-9e99-e90e17408a53"), new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-034", "gp", false, new Guid("f03cb7d7-2c91-d873-59f7-5656a5a66739"), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("707742c8-ad7a-1f60-94e5-3b738c07a01f"), new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-014", "family", false, new Guid("cd3bb063-ab7a-6ea6-48f1-68976f952aff"), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("7bf163f7-f62c-de3a-f0b3-b66153838322"), new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-012", "self", false, new Guid("b0c0273a-3d36-bd23-209a-fbe0470148d2"), new DateTime(2026, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("8692d172-9c54-c70f-0a4b-7531afdd5315"), new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-019", "gp", false, new Guid("e16629ef-6ae9-5131-4bac-bbdc97570c6a"), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("878bf789-24b9-7555-1fd9-eb230a0b377a"), new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-033", "self", true, new Guid("02646b52-5167-05b5-40ad-0cbc1892ac6d"), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("8f8c7165-dd27-62f3-5f2d-e4e6521c4495"), new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-017", "family", true, new Guid("503ca22c-bcb5-6afa-15f7-f33037656b43"), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("929cc5b6-c4d2-aa3e-85c5-e096fdab1c73"), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-015", "self", false, new Guid("7c4eb88a-13e4-a442-194e-9a6241a630ea"), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("99b1f5fa-05de-faa8-3f0a-6b0209525bbe"), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-061", "gp", true, new Guid("1b12ae0e-ffa8-66e3-113b-03e62bc6b7cb"), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("9c950c36-e912-12dd-aa43-0ee5632279e5"), new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 9, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-057", "self", true, new Guid("04c3d3cf-9d5a-7dd7-1581-60b1cb718a3f"), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("a026c6d0-c585-bc5a-7b57-86a02ae7f77a"), new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-011", "family", false, new Guid("42714c52-cd70-d620-b3e3-371d2f12dc61"), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("a116e44f-e59a-c4fd-cfa5-0d80091b9cc8"), new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2025, 12, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-025", "gp", true, new Guid("2124fc97-a309-0652-abc9-4fd0ed92d375"), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("a96bec8b-0a57-23e2-fadb-e6ece8c4fc44"), new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-054", "self", false, new Guid("b4e3dd74-5b14-5912-b5f9-8cab8b1f99b7"), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("b1fafa6e-9779-5c14-52c7-63d89bbf884a"), new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-024", "self", false, new Guid("e984995c-6c92-17d0-4039-7502c1f948e6"), new DateTime(2026, 3, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("b4fa3353-9e0e-78de-0449-d755225314f2"), new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-053", "family", true, new Guid("00b90bb0-8db2-1cfb-0327-be35fe8aacc1"), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("b9278ec8-7e71-33f9-76bf-867c4533e6bf"), new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-040", "gp", false, new Guid("6312a599-defc-1b06-de3c-c2607597830d"), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("b9d2af6f-d8fa-92be-e08c-881148a79a9b"), new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-062", "family", false, new Guid("dd11f30c-4c61-7bbd-ddee-b6e6edc11f4b"), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("bacf6983-0d3b-ab2a-2543-5da3ede2b7cd"), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-027", "self", false, new Guid("da3a9d48-3f78-db99-96e6-87bfc49bb10f"), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("bc1af24a-7d55-b046-ccca-14ecc5bd2801"), new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-047", "family", false, new Guid("0f9f762e-44bc-6e58-2ca1-87dc67352e68"), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("bedece19-6736-e923-2862-96210b55e498"), new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-056", "family", false, new Guid("15357db6-ebfe-1326-a885-6273969da2e9"), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("c81d7bbf-e761-983c-9ed0-04671b5e64b1"), new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-005", "family", true, new Guid("714f646c-412d-bd28-f70e-99cb8922e121"), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("ce939943-00c8-dcbd-d42d-e2ac46db190a"), new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-006", "self", false, new Guid("d76875ee-8566-0097-8bce-c7277dc71f0d"), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("d2221dec-071c-d380-b6f3-2515239f07aa"), new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-044", "family", false, new Guid("2fa10c48-6187-2fa7-3007-c901596d8db4"), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("d55b80ed-b3f5-4db9-bd93-4f4a782a9b75"), new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 22, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-026", "family", false, new Guid("4f4d37bb-9d24-c6c1-5c9d-142b0f11d6a9"), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("d64353b1-93e1-a496-26ff-691787c8e81e"), new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-035", "family", false, new Guid("07497de8-9368-c560-3cb7-d06346fe9b24"), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("d735d3ef-77d8-66a2-47f5-2dce715eaf13"), new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 16, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-046", "gp", false, new Guid("55b396a6-0dd1-3fa2-c58a-0f5a5d35e688"), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 18, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("db38eb15-818c-c146-8716-ee7785b75260"), new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-041", "family", true, new Guid("873516b9-97bb-9a9a-00d9-5b5cdbac4d27"), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e41f4a3a-c68c-d34e-fd10-63d0bd4cda91"), new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-059", "family", false, new Guid("51ea2e21-9e60-7135-4ea6-da9e26328416"), new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e641d55e-25f9-d223-0541-7b89a46233db"), new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 17, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 5, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-028", "gp", false, new Guid("77547a3f-3c0f-0b43-5ebf-8b2839b0cdda"), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e7b29d33-22b4-f43f-6c1d-3ea2552c5f11"), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-003", "self", false, new Guid("de24069e-8297-9016-cc8d-155d271e8b7a"), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("ebf094cc-d4f6-2fee-71e9-89382875c905"), new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 24, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 12, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-029", "family", true, new Guid("c2ace2ed-67ea-60ef-187a-08e631552491"), new DateTime(2026, 1, 21, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f1674ab5-6b49-716d-b8c8-cb768c002aeb"), new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-032", "family", false, new Guid("1341c05a-6afd-d1ce-952c-91176e737f72"), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f2ead506-547d-8eeb-2dd0-075d2fa36dfe"), new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-031", "gp", false, new Guid("ba61d2b6-01fb-7047-ed50-fe22edb83c53"), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f4f01740-f6a4-2e29-5a7f-ab5ae460bc8e"), new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 14, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-020", "family", false, new Guid("713fe41e-9fa4-258d-b1e7-ef88517d84ea"), new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f8dcb0ea-b18e-2eae-cb9c-92ff5adc2aef"), new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 2, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 26, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-007", "gp", false, new Guid("c6fe9877-04b3-5d76-9d3f-145f73cdae56"), new DateTime(2026, 2, 4, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 1, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("fa11406b-65af-f777-c35e-5b733790670d"), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), "Suitable for residential alcohol programme admission.", "admitted", "admission", "admitted", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, null, true, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 29, 0, 0, 0, 0, DateTimeKind.Utc), "ALC-REF-039", "self", false, new Guid("46e3ee33-fba9-6ab6-7cfe-7d161b6d2ae0"), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Utc), "Admitted to the alcohol programme following screening and admission decision.", new Guid("11111111-1111-1111-1111-111111111111") }
                });

            migrationBuilder.InsertData(
                table: "ResidentProgrammeEpisode",
                columns: new[] { "Id", "CentreEpisodeCode", "CentreId", "CohortId", "CurrentWeekNumber", "EndDate", "EntrySequence", "EntryWeek", "EntryYear", "ExpectedCompletionDate", "ParticipationMode", "PrimaryAddiction", "ProgrammeType", "ResidentCaseId", "ResidentId", "RoomNumber", "StartDate", "UnitId" },
                values: new object[,]
                {
                    { new Guid("00f68a0a-53b8-5ab7-e176-14eed828e254"), "BRU-2026W08-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 8, null, 13, 8, 2026, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("f1674ab5-6b49-716d-b8c8-cb768c002aeb"), new Guid("1341c05a-6afd-d1ce-952c-91176e737f72"), "A32", new DateOnly(2026, 2, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("01e8dc83-38c7-9957-5162-5ec4cb51cdcf"), "BRU-2026W11-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 11, null, 14, 11, 2026, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("bc1af24a-7d55-b046-ccca-14ecc5bd2801"), new Guid("0f9f762e-44bc-6e58-2ca1-87dc67352e68"), "A47", new DateOnly(2026, 3, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("02366ca6-52ad-b581-e56f-4dd0cabdd28e"), "BRU-2026W08-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 8, null, 11, 8, 2026, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("67aca680-ed16-0e43-aaa0-5e3c8fcf9224"), new Guid("14c795dc-b206-b1d9-8c6f-c1f5050da462"), "A08", new DateOnly(2026, 2, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("134c0c73-ce8c-f811-39bd-1d1565dad54d"), "BRU-2026W09-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 9, null, 15, 9, 2026, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("9c950c36-e912-12dd-aa43-0ee5632279e5"), new Guid("04c3d3cf-9d5a-7dd7-1581-60b1cb718a3f"), "A57", new DateOnly(2026, 3, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("13fa1d94-9b8d-84f7-4eb2-569f75c41aa8"), "BRU-2026W03-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, 14, 3, 2026, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("fa11406b-65af-f777-c35e-5b733790670d"), new Guid("46e3ee33-fba9-6ab6-7cfe-7d161b6d2ae0"), "A39", new DateOnly(2026, 1, 19), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("16074dfc-ccc1-fe81-6950-0ab846e6d057"), "BRU-2026W04-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 4, null, 11, 4, 2026, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("5b127d66-826c-3e6b-92b2-009ecf6329b2"), new Guid("1f34a8d0-03c2-9f7c-e206-1c0c7a15fd97"), "A04", new DateOnly(2026, 1, 26), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("180d3326-190d-4b88-990b-5892802a934f"), "BRU-2026W01-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, 14, 1, 2026, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("1b828d21-1e5a-78f7-b39c-be261ba424b0"), new Guid("b1913701-307d-4ec1-08dd-7611688c321a"), "A37", new DateOnly(2026, 1, 5), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("1a5cf3de-d58b-e350-c364-7d07b124fed0"), "BRU-2026W03-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, 11, 3, 2026, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("e7b29d33-22b4-f43f-6c1d-3ea2552c5f11"), new Guid("de24069e-8297-9016-cc8d-155d271e8b7a"), "A03", new DateOnly(2026, 1, 19), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("1aa99ba2-9c8f-17f6-b24b-48904c95c2e3"), "BRU-2026W02-016", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, 16, 2, 2026, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("b9d2af6f-d8fa-92be-e08c-881148a79a9b"), new Guid("dd11f30c-4c61-7bbd-ddee-b6e6edc11f4b"), "A62", new DateOnly(2026, 1, 12), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("2055f945-0245-7319-7ee1-3dfac196e2d4"), "BRU-2026W10-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 10, null, 15, 10, 2026, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("4c169242-6e08-6702-70f9-603ca34de470"), new Guid("2d914a98-cf47-8961-464c-12afa1ebd069"), "A58", new DateOnly(2026, 3, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("23e5c036-3d3a-c2eb-372c-704328b8da9c"), "BRU-2026W01-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, 12, 1, 2026, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("613c5f0f-9465-d1cc-bb6b-8b0e334b5286"), new Guid("2552a9d2-4ef1-7a45-34e6-6d563b69d158"), "A13", new DateOnly(2026, 1, 5), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("28c3d6da-ae77-4890-ab58-f4bd4f67b45c"), "BRU-2026W05-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 5, null, 13, 5, 2026, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("ebf094cc-d4f6-2fee-71e9-89382875c905"), new Guid("c2ace2ed-67ea-60ef-187a-08e631552491"), "A29", new DateOnly(2026, 2, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("2e0b673c-8621-a6ee-a0db-8602bf25f3de"), "BRU-2026W02-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, 11, 2, 2026, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("4892cd18-2942-732c-bd62-a53d80d6a3c2"), new Guid("8038ea42-33e8-a836-f0e7-31a72ae613d7"), "A02", new DateOnly(2026, 1, 12), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("3744b0b0-bfc1-4999-605d-aab09481e411"), "BRU-2026W03-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, 15, 3, 2026, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("2deef4a1-f6c0-4fe7-dc65-cc9b800eaf3e"), new Guid("00b34d2a-2563-516d-beb4-9922b72c5759"), "A51", new DateOnly(2026, 1, 19), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("38ed6aac-feb1-19b9-c06e-b27e78727a88"), "BRU-2026W07-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 7, null, 13, 7, 2026, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("f2ead506-547d-8eeb-2dd0-075d2fa36dfe"), new Guid("ba61d2b6-01fb-7047-ed50-fe22edb83c53"), "A31", new DateOnly(2026, 2, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("42a88115-701f-9715-2fc6-4584351927de"), "BRU-2026W04-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 4, null, 13, 4, 2026, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("e641d55e-25f9-d223-0541-7b89a46233db"), new Guid("77547a3f-3c0f-0b43-5ebf-8b2839b0cdda"), "A28", new DateOnly(2026, 1, 26), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("43f6fa90-dcf5-0e36-08c3-891d8b55ef2a"), "BRU-2026W12-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 12, null, 15, 12, 2026, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("067a031b-64f3-f757-3b13-bcc7696bc492"), new Guid("f3ae12b7-0031-14dd-85aa-dec722cd3f81"), "A60", new DateOnly(2026, 3, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("469a8b69-f59d-fc3d-0362-aa35caf37a02"), "BRU-2026W12-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 12, null, 12, 12, 2026, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("b1fafa6e-9779-5c14-52c7-63d89bbf884a"), new Guid("e984995c-6c92-17d0-4039-7502c1f948e6"), "A24", new DateOnly(2026, 3, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("49f1866f-25a5-fa19-419c-bb58e20f0f14"), "BRU-2026W11-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 11, null, 11, 11, 2026, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("a026c6d0-c585-bc5a-7b57-86a02ae7f77a"), new Guid("42714c52-cd70-d620-b3e3-371d2f12dc61"), "A11", new DateOnly(2026, 3, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("4eae6e29-64e3-48bc-080d-6a2aa4977f34"), "BRU-2026W09-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 9, null, 13, 9, 2026, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("878bf789-24b9-7555-1fd9-eb230a0b377a"), new Guid("02646b52-5167-05b5-40ad-0cbc1892ac6d"), "A33", new DateOnly(2026, 3, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("55b88b15-b85a-e235-8ff1-0f6190b28df2"), "BRU-2026W09-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 9, null, 14, 9, 2026, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("6b32d043-a1ae-71f1-03f0-1df665103c8b"), new Guid("83c32ed7-b746-6f05-8544-91d0392cfbee"), "A45", new DateOnly(2026, 3, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("5fc43550-8ade-cc6b-79bc-baf4af0422f5"), "BRU-2026W04-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 4, null, 14, 4, 2026, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("b9278ec8-7e71-33f9-76bf-867c4533e6bf"), new Guid("6312a599-defc-1b06-de3c-c2607597830d"), "A40", new DateOnly(2026, 1, 26), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("6b76e54f-ffd6-444a-b72c-c349bb2dcb02"), "BRU-2026W05-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 5, null, 11, 5, 2026, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("c81d7bbf-e761-983c-9ed0-04671b5e64b1"), new Guid("714f646c-412d-bd28-f70e-99cb8922e121"), "A05", new DateOnly(2026, 2, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("72899151-6c8f-6778-906a-fc5444d8d318"), "BRU-2026W02-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, 14, 2, 2026, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("02d5cf68-9ba3-8414-b815-04bfcf3d00cc"), new Guid("2e5a4001-36d4-593a-a79b-a9004917d5b6"), "A38", new DateOnly(2026, 1, 12), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("766ac4a7-5489-7fc5-b231-c6a29dbf125c"), "BRU-2026W01-016", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, 16, 1, 2026, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("99b1f5fa-05de-faa8-3f0a-6b0209525bbe"), new Guid("1b12ae0e-ffa8-66e3-113b-03e62bc6b7cb"), "A61", new DateOnly(2026, 1, 5), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("79bf6ca3-8873-c08a-0f00-fe4e949a9f40"), "BRU-2026W01-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, 13, 1, 2026, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("a116e44f-e59a-c4fd-cfa5-0d80091b9cc8"), new Guid("2124fc97-a309-0652-abc9-4fd0ed92d375"), "A25", new DateOnly(2026, 1, 5), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("7a023fc4-95a9-9b69-d82d-ccd909e82d6f"), "BRU-2026W06-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 6, null, 13, 6, 2026, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("05ac25af-20b9-cb10-1970-f222fc63f33c"), new Guid("199a2d39-1c16-28a2-64d6-8e769b65e5d1"), "A30", new DateOnly(2026, 2, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("7b17e3bb-4325-054a-28bd-4d0d73fb3104"), "BRU-2026W09-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 9, null, 12, 9, 2026, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("34592d5e-2b32-2033-c42f-bcf9681240d7"), new Guid("585d1677-ab72-1f47-5b20-b50777e425b8"), "A21", new DateOnly(2026, 3, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("7fd69a50-e0a7-85cf-d8df-2d7d201bad31"), "BRU-2026W10-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 10, null, 14, 10, 2026, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("d735d3ef-77d8-66a2-47f5-2dce715eaf13"), new Guid("55b396a6-0dd1-3fa2-c58a-0f5a5d35e688"), "A46", new DateOnly(2026, 3, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("8640b9f5-0225-fa06-577f-aaf9e47fa30b"), "BRU-2026W08-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 8, null, 14, 8, 2026, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("d2221dec-071c-d380-b6f3-2515239f07aa"), new Guid("2fa10c48-6187-2fa7-3007-c901596d8db4"), "A44", new DateOnly(2026, 2, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("8d846f9b-2379-9784-06cd-591814e8bb17"), "BRU-2026W04-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 4, null, 15, 4, 2026, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("620a1279-0c69-662b-60ef-969ec6c3f016"), new Guid("cfb4638f-5607-d48b-47db-0c3e3e856c4d"), "A52", new DateOnly(2026, 1, 26), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("8e7741a5-c04d-3222-58c7-b152259ad012"), "BRU-2026W07-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 7, null, 15, 7, 2026, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("5af6689e-fa64-ff88-31fb-08102f12a834"), new Guid("709b6da2-9bec-c416-64d6-2f49e2e56330"), "A55", new DateOnly(2026, 2, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("90dca87e-6d6a-515e-d9d0-2b7a51cc8808"), "BRU-2026W01-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, 11, 1, 2026, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("14dd0381-2265-6a21-9a42-c71ca226e43b"), new Guid("5dc2dc56-b4e2-c15c-3675-42207ebddf43"), "A01", new DateOnly(2026, 1, 5), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("91c1c235-ee57-f753-bf41-78eb7afcc2e5"), "BRU-2026W02-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, 15, 2, 2026, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("66dbc7fb-4df0-aa06-41dd-d3ca1b342446"), new Guid("75c8778b-ad14-4a46-c947-b3a735af2f4f"), "A50", new DateOnly(2026, 1, 12), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("94efbaf7-ae9a-7668-d1b5-795398a0ea31"), "BRU-2026W11-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 11, null, 13, 11, 2026, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("d64353b1-93e1-a496-26ff-691787c8e81e"), new Guid("07497de8-9368-c560-3cb7-d06346fe9b24"), "A35", new DateOnly(2026, 3, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("9b71f4bb-858f-4086-cb2d-e5bbdd8ab475"), "BRU-2026W06-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 6, null, 14, 6, 2026, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("3e079aca-4440-deb3-f5e9-96cb4218d983"), new Guid("34340ac2-065d-dd6e-eb77-55fac19e80f1"), "A42", new DateOnly(2026, 2, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("9bf7bfc9-1c49-cca3-0e13-2e374b1e4a9f"), "BRU-2026W09-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 9, null, 11, 9, 2026, new DateTime(2026, 5, 25, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("40459bcf-c396-f2ab-d069-8ded074a050e"), new Guid("e263c185-81ec-8fc5-7322-1407afc5a283"), "A09", new DateOnly(2026, 3, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("9c6b6297-abbb-a445-4644-e323028f9713"), "BRU-2026W10-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 10, null, 12, 10, 2026, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("4b320969-841e-d690-341f-58e6531fccee"), new Guid("be0dd053-72d2-01fe-8c85-5c36587db2bf"), "A22", new DateOnly(2026, 3, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("9e63f9b4-d99c-a1c1-dd3f-332ba8c4f521"), "BRU-2026W05-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 5, null, 14, 5, 2026, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("db38eb15-818c-c146-8716-ee7785b75260"), new Guid("873516b9-97bb-9a9a-00d9-5b5cdbac4d27"), "A41", new DateOnly(2026, 2, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("9eb2026f-1207-c0c7-8c47-18003b9845b9"), "BRU-2026W06-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 6, null, 12, 6, 2026, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("3e545e34-2694-5967-8c89-cd5f6cbbb384"), new Guid("13299c45-d2e6-84b6-4df4-f0d0f6c2d11e"), "A18", new DateOnly(2026, 2, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("a1da183f-3523-8e85-7cb2-dd061d086641"), "BRU-2026W03-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, 13, 3, 2026, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("bacf6983-0d3b-ab2a-2543-5da3ede2b7cd"), new Guid("da3a9d48-3f78-db99-96e6-87bfc49bb10f"), "A27", new DateOnly(2026, 1, 19), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("a9742781-8e7b-bb2b-7418-1d4a1533bcc6"), "BRU-2026W05-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 5, null, 15, 5, 2026, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("b4fa3353-9e0e-78de-0449-d755225314f2"), new Guid("00b90bb0-8db2-1cfb-0327-be35fe8aacc1"), "A53", new DateOnly(2026, 2, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("ac4b8eba-aa3d-6a51-2506-c9094ab1d67a"), "BRU-2026W08-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 8, null, 15, 8, 2026, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("bedece19-6736-e923-2862-96210b55e498"), new Guid("15357db6-ebfe-1326-a885-6273969da2e9"), "A56", new DateOnly(2026, 2, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("accf9302-cca5-4318-df0e-8a81b6e50177"), "BRU-2026W03-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, 12, 3, 2026, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("929cc5b6-c4d2-aa3e-85c5-e096fdab1c73"), new Guid("7c4eb88a-13e4-a442-194e-9a6241a630ea"), "A15", new DateOnly(2026, 1, 19), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("aedf2095-966a-55a6-3f66-c0f935e7d7b3"), "BRU-2026W05-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 5, null, 12, 5, 2026, new DateTime(2026, 4, 27, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("8f8c7165-dd27-62f3-5f2d-e4e6521c4495"), new Guid("503ca22c-bcb5-6afa-15f7-f33037656b43"), "A17", new DateOnly(2026, 2, 2), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("b1178f1e-6c18-d433-d563-5b94c660652e"), "BRU-2026W02-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, 13, 2, 2026, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("d55b80ed-b3f5-4db9-bd93-4f4a782a9b75"), new Guid("4f4d37bb-9d24-c6c1-5c9d-142b0f11d6a9"), "A26", new DateOnly(2026, 1, 12), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("b647b959-23ac-8bad-fd8e-5a4c2d8d2400"), "BRU-2026W04-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 4, null, 12, 4, 2026, new DateTime(2026, 4, 20, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("18e22be9-5d28-4bf1-1ba3-c22c4ffed5c2"), new Guid("fd66fc90-0601-b6f4-f4f2-38ca7aad4788"), "A16", new DateOnly(2026, 1, 26), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("bcf11f72-4428-d387-a4a8-02bd78c3666d"), "BRU-2026W10-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 10, null, 13, 10, 2026, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("7044d7e8-2ec7-4382-9e99-e90e17408a53"), new Guid("f03cb7d7-2c91-d873-59f7-5656a5a66739"), "A34", new DateOnly(2026, 3, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("c4d6f035-5fc2-f29e-57a8-db2807751bea"), "BRU-2026W11-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 11, null, 15, 11, 2026, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("e41f4a3a-c68c-d34e-fd10-63d0bd4cda91"), new Guid("51ea2e21-9e60-7135-4ea6-da9e26328416"), "A59", new DateOnly(2026, 3, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("c78c2c40-6ec1-b881-0370-7ee2906400eb"), "BRU-2026W07-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 7, null, 12, 7, 2026, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("8692d172-9c54-c70f-0a4b-7531afdd5315"), new Guid("e16629ef-6ae9-5131-4bac-bbdc97570c6a"), "A19", new DateOnly(2026, 2, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("cea72642-2cdc-797e-8d12-979b801278e1"), "BRU-2026W06-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 6, null, 15, 6, 2026, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("a96bec8b-0a57-23e2-fadb-e6ece8c4fc44"), new Guid("b4e3dd74-5b14-5912-b5f9-8cab8b1f99b7"), "A54", new DateOnly(2026, 2, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("d34965da-2bdb-313d-5082-71f5af813194"), "BRU-2026W07-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 7, null, 11, 7, 2026, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("f8dcb0ea-b18e-2eae-cb9c-92ff5adc2aef"), new Guid("c6fe9877-04b3-5d76-9d3f-145f73cdae56"), "A07", new DateOnly(2026, 2, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e2accce2-d23a-3a54-5c17-b1d2224482c6"), "BRU-2026W02-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 2, null, 12, 2, 2026, new DateTime(2026, 4, 6, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("707742c8-ad7a-1f60-94e5-3b738c07a01f"), new Guid("cd3bb063-ab7a-6ea6-48f1-68976f952aff"), "A14", new DateOnly(2026, 1, 12), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e7982d2b-1dc9-da46-dc32-8621aa848104"), "BRU-2026W11-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 11, null, 12, 11, 2026, new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("241662a4-9a12-435a-586e-af8ad6eef8a8"), new Guid("0dda78e5-00b7-393e-5a90-7f6859f285bc"), "A23", new DateOnly(2026, 3, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("e8ece56c-61e6-74b6-0b97-534d0683bd2b"), "BRU-2026W06-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 6, null, 11, 6, 2026, new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("ce939943-00c8-dcbd-d42d-e2ac46db190a"), new Guid("d76875ee-8566-0097-8bce-c7277dc71f0d"), "A06", new DateOnly(2026, 2, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("ec6d55b1-8a3b-1bb0-deaf-5543f065d719"), "BRU-2026W03-016", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 3, null, 16, 3, 2026, new DateTime(2026, 4, 13, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("4a53240f-690c-44d4-bb22-9c47ba0fb78e"), new Guid("48b0b608-d5cf-d97f-3d9a-61dc75ece93a"), "A63", new DateOnly(2026, 1, 19), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("efef5c7a-fef5-cb63-e946-aac1b55c10a6"), "BRU-2026W10-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 10, null, 11, 10, 2026, new DateTime(2026, 6, 1, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("17e7a384-bd51-89c2-8193-bd3b7c020261"), new Guid("9843b1b3-edbe-0455-e187-8e10b75ef922"), "A10", new DateOnly(2026, 3, 9), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f1839d2e-b69a-8246-f084-ecb3686c2427"), "BRU-2026W12-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 12, null, 14, 12, 2026, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("0cbe447b-6bdf-d70b-5959-ea464cb4309a"), new Guid("b0327f6c-dc52-299c-3d03-ac92a981fc49"), "A48", new DateOnly(2026, 3, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f3cbd346-de34-0685-c0f7-b7ae526771d3"), "BRU-2026W12-011", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 12, null, 11, 12, 2026, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("7bf163f7-f62c-de3a-f0b3-b66153838322"), new Guid("b0c0273a-3d36-bd23-209a-fbe0470148d2"), "A12", new DateOnly(2026, 3, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f401172f-9a45-be8c-50bd-cb29c53155ef"), "BRU-2026W01-015", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 1, null, 15, 1, 2026, new DateTime(2026, 3, 30, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("6aa7429c-32a8-4048-3444-87a42644a94a"), new Guid("08120ced-a0f4-d723-2e3c-b56fb6fbd9f1"), "A49", new DateOnly(2026, 1, 5), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("f7939090-48dc-ac01-91b6-5ee6d726b46b"), "BRU-2026W07-014", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 7, null, 14, 7, 2026, new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("6e0e43eb-d5ae-1bc7-a6cc-4f791e1ec83a"), new Guid("6537d6a1-e2cb-ab1c-e1ae-78bea44625e0"), "A43", new DateOnly(2026, 2, 16), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("fc290ae9-7c3a-260e-a954-2ea64834a2c5"), "BRU-2026W08-012", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 8, null, 12, 8, 2026, new DateTime(2026, 5, 18, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("f4f01740-f6a4-2e29-5a7f-ab5ae460bc8e"), new Guid("713fe41e-9fa4-258d-b1e7-ef88517d84ea"), "A20", new DateOnly(2026, 2, 23), new Guid("11111111-1111-1111-1111-111111111111") },
                    { new Guid("fca1eee1-48c6-5ee8-3bc3-85822413adef"), "BRU-2026W12-013", new Guid("aaaaaaaa-1111-1111-1111-111111111111"), null, 12, null, 13, 12, 2026, new DateTime(2026, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "FullProgramme", "Alcohol", "Alcohol", new Guid("2b567f24-2645-3563-6dc7-256da1a473f9"), new Guid("e7a1923e-1376-9d8b-4591-6fee240adcca"), "A36", new DateOnly(2026, 3, 23), new Guid("11111111-1111-1111-1111-111111111111") }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("00f68a0a-53b8-5ab7-e176-14eed828e254"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("01e8dc83-38c7-9957-5162-5ec4cb51cdcf"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("02366ca6-52ad-b581-e56f-4dd0cabdd28e"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("134c0c73-ce8c-f811-39bd-1d1565dad54d"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("13fa1d94-9b8d-84f7-4eb2-569f75c41aa8"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("16074dfc-ccc1-fe81-6950-0ab846e6d057"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("180d3326-190d-4b88-990b-5892802a934f"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("1a5cf3de-d58b-e350-c364-7d07b124fed0"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("1aa99ba2-9c8f-17f6-b24b-48904c95c2e3"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("2055f945-0245-7319-7ee1-3dfac196e2d4"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("23e5c036-3d3a-c2eb-372c-704328b8da9c"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("28c3d6da-ae77-4890-ab58-f4bd4f67b45c"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("2e0b673c-8621-a6ee-a0db-8602bf25f3de"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("3744b0b0-bfc1-4999-605d-aab09481e411"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("38ed6aac-feb1-19b9-c06e-b27e78727a88"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("42a88115-701f-9715-2fc6-4584351927de"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("43f6fa90-dcf5-0e36-08c3-891d8b55ef2a"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("469a8b69-f59d-fc3d-0362-aa35caf37a02"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("49f1866f-25a5-fa19-419c-bb58e20f0f14"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("4eae6e29-64e3-48bc-080d-6a2aa4977f34"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("55b88b15-b85a-e235-8ff1-0f6190b28df2"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("5fc43550-8ade-cc6b-79bc-baf4af0422f5"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("6b76e54f-ffd6-444a-b72c-c349bb2dcb02"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("72899151-6c8f-6778-906a-fc5444d8d318"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("766ac4a7-5489-7fc5-b231-c6a29dbf125c"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("79bf6ca3-8873-c08a-0f00-fe4e949a9f40"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("7a023fc4-95a9-9b69-d82d-ccd909e82d6f"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("7b17e3bb-4325-054a-28bd-4d0d73fb3104"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("7fd69a50-e0a7-85cf-d8df-2d7d201bad31"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("8640b9f5-0225-fa06-577f-aaf9e47fa30b"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("8d846f9b-2379-9784-06cd-591814e8bb17"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("8e7741a5-c04d-3222-58c7-b152259ad012"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("90dca87e-6d6a-515e-d9d0-2b7a51cc8808"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("91c1c235-ee57-f753-bf41-78eb7afcc2e5"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("94efbaf7-ae9a-7668-d1b5-795398a0ea31"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("9b71f4bb-858f-4086-cb2d-e5bbdd8ab475"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("9bf7bfc9-1c49-cca3-0e13-2e374b1e4a9f"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("9c6b6297-abbb-a445-4644-e323028f9713"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("9e63f9b4-d99c-a1c1-dd3f-332ba8c4f521"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("9eb2026f-1207-c0c7-8c47-18003b9845b9"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("a1da183f-3523-8e85-7cb2-dd061d086641"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("a9742781-8e7b-bb2b-7418-1d4a1533bcc6"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("ac4b8eba-aa3d-6a51-2506-c9094ab1d67a"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("accf9302-cca5-4318-df0e-8a81b6e50177"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("aedf2095-966a-55a6-3f66-c0f935e7d7b3"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("b1178f1e-6c18-d433-d563-5b94c660652e"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("b647b959-23ac-8bad-fd8e-5a4c2d8d2400"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("bcf11f72-4428-d387-a4a8-02bd78c3666d"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("c4d6f035-5fc2-f29e-57a8-db2807751bea"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("c78c2c40-6ec1-b881-0370-7ee2906400eb"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("cea72642-2cdc-797e-8d12-979b801278e1"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("d34965da-2bdb-313d-5082-71f5af813194"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("e2accce2-d23a-3a54-5c17-b1d2224482c6"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("e7982d2b-1dc9-da46-dc32-8621aa848104"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("e8ece56c-61e6-74b6-0b97-534d0683bd2b"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("ec6d55b1-8a3b-1bb0-deaf-5543f065d719"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("efef5c7a-fef5-cb63-e946-aac1b55c10a6"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("f1839d2e-b69a-8246-f084-ecb3686c2427"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("f3cbd346-de34-0685-c0f7-b7ae526771d3"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("f401172f-9a45-be8c-50bd-cb29c53155ef"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("f7939090-48dc-ac01-91b6-5ee6d726b46b"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("fc290ae9-7c3a-260e-a954-2ea64834a2c5"));

            migrationBuilder.DeleteData(
                table: "ResidentProgrammeEpisode",
                keyColumn: "Id",
                keyValue: new Guid("fca1eee1-48c6-5ee8-3bc3-85822413adef"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("02d5cf68-9ba3-8414-b815-04bfcf3d00cc"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("05ac25af-20b9-cb10-1970-f222fc63f33c"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("067a031b-64f3-f757-3b13-bcc7696bc492"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("0cbe447b-6bdf-d70b-5959-ea464cb4309a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("14dd0381-2265-6a21-9a42-c71ca226e43b"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("17e7a384-bd51-89c2-8193-bd3b7c020261"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("18e22be9-5d28-4bf1-1ba3-c22c4ffed5c2"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("1b828d21-1e5a-78f7-b39c-be261ba424b0"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("241662a4-9a12-435a-586e-af8ad6eef8a8"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2b567f24-2645-3563-6dc7-256da1a473f9"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2deef4a1-f6c0-4fe7-dc65-cc9b800eaf3e"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("34592d5e-2b32-2033-c42f-bcf9681240d7"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e079aca-4440-deb3-f5e9-96cb4218d983"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e545e34-2694-5967-8c89-cd5f6cbbb384"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("40459bcf-c396-f2ab-d069-8ded074a050e"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4892cd18-2942-732c-bd62-a53d80d6a3c2"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4a53240f-690c-44d4-bb22-9c47ba0fb78e"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4b320969-841e-d690-341f-58e6531fccee"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4c169242-6e08-6702-70f9-603ca34de470"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5af6689e-fa64-ff88-31fb-08102f12a834"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5b127d66-826c-3e6b-92b2-009ecf6329b2"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("613c5f0f-9465-d1cc-bb6b-8b0e334b5286"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("620a1279-0c69-662b-60ef-969ec6c3f016"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("66dbc7fb-4df0-aa06-41dd-d3ca1b342446"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("67aca680-ed16-0e43-aaa0-5e3c8fcf9224"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6aa7429c-32a8-4048-3444-87a42644a94a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6b32d043-a1ae-71f1-03f0-1df665103c8b"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6e0e43eb-d5ae-1bc7-a6cc-4f791e1ec83a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7044d7e8-2ec7-4382-9e99-e90e17408a53"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("707742c8-ad7a-1f60-94e5-3b738c07a01f"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7bf163f7-f62c-de3a-f0b3-b66153838322"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8692d172-9c54-c70f-0a4b-7531afdd5315"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("878bf789-24b9-7555-1fd9-eb230a0b377a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8f8c7165-dd27-62f3-5f2d-e4e6521c4495"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("929cc5b6-c4d2-aa3e-85c5-e096fdab1c73"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("99b1f5fa-05de-faa8-3f0a-6b0209525bbe"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("9c950c36-e912-12dd-aa43-0ee5632279e5"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a026c6d0-c585-bc5a-7b57-86a02ae7f77a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a116e44f-e59a-c4fd-cfa5-0d80091b9cc8"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a96bec8b-0a57-23e2-fadb-e6ece8c4fc44"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b1fafa6e-9779-5c14-52c7-63d89bbf884a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b4fa3353-9e0e-78de-0449-d755225314f2"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9278ec8-7e71-33f9-76bf-867c4533e6bf"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9d2af6f-d8fa-92be-e08c-881148a79a9b"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bacf6983-0d3b-ab2a-2543-5da3ede2b7cd"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bc1af24a-7d55-b046-ccca-14ecc5bd2801"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bedece19-6736-e923-2862-96210b55e498"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("c81d7bbf-e761-983c-9ed0-04671b5e64b1"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ce939943-00c8-dcbd-d42d-e2ac46db190a"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d2221dec-071c-d380-b6f3-2515239f07aa"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d55b80ed-b3f5-4db9-bd93-4f4a782a9b75"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d64353b1-93e1-a496-26ff-691787c8e81e"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d735d3ef-77d8-66a2-47f5-2dce715eaf13"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("db38eb15-818c-c146-8716-ee7785b75260"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e41f4a3a-c68c-d34e-fd10-63d0bd4cda91"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e641d55e-25f9-d223-0541-7b89a46233db"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e7b29d33-22b4-f43f-6c1d-3ea2552c5f11"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ebf094cc-d4f6-2fee-71e9-89382875c905"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f1674ab5-6b49-716d-b8c8-cb768c002aeb"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f2ead506-547d-8eeb-2dd0-075d2fa36dfe"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f4f01740-f6a4-2e29-5a7f-ab5ae460bc8e"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f8dcb0ea-b18e-2eae-cb9c-92ff5adc2aef"));

            migrationBuilder.DeleteData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("fa11406b-65af-f777-c35e-5b733790670d"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("00b34d2a-2563-516d-beb4-9922b72c5759"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("00b90bb0-8db2-1cfb-0327-be35fe8aacc1"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("02646b52-5167-05b5-40ad-0cbc1892ac6d"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("04c3d3cf-9d5a-7dd7-1581-60b1cb718a3f"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("07497de8-9368-c560-3cb7-d06346fe9b24"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("08120ced-a0f4-d723-2e3c-b56fb6fbd9f1"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("0dda78e5-00b7-393e-5a90-7f6859f285bc"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("0f9f762e-44bc-6e58-2ca1-87dc67352e68"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("13299c45-d2e6-84b6-4df4-f0d0f6c2d11e"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("1341c05a-6afd-d1ce-952c-91176e737f72"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("14c795dc-b206-b1d9-8c6f-c1f5050da462"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("15357db6-ebfe-1326-a885-6273969da2e9"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("199a2d39-1c16-28a2-64d6-8e769b65e5d1"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("1b12ae0e-ffa8-66e3-113b-03e62bc6b7cb"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("1f34a8d0-03c2-9f7c-e206-1c0c7a15fd97"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2124fc97-a309-0652-abc9-4fd0ed92d375"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2552a9d2-4ef1-7a45-34e6-6d563b69d158"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2d914a98-cf47-8961-464c-12afa1ebd069"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2e5a4001-36d4-593a-a79b-a9004917d5b6"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("2fa10c48-6187-2fa7-3007-c901596d8db4"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("34340ac2-065d-dd6e-eb77-55fac19e80f1"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("42714c52-cd70-d620-b3e3-371d2f12dc61"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("46e3ee33-fba9-6ab6-7cfe-7d161b6d2ae0"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("48b0b608-d5cf-d97f-3d9a-61dc75ece93a"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("4f4d37bb-9d24-c6c1-5c9d-142b0f11d6a9"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("503ca22c-bcb5-6afa-15f7-f33037656b43"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("51ea2e21-9e60-7135-4ea6-da9e26328416"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("55b396a6-0dd1-3fa2-c58a-0f5a5d35e688"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("585d1677-ab72-1f47-5b20-b50777e425b8"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("5dc2dc56-b4e2-c15c-3675-42207ebddf43"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("6312a599-defc-1b06-de3c-c2607597830d"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("6537d6a1-e2cb-ab1c-e1ae-78bea44625e0"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("709b6da2-9bec-c416-64d6-2f49e2e56330"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("713fe41e-9fa4-258d-b1e7-ef88517d84ea"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("714f646c-412d-bd28-f70e-99cb8922e121"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("75c8778b-ad14-4a46-c947-b3a735af2f4f"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("77547a3f-3c0f-0b43-5ebf-8b2839b0cdda"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("7c4eb88a-13e4-a442-194e-9a6241a630ea"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("8038ea42-33e8-a836-f0e7-31a72ae613d7"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("83c32ed7-b746-6f05-8544-91d0392cfbee"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("873516b9-97bb-9a9a-00d9-5b5cdbac4d27"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("9843b1b3-edbe-0455-e187-8e10b75ef922"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("b0327f6c-dc52-299c-3d03-ac92a981fc49"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("b0c0273a-3d36-bd23-209a-fbe0470148d2"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("b1913701-307d-4ec1-08dd-7611688c321a"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("b4e3dd74-5b14-5912-b5f9-8cab8b1f99b7"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("ba61d2b6-01fb-7047-ed50-fe22edb83c53"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("be0dd053-72d2-01fe-8c85-5c36587db2bf"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("c2ace2ed-67ea-60ef-187a-08e631552491"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("c6fe9877-04b3-5d76-9d3f-145f73cdae56"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("cd3bb063-ab7a-6ea6-48f1-68976f952aff"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("cfb4638f-5607-d48b-47db-0c3e3e856c4d"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("d76875ee-8566-0097-8bce-c7277dc71f0d"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("da3a9d48-3f78-db99-96e6-87bfc49bb10f"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("dd11f30c-4c61-7bbd-ddee-b6e6edc11f4b"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("de24069e-8297-9016-cc8d-155d271e8b7a"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("e16629ef-6ae9-5131-4bac-bbdc97570c6a"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("e263c185-81ec-8fc5-7322-1407afc5a283"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("e7a1923e-1376-9d8b-4591-6fee240adcca"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("e984995c-6c92-17d0-4039-7502c1f948e6"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("f03cb7d7-2c91-d873-59f7-5656a5a66739"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("f3ae12b7-0031-14dd-85aa-dec722cd3f81"));

            migrationBuilder.DeleteData(
                table: "Resident",
                keyColumn: "Id",
                keyValue: new Guid("fd66fc90-0601-b6f4-f4f2-38ca7aad4788"));

            migrationBuilder.UpdateData(
                table: "Unit",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CurrentOccupancy",
                value: 92);
        }
    }
}
