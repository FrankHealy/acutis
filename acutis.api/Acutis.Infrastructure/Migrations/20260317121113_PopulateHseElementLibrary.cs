using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PopulateHseElementLibrary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("38f88e06-ce48-de3d-0071-173e8c31604c"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("475f7311-07d1-d94b-2043-3981b2a738b2"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("6a306056-c421-6f8d-c49d-51405573e554"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("85715f16-8002-8fd3-076e-de7bd84141ee"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("92a94372-8286-a77a-d940-22e9e722c4f7"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("9ee102e3-1ab3-1cf0-b8dc-7c34c1a6c6ba"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("d61eaf90-2915-09cd-8dc4-449dbdd596b4"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e75c5e7a-7c38-5a83-e178-6e20333ba2df"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("df21f89e-a03e-741b-c4a2-4cf5eb2bbce2"));

            migrationBuilder.UpdateData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("dad6e360-7afe-51ef-f174-8e359e1d6fdc"),
                columns: new[] { "DisplayOrder", "FieldConfigJson", "GroupId", "HelpText", "SourceDocumentReference" },
                values: new object[] { 3, "{\"required\":true,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, "AF Printed Page 6.html" });

            migrationBuilder.InsertData(
                table: "ElementGroup",
                columns: new[] { "Id", "CreatedAtUtc", "Description", "DisplayOrder", "IsActive", "Key", "Name", "SourceDocumentReference", "Status", "UpdatedAtUtc", "Version" },
                values: new object[,]
                {
                    { new Guid("365b011b-bad0-fda1-6c89-30ef0bd7c6ee"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "HSE happiness scale matrix derived from AF Printed Page 15.", 8, true, "happiness_scale", "Happiness Scale", "AF Printed Page 15.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Physical health and screening access elements derived from AF Printed Page 12.", 4, true, "physical_health", "Physical Health", "AF Printed Page 12.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Safeguarding, justice, and service safety elements derived from AF Printed Page 14.", 7, true, "domestic_violence_justice_health_safety", "Domestic Violence / Justice / Health and Safety", "AF Printed Page 14.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Mental health consent and assessment elements derived from AF Printed Pages 3 and 13.", 6, true, "mental_health", "Mental Health", "AF Printed Page 3,13.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Sexual orientation and sexual wellbeing elements derived from AF Printed Pages 6 and 13.", 5, true, "sexual_wellbeing", "Sexual Wellbeing", "AF Printed Page 6,13.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("9731f4ac-9a53-1b7f-64ca-bb7be4cf9472"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Post-assessment action checklist and follow-up elements derived from AF Printed Page 15.", 9, true, "assessor_actions_required", "Assessor Actions Required", "AF Printed Page 15.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("a5420397-8270-f33c-28ba-ede805773239"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "HSE consent, confidentiality, additional consent, and service-user signature elements derived from AF Printed Pages 1 to 5.", 1, true, "consent_confidentiality", "Consent and Confidentiality", "AF Printed Page 1-5.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Admission and intake identity, referral, contact, and administration elements derived from AF Printed Pages 6 and 7.", 2, true, "intake_admin_identity", "Intake / Admin Identity", "AF Printed Page 6-7.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Substance, gambling, family history, alcohol treatment, and harm-reduction elements derived from AF Printed Pages 9 to 11.", 3, true, "substance_use_alcohol_treatment_history", "Substance Use / Alcohol / Treatment History", "AF Printed Page 9-11.html", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.InsertData(
                table: "ElementDefinition",
                columns: new[] { "Id", "CanonicalFieldKey", "CreatedAtUtc", "Description", "DisplayOrder", "ElementType", "FieldConfigJson", "GroupId", "HelpText", "IsActive", "Key", "Label", "OptionSetKey", "SourceDocumentReference", "SourceKind", "Status", "UpdatedAtUtc", "Version" },
                values: new object[,]
                {
                    { new Guid("01ff19f8-3a2c-301d-4092-52aa1f6db2c4"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 18, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "medical_card_status", "Medical Card", null, "AF Printed Page 7.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("02883ebd-2cfa-4243-7184-84e4fd658b41"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "last_gp_checkup", "Last GP Check-Up", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("02bdb60c-619d-fd15-d582-f5c0eb9eebe8"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 7, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "has_solicitor", "Has a Solicitor", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("03b35aa8-97ee-80a5-e35e-cee10a9e450f"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 10, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":1000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "treatment_providers", "Name of Treatment Provider(s)", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("093c683d-1da5-ccb7-99cc-42c68895c922"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 8, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "justice_details", "Justice Details", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("09a293ba-8c93-087f-31dc-bb1b47017704"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 6, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "current_medications", "Current Medications", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("09fca025-6925-3484-72ce-6ee15fb55a89"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 10, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "health_and_safety_details", "Health and Safety Details", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("0b17893f-fdba-ba49-1479-860067d28c83"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "history_of_abuse", "History of Physical / Mental / Sexual Abuse", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("0e106780-bfcd-75c1-9400-153f3d8a1e1b"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 17, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "gp_name", "GP Name", null, "AF Printed Page 7.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("0f91f740-062d-ad0c-b4f5-52ebf33ea063"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 10, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":null,\"pattern\":\"^\\\\\\u002B?[0-9()\\\\-\\\\s]{7,20}$\",\"customMessage\":null},\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "mobile_number", "Mobile Number", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("0fe9b3e2-75cc-2fae-fdc8-fb88b3cd0476"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("9731f4ac-9a53-1b7f-64ca-bb7be4cf9472"), null, true, "key_work_other_service_details", "Key Work Other Service Details", null, "AF Printed Page 15.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11b65c33-9ced-5444-18a5-bd280ef2abb1"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "main_problem_drug_assessability", "Difficulty Assessing Main Problem Drug", null, "AF Printed Page 9.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11fe7f42-1c64-0f48-27d0-b837c0ba86e3"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "physical_health_concerns", "Concerns About Physical Health", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("13e79e47-1b5d-da80-ab02-3d025a3da534"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 9, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "behaviour_impacting_treatment_plan", "Behaviour May Impact Treatment Plan", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("15f4f0f9-eeaa-e0ea-fefe-18c79943bf16"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 9, "multi-checkbox", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "treatment_types", "Treatment Type(s)", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("17accf06-6190-acdc-cd16-a8885eff0e63"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 8, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "adheres_to_medication", "Adheres to Medication", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("1f82d038-536a-6aef-851e-fb265c886f46"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Named people or services with whom information can be shared.", 8, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "additional_consent_contacts", "Additional Consent Contacts", null, "AF Printed Page 4.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("26dfa6b4-f6dc-7250-7b36-aa639a4514be"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 17, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "family_substance_use_history", "Family Substance Use History", null, "AF Printed Page 7.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("2e339c17-0a8d-e86e-72c8-f757b7e27487"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "mental_health_concerns", "Concerns About Mental Health", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("2f185b33-da96-c9ae-7dcc-ca1c4c225d5d"), "resident.firstName", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident first name.", 2, "text", "{\"required\":true,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "first_name", "First Name", null, "AF Printed Page 6.html", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("31e08bb8-20e3-8ef2-1bb0-9639f1a9b552"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 7, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "can_access_medication", "Can Access Medication", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("34a36a6b-88ef-8fce-5d20-0164a00367ff"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Signature of staff witnessing or confirming consent.", 6, "signature", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "staff_signature", "Staff Signature", null, "AF Printed Page 3.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("397891f0-60b0-8e99-5645-d64d2dda1542"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 16, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "source_of_income", "Source of Income", null, "AF Printed Page 7.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("42d6d0d8-78ef-f673-7086-d58ddcf6bfa1"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 8, "number", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":0,\"max\":120,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "age_first_treated", "Age First Treated", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("4575fde0-3aaa-8b61-e372-c4126d196abc"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 12, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "longest_time_abstinent", "Longest Time Abstinent", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("45f11262-eb2d-1e04-0236-5ee96daf3976"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Captures next of kin and emergency contact context.", 19, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "next_of_kin_details", "Next of Kin Details", null, "AF Printed Page 7.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("490c3d54-49ae-02d0-81e8-5ef8e4af39cd"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Consent specific to shared mental health records.", 7, "yes-no", "{\"required\":true,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "consent_mental_health_shared_record", "Consent to Shared Mental Health Record", null, "AF Printed Page 3.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("4d665a2f-6a69-8418-d3af-b69e9a973a87"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 9, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "history_of_seizures", "History of Seizures", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("554b5c06-4a8b-9c96-6c27-efd105020022"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), null, true, "sexual_health_concerns", "Concerns About Sexual Health and Wellbeing", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("5562bf93-0f4f-7d8c-f5a5-bf7896ddff45"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "custodial_sentence_history", "History of Custodial Sentence", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("57a09af2-5b2f-d3bf-4f63-f67dba407265"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), null, true, "sti_screening_history", "History of STI Screening / Testing", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("583f0ef2-7a9b-ddca-d9ea-b1091e1ae164"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 12, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "additional_comments_details", "Additional Comments Details", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("6028416e-e651-8f71-e7f3-6d1b6f82fc88"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 13, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "current_opiate_agonist_treatment", "Current Opiate Agonist Treatment", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("60d0b263-cfc2-737b-4076-be30ef94fd71"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), null, true, "uses_condoms_or_barriers", "Uses Condoms or Other Physical Barriers", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("68329508-1ba3-582c-2455-c85df7eac306"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 7, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "mental_health_details", "Mental Health Details", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("6d253902-4eea-6e98-095a-c7ac637f9912"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 10, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "physical_health_details", "Physical Health Details", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("71cea04a-f74b-a11e-79a7-9579dc920ef7"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "current_relationship_safety", "Feels Safe in Current Relationship", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("7237c51a-1c65-ce96-3798-e3b9eb1c3896"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 16, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"needle_exchange\",\"label\":\"Needle Exchange time and places\"},{\"value\":\"drug_use\",\"label\":\"Drug Use\"},{\"value\":\"drug_interactions\",\"label\":\"Drug Interactions\"},{\"value\":\"alcohol_use\",\"label\":\"Alcohol Use\"},{\"value\":\"overdose_prevention\",\"label\":\"Overdose Prevention\"},{\"value\":\"access_to_naloxone\",\"label\":\"Access to Naloxone\"},{\"value\":\"safe_injecting_practice\",\"label\":\"Safe Injecting Practice\"},{\"value\":\"sexual_activity\",\"label\":\"Sexual Activity\"}]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "harm_reduction_advice_given", "Harm Reduction Advice Given", null, "AF Printed Page 11.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("73908bdc-bbe1-d71e-192f-8fdd808f60d2"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Consent for placement on the HSE National Waiting List for Opiate Addiction Treatment.", 10, "signature", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "national_waiting_list_consent", "National Waiting List Consent", null, "AF Printed Page 5.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("759213ba-09d9-b9d0-d38d-9db6e5ae4b83"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "history_of_self_harm_or_suicidal_thoughts", "History of Self Harm or Suicidal Thoughts", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("75fa27f6-b3d2-9efb-e5bf-68b02cd1fe98"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "gambling_history", "Gambling History", null, "AF Printed Page 9.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("76e95a91-c2c8-7dff-1dd1-b78aa85e3d60"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Checklist of actions required after initial assessment.", 1, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"child_protection_referral\",\"label\":\"Children First / Child Protection / social work referral\"},{\"value\":\"medical_assessment\",\"label\":\"Medical assessment\"},{\"value\":\"psychiatric_assessment\",\"label\":\"Psychiatric assessment\"},{\"value\":\"multi_agency_meeting\",\"label\":\"Multi-agency meeting or review\"},{\"value\":\"opiate_substitution_protocols\",\"label\":\"Progress to opiate substitution protocols\"},{\"value\":\"register_screening_service\",\"label\":\"Register with National Screening Service\"},{\"value\":\"homeless_action_team\",\"label\":\"Referral to a homeless Action Team\"},{\"value\":\"key_work_other_service\",\"label\":\"Key work engagement from other service provider\"},{\"value\":\"other_action\",\"label\":\"Other action (e.g. placement on waiting list)\"}]}", new Guid("9731f4ac-9a53-1b7f-64ca-bb7be4cf9472"), null, true, "assessor_actions_required", "Assessor Actions Required", null, "AF Printed Page 15.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("7aa0068e-5ee7-4b10-49ec-bb697551044e"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "ever_treated_for_substance_use", "Ever Treated for Substance Use", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("7f94d79a-7be1-d594-e9d7-fd0f4306b959"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 11, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "national_screening_interest", "Would Like Access to National Screening Service", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("80249d60-abe0-a86a-3f8e-8a97adebca35"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "mental_health_professional_engagement", "Seen or Seeing a Mental Health Professional", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("8a0d49f8-f6da-917d-2946-729b8464a8ca"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "history_of_psychiatric_care", "History of Psychiatric Care", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("8e1ddfd4-4038-9bcf-b6e6-7ef3f9470339"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 11, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":null,\"pattern\":\"^[A-Za-z0-9._%\\u002B\\\\-]\\u002B@[A-Za-z0-9.\\\\-]\\u002B\\\\.[A-Za-z]{2,}$\",\"customMessage\":null},\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "email_address", "Email Address", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("93debde2-ed95-9d76-c45a-dbee645a1c6b"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Consent to be contacted via different channels.", 12, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"contact_at_address\",\"label\":\"Agree to be contacted at the above address\"},{\"value\":\"contact_via_phone_text\",\"label\":\"Agree to be contacted via phone text\"},{\"value\":\"contact_by_email\",\"label\":\"Agree to be contacted by email\"}]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "contact_permissions", "Contact Permissions", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("98120910-a846-3efc-f540-b5e7e057281e"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 15, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"ever_injected\",\"label\":\"Ever injected\"},{\"value\":\"shared_needles\",\"label\":\"Ever shared needles / syringes\"},{\"value\":\"shared_paraphernalia\",\"label\":\"Ever shared other paraphernalia\"}]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "risk_behaviour_history", "Risk Behaviour History", null, "AF Printed Page 11.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("9ff370e2-efe8-b85a-3137-b4791d42df2a"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Section guidance text introducing current need and care-plan discussion.", 1, "instructional-text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "substance_problem_overview", "Substance Use / Gambling / Eating Disorder Overview", null, "AF Printed Page 9.html", "unbound", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("ae3a51ab-7be1-66ff-2b39-b6dda82e35a1"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Date comprehensive assessment was completed.", 2, "date", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "assessment_completion_date", "Assessment Completion Date", null, "AF Printed Page 1.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("aec444f1-8938-6551-209f-0125278f45fc"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 6, "single-choice", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"very_low\",\"label\":\"Very low\"},{\"value\":\"low\",\"label\":\"Low\"},{\"value\":\"reasonable\",\"label\":\"Reasonable\"},{\"value\":\"good\",\"label\":\"Good\"}]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "mood_last_month", "Mood Over the Last Month", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("aff568eb-a3f5-f34c-e64d-d2dbc0abfece"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 6, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), null, true, "sexual_wellbeing_details", "Sexual Wellbeing Details", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("b0467e39-a89d-ed91-93fe-281759a25f5b"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 2, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "known_allergies", "Known Allergies", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("b3e232de-3f1b-38d6-d91e-3a8d657223ac"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 11, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":1000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "reason_for_leaving_treatment", "Reason for Leaving", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("b6801447-9eec-3ef3-18a0-f3494071cfd1"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Checklist used at the start of assessment.", 4, "checklist", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"consent_signed_understood\",\"label\":\"Consent signed and understood by Service User\"},{\"value\":\"initial_care_plan_agreed\",\"label\":\"Initial care plan developed and agreed with Service User based on assessment\"},{\"value\":\"consent_explained\",\"label\":\"Explain consent and confidentiality\"},{\"value\":\"new_treatment_episode\",\"label\":\"Is this a new treatment episode?\"},{\"value\":\"circumstances_changed\",\"label\":\"Have the Service User\\u0027s circumstances changed? If so, update this assessment\"}]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "assessment_checklist", "Assessment Checklist", null, "AF Printed Page 1.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("be5a2e25-eb6f-3862-408f-24963f725277"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 8, "date", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "referral_date", "Date of Referral", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("be793e1a-9975-00b0-75e9-93581bd1e6ce"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Instructional content reminding the assessor to explain consent and confidentiality.", 3, "instructional-text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "consent_explainer", "Consent and Confidentiality Explainer", null, "AF Printed Page 1-3.html", "unbound", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("bf0e253c-d0b5-c443-8254-c1e860982631"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "history_of_head_injury", "History of Head Injury", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("c36670d5-89a4-ef51-a14a-1bb35ae851f3"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 9, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":null,\"pattern\":\"^\\\\\\u002B?[0-9()\\\\-\\\\s]{7,20}$\",\"customMessage\":null},\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "phone_number", "Phone Number", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("c5b33af1-ae2d-24be-41f0-7bbea724d375"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("9731f4ac-9a53-1b7f-64ca-bb7be4cf9472"), null, true, "comprehensive_assessment_arranged", "Comprehensive Assessment Arranged", null, "AF Printed Page 15.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("c5fe4a7a-5383-b2ee-8f98-ee006030765d"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 5, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"), null, true, "relevant_medical_history", "Relevant Medical History", null, "AF Printed Page 12.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("c7e691c8-8e49-c5d0-add0-e1b7488a2a16"), "resident.dateOfBirth", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident date of birth.", 4, "date", "{\"required\":true,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "date_of_birth", "Date of Birth", null, "AF Printed Page 6.html", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("c97bdf71-f3b0-d9ad-892f-dc1426f76c75"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 13, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "country_of_birth", "Country of Birth", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d21160b1-ccf0-2703-7419-2fc05a000eb1"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 14, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "other_current_treatment_medication", "Other Current Treatment / Prescribed Medications", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d57c37ef-8ccc-7ab5-05b5-049abae466ab"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Consent specific to homeless services PASS database.", 9, "signature", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "pass_database_consent", "PASS Database Consent", null, "AF Printed Page 4.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d59103b5-8439-b85c-8d33-3844ffe675fc"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Records whether the comprehensive assessment is completed.", 1, "yes-no", "{\"required\":true,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "assessment_completion_status", "Comprehensive Assessment Completed", null, "AF Printed Page 1.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d7910b10-0722-f801-9e94-20be30ac40b5"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"), null, true, "mental_health_consent_shared_record", "Mental Health Shared Record Consent", null, "AF Printed Page 3.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d9808e10-178b-d5c0-a3da-4dc022a0bba2"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Full service user name as captured on admission.", 1, "text", "{\"required\":true,\"placeholder\":\"Block capitals\",\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "service_user_full_name", "Service User Name", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("dc03ab2a-b344-ec39-12d4-ac8c0e83af99"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Current happiness over the last 30 days across HSE-defined domains.", 1, "matrix/rating", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"confidence_in_self\",\"label\":\"Confidence in self\"},{\"value\":\"mental_health_and_happiness\",\"label\":\"Mental health and happiness\"},{\"value\":\"job_role\",\"label\":\"Job/role\"},{\"value\":\"social_life\",\"label\":\"Social life\"},{\"value\":\"physical_health\",\"label\":\"Physical health\"},{\"value\":\"inner_peace\",\"label\":\"Inner peace\"},{\"value\":\"relationships\",\"label\":\"Relationships\"},{\"value\":\"family\",\"label\":\"Family\"},{\"value\":\"legal_issues\",\"label\":\"Legal issues\"},{\"value\":\"appearance_life\",\"label\":\"Appearance / life\"},{\"value\":\"communication_skills\",\"label\":\"Communication Skills\"},{\"value\":\"housing\",\"label\":\"Housing\"},{\"value\":\"spirituality\",\"label\":\"Spirituality\"},{\"value\":\"other\",\"label\":\"Other (be specific)\"}]}", new Guid("365b011b-bad0-fda1-6c89-30ef0bd7c6ee"), "Low numbers indicate lower happiness; high numbers indicate greater happiness.", true, "happiness_scale_matrix", "Happiness Scale Matrix", null, "AF Printed Page 15.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("dc906de2-2e51-c944-ca09-a563e703db53"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("9731f4ac-9a53-1b7f-64ca-bb7be4cf9472"), null, true, "comprehensive_assessment_needed", "Comprehensive Assessment Needed", null, "AF Printed Page 15.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("de075197-67d6-610e-a220-4a23f8be3613"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Signature of service user confirming consent.", 5, "signature", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("a5420397-8270-f33c-28ba-ede805773239"), null, true, "service_user_signature", "Service User Signature", null, "AF Printed Page 3.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("dfc02997-843b-c030-a32b-d08494317f05"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "probation_service_engagement", "Engaged With Probation Services", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e0e57bc0-ed88-1cf8-ef30-e18e398e2921"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "eating_disorder_history", "Eating Disorder History", null, "AF Printed Page 9.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e37e15de-e421-dc8e-28cd-c8f37752ec2a"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 6, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "pending_court_cases", "Pending Court Cases", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e3931636-ea69-4c9d-46a6-50af2e036fa6"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Referral source captured on intake.", 6, "single-choice", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"gp\",\"label\":\"GP\"},{\"value\":\"family\",\"label\":\"Family\"},{\"value\":\"self\",\"label\":\"Self\"},{\"value\":\"other\",\"label\":\"Other\"}]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "source_of_referral", "Source of Referral", "referral_source", "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e6f3d851-1473-f836-f201-3325b712ce68"), "resident.nationality", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident nationality.", 5, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "nationality", "Nationality", null, "AF Printed Page 6.html", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e90b1346-e6c7-4116-e268-973937dd986f"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 15, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "employment_status", "Employment Status", null, "AF Printed Page 7.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("ec521f32-7947-64de-f970-0a05894e934a"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 6, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "ever_treated_for_alcohol", "Ever Treated for Alcohol", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("eea97ad0-6d96-6173-88ff-f4a45066d2c3"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 4, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), null, true, "knows_barrier_access_points", "Knows Where Barriers Are Freely Available", null, "AF Printed Page 13.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("ef4d373a-e7b0-927e-bdfe-a074d40eb2e2"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 11, "yes-no", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "additional_comments_needed", "Additional Comments Required", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("f15d75f2-134a-ba99-6859-8d04283a7ea1"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 7, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "referral_reference_number", "Referral Reference Number", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("f204c24c-a5a3-ba11-de4b-a4d3707576a0"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 3, "textarea", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":null,\"max\":2000,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"), null, true, "domestic_violence_details", "Domestic Violence Details", null, "AF Printed Page 14.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("f32c18b4-4b3e-63b1-89d4-995fc912d18e"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 1, "single-choice", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[{\"value\":\"heterosexual\",\"label\":\"Heterosexual or Straight\"},{\"value\":\"bisexual\",\"label\":\"Bisexual\"},{\"value\":\"other\",\"label\":\"Other sexual orientation not listed\"}]}", new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"), null, true, "self_defined_sexual_orientation", "Self-Defined Sexual Orientation", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("f4303cdb-6dff-d968-3866-953120a04adf"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 7, "number", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":{\"min\":0,\"max\":null,\"pattern\":null,\"customMessage\":null},\"options\":[]}", new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"), null, true, "total_previous_treatments", "Total Number of Previous Treatments", null, "AF Printed Page 10.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("fa1a2730-c34e-295a-2e4d-ba40e2e8a17a"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), null, 14, "text", "{\"required\":false,\"placeholder\":null,\"defaultValue\":null,\"validation\":null,\"options\":[]}", new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"), null, true, "preferred_language", "Preferred Language to Work With", null, "AF Printed Page 6.html", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("01ff19f8-3a2c-301d-4092-52aa1f6db2c4"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("02883ebd-2cfa-4243-7184-84e4fd658b41"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("02bdb60c-619d-fd15-d582-f5c0eb9eebe8"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("03b35aa8-97ee-80a5-e35e-cee10a9e450f"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("093c683d-1da5-ccb7-99cc-42c68895c922"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("09a293ba-8c93-087f-31dc-bb1b47017704"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("09fca025-6925-3484-72ce-6ee15fb55a89"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("0b17893f-fdba-ba49-1479-860067d28c83"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("0e106780-bfcd-75c1-9400-153f3d8a1e1b"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("0f91f740-062d-ad0c-b4f5-52ebf33ea063"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("0fe9b3e2-75cc-2fae-fdc8-fb88b3cd0476"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("11b65c33-9ced-5444-18a5-bd280ef2abb1"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("11fe7f42-1c64-0f48-27d0-b837c0ba86e3"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("13e79e47-1b5d-da80-ab02-3d025a3da534"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("15f4f0f9-eeaa-e0ea-fefe-18c79943bf16"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("17accf06-6190-acdc-cd16-a8885eff0e63"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("1f82d038-536a-6aef-851e-fb265c886f46"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("26dfa6b4-f6dc-7250-7b36-aa639a4514be"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("2e339c17-0a8d-e86e-72c8-f757b7e27487"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("2f185b33-da96-c9ae-7dcc-ca1c4c225d5d"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("31e08bb8-20e3-8ef2-1bb0-9639f1a9b552"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("34a36a6b-88ef-8fce-5d20-0164a00367ff"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("397891f0-60b0-8e99-5645-d64d2dda1542"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("42d6d0d8-78ef-f673-7086-d58ddcf6bfa1"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("4575fde0-3aaa-8b61-e372-c4126d196abc"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("45f11262-eb2d-1e04-0236-5ee96daf3976"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("490c3d54-49ae-02d0-81e8-5ef8e4af39cd"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("4d665a2f-6a69-8418-d3af-b69e9a973a87"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("554b5c06-4a8b-9c96-6c27-efd105020022"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("5562bf93-0f4f-7d8c-f5a5-bf7896ddff45"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("57a09af2-5b2f-d3bf-4f63-f67dba407265"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("583f0ef2-7a9b-ddca-d9ea-b1091e1ae164"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("6028416e-e651-8f71-e7f3-6d1b6f82fc88"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("60d0b263-cfc2-737b-4076-be30ef94fd71"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("68329508-1ba3-582c-2455-c85df7eac306"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("6d253902-4eea-6e98-095a-c7ac637f9912"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("71cea04a-f74b-a11e-79a7-9579dc920ef7"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("7237c51a-1c65-ce96-3798-e3b9eb1c3896"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("73908bdc-bbe1-d71e-192f-8fdd808f60d2"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("759213ba-09d9-b9d0-d38d-9db6e5ae4b83"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("75fa27f6-b3d2-9efb-e5bf-68b02cd1fe98"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("76e95a91-c2c8-7dff-1dd1-b78aa85e3d60"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("7aa0068e-5ee7-4b10-49ec-bb697551044e"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("7f94d79a-7be1-d594-e9d7-fd0f4306b959"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("80249d60-abe0-a86a-3f8e-8a97adebca35"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("8a0d49f8-f6da-917d-2946-729b8464a8ca"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("8e1ddfd4-4038-9bcf-b6e6-7ef3f9470339"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("93debde2-ed95-9d76-c45a-dbee645a1c6b"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("98120910-a846-3efc-f540-b5e7e057281e"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("9ff370e2-efe8-b85a-3137-b4791d42df2a"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("ae3a51ab-7be1-66ff-2b39-b6dda82e35a1"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("aec444f1-8938-6551-209f-0125278f45fc"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("aff568eb-a3f5-f34c-e64d-d2dbc0abfece"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("b0467e39-a89d-ed91-93fe-281759a25f5b"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("b3e232de-3f1b-38d6-d91e-3a8d657223ac"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("b6801447-9eec-3ef3-18a0-f3494071cfd1"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("be5a2e25-eb6f-3862-408f-24963f725277"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("be793e1a-9975-00b0-75e9-93581bd1e6ce"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("bf0e253c-d0b5-c443-8254-c1e860982631"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("c36670d5-89a4-ef51-a14a-1bb35ae851f3"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("c5b33af1-ae2d-24be-41f0-7bbea724d375"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("c5fe4a7a-5383-b2ee-8f98-ee006030765d"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("c7e691c8-8e49-c5d0-add0-e1b7488a2a16"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("c97bdf71-f3b0-d9ad-892f-dc1426f76c75"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("d21160b1-ccf0-2703-7419-2fc05a000eb1"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("d57c37ef-8ccc-7ab5-05b5-049abae466ab"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("d59103b5-8439-b85c-8d33-3844ffe675fc"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("d7910b10-0722-f801-9e94-20be30ac40b5"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("d9808e10-178b-d5c0-a3da-4dc022a0bba2"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("dc03ab2a-b344-ec39-12d4-ac8c0e83af99"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("dc906de2-2e51-c944-ca09-a563e703db53"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("de075197-67d6-610e-a220-4a23f8be3613"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("dfc02997-843b-c030-a32b-d08494317f05"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e0e57bc0-ed88-1cf8-ef30-e18e398e2921"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e37e15de-e421-dc8e-28cd-c8f37752ec2a"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e3931636-ea69-4c9d-46a6-50af2e036fa6"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e6f3d851-1473-f836-f201-3325b712ce68"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("e90b1346-e6c7-4116-e268-973937dd986f"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("ec521f32-7947-64de-f970-0a05894e934a"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("eea97ad0-6d96-6173-88ff-f4a45066d2c3"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("ef4d373a-e7b0-927e-bdfe-a074d40eb2e2"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("f15d75f2-134a-ba99-6859-8d04283a7ea1"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("f204c24c-a5a3-ba11-de4b-a4d3707576a0"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("f32c18b4-4b3e-63b1-89d4-995fc912d18e"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("f4303cdb-6dff-d968-3866-953120a04adf"));

            migrationBuilder.DeleteData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("fa1a2730-c34e-295a-2e4d-ba40e2e8a17a"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("365b011b-bad0-fda1-6c89-30ef0bd7c6ee"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("4c3f7b16-512b-610c-df38-920a4d7e1919"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("62f87062-5d98-d89f-07b6-37c98fa3957e"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("65530b7e-b2a2-e7f2-4781-a0a14b5ce1c7"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("696fa5bc-fe42-d6e4-3de6-5a9239ea2cb0"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("9731f4ac-9a53-1b7f-64ca-bb7be4cf9472"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("a5420397-8270-f33c-28ba-ede805773239"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("aa129230-bd9b-6cd6-dcd7-46621a38e72b"));

            migrationBuilder.DeleteData(
                table: "ElementGroup",
                keyColumn: "Id",
                keyValue: new Guid("bcdd1330-06c4-8154-2dbb-429b67609fec"));

            migrationBuilder.UpdateData(
                table: "ElementDefinition",
                keyColumn: "Id",
                keyValue: new Guid("dad6e360-7afe-51ef-f174-8e359e1d6fdc"),
                columns: new[] { "DisplayOrder", "FieldConfigJson", "GroupId", "HelpText", "SourceDocumentReference" },
                values: new object[] { 2, "{\"required\":true,\"placeholder\":\"Enter surname\",\"validation\":{\"min\":2,\"max\":50}}", new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), "Matches resident identity surname.", "resident" });

            migrationBuilder.InsertData(
                table: "ElementGroup",
                columns: new[] { "Id", "CreatedAtUtc", "Description", "DisplayOrder", "IsActive", "Key", "Name", "SourceDocumentReference", "Status", "UpdatedAtUtc", "Version" },
                values: new object[,]
                {
                    { new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "JSON-backed safety and follow-up elements sourced from the alcohol screening form.", 3, true, "screening_safety_follow_up", "Screening Safety And Follow-Up", "alcohol_screening_call", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Canonical identity fields suitable for reusable intake and admission forms.", 1, true, "resident_identity", "Resident Identity", "resident", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "JSON-backed assessment elements sourced from the alcohol screening form.", 2, true, "screening_alcohol_pattern", "Screening Alcohol Pattern", "alcohol_screening_call", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("df21f89e-a03e-741b-c4a2-4cf5eb2bbce2"), new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Reusable unbound note-style elements without canonical persistence mapping.", 4, true, "unbound_notes", "Unbound Notes", "library_seed", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.InsertData(
                table: "ElementDefinition",
                columns: new[] { "Id", "CanonicalFieldKey", "CreatedAtUtc", "Description", "DisplayOrder", "ElementType", "FieldConfigJson", "GroupId", "HelpText", "IsActive", "Key", "Label", "OptionSetKey", "SourceDocumentReference", "SourceKind", "Status", "UpdatedAtUtc", "Version" },
                values: new object[,]
                {
                    { new Guid("38f88e06-ce48-de3d-0071-173e8c31604c"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Clinical follow-up notes captured during screening.", 2, "textarea", "{\"required\":false,\"validation\":{\"max\":2000}}", new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"), "Add contextual details for follow-up and handover.", true, "assessor_notes", "Assessor Notes", null, "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("475f7311-07d1-d94b-2043-3981b2a738b2"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Primary drink type reported in screening.", 1, "select", "{\"required\":true}", new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), "Links to the shared drink type option set.", true, "drink_type", "Drink Type", "drink_type", "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("6a306056-c421-6f8d-c49d-51405573e554"), "resident.firstName", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident first name.", 1, "text", "{\"required\":true,\"placeholder\":\"Enter first name\",\"validation\":{\"min\":2,\"max\":50}}", new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), "Matches resident identity first name.", true, "first_name", "First Name", null, "resident", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("85715f16-8002-8fd3-076e-de7bd84141ee"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Average quantity reported on drinking days.", 2, "number", "{\"required\":true,\"validation\":{\"min\":0,\"max\":100}}", new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), "Approximate average on drinking days.", true, "drinks_per_day", "Drinks Per Day", null, "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("92a94372-8286-a77a-d940-22e9e722c4f7"), "resident.dateOfBirth", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Resident date of birth.", 3, "date", "{\"required\":true}", new Guid("7959f00c-0064-baad-804a-5dc4eaeefd20"), "Matches resident identity date of birth.", true, "date_of_birth", "Date of Birth", null, "resident", "canonical", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("9ee102e3-1ab3-1cf0-b8dc-7c34c1a6c6ba"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Housing status captured during screening.", 1, "select", "{\"required\":true}", new Guid("511fc940-1d47-ae07-9cb1-6c717844fc38"), "Links to the shared housing status option set.", true, "housing_status", "Housing Status", "housing_status", "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("d61eaf90-2915-09cd-8dc4-449dbdd596b4"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Referral source captured during screening.", 3, "select", "{\"required\":true}", new Guid("90187a35-98d6-bdeb-dfc4-b545227c7c63"), "Links to the shared referral source option set.", true, "referral_source", "Referral Source", "referral_source", "alcohol_screening_call", "json", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("e75c5e7a-7c38-5a83-e178-6e20333ba2df"), null, new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Unbound reusable notes block.", 1, "textarea", "{\"required\":false,\"placeholder\":\"Enter notes\",\"validation\":{\"max\":2000}}", new Guid("df21f89e-a03e-741b-c4a2-4cf5eb2bbce2"), "Reusable long-form notes area without a canonical mapping.", true, "free_notes", "Free Notes", null, "library_seed", "unbound", "published", new DateTime(2026, 2, 2, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });
        }
    }
}
