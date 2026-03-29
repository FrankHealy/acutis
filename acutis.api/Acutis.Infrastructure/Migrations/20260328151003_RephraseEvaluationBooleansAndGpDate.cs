using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RephraseEvaluationBooleansAndGpDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("2a2080bf-d4eb-4f7a-84af-b23651e0b0e5"),
                column: "SchemaJson",
                value: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"service_user_full_name\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 160 },\n    \"first_name\": { \"type\": \"string\", \"minLength\": 1, \"maxLength\": 80 },\n    \"surname\": { \"type\": \"string\", \"minLength\": 1, \"maxLength\": 80 },\n    \"date_of_birth\": { \"type\": \"date\" },\n    \"phone_number\": { \"type\": \"string\", \"maxLength\": 20, \"pattern\": \"^\\\\+?[0-9()\\\\-\\\\s]{7,20}$\", \"format\": \"phone\" },\n    \"email_address\": { \"type\": \"string\", \"maxLength\": 120, \"pattern\": \"^[A-Za-z0-9._%+\\\\-]+@[A-Za-z0-9.\\\\-]+\\\\.[A-Za-z]{2,}$\", \"format\": \"email\" },\n    \"gp_name\": { \"type\": \"string\", \"maxLength\": 160 },\n    \"medical_card_status\": { \"type\": \"boolean\" },\n    \"assessment_completion_status\": { \"type\": \"boolean\" },\n    \"assessment_completion_date\": { \"type\": \"date\" },\n    \"consent_mental_health_shared_record\": { \"type\": \"boolean\" },\n    \"source_of_referral\": { \"type\": \"enum\" },\n    \"ever_treated_for_substance_use\": { \"type\": \"boolean\" },\n    \"ever_treated_for_alcohol\": { \"type\": \"boolean\" },\n    \"total_previous_treatments\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 250 },\n    \"age_first_treated\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 120 },\n    \"treatment_providers\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"reason_for_leaving_treatment\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"longest_time_abstinent\": { \"type\": \"string\", \"maxLength\": 120 },\n    \"current_opiate_agonist_treatment\": { \"type\": \"boolean\" },\n    \"other_current_treatment_medication\": { \"type\": \"boolean\" },\n    \"physical_health_concerns\": { \"type\": \"boolean\" },\n    \"known_allergies\": { \"type\": \"boolean\" },\n    \"history_of_head_injury\": { \"type\": \"boolean\" },\n    \"last_gp_checkup\": { \"type\": \"date\" },\n    \"relevant_medical_history\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"current_medications\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"history_of_seizures\": { \"type\": \"boolean\" },\n    \"mental_health_concerns\": { \"type\": \"boolean\" },\n    \"mental_health_professional_engagement\": { \"type\": \"boolean\" },\n    \"history_of_psychiatric_care\": { \"type\": \"boolean\" },\n    \"history_of_self_harm_or_suicidal_thoughts\": { \"type\": \"boolean\" },\n    \"mood_last_month\": { \"type\": \"enum\" },\n    \"mental_health_details\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"comprehensive_assessment_needed\": { \"type\": \"boolean\" },\n    \"comprehensive_assessment_arranged\": { \"type\": \"boolean\" },\n    \"additional_comments_details\": { \"type\": \"text\", \"maxLength\": 2000 }\n  },\n  \"required\": [\n    \"service_user_full_name\",\n    \"first_name\",\n    \"surname\",\n    \"date_of_birth\",\n    \"assessment_completion_status\",\n    \"consent_mental_health_shared_record\"\n  ]\n}");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Concerns About Mental Health",
                column: "DefaultText",
                value: "Mental Health Concerns Identified");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Concerns About Physical Health",
                column: "DefaultText",
                value: "Physical Health Concerns Identified");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Consent to Shared Mental Health Record",
                column: "DefaultText",
                value: "Consent Given to Share the Mental Health Record");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Current Opiate Agonist Treatment",
                column: "DefaultText",
                value: "Currently Receiving Opiate Agonist Treatment");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Ever Treated for Alcohol",
                column: "DefaultText",
                value: "Previously Treated for Alcohol Use");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Ever Treated for Substance Use",
                column: "DefaultText",
                value: "Previously Treated for Substance Use");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "History of Self Harm or Suicidal Thoughts",
                column: "DefaultText",
                value: "History of Self-Harm or Suicidal Thoughts");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Known Allergies",
                column: "DefaultText",
                value: "Known Allergies (More Info)");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Medical Card",
                column: "DefaultText",
                value: "Medical Card Held");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Other Current Treatment / Prescribed Medications",
                column: "DefaultText",
                value: "Currently Taking Other Treatment or Prescribed Medication");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Seen or Seeing a Mental Health Professional",
                column: "DefaultText",
                value: "Seen or Seeing a Mental Health Professional (More Info)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("37efcbaf-2539-44ca-aac3-bb8cca1d2acf"),
                column: "Text",
                value: "تم تحديد مخاوف تتعلق بالصحة النفسية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("57cf1cf1-557e-4efc-b51c-8ff265838780"),
                column: "Text",
                value: "يتناول حالياً علاجاً آخر أو دواءً موصوفاً");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("57d2224b-e3ec-4dfe-9a5f-b5c51d1770b0"),
                column: "Text",
                value: "تم منح الموافقة على مشاركة سجل الصحة النفسية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("604c88c3-1e6b-4f3f-b8ca-72da79cbc9d2"),
                column: "Text",
                value: "حساسيات معروفة (مزيد من المعلومات)");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("70c4577c-50f2-41c6-9174-f35453295d85"),
                column: "Text",
                value: "تلقى علاجاً سابقاً لتعاطي الكحول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7a6c0acb-5c6e-4460-9dd3-b0f77afca2ea"),
                column: "Text",
                value: "تم تحديد مخاوف تتعلق بالصحة الجسدية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9d31db4c-8a78-4a39-bf28-978e05377a87"),
                column: "Text",
                value: "يتلقى حالياً علاجاً بناهضات الأفيونات");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a351a748-18c8-4ad5-9d1b-d3dc75abd273"),
                column: "Text",
                value: "تلقى علاجاً سابقاً لتعاطي المواد");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b3069cc6-6dc3-46dd-a942-f2b5396a51e7"),
                column: "Text",
                value: "بطاقة طبية متوفرة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e510b335-5ff1-4a32-b4f5-f6fbaeb0e2f4"),
                column: "Text",
                value: "راجع أو يراجع مختصاً في الصحة النفسية (مزيد من المعلومات)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FormDefinition",
                keyColumn: "Id",
                keyValue: new Guid("2a2080bf-d4eb-4f7a-84af-b23651e0b0e5"),
                column: "SchemaJson",
                value: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"service_user_full_name\": { \"type\": \"string\", \"minLength\": 2, \"maxLength\": 160 },\n    \"first_name\": { \"type\": \"string\", \"minLength\": 1, \"maxLength\": 80 },\n    \"surname\": { \"type\": \"string\", \"minLength\": 1, \"maxLength\": 80 },\n    \"date_of_birth\": { \"type\": \"date\" },\n    \"phone_number\": { \"type\": \"string\", \"maxLength\": 20, \"pattern\": \"^\\\\+?[0-9()\\\\-\\\\s]{7,20}$\", \"format\": \"phone\" },\n    \"email_address\": { \"type\": \"string\", \"maxLength\": 120, \"pattern\": \"^[A-Za-z0-9._%+\\\\-]+@[A-Za-z0-9.\\\\-]+\\\\.[A-Za-z]{2,}$\", \"format\": \"email\" },\n    \"gp_name\": { \"type\": \"string\", \"maxLength\": 160 },\n    \"medical_card_status\": { \"type\": \"boolean\" },\n    \"assessment_completion_status\": { \"type\": \"boolean\" },\n    \"assessment_completion_date\": { \"type\": \"date\" },\n    \"consent_mental_health_shared_record\": { \"type\": \"boolean\" },\n    \"source_of_referral\": { \"type\": \"enum\" },\n    \"ever_treated_for_substance_use\": { \"type\": \"boolean\" },\n    \"ever_treated_for_alcohol\": { \"type\": \"boolean\" },\n    \"total_previous_treatments\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 250 },\n    \"age_first_treated\": { \"type\": \"integer\", \"minimum\": 0, \"maximum\": 120 },\n    \"treatment_providers\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"reason_for_leaving_treatment\": { \"type\": \"text\", \"maxLength\": 1000 },\n    \"longest_time_abstinent\": { \"type\": \"string\", \"maxLength\": 120 },\n    \"current_opiate_agonist_treatment\": { \"type\": \"boolean\" },\n    \"other_current_treatment_medication\": { \"type\": \"boolean\" },\n    \"physical_health_concerns\": { \"type\": \"boolean\" },\n    \"known_allergies\": { \"type\": \"boolean\" },\n    \"history_of_head_injury\": { \"type\": \"boolean\" },\n    \"last_gp_checkup\": { \"type\": \"string\", \"maxLength\": 160 },\n    \"relevant_medical_history\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"current_medications\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"history_of_seizures\": { \"type\": \"boolean\" },\n    \"mental_health_concerns\": { \"type\": \"boolean\" },\n    \"mental_health_professional_engagement\": { \"type\": \"boolean\" },\n    \"history_of_psychiatric_care\": { \"type\": \"boolean\" },\n    \"history_of_self_harm_or_suicidal_thoughts\": { \"type\": \"boolean\" },\n    \"mood_last_month\": { \"type\": \"enum\" },\n    \"mental_health_details\": { \"type\": \"text\", \"maxLength\": 2000 },\n    \"comprehensive_assessment_needed\": { \"type\": \"boolean\" },\n    \"comprehensive_assessment_arranged\": { \"type\": \"boolean\" },\n    \"additional_comments_details\": { \"type\": \"text\", \"maxLength\": 2000 }\n  },\n  \"required\": [\n    \"service_user_full_name\",\n    \"first_name\",\n    \"surname\",\n    \"date_of_birth\",\n    \"assessment_completion_status\",\n    \"consent_mental_health_shared_record\"\n  ]\n}");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Concerns About Mental Health",
                column: "DefaultText",
                value: "Concerns About Mental Health");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Concerns About Physical Health",
                column: "DefaultText",
                value: "Concerns About Physical Health");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Consent to Shared Mental Health Record",
                column: "DefaultText",
                value: "Consent to Shared Mental Health Record");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Current Opiate Agonist Treatment",
                column: "DefaultText",
                value: "Current Opiate Agonist Treatment");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Ever Treated for Alcohol",
                column: "DefaultText",
                value: "Ever Treated for Alcohol");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Ever Treated for Substance Use",
                column: "DefaultText",
                value: "Ever Treated for Substance Use");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "History of Self Harm or Suicidal Thoughts",
                column: "DefaultText",
                value: "History of Self Harm or Suicidal Thoughts");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Known Allergies",
                column: "DefaultText",
                value: "Known Allergies");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Medical Card",
                column: "DefaultText",
                value: "Medical Card");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Other Current Treatment / Prescribed Medications",
                column: "DefaultText",
                value: "Other Current Treatment / Prescribed Medications");

            migrationBuilder.UpdateData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Seen or Seeing a Mental Health Professional",
                column: "DefaultText",
                value: "Seen or Seeing a Mental Health Professional");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("37efcbaf-2539-44ca-aac3-bb8cca1d2acf"),
                column: "Text",
                value: "مخاوف بشأن الصحة النفسية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("57cf1cf1-557e-4efc-b51c-8ff265838780"),
                column: "Text",
                value: "العلاج الحالي الآخر أو الأدوية الموصوفة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("57d2224b-e3ec-4dfe-9a5f-b5c51d1770b0"),
                column: "Text",
                value: "الموافقة على مشاركة سجل الصحة النفسية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("604c88c3-1e6b-4f3f-b8ca-72da79cbc9d2"),
                column: "Text",
                value: "الحساسيات المعروفة");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("70c4577c-50f2-41c6-9174-f35453295d85"),
                column: "Text",
                value: "هل تلقى علاجا سابقا للكحول");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7a6c0acb-5c6e-4460-9dd3-b0f77afca2ea"),
                column: "Text",
                value: "مخاوف بشأن الصحة الجسدية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9d31db4c-8a78-4a39-bf28-978e05377a87"),
                column: "Text",
                value: "العلاج الحالي بناهضات الأفيونات");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a351a748-18c8-4ad5-9d1b-d3dc75abd273"),
                column: "Text",
                value: "هل تلقى علاجا سابقا لتعاطي المواد");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b3069cc6-6dc3-46dd-a942-f2b5396a51e7"),
                column: "Text",
                value: "البطاقة الطبية");

            migrationBuilder.UpdateData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e510b335-5ff1-4a32-b4f5-f6fbaeb0e2f4"),
                column: "Text",
                value: "راجع أو يراجع مختصا في الصحة النفسية");
        }
    }
}
