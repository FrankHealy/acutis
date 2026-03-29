using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SplitResidentCaseReferralReferenceFromCallLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ReferralCallId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE rc
                SET rc.ReferralCallId = TRY_CONVERT(uniqueidentifier, rc.ReferralReference)
                FROM ResidentCase rc
                WHERE rc.ReferralCallId IS NULL
                  AND TRY_CONVERT(uniqueidentifier, rc.ReferralReference) IS NOT NULL;
                """);

            migrationBuilder.Sql(
                """
                ;WITH CanonicalBase AS (
                    SELECT
                        rc.Id,
                        Prefix =
                            UPPER(LEFT(COALESCE(NULLIF(c.Code, ''), 'CTR') + 'XXX', 3)) + '-' +
                            UPPER(LEFT(COALESCE(NULLIF(u.Code, ''), 'GEN') + 'XXX', 3)) + '-' +
                            RIGHT(CONCAT('0', YEAR(COALESCE(rc.ReferralReceivedAtUtc, rc.OpenedAtUtc)) % 100), 2) + '-' +
                            RIGHT(CONCAT('0', DATEPART(ISO_WEEK, COALESCE(rc.ReferralReceivedAtUtc, rc.OpenedAtUtc))), 2),
                        Seq = ROW_NUMBER() OVER (
                            PARTITION BY
                                rc.CentreId,
                                rc.UnitId,
                                YEAR(COALESCE(rc.ReferralReceivedAtUtc, rc.OpenedAtUtc)),
                                DATEPART(ISO_WEEK, COALESCE(rc.ReferralReceivedAtUtc, rc.OpenedAtUtc))
                            ORDER BY COALESCE(rc.ReferralReceivedAtUtc, rc.OpenedAtUtc), rc.Id)
                    FROM ResidentCase rc
                    LEFT JOIN Centre c ON c.Id = rc.CentreId
                    LEFT JOIN Unit u ON u.Id = rc.UnitId
                    WHERE rc.ReferralReference IS NULL
                       OR TRY_CONVERT(uniqueidentifier, rc.ReferralReference) IS NOT NULL
                )
                UPDATE rc
                SET rc.ReferralReference = CONCAT(cb.Prefix, '-', RIGHT(CONCAT('000', cb.Seq), 3))
                FROM ResidentCase rc
                INNER JOIN CanonicalBase cb ON cb.Id = rc.Id;
                """);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("02d5cf68-9ba3-8414-b815-04bfcf3d00cc"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("05ac25af-20b9-cb10-1970-f222fc63f33c"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("067a031b-64f3-f757-3b13-bcc7696bc492"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("0cbe447b-6bdf-d70b-5959-ea464cb4309a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("14dd0381-2265-6a21-9a42-c71ca226e43b"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("17e7a384-bd51-89c2-8193-bd3b7c020261"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("18e22be9-5d28-4bf1-1ba3-c22c4ffed5c2"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("1b828d21-1e5a-78f7-b39c-be261ba424b0"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("241662a4-9a12-435a-586e-af8ad6eef8a8"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2b567f24-2645-3563-6dc7-256da1a473f9"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2deef4a1-f6c0-4fe7-dc65-cc9b800eaf3e"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("34592d5e-2b32-2033-c42f-bcf9681240d7"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e079aca-4440-deb3-f5e9-96cb4218d983"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e545e34-2694-5967-8c89-cd5f6cbbb384"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("40459bcf-c396-f2ab-d069-8ded074a050e"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4892cd18-2942-732c-bd62-a53d80d6a3c2"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4a53240f-690c-44d4-bb22-9c47ba0fb78e"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4b320969-841e-d690-341f-58e6531fccee"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4c169242-6e08-6702-70f9-603ca34de470"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5af6689e-fa64-ff88-31fb-08102f12a834"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5b127d66-826c-3e6b-92b2-009ecf6329b2"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("613c5f0f-9465-d1cc-bb6b-8b0e334b5286"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("620a1279-0c69-662b-60ef-969ec6c3f016"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("66dbc7fb-4df0-aa06-41dd-d3ca1b342446"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("67aca680-ed16-0e43-aaa0-5e3c8fcf9224"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6aa7429c-32a8-4048-3444-87a42644a94a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6b32d043-a1ae-71f1-03f0-1df665103c8b"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6e0e43eb-d5ae-1bc7-a6cc-4f791e1ec83a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7044d7e8-2ec7-4382-9e99-e90e17408a53"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("707742c8-ad7a-1f60-94e5-3b738c07a01f"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7bf163f7-f62c-de3a-f0b3-b66153838322"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8692d172-9c54-c70f-0a4b-7531afdd5315"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("878bf789-24b9-7555-1fd9-eb230a0b377a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8f8c7165-dd27-62f3-5f2d-e4e6521c4495"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("929cc5b6-c4d2-aa3e-85c5-e096fdab1c73"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("99b1f5fa-05de-faa8-3f0a-6b0209525bbe"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("9c950c36-e912-12dd-aa43-0ee5632279e5"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a026c6d0-c585-bc5a-7b57-86a02ae7f77a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a116e44f-e59a-c4fd-cfa5-0d80091b9cc8"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a96bec8b-0a57-23e2-fadb-e6ece8c4fc44"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b1fafa6e-9779-5c14-52c7-63d89bbf884a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b4fa3353-9e0e-78de-0449-d755225314f2"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9278ec8-7e71-33f9-76bf-867c4533e6bf"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9d2af6f-d8fa-92be-e08c-881148a79a9b"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bacf6983-0d3b-ab2a-2543-5da3ede2b7cd"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bc1af24a-7d55-b046-ccca-14ecc5bd2801"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bedece19-6736-e923-2862-96210b55e498"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("c81d7bbf-e761-983c-9ed0-04671b5e64b1"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ce939943-00c8-dcbd-d42d-e2ac46db190a"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d2221dec-071c-d380-b6f3-2515239f07aa"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d55b80ed-b3f5-4db9-bd93-4f4a782a9b75"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d64353b1-93e1-a496-26ff-691787c8e81e"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d735d3ef-77d8-66a2-47f5-2dce715eaf13"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("db38eb15-818c-c146-8716-ee7785b75260"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e41f4a3a-c68c-d34e-fd10-63d0bd4cda91"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e641d55e-25f9-d223-0541-7b89a46233db"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e7b29d33-22b4-f43f-6c1d-3ea2552c5f11"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ebf094cc-d4f6-2fee-71e9-89382875c905"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f1674ab5-6b49-716d-b8c8-cb768c002aeb"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f2ead506-547d-8eeb-2dd0-075d2fa36dfe"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f4f01740-f6a4-2e29-5a7f-ab5ae460bc8e"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f8dcb0ea-b18e-2eae-cb9c-92ff5adc2aef"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("fa11406b-65af-f777-c35e-5b733790670d"),
                column: "ReferralCallId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_ReferralCallId",
                table: "ResidentCase",
                column: "ReferralCallId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_ReferralCallId",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "ReferralCallId",
                table: "ResidentCase");
        }
    }
}
