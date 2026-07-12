using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedVideos : Migration
    {
        private const string EmbeddedSeedJson = """
[{"id":"nova_addiction_pbs","title":"Addiction - Full Documentary (NOVA | PBS)","url":"https://www.youtube.com/watch?v=qJ-qX3yrxC0","lengthSeconds":2160,"description":"Science-led documentary explaining addiction mechanisms and treatment realities.","source":"YouTube","language":"en","tags":["detox-safe","education","science","documentary"],"isActive":true},{"id":"real_stories_addiction_hope","title":"Real Stories of Addiction and Hope","url":"https://www.youtube.com/watch?v=hcUf9jrgjek","lengthSeconds":3000,"description":"First-person accounts of addiction and recovery; varied perspectives, steady tone.","source":"YouTube","language":"en","tags":["detox-safe","lived-experience","documentary","recovery"],"isActive":true},{"id":"breaking_the_chains_northants","title":"Breaking the Chains of Addiction","url":"https://www.youtube.com/watch?v=qT8VfNvC1Mw","lengthSeconds":2880,"description":"Northamptonshire recovery stories; honest, community-focused, non-sensational.","source":"YouTube","language":"en","tags":["detox-safe","lived-experience","community","recovery"],"isActive":true},{"id":"break_the_chain_jordan","title":"Jordan's Addiction Recovery Story | BREAK THE CHAIN","url":"https://www.youtube.com/watch?v=_Dd8UINnIaQ","lengthSeconds":3000,"description":"Long-form personal recovery story; supportive framing and reflection.","source":"YouTube","language":"en","tags":["detox-safe","lived-experience","recovery"],"isActive":true},{"id":"break_the_chain_helen","title":"Helen's Addiction Recovery Story | BREAK THE CHAIN (Full)","url":"https://www.youtube.com/watch?v=7SkzS4YFy-s","lengthSeconds":3000,"description":"Long-form personal account; impact on relationships and rebuilding.","source":"YouTube","language":"en","tags":["detox-safe","lived-experience","recovery"],"isActive":true},{"id":"only_human_alcohol_took_over","title":"How Alcohol Took Over My Life: Addiction And Recovery","url":"https://www.youtube.com/watch?v=wk8cvg3TwOw","lengthSeconds":2700,"description":"Alcohol-focused lived experience documentary; consequences and change process.","source":"YouTube","language":"en","tags":["detox-safe","lived-experience","alcohol","recovery"],"isActive":true},{"id":"through_a_blue_lens_nfb","title":"THROUGH A BLUE LENS | Full Documentary (NFB)","url":"https://www.youtube.com/watch?v=gwFRsfATaag","lengthSeconds":3120,"description":"Stark street-level documentary; mature subject matter (use discretion in detox).","source":"YouTube","language":"en","tags":["lived-experience","documentary","mature","staff-discretion"],"isActive":true},{"id":"frontline_opioids_inc","title":"Opioids, Inc. | FRONTLINE (PBS/FT)","url":"https://www.pbs.org/video/opioids-inc-x1xeg9/","lengthSeconds":3263,"description":"Investigative documentary on an opioid company's practices and system failures.","source":"PBS","language":"en","tags":["detox-safe","education","investigative","opioids","policy"],"isActive":true},{"id":"frontline_chasing_heroin","title":"Chasing Heroin | FRONTLINE (PBS)","url":"https://www.pbs.org/wgbh/frontline/documentary/chasing-heroin/","lengthSeconds":3240,"description":"Public-health framing of the opioid/heroin crisis and what helps recovery.","source":"PBS","language":"en","tags":["detox-safe","education","documentary","opioids","public-health"],"isActive":true},{"id":"overdosed_hidden_opioid_crisis","title":"Overdosed | The Hidden Opioid Crisis | Full Documentary","url":"https://www.youtube.com/watch?v=LX3BBbBfMco","lengthSeconds":3000,"description":"Rural community impact of opioid crisis; personal and systemic angles.","source":"YouTube","language":"en","tags":["detox-safe","lived-experience","opioids","documentary"],"isActive":true},{"id":"breaking_points_teen_stress","title":"BREAKING POINTS | Partnership to End Addiction","url":"https://www.youtube.com/watch?v=SaiGJzsfG30","lengthSeconds":1800,"description":"Youth stress and coping; prevention-oriented framing.","source":"YouTube","language":"en","tags":["detox-safe","education","youth","prevention"],"isActive":true},{"id":"american_epidemic_wsj","title":"American Epidemic: The Nation's Struggle With Opioid Addiction (WSJ)","url":"https://www.youtube.com/watch?v=nNj89ohoYQ0","lengthSeconds":2700,"description":"WSJ documentary on opioid addiction impact and families' experiences.","source":"YouTube","language":"en","tags":["detox-safe","education","opioids","documentary"],"isActive":true}]
""";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Video",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    LengthSeconds = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TagsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ModifiedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Video", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnitVideoCuration",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VideoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true),
                    IsExcluded = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitVideoCuration", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UnitVideoCuration_Video_VideoId",
                        column: x => x.VideoId,
                        principalTable: "Video",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UnitVideoCuration_UnitId_VideoId",
                table: "UnitVideoCuration",
                columns: new[] { "UnitId", "VideoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UnitVideoCuration_VideoId",
                table: "UnitVideoCuration",
                column: "VideoId");

            migrationBuilder.CreateIndex(
                name: "IX_Video_IsActive_Title",
                table: "Video",
                columns: new[] { "IsActive", "Title" });

            migrationBuilder.CreateIndex(
                name: "IX_Video_Key",
                table: "Video",
                column: "Key",
                unique: true);

            var now = DateTime.UtcNow;
            var rows = LoadSeedRows();
            foreach (var row in rows)
            {
                var id = CreateDeterministicGuid($"video:{row.Id}");
                var tagsJson = JsonSerializer.Serialize(row.Tags ?? Array.Empty<string>());
                migrationBuilder.Sql($"""
IF EXISTS (SELECT 1 FROM [Video] WHERE [Key] = {SqlLiteral(row.Id)})
BEGIN
    UPDATE [Video]
    SET
        [Title] = {SqlLiteral(row.Title)},
        [Url] = {SqlLiteral(row.Url)},
        [LengthSeconds] = {row.LengthSeconds},
        [Description] = {SqlLiteral(row.Description)},
        [Source] = {SqlLiteral(row.Source)},
        [Language] = {SqlLiteral(row.Language)},
        [TagsJson] = {SqlLiteral(tagsJson)},
        [IsActive] = {(row.IsActive ? 1 : 0)},
        [ModifiedAtUtc] = {SqlLiteral(now.ToString("O"))},
        [ModifiedBy] = N'seed'
    WHERE [Key] = {SqlLiteral(row.Id)};
END
ELSE
BEGIN
    INSERT INTO [Video]
    (
        [Id], [Key], [Title], [Url], [LengthSeconds], [Description], [Source],
        [Language], [TagsJson], [IsActive], [CreatedAtUtc], [CreatedBy], [ModifiedAtUtc], [ModifiedBy]
    )
    VALUES
    (
        {SqlLiteral(id.ToString())}, {SqlLiteral(row.Id)}, {SqlLiteral(row.Title)}, {SqlLiteral(row.Url)},
        {row.LengthSeconds}, {SqlLiteral(row.Description)}, {SqlLiteral(row.Source)},
        {SqlLiteral(row.Language)}, {SqlLiteral(tagsJson)}, {(row.IsActive ? 1 : 0)},
        {SqlLiteral(now.ToString("O"))}, N'seed', {SqlLiteral(now.ToString("O"))}, N'seed'
    );
END
""");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UnitVideoCuration");

            migrationBuilder.DropTable(
                name: "Video");
        }

        private static SeedVideoRow[] LoadSeedRows()
        {
            var json = EmbeddedSeedJson;
            var rows = JsonSerializer.Deserialize<SeedVideoRow[]>(json, new JsonSerializerOptions(JsonSerializerDefaults.Web))
                ?? Array.Empty<SeedVideoRow>();
            return rows.Where(x => !string.IsNullOrWhiteSpace(x.Id)).ToArray();
        }

        private static Guid CreateDeterministicGuid(string value)
        {
            var hash = MD5.HashData(Encoding.UTF8.GetBytes(value));
            return new Guid(hash);
        }

        private static string SqlLiteral(string value)
        {
            if (value is null)
            {
                return "NULL";
            }

            return $"N'{value.Replace("'", "''")}'";
        }

        private sealed class SeedVideoRow
        {
            public string Id { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Url { get; set; } = string.Empty;
            public int LengthSeconds { get; set; }
            public string Description { get; set; } = string.Empty;
            public string Source { get; set; } = string.Empty;
            public string Language { get; set; } = "en";
            public string[] Tags { get; set; } = Array.Empty<string>();
            public bool IsActive { get; set; } = true;
        }
    }
}
