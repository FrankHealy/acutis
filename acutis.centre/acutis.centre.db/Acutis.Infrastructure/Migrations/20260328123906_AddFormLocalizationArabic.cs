using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Acutis.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFormLocalizationArabic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "TextResource",
                columns: new[] { "Key", "DefaultText" },
                values: new object[,]
                {
                    { "Additional Comments Details", "Additional Comments Details" },
                    { "Age First Treated", "Age First Treated" },
                    { "Assessment Completion Date", "Assessment Completion Date" },
                    { "Assessor Actions Required", "Assessor Actions Required" },
                    { "Comprehensive Assessment Arranged", "Comprehensive Assessment Arranged" },
                    { "Comprehensive Assessment Completed", "Comprehensive Assessment Completed" },
                    { "Comprehensive Assessment Needed", "Comprehensive Assessment Needed" },
                    { "Concerns About Mental Health", "Concerns About Mental Health" },
                    { "Concerns About Physical Health", "Concerns About Physical Health" },
                    { "Consent and Confidentiality", "Consent and Confidentiality" },
                    { "Consent to Shared Mental Health Record", "Consent to Shared Mental Health Record" },
                    { "Current Medications", "Current Medications" },
                    { "Current Opiate Agonist Treatment", "Current Opiate Agonist Treatment" },
                    { "Date of Birth", "Date of Birth" },
                    { "Email Address", "Email Address" },
                    { "evaluation.action.awaiting", "Awaiting" },
                    { "evaluation.action.open", "Open Evaluation" },
                    { "evaluation.action.review", "Review Screening" },
                    { "evaluation.action.start", "Start Screening" },
                    { "evaluation.queue.alcohol", "Alcohol" },
                    { "evaluation.queue.all", "All Queues" },
                    { "evaluation.queue.drugs", "Drugs" },
                    { "evaluation.queue.gambling", "Gambling" },
                    { "evaluation.queue.general_query", "General Query" },
                    { "evaluation.queue.ladies", "Ladies" },
                    { "evaluation.table.phone", "Phone Number" },
                    { "evaluation.table.queue", "Queue" },
                    { "Ever Treated for Alcohol", "Ever Treated for Alcohol" },
                    { "Ever Treated for Substance Use", "Ever Treated for Substance Use" },
                    { "Family", "Family" },
                    { "First Name", "First Name" },
                    { "form.action.next", "Next" },
                    { "form.action.previous", "Previous" },
                    { "form.action.save_draft", "Save Draft" },
                    { "form.action.saving", "Saving..." },
                    { "form.action.submit", "Submit" },
                    { "form.action.submitting", "Submitting..." },
                    { "form.error.save_progress", "Unable to save progress." },
                    { "form.error.submission_failed", "Submission failed." },
                    { "form.group.default", "Group" },
                    { "form.select.placeholder", "Select..." },
                    { "form.status.draft_saved_at", "Draft saved at {time}." },
                    { "form.status.progress_saved_on_blur", "Progress saves on field blur." },
                    { "form.status.saving_progress", "Saving progress..." },
                    { "form.status.submitted", "Submitted." },
                    { "form.validation.expected_boolean", "Expected boolean." },
                    { "form.validation.expected_integer", "Expected integer." },
                    { "form.validation.expected_number", "Expected number." },
                    { "form.validation.expected_option_list", "Expected a list of option codes." },
                    { "form.validation.expected_type", "Expected {type}." },
                    { "form.validation.invalid_format", "Invalid {format} format." },
                    { "form.validation.invalid_option", "Invalid option value." },
                    { "form.validation.invalid_option_list", "One or more options are invalid." },
                    { "form.validation.max_length", "Maximum length is {value}." },
                    { "form.validation.max_value", "Maximum value is {value}." },
                    { "form.validation.min_length", "Minimum length is {value}." },
                    { "form.validation.min_value", "Minimum value is {value}." },
                    { "form.validation.pattern", "Value does not match required format." },
                    { "form.validation.required", "This field is required." },
                    { "Good", "Good" },
                    { "GP", "GP" },
                    { "GP Name", "GP Name" },
                    { "History of Head Injury", "History of Head Injury" },
                    { "History of Psychiatric Care", "History of Psychiatric Care" },
                    { "History of Seizures", "History of Seizures" },
                    { "History of Self Harm or Suicidal Thoughts", "History of Self Harm or Suicidal Thoughts" },
                    { "HSE library source: Assessor actions required / AF Printed Page 15.html / json", "HSE library source: Assessor actions required / AF Printed Page 15.html / json" },
                    { "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json", "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json" },
                    { "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json", "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json" },
                    { "HSE library source: Intake and admin identity / AF Printed Page 6.html / json", "HSE library source: Intake and admin identity / AF Printed Page 6.html / json" },
                    { "HSE library source: Mental health / AF Printed Page 13.html / json", "HSE library source: Mental health / AF Printed Page 13.html / json" },
                    { "HSE library source: Physical health / AF Printed Page 12.html / json", "HSE library source: Physical health / AF Printed Page 12.html / json" },
                    { "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json", "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json" },
                    { "Intake and Administrative Identity", "Intake and Administrative Identity" },
                    { "Known Allergies", "Known Allergies" },
                    { "Last GP Check-Up", "Last GP Check-Up" },
                    { "Longest Time Abstinent", "Longest Time Abstinent" },
                    { "Low", "Low" },
                    { "Medical Card", "Medical Card" },
                    { "Mental Health", "Mental Health" },
                    { "Mental Health Details", "Mental Health Details" },
                    { "Mood Over the Last Month", "Mood Over the Last Month" },
                    { "Name of Treatment Provider(s)", "Name of Treatment Provider(s)" },
                    { "Other", "Other" },
                    { "Other Current Treatment / Prescribed Medications", "Other Current Treatment / Prescribed Medications" },
                    { "Phone Number", "Phone Number" },
                    { "Physical Health", "Physical Health" },
                    { "Reason for Leaving", "Reason for Leaving" },
                    { "Reasonable", "Reasonable" },
                    { "Relevant Medical History", "Relevant Medical History" },
                    { "screening.page.title", "Screening & Evaluation" },
                    { "Seen or Seeing a Mental Health Professional", "Seen or Seeing a Mental Health Professional" },
                    { "Self", "Self" },
                    { "Service User Name", "Service User Name" },
                    { "Source of Referral", "Source of Referral" },
                    { "Substance and Treatment History", "Substance and Treatment History" },
                    { "Surname", "Surname" },
                    { "Total Number of Previous Treatments", "Total Number of Previous Treatments" },
                    { "Very low", "Very low" }
                });

            migrationBuilder.InsertData(
                table: "TextTranslation",
                columns: new[] { "Id", "Key", "Locale", "Text" },
                values: new object[,]
                {
                    { new Guid("00fd3cde-ac1b-483c-b742-e5781688b9d4"), "evaluation.queue.ladies", "ar", "السيدات" },
                    { new Guid("01bd91d0-d906-45bf-ba71-0ab6de2f89d4"), "History of Head Injury", "ar", "تاريخ إصابات الرأس" },
                    { new Guid("02269162-87e9-4952-b2df-5575dbe2fa90"), "evaluation.queue.general_query", "ar", "الاستفسارات العامة" },
                    { new Guid("0333296b-637b-4b7a-8913-ad14bc58c6c3"), "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json", "ar", "مصدر مكتبة HSE: الموافقة والسرية / AF Printed Page 1.html / json" },
                    { new Guid("06b4cf6c-fea5-4b6f-8674-62f87c79d355"), "form.error.save_progress", "ar", "تعذر حفظ التقدم." },
                    { new Guid("0c0f3029-002e-40c4-a242-51c764a43103"), "HSE library source: Intake and admin identity / AF Printed Page 6.html / json", "ar", "مصدر مكتبة HSE: الاستقبال والهوية الإدارية / AF Printed Page 6.html / json" },
                    { new Guid("0f9b886d-1538-4a88-8f07-bab77cf88269"), "Assessment Completion Date", "ar", "تاريخ اكتمال التقييم" },
                    { new Guid("135cc8e6-330d-4ad5-8f17-f6a12b60a7a8"), "Longest Time Abstinent", "ar", "أطول مدة امتناع" },
                    { new Guid("1a2990a2-b9c0-49ec-9af9-7eaf3bf1171e"), "form.action.saving", "ar", "جار الحفظ..." },
                    { new Guid("1da9883a-d053-4e26-a0fb-d62f6f5580d8"), "Family", "ar", "الأسرة" },
                    { new Guid("2398ebc8-9128-4f48-9e30-b02872edbba1"), "Relevant Medical History", "ar", "التاريخ الطبي ذي الصلة" },
                    { new Guid("2adf4542-ab8f-431e-8c9c-12328b3baf24"), "form.status.submitted", "ar", "تم الإرسال." },
                    { new Guid("2b6c5d2d-ce64-4fb6-ad54-b5d1006bb615"), "Substance and Treatment History", "ar", "تاريخ التعاطي والعلاج" },
                    { new Guid("324dd734-5c19-4f26-8fc9-f8abebfba4b8"), "form.action.submit", "ar", "إرسال" },
                    { new Guid("348725bb-8682-4499-8997-28e4d04bc250"), "Phone Number", "ar", "رقم الهاتف" },
                    { new Guid("37efcbaf-2539-44ca-aac3-bb8cca1d2acf"), "Concerns About Mental Health", "ar", "مخاوف بشأن الصحة النفسية" },
                    { new Guid("400ca48a-cb25-4170-a286-fd7ab1684989"), "evaluation.queue.alcohol", "ar", "الكحول" },
                    { new Guid("41a58f89-3087-4adf-a124-393a7b5d8fc0"), "Assessor Actions Required", "ar", "الإجراءات المطلوبة من المقيم" },
                    { new Guid("4d26b5f0-b4a7-46e4-958e-fd5046426e8e"), "form.validation.expected_boolean", "ar", "القيمة المتوقعة منطقية." },
                    { new Guid("507d041d-ec45-4fdd-802b-c32f58e0f6ca"), "Name of Treatment Provider(s)", "ar", "اسم جهة أو جهات تقديم العلاج" },
                    { new Guid("51451a8c-29c6-4d77-a3fd-01f5a7696ae7"), "evaluation.table.queue", "ar", "القائمة" },
                    { new Guid("53550d97-8d2e-4df7-9e08-8fe6f3b40f6e"), "form.validation.min_value", "ar", "الحد الأدنى للقيمة هو {value}." },
                    { new Guid("5477f6d8-20c3-4d8d-a904-4f4d98602021"), "form.validation.invalid_option", "ar", "قيمة الخيار غير صالحة." },
                    { new Guid("554d445a-b2c5-4b54-8d73-4687d304bb76"), "Surname", "ar", "اللقب" },
                    { new Guid("561c40aa-850b-46ed-bca1-fc5a6e3ce91e"), "First Name", "ar", "الاسم الأول" },
                    { new Guid("57cf1cf1-557e-4efc-b51c-8ff265838780"), "Other Current Treatment / Prescribed Medications", "ar", "العلاج الحالي الآخر أو الأدوية الموصوفة" },
                    { new Guid("57d2224b-e3ec-4dfe-9a5f-b5c51d1770b0"), "Consent to Shared Mental Health Record", "ar", "الموافقة على مشاركة سجل الصحة النفسية" },
                    { new Guid("5919ffba-7147-4365-9838-1681eb1247ff"), "Last GP Check-Up", "ar", "آخر فحص عند الطبيب العام" },
                    { new Guid("5a711fec-e093-4f12-a160-490deaf93702"), "form.validation.expected_integer", "ar", "القيمة المتوقعة عدد صحيح." },
                    { new Guid("5df2111d-a81a-4cf8-b822-fb4cbe670f89"), "form.action.submitting", "ar", "جار الإرسال..." },
                    { new Guid("5e89bcfb-bc40-4139-a36e-893b4534805f"), "evaluation.action.awaiting", "ar", "بانتظار" },
                    { new Guid("5fef526c-0f52-4bc2-91ba-5933ef0c8397"), "form.select.placeholder", "ar", "اختر..." },
                    { new Guid("600e1524-10bb-4be6-a3c1-203377d8b5e5"), "Total Number of Previous Treatments", "ar", "إجمالي عدد العلاجات السابقة" },
                    { new Guid("60410c00-c9ab-4c75-8c16-a38fe2c9112d"), "form.status.progress_saved_on_blur", "ar", "يتم حفظ التقدم عند مغادرة الحقل." },
                    { new Guid("604c88c3-1e6b-4f3f-b8ca-72da79cbc9d2"), "Known Allergies", "ar", "الحساسيات المعروفة" },
                    { new Guid("64c905cf-cdbe-43f5-90a7-8f4c0733f3be"), "form.validation.pattern", "ar", "القيمة لا تطابق التنسيق المطلوب." },
                    { new Guid("651f170e-57b0-491a-a2b4-0b2423072ae3"), "form.validation.expected_type", "ar", "القيمة المتوقعة هي {type}." },
                    { new Guid("66758eea-e1f4-472b-a762-e251f310f3e4"), "evaluation.action.review", "ar", "مراجعة الفحص" },
                    { new Guid("69a5e0ed-f649-4582-b64e-48d3f95af261"), "Date of Birth", "ar", "تاريخ الميلاد" },
                    { new Guid("6b295df7-f278-4614-bae0-c5111e2dcd95"), "form.action.save_draft", "ar", "حفظ المسودة" },
                    { new Guid("6b4561f1-fd40-487f-9e59-f0e0e7f65fd0"), "form.group.default", "ar", "مجموعة" },
                    { new Guid("6bb77c7c-c6b5-4cb0-a2e3-130baed2569d"), "form.validation.invalid_option_list", "ar", "خيار واحد أو أكثر غير صالح." },
                    { new Guid("70c4577c-50f2-41c6-9174-f35453295d85"), "Ever Treated for Alcohol", "ar", "هل تلقى علاجا سابقا للكحول" },
                    { new Guid("74a4d715-f638-4ad7-93d3-e19333656d1d"), "Reasonable", "ar", "معقول" },
                    { new Guid("7a6c0acb-5c6e-4460-9dd3-b0f77afca2ea"), "Concerns About Physical Health", "ar", "مخاوف بشأن الصحة الجسدية" },
                    { new Guid("7aa6f38d-55ca-404d-84da-3b28ecbf4252"), "HSE library source: Mental health / AF Printed Page 13.html / json", "ar", "مصدر مكتبة HSE: الصحة النفسية / AF Printed Page 13.html / json" },
                    { new Guid("7d2e4f98-74e9-4e83-88cf-31af3fdd3f14"), "form.validation.expected_option_list", "ar", "المتوقع قائمة من رموز الخيارات." },
                    { new Guid("7de6b3d0-204f-4ebd-bfb0-8d689592dedb"), "Source of Referral", "ar", "مصدر الإحالة" },
                    { new Guid("7ef25e4d-3fbf-4afe-96bb-9e55ea97894d"), "evaluation.table.phone", "ar", "رقم الهاتف" },
                    { new Guid("839b371f-e118-4dab-bd57-37d6a9a0725b"), "form.action.previous", "ar", "السابق" },
                    { new Guid("87a3b3df-08bb-4c18-aefc-b29af3147634"), "form.validation.invalid_format", "ar", "تنسيق {format} غير صالح." },
                    { new Guid("88802650-d75c-4370-b112-57ee8010dbf7"), "Self", "ar", "الذات" },
                    { new Guid("8981d1e4-f4a1-45e5-b2da-4a3b884737ab"), "Current Medications", "ar", "الأدوية الحالية" },
                    { new Guid("8ab90d8f-45f3-4e11-8e97-863a03cd6e61"), "HSE library source: Physical health / AF Printed Page 12.html / json", "ar", "مصدر مكتبة HSE: الصحة الجسدية / AF Printed Page 12.html / json" },
                    { new Guid("8c2d9d4f-9560-4c2b-9222-8348d66ad3bb"), "GP Name", "ar", "اسم الطبيب العام" },
                    { new Guid("8ef8a084-1220-4454-aac4-b9c7d90ed1a1"), "Comprehensive Assessment Arranged", "ar", "تم ترتيب التقييم الشامل" },
                    { new Guid("8fa2f5f8-f75d-4cb8-a662-123efbf2866e"), "Low", "ar", "منخفض" },
                    { new Guid("8ffcf90e-18ea-45f1-b874-55ba56aede9e"), "Very low", "ar", "منخفض جدا" },
                    { new Guid("93c26d2d-4a14-480f-8951-fbb6b00b610b"), "Consent and Confidentiality", "ar", "الموافقة والسرية" },
                    { new Guid("954d6b17-b2f8-441f-9d91-a7ee5db65379"), "History of Self Harm or Suicidal Thoughts", "ar", "تاريخ إيذاء النفس أو الأفكار الانتحارية" },
                    { new Guid("97f4810f-1bdb-4354-9ff4-f2ef11b07e6d"), "form.status.draft_saved_at", "ar", "تم حفظ المسودة في {time}." },
                    { new Guid("99a9c9e6-20c7-40c3-be53-47e56ddda35b"), "form.action.next", "ar", "التالي" },
                    { new Guid("9d31db4c-8a78-4a39-bf28-978e05377a87"), "Current Opiate Agonist Treatment", "ar", "العلاج الحالي بناهضات الأفيونات" },
                    { new Guid("9f311ef4-cf7b-4976-849f-ebd2335194f1"), "form.validation.min_length", "ar", "الحد الأدنى للطول هو {value}." },
                    { new Guid("a12aff89-f092-4d15-8090-ed658f749eb2"), "Physical Health", "ar", "الصحة الجسدية" },
                    { new Guid("a1e1e245-82d6-46c9-af3c-f685ec5bc93f"), "evaluation.action.start", "ar", "بدء الفحص" },
                    { new Guid("a283092b-aa56-4c4c-b43d-37f8dc1be4db"), "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json", "ar", "مصدر مكتبة HSE: الموافقة والسرية / AF Printed Page 3.html / json" },
                    { new Guid("a351a748-18c8-4ad5-9d1b-d3dc75abd273"), "Ever Treated for Substance Use", "ar", "هل تلقى علاجا سابقا لتعاطي المواد" },
                    { new Guid("a388e4e0-1d7a-4359-adf7-9d60715b27df"), "form.status.saving_progress", "ar", "جار حفظ التقدم..." },
                    { new Guid("a466b8ab-c0c5-4f84-81e2-fefba79ac784"), "Mental Health", "ar", "الصحة النفسية" },
                    { new Guid("a4823b67-4145-48ca-8dcb-987e931e478a"), "evaluation.queue.all", "ar", "كل القوائم" },
                    { new Guid("a5786ff5-7c1d-42ff-a826-7e72d14c537c"), "History of Psychiatric Care", "ar", "تاريخ الرعاية النفسية" },
                    { new Guid("adcd199b-85e2-4d1d-a18f-8d4b09cf45b0"), "Reason for Leaving", "ar", "سبب المغادرة" },
                    { new Guid("b0a3d81e-584f-4756-a727-b2e93b430590"), "screening.page.title", "ar", "الفحص والتقييم" },
                    { new Guid("b3069cc6-6dc3-46dd-a942-f2b5396a51e7"), "Medical Card", "ar", "البطاقة الطبية" },
                    { new Guid("b7a4475a-75d0-44a5-8ca1-6ef72ad6e95b"), "form.validation.max_value", "ar", "الحد الأقصى للقيمة هو {value}." },
                    { new Guid("b8346b69-3d68-4a47-b090-c08de8ba66fc"), "GP", "ar", "الطبيب العام" },
                    { new Guid("bc0c8777-2c67-4a47-8466-b371f0a178d9"), "History of Seizures", "ar", "تاريخ النوبات" },
                    { new Guid("bc6e4c19-46dd-4200-b775-a47dfecdb43f"), "Other", "ar", "أخرى" },
                    { new Guid("c4609f85-60d1-4f03-bc41-85133b847891"), "Intake and Administrative Identity", "ar", "الاستقبال والهوية الإدارية" },
                    { new Guid("c65d20ca-d618-4a83-80bd-4c6389ca6d6b"), "Good", "ar", "جيد" },
                    { new Guid("c78f0c59-e220-49d0-a8fc-9333f802777d"), "Email Address", "ar", "البريد الإلكتروني" },
                    { new Guid("c7e03c2c-1946-4ceb-b252-79a3eb5bfa8c"), "Mental Health Details", "ar", "تفاصيل الصحة النفسية" },
                    { new Guid("ca371ef4-2ccc-49e4-b28a-7807700d5239"), "HSE library source: Assessor actions required / AF Printed Page 15.html / json", "ar", "مصدر مكتبة HSE: الإجراءات المطلوبة من المقيم / AF Printed Page 15.html / json" },
                    { new Guid("cb1f6f13-f5a1-4544-9093-83d2f57bf679"), "Additional Comments Details", "ar", "تفاصيل التعليقات الإضافية" },
                    { new Guid("cb9c1bb2-f682-4c11-861d-284238769783"), "Comprehensive Assessment Needed", "ar", "التقييم الشامل مطلوب" },
                    { new Guid("cc0638f0-d318-408d-966c-5451a8ac20e8"), "Age First Treated", "ar", "العمر عند أول علاج" },
                    { new Guid("d886900e-b6b6-42aa-b018-2022044770df"), "evaluation.queue.gambling", "ar", "القمار" },
                    { new Guid("db2c6ce7-bc37-4af4-9a68-5081ea4ea807"), "evaluation.queue.drugs", "ar", "المخدرات" },
                    { new Guid("e510b335-5ff1-4a32-b4f5-f6fbaeb0e2f4"), "Seen or Seeing a Mental Health Professional", "ar", "راجع أو يراجع مختصا في الصحة النفسية" },
                    { new Guid("eb6eff4b-6370-40ee-b2bb-4689decae667"), "form.validation.max_length", "ar", "الحد الأقصى للطول هو {value}." },
                    { new Guid("ecbb8470-5ff5-45cb-80e8-238f5bcbe779"), "Comprehensive Assessment Completed", "ar", "اكتمل التقييم الشامل" },
                    { new Guid("ed9ec0b5-d97c-41d3-bb6d-b1df8274cb76"), "form.error.submission_failed", "ar", "فشل الإرسال." },
                    { new Guid("efab4558-c9a2-4c76-8098-a279ce2fe167"), "Mood Over the Last Month", "ar", "الحالة المزاجية خلال الشهر الماضي" },
                    { new Guid("f4bfa3d7-b1ab-43a4-a8ec-0356d9f43b4d"), "form.validation.required", "ar", "هذا الحقل مطلوب." },
                    { new Guid("f5ff2911-4b8d-4d3e-b8c8-7415df4e90e8"), "form.validation.expected_number", "ar", "القيمة المتوقعة رقم." },
                    { new Guid("f73ae6be-e73c-4e7c-8482-e36b641acb7c"), "Service User Name", "ar", "اسم متلقي الخدمة" },
                    { new Guid("fb237fca-f632-4874-b8e1-0180dbf21f84"), "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json", "ar", "مصدر مكتبة HSE: تاريخ التعاطي والعلاج / AF Printed Page 10.html / json" },
                    { new Guid("fc698803-34b1-4f59-a0c1-7c1c2bfec276"), "evaluation.action.open", "ar", "فتح التقييم" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("00fd3cde-ac1b-483c-b742-e5781688b9d4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("01bd91d0-d906-45bf-ba71-0ab6de2f89d4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("02269162-87e9-4952-b2df-5575dbe2fa90"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0333296b-637b-4b7a-8913-ad14bc58c6c3"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("06b4cf6c-fea5-4b6f-8674-62f87c79d355"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0c0f3029-002e-40c4-a242-51c764a43103"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("0f9b886d-1538-4a88-8f07-bab77cf88269"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("135cc8e6-330d-4ad5-8f17-f6a12b60a7a8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1a2990a2-b9c0-49ec-9af9-7eaf3bf1171e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("1da9883a-d053-4e26-a0fb-d62f6f5580d8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2398ebc8-9128-4f48-9e30-b02872edbba1"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2adf4542-ab8f-431e-8c9c-12328b3baf24"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("2b6c5d2d-ce64-4fb6-ad54-b5d1006bb615"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("324dd734-5c19-4f26-8fc9-f8abebfba4b8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("348725bb-8682-4499-8997-28e4d04bc250"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("37efcbaf-2539-44ca-aac3-bb8cca1d2acf"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("400ca48a-cb25-4170-a286-fd7ab1684989"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("41a58f89-3087-4adf-a124-393a7b5d8fc0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("4d26b5f0-b4a7-46e4-958e-fd5046426e8e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("507d041d-ec45-4fdd-802b-c32f58e0f6ca"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("51451a8c-29c6-4d77-a3fd-01f5a7696ae7"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("53550d97-8d2e-4df7-9e08-8fe6f3b40f6e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5477f6d8-20c3-4d8d-a904-4f4d98602021"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("554d445a-b2c5-4b54-8d73-4687d304bb76"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("561c40aa-850b-46ed-bca1-fc5a6e3ce91e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("57cf1cf1-557e-4efc-b51c-8ff265838780"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("57d2224b-e3ec-4dfe-9a5f-b5c51d1770b0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5919ffba-7147-4365-9838-1681eb1247ff"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5a711fec-e093-4f12-a160-490deaf93702"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5df2111d-a81a-4cf8-b822-fb4cbe670f89"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5e89bcfb-bc40-4139-a36e-893b4534805f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("5fef526c-0f52-4bc2-91ba-5933ef0c8397"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("600e1524-10bb-4be6-a3c1-203377d8b5e5"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("60410c00-c9ab-4c75-8c16-a38fe2c9112d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("604c88c3-1e6b-4f3f-b8ca-72da79cbc9d2"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("64c905cf-cdbe-43f5-90a7-8f4c0733f3be"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("651f170e-57b0-491a-a2b4-0b2423072ae3"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("66758eea-e1f4-472b-a762-e251f310f3e4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("69a5e0ed-f649-4582-b64e-48d3f95af261"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6b295df7-f278-4614-bae0-c5111e2dcd95"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6b4561f1-fd40-487f-9e59-f0e0e7f65fd0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("6bb77c7c-c6b5-4cb0-a2e3-130baed2569d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("70c4577c-50f2-41c6-9174-f35453295d85"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("74a4d715-f638-4ad7-93d3-e19333656d1d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7a6c0acb-5c6e-4460-9dd3-b0f77afca2ea"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7aa6f38d-55ca-404d-84da-3b28ecbf4252"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7d2e4f98-74e9-4e83-88cf-31af3fdd3f14"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7de6b3d0-204f-4ebd-bfb0-8d689592dedb"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("7ef25e4d-3fbf-4afe-96bb-9e55ea97894d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("839b371f-e118-4dab-bd57-37d6a9a0725b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("87a3b3df-08bb-4c18-aefc-b29af3147634"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("88802650-d75c-4370-b112-57ee8010dbf7"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8981d1e4-f4a1-45e5-b2da-4a3b884737ab"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8ab90d8f-45f3-4e11-8e97-863a03cd6e61"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8c2d9d4f-9560-4c2b-9222-8348d66ad3bb"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8ef8a084-1220-4454-aac4-b9c7d90ed1a1"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8fa2f5f8-f75d-4cb8-a662-123efbf2866e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("8ffcf90e-18ea-45f1-b874-55ba56aede9e"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("93c26d2d-4a14-480f-8951-fbb6b00b610b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("954d6b17-b2f8-441f-9d91-a7ee5db65379"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("97f4810f-1bdb-4354-9ff4-f2ef11b07e6d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("99a9c9e6-20c7-40c3-be53-47e56ddda35b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9d31db4c-8a78-4a39-bf28-978e05377a87"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("9f311ef4-cf7b-4976-849f-ebd2335194f1"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a12aff89-f092-4d15-8090-ed658f749eb2"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a1e1e245-82d6-46c9-af3c-f685ec5bc93f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a283092b-aa56-4c4c-b43d-37f8dc1be4db"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a351a748-18c8-4ad5-9d1b-d3dc75abd273"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a388e4e0-1d7a-4359-adf7-9d60715b27df"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a466b8ab-c0c5-4f84-81e2-fefba79ac784"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a4823b67-4145-48ca-8dcb-987e931e478a"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("a5786ff5-7c1d-42ff-a826-7e72d14c537c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("adcd199b-85e2-4d1d-a18f-8d4b09cf45b0"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b0a3d81e-584f-4756-a727-b2e93b430590"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b3069cc6-6dc3-46dd-a942-f2b5396a51e7"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b7a4475a-75d0-44a5-8ca1-6ef72ad6e95b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("b8346b69-3d68-4a47-b090-c08de8ba66fc"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc0c8777-2c67-4a47-8466-b371f0a178d9"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("bc6e4c19-46dd-4200-b775-a47dfecdb43f"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c4609f85-60d1-4f03-bc41-85133b847891"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c65d20ca-d618-4a83-80bd-4c6389ca6d6b"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c78f0c59-e220-49d0-a8fc-9333f802777d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("c7e03c2c-1946-4ceb-b252-79a3eb5bfa8c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ca371ef4-2ccc-49e4-b28a-7807700d5239"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cb1f6f13-f5a1-4544-9093-83d2f57bf679"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cb9c1bb2-f682-4c11-861d-284238769783"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("cc0638f0-d318-408d-966c-5451a8ac20e8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("d886900e-b6b6-42aa-b018-2022044770df"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("db2c6ce7-bc37-4af4-9a68-5081ea4ea807"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("e510b335-5ff1-4a32-b4f5-f6fbaeb0e2f4"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("eb6eff4b-6370-40ee-b2bb-4689decae667"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ecbb8470-5ff5-45cb-80e8-238f5bcbe779"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("ed9ec0b5-d97c-41d3-bb6d-b1df8274cb76"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("efab4558-c9a2-4c76-8098-a279ce2fe167"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f4bfa3d7-b1ab-43a4-a8ec-0356d9f43b4d"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f5ff2911-4b8d-4d3e-b8c8-7415df4e90e8"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("f73ae6be-e73c-4e7c-8482-e36b641acb7c"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("fb237fca-f632-4874-b8e1-0180dbf21f84"));

            migrationBuilder.DeleteData(
                table: "TextTranslation",
                keyColumn: "Id",
                keyValue: new Guid("fc698803-34b1-4f59-a0c1-7c1c2bfec276"));

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Additional Comments Details");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Age First Treated");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Assessment Completion Date");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Assessor Actions Required");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Comprehensive Assessment Arranged");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Comprehensive Assessment Completed");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Comprehensive Assessment Needed");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Concerns About Mental Health");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Concerns About Physical Health");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Consent and Confidentiality");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Consent to Shared Mental Health Record");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Current Medications");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Current Opiate Agonist Treatment");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Date of Birth");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Email Address");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.action.awaiting");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.action.open");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.action.review");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.action.start");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.alcohol");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.all");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.drugs");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.gambling");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.general_query");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.queue.ladies");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.phone");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "evaluation.table.queue");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Ever Treated for Alcohol");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Ever Treated for Substance Use");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Family");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "First Name");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.next");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.previous");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.save_draft");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.saving");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.submit");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.action.submitting");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.error.save_progress");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.error.submission_failed");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.group.default");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.select.placeholder");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.draft_saved_at");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.progress_saved_on_blur");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.saving_progress");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.status.submitted");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.expected_boolean");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.expected_integer");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.expected_number");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.expected_option_list");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.expected_type");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.invalid_format");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.invalid_option");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.invalid_option_list");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.max_length");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.max_value");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.min_length");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.min_value");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.pattern");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "form.validation.required");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Good");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "GP");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "GP Name");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "History of Head Injury");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "History of Psychiatric Care");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "History of Seizures");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "History of Self Harm or Suicidal Thoughts");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Assessor actions required / AF Printed Page 15.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Intake and admin identity / AF Printed Page 6.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Mental health / AF Printed Page 13.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Physical health / AF Printed Page 12.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Intake and Administrative Identity");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Known Allergies");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Last GP Check-Up");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Longest Time Abstinent");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Low");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Medical Card");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Mental Health");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Mental Health Details");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Mood Over the Last Month");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Name of Treatment Provider(s)");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Other");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Other Current Treatment / Prescribed Medications");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Phone Number");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Physical Health");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Reason for Leaving");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Reasonable");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Relevant Medical History");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "screening.page.title");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Seen or Seeing a Mental Health Professional");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Self");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Service User Name");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Source of Referral");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Substance and Treatment History");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Surname");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Total Number of Previous Treatments");

            migrationBuilder.DeleteData(
                table: "TextResource",
                keyColumn: "Key",
                keyValue: "Very low");
        }
    }
}
