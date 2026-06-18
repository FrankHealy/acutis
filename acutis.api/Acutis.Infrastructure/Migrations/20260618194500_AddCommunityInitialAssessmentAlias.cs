using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunityInitialAssessmentAlias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [FormDefinition]
                SET [Status] = N'published'
                WHERE [Code] = N'community_initial_assessment'
                  AND [Status] = N'active';

                DELETE FROM [FormDefinition]
                WHERE [Id] = '8fc0426a-1a3c-41c1-b7a4-9867801efa8d';

                INSERT INTO [FormDefinition]
                    ([Id], [Code], [CreatedAt], [DescriptionKey], [RulesJson], [SchemaJson], [Status], [TitleKey], [UiJson], [Version])
                SELECT
                    '8fc0426a-1a3c-41c1-b7a4-9867801efa8d',
                    N'community_initial_assessment',
                    '2026-06-18T19:45:00.0000000Z',
                    [DescriptionKey],
                    [RulesJson],
                    [SchemaJson],
                    N'active',
                    [TitleKey],
                    [UiJson],
                    1
                FROM [FormDefinition]
                WHERE [Code] = N'alcohol_screening_call'
                  AND [Version] = 6;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("8fc0426a-1a3c-41c1-b7a4-9867801efa8d"));
        }
    }
}
