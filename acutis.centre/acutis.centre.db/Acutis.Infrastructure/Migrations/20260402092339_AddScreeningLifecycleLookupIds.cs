using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScreeningLifecycleLookupIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "StatusLookupValueId",
                table: "ScheduledIntake",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AdmissionDecisionStatusLookupValueId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CasePhaseLookupValueId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CaseStatusLookupValueId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupType",
                columns: new[] { "LookupTypeId", "DefaultLocale", "IsActive", "Key", "Version" },
                values: new object[,]
                {
                    { new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), "en-IE", true, "screening_case_status", 1 },
                    { new Guid("48ba830e-fb52-435c-8235-62c9265324a8"), "en-IE", true, "screening_admission_decision_status", 1 },
                    { new Guid("4e2a6d0e-dd7e-45dd-9a59-6f81609c80fa"), "en-IE", true, "screening_scheduled_intake_status", 1 },
                    { new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"), "en-IE", true, "screening_case_phase", 1 }
                });

            migrationBuilder.Sql(
                """
                UPDATE dbo.ResidentCase
                SET CaseStatusLookupValueId = CASE LOWER(LTRIM(RTRIM(CaseStatus)))
                    WHEN 'referred' THEN '3B4536D3-5DA6-47E2-BD3F-7266D1FF4F48'
                    WHEN 'referral_received' THEN '508CEEBD-752E-43CC-B237-B9CD45722A29'
                    WHEN 'screening_in_progress' THEN '25394E01-00DA-4550-B175-7732BF9B05CE'
                    WHEN 'screening_completed' THEN '33DA7572-D932-4DC6-A73A-BB5D14DE10BB'
                    WHEN 'waitlisted' THEN 'FBD5B871-557A-4672-AD2C-1722D19244E0'
                    WHEN 'deferred' THEN '56FA535A-1146-4586-8136-A04F2ECFCC28'
                    WHEN 'admitted' THEN 'DB73F893-2F2E-4D08-9567-BFCE123F76B3'
                    WHEN 'declined' THEN '3295573D-BF71-468F-BBDA-21210AE9D939'
                    WHEN 'closed_without_admission' THEN '3124CFF7-CA2E-4F65-8859-41004144ED96'
                    ELSE NULL
                END
                WHERE CaseStatusLookupValueId IS NULL;

                UPDATE dbo.ResidentCase
                SET CasePhaseLookupValueId = CASE LOWER(LTRIM(RTRIM(CasePhase)))
                    WHEN 'intake' THEN 'AB177E88-2252-4852-B313-A6451717BF56'
                    WHEN 'referral' THEN '7CE7F82E-9479-42FD-A529-BFD46A01FC1B'
                    WHEN 'screening' THEN '19581218-A828-45C2-B55F-CD77877AA850'
                    WHEN 'admission_decision' THEN '30604255-7C76-4863-AD1B-DDD50CF1CE00'
                    WHEN 'admission' THEN '26A24065-7E1D-49D0-825C-B8A748E00A6F'
                    ELSE NULL
                END
                WHERE CasePhaseLookupValueId IS NULL;

                UPDATE dbo.ResidentCase
                SET AdmissionDecisionStatusLookupValueId = CASE LOWER(LTRIM(RTRIM(AdmissionDecisionStatus)))
                    WHEN 'approved' THEN '0E30AA95-F453-4478-A1F6-2DD5486CA49F'
                    WHEN 'rejected' THEN '96ED1CC5-E91B-4BDB-A8B1-F663B16E40B8'
                    WHEN 'waitlisted' THEN '6E85B1A2-F242-47BF-AB58-F53C35D5147F'
                    WHEN 'deferred' THEN '6712A77B-64EF-4909-B524-D22C18C546C3'
                    WHEN 'admitted' THEN '174C677E-BDFD-44AC-9BAF-F055339D096D'
                    ELSE NULL
                END
                WHERE AdmissionDecisionStatusLookupValueId IS NULL
                  AND AdmissionDecisionStatus IS NOT NULL;

                UPDATE dbo.ScheduledIntake
                SET StatusLookupValueId = CASE LOWER(LTRIM(RTRIM(Status)))
                    WHEN 'scheduled' THEN '052CC32D-3DB6-48F0-A36E-AA6A21CAC522'
                    WHEN 'cancelled' THEN '11C771A2-D9A1-4C6A-B5EC-B341248B7D90'
                    ELSE NULL
                END
                WHERE StatusLookupValueId IS NULL;
                """);

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("02d5cf68-9ba3-8414-b815-04bfcf3d00cc"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("05ac25af-20b9-cb10-1970-f222fc63f33c"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("067a031b-64f3-f757-3b13-bcc7696bc492"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("0cbe447b-6bdf-d70b-5959-ea464cb4309a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("14dd0381-2265-6a21-9a42-c71ca226e43b"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("17e7a384-bd51-89c2-8193-bd3b7c020261"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("18e22be9-5d28-4bf1-1ba3-c22c4ffed5c2"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("1b828d21-1e5a-78f7-b39c-be261ba424b0"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("241662a4-9a12-435a-586e-af8ad6eef8a8"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2b567f24-2645-3563-6dc7-256da1a473f9"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("2deef4a1-f6c0-4fe7-dc65-cc9b800eaf3e"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("34592d5e-2b32-2033-c42f-bcf9681240d7"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e079aca-4440-deb3-f5e9-96cb4218d983"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("3e545e34-2694-5967-8c89-cd5f6cbbb384"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("40459bcf-c396-f2ab-d069-8ded074a050e"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4892cd18-2942-732c-bd62-a53d80d6a3c2"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4a53240f-690c-44d4-bb22-9c47ba0fb78e"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4b320969-841e-d690-341f-58e6531fccee"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("4c169242-6e08-6702-70f9-603ca34de470"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5af6689e-fa64-ff88-31fb-08102f12a834"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("5b127d66-826c-3e6b-92b2-009ecf6329b2"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("613c5f0f-9465-d1cc-bb6b-8b0e334b5286"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("620a1279-0c69-662b-60ef-969ec6c3f016"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("66dbc7fb-4df0-aa06-41dd-d3ca1b342446"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("67aca680-ed16-0e43-aaa0-5e3c8fcf9224"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6aa7429c-32a8-4048-3444-87a42644a94a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6b32d043-a1ae-71f1-03f0-1df665103c8b"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("6e0e43eb-d5ae-1bc7-a6cc-4f791e1ec83a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7044d7e8-2ec7-4382-9e99-e90e17408a53"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("707742c8-ad7a-1f60-94e5-3b738c07a01f"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("7bf163f7-f62c-de3a-f0b3-b66153838322"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8692d172-9c54-c70f-0a4b-7531afdd5315"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("878bf789-24b9-7555-1fd9-eb230a0b377a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("8f8c7165-dd27-62f3-5f2d-e4e6521c4495"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("929cc5b6-c4d2-aa3e-85c5-e096fdab1c73"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("99b1f5fa-05de-faa8-3f0a-6b0209525bbe"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("9c950c36-e912-12dd-aa43-0ee5632279e5"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a026c6d0-c585-bc5a-7b57-86a02ae7f77a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a116e44f-e59a-c4fd-cfa5-0d80091b9cc8"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("a96bec8b-0a57-23e2-fadb-e6ece8c4fc44"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b1fafa6e-9779-5c14-52c7-63d89bbf884a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b4fa3353-9e0e-78de-0449-d755225314f2"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9278ec8-7e71-33f9-76bf-867c4533e6bf"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("b9d2af6f-d8fa-92be-e08c-881148a79a9b"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bacf6983-0d3b-ab2a-2543-5da3ede2b7cd"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bc1af24a-7d55-b046-ccca-14ecc5bd2801"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("bedece19-6736-e923-2862-96210b55e498"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("c81d7bbf-e761-983c-9ed0-04671b5e64b1"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ce939943-00c8-dcbd-d42d-e2ac46db190a"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d2221dec-071c-d380-b6f3-2515239f07aa"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d55b80ed-b3f5-4db9-bd93-4f4a782a9b75"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d64353b1-93e1-a496-26ff-691787c8e81e"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("d735d3ef-77d8-66a2-47f5-2dce715eaf13"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("db38eb15-818c-c146-8716-ee7785b75260"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e41f4a3a-c68c-d34e-fd10-63d0bd4cda91"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e641d55e-25f9-d223-0541-7b89a46233db"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("e7b29d33-22b4-f43f-6c1d-3ea2552c5f11"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("ebf094cc-d4f6-2fee-71e9-89382875c905"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f1674ab5-6b49-716d-b8c8-cb768c002aeb"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f2ead506-547d-8eeb-2dd0-075d2fa36dfe"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f4f01740-f6a4-2e29-5a7f-ab5ae460bc8e"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("f8dcb0ea-b18e-2eae-cb9c-92ff5adc2aef"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.UpdateData(
                table: "ResidentCase",
                keyColumn: "Id",
                keyValue: new Guid("fa11406b-65af-f777-c35e-5b733790670d"),
                columns: new[] { "AdmissionDecisionStatusLookupValueId", "CasePhaseLookupValueId", "CaseStatusLookupValueId" },
                values: new object[] { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValue",
                columns: new[] { "LookupValueId", "Code", "IsActive", "LookupTypeId", "SortOrder", "UnitId" },
                values: new object[,]
                {
                    { new Guid("052cc32d-3db6-48f0-a36e-aa6a21cac522"), "scheduled", true, new Guid("4e2a6d0e-dd7e-45dd-9a59-6f81609c80fa"), 10, null },
                    { new Guid("0e30aa95-f453-4478-a1f6-2dd5486ca49f"), "approved", true, new Guid("48ba830e-fb52-435c-8235-62c9265324a8"), 10, null },
                    { new Guid("11c771a2-d9a1-4c6a-b5ec-b341248b7d90"), "cancelled", true, new Guid("4e2a6d0e-dd7e-45dd-9a59-6f81609c80fa"), 20, null },
                    { new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), "admitted", true, new Guid("48ba830e-fb52-435c-8235-62c9265324a8"), 50, null },
                    { new Guid("19581218-a828-45c2-b55f-cd77877aa850"), "screening", true, new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"), 30, null },
                    { new Guid("25394e01-00da-4550-b175-7732bf9b05ce"), "screening_in_progress", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 30, null },
                    { new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), "admission", true, new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"), 50, null },
                    { new Guid("30604255-7c76-4863-ad1b-ddd50cf1ce00"), "admission_decision", true, new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"), 40, null },
                    { new Guid("3124cff7-ca2e-4f65-8859-41004144ed96"), "closed_without_admission", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 90, null },
                    { new Guid("3295573d-bf71-468f-bbda-21210ae9d939"), "declined", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 80, null },
                    { new Guid("33da7572-d932-4dc6-a73a-bb5d14de10bb"), "screening_completed", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 40, null },
                    { new Guid("3b4536d3-5da6-47e2-bd3f-7266d1ff4f48"), "referred", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 10, null },
                    { new Guid("508ceebd-752e-43cc-b237-b9cd45722a29"), "referral_received", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 20, null },
                    { new Guid("56fa535a-1146-4586-8136-a04f2ecfcc28"), "deferred", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 60, null },
                    { new Guid("6712a77b-64ef-4909-b524-d22c18c546c3"), "deferred", true, new Guid("48ba830e-fb52-435c-8235-62c9265324a8"), 40, null },
                    { new Guid("6e85b1a2-f242-47bf-ab58-f53c35d5147f"), "waitlisted", true, new Guid("48ba830e-fb52-435c-8235-62c9265324a8"), 30, null },
                    { new Guid("7ce7f82e-9479-42fd-a529-bfd46a01fc1b"), "referral", true, new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"), 20, null },
                    { new Guid("96ed1cc5-e91b-4bdb-a8b1-f663b16e40b8"), "rejected", true, new Guid("48ba830e-fb52-435c-8235-62c9265324a8"), 20, null },
                    { new Guid("ab177e88-2252-4852-b313-a6451717bf56"), "intake", true, new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"), 10, null },
                    { new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3"), "admitted", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 70, null },
                    { new Guid("fbd5b871-557a-4672-ad2c-1722d19244e0"), "waitlisted", true, new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"), 50, null }
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "LookupValueLabel",
                columns: new[] { "Locale", "LookupValueId", "Label" },
                values: new object[,]
                {
                    { "en-IE", new Guid("052cc32d-3db6-48f0-a36e-aa6a21cac522"), "Scheduled" },
                    { "en-IE", new Guid("0e30aa95-f453-4478-a1f6-2dd5486ca49f"), "Approved" },
                    { "en-IE", new Guid("11c771a2-d9a1-4c6a-b5ec-b341248b7d90"), "Cancelled" },
                    { "en-IE", new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"), "Admitted" },
                    { "en-IE", new Guid("19581218-a828-45c2-b55f-cd77877aa850"), "Screening" },
                    { "en-IE", new Guid("25394e01-00da-4550-b175-7732bf9b05ce"), "Screening In Progress" },
                    { "en-IE", new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"), "Admission" },
                    { "en-IE", new Guid("30604255-7c76-4863-ad1b-ddd50cf1ce00"), "Admission Decision" },
                    { "en-IE", new Guid("3124cff7-ca2e-4f65-8859-41004144ed96"), "Closed Without Admission" },
                    { "en-IE", new Guid("3295573d-bf71-468f-bbda-21210ae9d939"), "Declined" },
                    { "en-IE", new Guid("33da7572-d932-4dc6-a73a-bb5d14de10bb"), "Screening Completed" },
                    { "en-IE", new Guid("3b4536d3-5da6-47e2-bd3f-7266d1ff4f48"), "Referred" },
                    { "en-IE", new Guid("508ceebd-752e-43cc-b237-b9cd45722a29"), "Referral Received" },
                    { "en-IE", new Guid("56fa535a-1146-4586-8136-a04f2ecfcc28"), "Deferred" },
                    { "en-IE", new Guid("6712a77b-64ef-4909-b524-d22c18c546c3"), "Deferred" },
                    { "en-IE", new Guid("6e85b1a2-f242-47bf-ab58-f53c35d5147f"), "Waitlisted" },
                    { "en-IE", new Guid("7ce7f82e-9479-42fd-a529-bfd46a01fc1b"), "Referral" },
                    { "en-IE", new Guid("96ed1cc5-e91b-4bdb-a8b1-f663b16e40b8"), "Rejected" },
                    { "en-IE", new Guid("ab177e88-2252-4852-b313-a6451717bf56"), "Intake" },
                    { "en-IE", new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3"), "Admitted" },
                    { "en-IE", new Guid("fbd5b871-557a-4672-ad2c-1722d19244e0"), "Waitlisted" }
                });

            migrationBuilder.AlterColumn<Guid>(
                name: "StatusLookupValueId",
                table: "ScheduledIntake",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CasePhaseLookupValueId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CaseStatusLookupValueId",
                table: "ResidentCase",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledIntake_StatusLookupValueId",
                table: "ScheduledIntake",
                column: "StatusLookupValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledIntake_UnitId_ScheduledDate_StatusLookupValueId",
                table: "ScheduledIntake",
                columns: new[] { "UnitId", "ScheduledDate", "StatusLookupValueId" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_AdmissionDecisionStatusLookupValueId",
                table: "ResidentCase",
                column: "AdmissionDecisionStatusLookupValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CasePhaseLookupValueId",
                table: "ResidentCase",
                column: "CasePhaseLookupValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CaseStatusLookupValueId",
                table: "ResidentCase",
                column: "CaseStatusLookupValueId");

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CentreId_AdmissionDecisionStatusLookupValueId_AdmissionDecisionAtUtc",
                table: "ResidentCase",
                columns: new[] { "CentreId", "AdmissionDecisionStatusLookupValueId", "AdmissionDecisionAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CentreId_CasePhaseLookupValueId_OpenedAtUtc",
                table: "ResidentCase",
                columns: new[] { "CentreId", "CasePhaseLookupValueId", "OpenedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentCase_CentreId_CaseStatusLookupValueId_OpenedAtUtc",
                table: "ResidentCase",
                columns: new[] { "CentreId", "CaseStatusLookupValueId", "OpenedAtUtc" });

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentCase_LookupValue_AdmissionDecisionStatusLookupValueId",
                table: "ResidentCase",
                column: "AdmissionDecisionStatusLookupValueId",
                principalSchema: "dbo",
                principalTable: "LookupValue",
                principalColumn: "LookupValueId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentCase_LookupValue_CasePhaseLookupValueId",
                table: "ResidentCase",
                column: "CasePhaseLookupValueId",
                principalSchema: "dbo",
                principalTable: "LookupValue",
                principalColumn: "LookupValueId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResidentCase_LookupValue_CaseStatusLookupValueId",
                table: "ResidentCase",
                column: "CaseStatusLookupValueId",
                principalSchema: "dbo",
                principalTable: "LookupValue",
                principalColumn: "LookupValueId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledIntake_LookupValue_StatusLookupValueId",
                table: "ScheduledIntake",
                column: "StatusLookupValueId",
                principalSchema: "dbo",
                principalTable: "LookupValue",
                principalColumn: "LookupValueId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResidentCase_LookupValue_AdmissionDecisionStatusLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropForeignKey(
                name: "FK_ResidentCase_LookupValue_CasePhaseLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropForeignKey(
                name: "FK_ResidentCase_LookupValue_CaseStatusLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledIntake_LookupValue_StatusLookupValueId",
                table: "ScheduledIntake");

            migrationBuilder.DropIndex(
                name: "IX_ScheduledIntake_StatusLookupValueId",
                table: "ScheduledIntake");

            migrationBuilder.DropIndex(
                name: "IX_ScheduledIntake_UnitId_ScheduledDate_StatusLookupValueId",
                table: "ScheduledIntake");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_AdmissionDecisionStatusLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CasePhaseLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CaseStatusLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CentreId_AdmissionDecisionStatusLookupValueId_AdmissionDecisionAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CentreId_CasePhaseLookupValueId_OpenedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DropIndex(
                name: "IX_ResidentCase_CentreId_CaseStatusLookupValueId_OpenedAtUtc",
                table: "ResidentCase");

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("052cc32d-3db6-48f0-a36e-aa6a21cac522") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("0e30aa95-f453-4478-a1f6-2dd5486ca49f") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("11c771a2-d9a1-4c6a-b5ec-b341248b7d90") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("174c677e-bdfd-44ac-9baf-f055339d096d") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("19581218-a828-45c2-b55f-cd77877aa850") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("25394e01-00da-4550-b175-7732bf9b05ce") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("30604255-7c76-4863-ad1b-ddd50cf1ce00") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("3124cff7-ca2e-4f65-8859-41004144ed96") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("3295573d-bf71-468f-bbda-21210ae9d939") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("33da7572-d932-4dc6-a73a-bb5d14de10bb") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("3b4536d3-5da6-47e2-bd3f-7266d1ff4f48") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("508ceebd-752e-43cc-b237-b9cd45722a29") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("56fa535a-1146-4586-8136-a04f2ecfcc28") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("6712a77b-64ef-4909-b524-d22c18c546c3") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("6e85b1a2-f242-47bf-ab58-f53c35d5147f") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("7ce7f82e-9479-42fd-a529-bfd46a01fc1b") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("96ed1cc5-e91b-4bdb-a8b1-f663b16e40b8") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("ab177e88-2252-4852-b313-a6451717bf56") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValueLabel",
                keyColumns: new[] { "Locale", "LookupValueId" },
                keyValues: new object[] { "en-IE", new Guid("fbd5b871-557a-4672-ad2c-1722d19244e0") });

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("052cc32d-3db6-48f0-a36e-aa6a21cac522"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("0e30aa95-f453-4478-a1f6-2dd5486ca49f"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("11c771a2-d9a1-4c6a-b5ec-b341248b7d90"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("174c677e-bdfd-44ac-9baf-f055339d096d"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("19581218-a828-45c2-b55f-cd77877aa850"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("25394e01-00da-4550-b175-7732bf9b05ce"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("26a24065-7e1d-49d0-825c-b8a748e00a6f"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("30604255-7c76-4863-ad1b-ddd50cf1ce00"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("3124cff7-ca2e-4f65-8859-41004144ed96"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("3295573d-bf71-468f-bbda-21210ae9d939"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("33da7572-d932-4dc6-a73a-bb5d14de10bb"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("3b4536d3-5da6-47e2-bd3f-7266d1ff4f48"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("508ceebd-752e-43cc-b237-b9cd45722a29"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("56fa535a-1146-4586-8136-a04f2ecfcc28"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("6712a77b-64ef-4909-b524-d22c18c546c3"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("6e85b1a2-f242-47bf-ab58-f53c35d5147f"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("7ce7f82e-9479-42fd-a529-bfd46a01fc1b"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("96ed1cc5-e91b-4bdb-a8b1-f663b16e40b8"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("ab177e88-2252-4852-b313-a6451717bf56"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("db73f893-2f2e-4d08-9567-bfce123f76b3"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupValue",
                keyColumn: "LookupValueId",
                keyValue: new Guid("fbd5b871-557a-4672-ad2c-1722d19244e0"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("1b9fe05a-8664-4d7f-af4c-096e703d9922"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("48ba830e-fb52-435c-8235-62c9265324a8"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("4e2a6d0e-dd7e-45dd-9a59-6f81609c80fa"));

            migrationBuilder.DeleteData(
                schema: "dbo",
                table: "LookupType",
                keyColumn: "LookupTypeId",
                keyValue: new Guid("94e91511-c0c9-4514-b332-f253f17d71fb"));

            migrationBuilder.DropColumn(
                name: "StatusLookupValueId",
                table: "ScheduledIntake");

            migrationBuilder.DropColumn(
                name: "AdmissionDecisionStatusLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "CasePhaseLookupValueId",
                table: "ResidentCase");

            migrationBuilder.DropColumn(
                name: "CaseStatusLookupValueId",
                table: "ResidentCase");
        }
    }
}
