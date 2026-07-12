using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddListeningGroupTherapyWeek : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "GroupTherapySubjectTemplate",
                columns: new[] { "Id", "IntroText", "IsActive", "ProgramCode", "Topic", "UnitCode", "WeekNumber" },
                values: new object[] { new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa"), "Week focus: strengthening active listening in recovery groups. Residents practice presence, reflection, and empathy so conversations become safer, clearer, and more supportive.", true, "bruree_alcohol_gt", "Listening", "alcohol", 5 });

            migrationBuilder.InsertData(
                table: "GroupTherapyDailyQuestion",
                columns: new[] { "Id", "DayNumber", "IsActive", "QuestionText", "SortOrder", "SubjectTemplateId" },
                values: new object[,]
                {
                    { new Guid("098801ef-c165-979c-eac7-3272d84230ec"), 3, true, "How does better listening reduce conflict in recovery settings?", 1, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("1bc8d546-b918-e0a7-456f-89d11783805a"), 2, true, "What phrase can you use to show empathy in a difficult conversation?", 3, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("31d3c554-2e1c-0b05-d69f-d624bc872265"), 3, true, "How can listening improve accountability between peers?", 2, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("574598cf-bc96-ff2b-e7a6-e64b939bd722"), 2, true, "What gets in the way of listening when emotions run high?", 2, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("8102daea-a52d-c9f0-ff85-676cb0658c80"), 1, true, "What does active listening look like in group therapy?", 1, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("8d533f76-de71-0bcf-982a-2ccf134075b4"), 1, true, "When do you notice yourself listening to reply rather than to understand?", 2, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("dd02f7e4-8592-ca0a-597e-40a1fe9570ad"), 1, true, "What is one habit that would improve how you listen this week?", 3, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("e6cfdd9f-7858-32ae-44f8-7f6f9a64eaa2"), 3, true, "What listening commitment will you keep before next session?", 3, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") },
                    { new Guid("f46ab704-a436-695d-859d-6984e7b2dd56"), 2, true, "How can you reflect back what someone said without judging?", 1, new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa") }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("098801ef-c165-979c-eac7-3272d84230ec"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("1bc8d546-b918-e0a7-456f-89d11783805a"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("31d3c554-2e1c-0b05-d69f-d624bc872265"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("574598cf-bc96-ff2b-e7a6-e64b939bd722"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("8102daea-a52d-c9f0-ff85-676cb0658c80"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("8d533f76-de71-0bcf-982a-2ccf134075b4"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("dd02f7e4-8592-ca0a-597e-40a1fe9570ad"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("e6cfdd9f-7858-32ae-44f8-7f6f9a64eaa2"));

            migrationBuilder.DeleteData(
                table: "GroupTherapyDailyQuestion",
                keyColumn: "Id",
                keyValue: new Guid("f46ab704-a436-695d-859d-6984e7b2dd56"));

            migrationBuilder.DeleteData(
                table: "GroupTherapySubjectTemplate",
                keyColumn: "Id",
                keyValue: new Guid("e55f9fc8-a0e7-1894-6830-9b189760b6aa"));
        }
    }
}
