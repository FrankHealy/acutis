using System;
using System.Collections.Generic;
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

            var nowUtc = DateTime.UtcNow;
            var seedJson = GetEmbeddedQuoteSeedJson();
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

        private static string GetEmbeddedQuoteSeedJson() => """
[
  {
    "id": "6d3c7c20-0b4b-4b34-9c5f-8b77a53f1c01",
    "text": "The unexamined life is not worth living.",
    "attribution": "Socrates (Plato, Apology 38a)",
    "source_work": "Plato, Apology",
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["classic", "philosophy"],
    "is_active": true
  },
  {
    "id": "d8b1c9a6-4a3d-4ad0-8b53-6f7b0c9a8a04",
    "text": "The Moving Finger writes; and, having writ, moves on.",
    "attribution": "Omar Khayyam (trans. Edward FitzGerald)",
    "source_work": "Rubaiyat (FitzGerald translation)",
    "source_notes": "Curated line; intentionally excludes the 'jug of wine' stanza.",
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["poetry", "classic"],
    "is_active": true
  },
  {
    "id": "b0b2c7b2-1b8b-4ef4-9e5f-1c1b6d8a5f02",
    "text": "A book must be the axe for the frozen sea within us.",
    "attribution": "Franz Kafka",
    "source_work": "Letter to Oskar Pollak (27 Jan 1904)",
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["literature", "modern"],
    "is_active": true
  },
  {
    "id": "4fb17f84-9e5e-4c93-95aa-1c04e77b4c21",
    "text": "It was necessary for man's salvation that there should be a knowledge revealed by God besides philosophical science built up by human reason.",
    "attribution": "Thomas Aquinas",
    "source_work": "Summa Theologiae, I, q.1, a.1",
    "source_notes": "Verified Aquinas text rendered in standard English translation.",
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["theology", "verified"],
    "is_active": true
  },
  {
    "id": "a5e35b73-3f7e-4d36-ae8a-1f2a4d92c503",
    "text": "Grant me chastity and continence, but not yet.",
    "attribution": "Augustine of Hippo",
    "source_work": "Confessions, Book VIII",
    "source_notes": "Accepted modern rendering across translations.",
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["late-antique", "wry"],
    "is_active": true
  },
  {
    "id": "f2a8e2c1-7d3d-4b59-9af9-92d2d0f10c06",
    "text": "Things fall apart; the centre cannot hold;",
    "attribution": "W. B. Yeats",
    "source_work": "The Second Coming",
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["irish", "poetry"],
    "is_active": true
  },
  {
    "id": "3d4e5f60-7a8b-4c9d-8e7f-6a5b4c3d2e08",
    "text": "I am a drinker with a writing problem.",
    "attribution": "Brendan Behan",
    "source_work": null,
    "source_notes": "Popular attribution; retained with note.",
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["irish", "wry"],
    "is_active": true
  },
  {
    "id": "4e5f6071-8b9c-4d0e-9f8a-7b6c5d4e3f09",
    "text": "A pint of plain is your only man.",
    "attribution": "Myles na gCopaleen (Flann O'Brien persona)",
    "source_work": "Cruiskeen Lawn columns",
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["irish", "comic"],
    "is_active": true
  },
  {
    "id": "5f607182-9cad-4e1f-a09b-8c7d6e5f4a10",
    "text": "Those are my principles, and if you don't like them... well, I have others.",
    "attribution": "Groucho Marx",
    "source_work": "Duck Soup (1933)",
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["comic", "satire"],
    "is_active": true
  },
  {
    "id": "01872b7c-8f6b-4a8d-b67d-5f478b993ece",
    "text": "Outside of a dog, a book is man's best friend. Inside of a dog it's too dark to read.",
    "attribution": "Groucho Marx",
    "source_work": null,
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["comic", "books"],
    "is_active": true
  },
  {
    "id": "60718293-acde-4f20-b1ac-9d8e7f6a5b11",
    "text": "Trying is the first step toward failure.",
    "attribution": "Homer Simpson",
    "source_work": "The Simpsons, Realty Bites",
    "source_notes": null,
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["comic", "popculture"],
    "is_active": true
  },
  {
    "id": "718293a4-bced-4021-c2bd-ae9f807b6c12",
    "text": "Bez pracy nie ma koÅ‚aczy.",
    "attribution": "Polish proverb",
    "source_work": null,
    "source_notes": null,
    "language": "pl",
    "pronunciation_guide": "bez PRAH-tsee nye mah koh-WAH-chih",
    "tags": ["proverb", "pl"],
    "is_active": true
  },
  {
    "id": "8293a4b5-cdef-4122-d3ce-bf0a918c7d13",
    "text": "Nie ma tego zÅ‚ego, co by na dobre nie wyszÅ‚o.",
    "attribution": "Polish proverb",
    "source_work": null,
    "source_notes": null,
    "language": "pl",
    "pronunciation_guide": "nye mah TEH-goh ZWEH-goh, tsoh bih nah DOH-breh nye VIH-shwoh",
    "tags": ["proverb", "pl"],
    "is_active": true
  },
  {
    "id": "93a4b5c6-def0-4233-e4df-c01ba29d8e14",
    "text": "To one who has faith, no explanation is necessary. To one without faith, no explanation is possible.",
    "attribution": "Often misattributed to Thomas Aquinas",
    "source_work": null,
    "source_notes": "Disputed attribution; intentionally retained as inactive reference.",
    "language": "en",
    "pronunciation_guide": null,
    "tags": ["disputed", "misattributed"],
    "is_active": false
  }
]
""";

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
