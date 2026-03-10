using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuoteOfTheDaySystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Quote",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Attribution = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    SourceWork = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    SourceNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    PronunciationGuide = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TagsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quote", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnitQuoteCuration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    QuoteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Weight = table.Column<int>(type: "int", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true),
                    PinnedFrom = table.Column<DateOnly>(type: "date", nullable: true),
                    PinnedTo = table.Column<DateOnly>(type: "date", nullable: true),
                    IsExcluded = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitQuoteCuration", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UnitQuoteCuration_Quote_QuoteId",
                        column: x => x.QuoteId,
                        principalTable: "Quote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Quote_Attribution",
                table: "Quote",
                column: "Attribution");

            migrationBuilder.CreateIndex(
                name: "IX_Quote_Language_IsActive",
                table: "Quote",
                columns: new[] { "Language", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_UnitQuoteCuration_QuoteId",
                table: "UnitQuoteCuration",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_UnitQuoteCuration_UnitId_QuoteId",
                table: "UnitQuoteCuration",
                columns: new[] { "UnitId", "QuoteId" },
                unique: true);

            var seedPath = @"C:\Acutis\media\quoutes\quotes.seed.json";
            if (!File.Exists(seedPath))
            {
                throw new FileNotFoundException($"Quote seed file was not found: {seedPath}");
            }

            var nowUtc = DateTime.UtcNow;
            var seedJson = File.ReadAllText(seedPath);
            var quotes = JsonSerializer.Deserialize<List<SeedQuote>>(seedJson) ?? new List<SeedQuote>();
            foreach (var quote in quotes)
            {
                var tagsJson = JsonSerializer.Serialize(quote.tags ?? new List<string>());
                var sql = $"IF NOT EXISTS (SELECT 1 FROM [Quote] WHERE [Id] = '{quote.id}') " +
                          "BEGIN " +
                          "INSERT INTO [Quote] ([Id], [Text], [Attribution], [SourceWork], [SourceNotes], [Language], [PronunciationGuide], [TagsJson], [IsActive], [CreatedAt], [CreatedBy], [ModifiedAt], [ModifiedBy]) " +
                          $"VALUES ('{quote.id}', {SqlLiteral(quote.text)}, {SqlLiteral(quote.attribution)}, {SqlLiteral(quote.source_work)}, {SqlLiteral(quote.source_notes)}, {SqlLiteral(quote.language)}, {SqlLiteral(quote.pronunciation_guide)}, {SqlLiteral(tagsJson)}, {(quote.is_active ? 1 : 0)}, '{nowUtc:O}', 'seed', '{nowUtc:O}', 'seed'); " +
                          "END";

                migrationBuilder.Sql(sql);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UnitQuoteCuration");

            migrationBuilder.DropTable(
                name: "Quote");
        }

        private static string SqlLiteral(string value)
        {
            if (value is null)
            {
                return "NULL";
            }

            return $"N'{value.Replace("'", "''")}'";
        }

        private sealed class SeedQuote
        {
            public Guid id { get; set; }
            public string text { get; set; } = string.Empty;
            public string attribution { get; set; } = string.Empty;
            public string source_work { get; set; }
            public string source_notes { get; set; }
            public string language { get; set; } = "en";
            public string pronunciation_guide { get; set; }
            public List<string> tags { get; set; }
            public bool is_active { get; set; }
        }
    }
}
