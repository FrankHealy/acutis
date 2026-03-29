using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Acutis.Infrastructure.Auditing;
using Acutis.Infrastructure.Persistence.Configurations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Acutis.Infrastructure.Data;

public sealed class AcutisDbContext : DbContext
{
    private static readonly DateTime SeedCreatedAt = new(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc);
    private static readonly Guid SystemActorUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    private static readonly JsonSerializerOptions AuditJsonOptions = new(JsonSerializerDefaults.Web)
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };
    private static readonly HashSet<string> AutoAuditSkippedEntityTypes = new(StringComparer.Ordinal)
    {
        nameof(AuditLog),
        nameof(FormSubmission),
        nameof(ResidentCase),
        nameof(ScheduledIntake),
        nameof(ScreeningScheduleSlot),
        nameof(Video),
        nameof(UnitVideoCuration),
        nameof(Quote),
        nameof(UnitQuoteCuration)
    };

    private const string ScreeningFormCode = "alcohol_screening_call";
    private static readonly Guid ScreeningFormId = Guid.Parse("ed6af9de-1397-41f6-b165-b11b5d426f90");
    private static readonly Guid ScreeningFormV2Id = Guid.Parse("9ed5438e-70f7-4567-a8f6-b8402b645a69");
    private static readonly Guid ScreeningFormV3Id = Guid.Parse("1159096f-504f-4892-bcce-b4e3245a99ab");
    private static readonly Guid ScreeningFormV4Id = Guid.Parse("e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028");
    private static readonly Guid ScreeningFormV5Id = Guid.Parse("2a2080bf-d4eb-4f7a-84af-b23651e0b0e5");
    private static readonly Guid ReferralSourceOptionSetId = Guid.Parse("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5");
    private static readonly Guid DrinkTypeOptionSetId = Guid.Parse("5215043d-b92f-47c8-9650-f39f4f9fd7ca");
    private static readonly Guid DrinkMeasureUnitOptionSetId = Guid.Parse("0d16b802-9dc1-4c8b-819a-52e0d41a6f59");
    private static readonly Guid HousingStatusOptionSetId = Guid.Parse("7598f1ce-65c6-4245-af64-5aeb4be2c3b2");
    private static readonly Guid GpOptionItemId = Guid.Parse("4cdab4a6-537f-42dd-a88d-5cc04c4e9d03");
    private static readonly Guid FamilyOptionItemId = Guid.Parse("4167ea3e-95e1-4578-8dbf-1b04af0f87ce");
    private static readonly Guid SelfOptionItemId = Guid.Parse("6f2838eb-16ca-41c0-bb69-0bc6e7ba93f9");
    private static readonly Guid OtherOptionItemId = Guid.Parse("838674f5-05c6-4422-9515-6f92907f0963");
    private static readonly Guid DrinkTypeBeerOptionItemId = Guid.Parse("7d71172d-38bf-46fd-b4ec-8258ab2bf389");
    private static readonly Guid DrinkTypeWineOptionItemId = Guid.Parse("8f5ef9ba-3853-48f9-9f8a-dd99f6ebf5f4");
    private static readonly Guid DrinkTypeSpiritsOptionItemId = Guid.Parse("44f81460-88f7-4d58-9fd2-2f86f9f55f3d");
    private static readonly Guid DrinkTypeCiderOptionItemId = Guid.Parse("7a607ff4-0a82-4402-a85a-4b8ed64d09c0");
    private static readonly Guid DrinkTypeOtherOptionItemId = Guid.Parse("1f0fca56-5f9a-49a5-b4df-3f8c7f413d32");
    private static readonly Guid DrinkMeasureUnitPintsOptionItemId = Guid.Parse("0a2f5ceb-fe3b-420f-a4df-95f1bff9342c");
    private static readonly Guid DrinkMeasureUnitLitresOptionItemId = Guid.Parse("31279df6-9f65-4ceb-9d32-f3b0f1bf066c");
    private static readonly Guid DrinkMeasureUnitBottlesOptionItemId = Guid.Parse("77e32289-2589-494a-9636-ad727ba907fe");
    private static readonly Guid HousingStatusStableOptionItemId = Guid.Parse("17691e58-8ab8-482e-b9df-5f5f35ad4865");
    private static readonly Guid HousingStatusTemporaryOptionItemId = Guid.Parse("953f699e-640b-4583-a6ec-af800aa2cbf5");
    private static readonly Guid HousingStatusHomelessOptionItemId = Guid.Parse("4cc93a6b-60bd-44d8-a2d4-e0a11c79b1f9");
    private static readonly Guid HousingStatusSupportedOptionItemId = Guid.Parse("cc4ce33c-5bc9-45a4-b128-35cf2a4722ae");
    private static readonly Guid HousingStatusOtherOptionItemId = Guid.Parse("b223fa1f-3d8f-4c11-900f-e73c684ffdfa");
    private static readonly Guid TrScreeningFormTitleEn = Guid.Parse("7f428f69-c2f7-48f9-a7f8-c5d3221d8f33");
    private static readonly Guid TrScreeningFormTitleGa = Guid.Parse("e368b1f6-3bf5-40d6-bf5e-f2f8d16a3ca4");
    private static readonly Guid TrScreeningFormDescriptionEn = Guid.Parse("f3c1b6db-ffb8-41f3-84dd-c8738c75d977");
    private static readonly Guid TrScreeningFormDescriptionGa = Guid.Parse("6341dabe-b53c-45a2-bcb9-4ff0fbd7c40d");
    private static readonly Guid TrCallerDetailsEn = Guid.Parse("7b5a2874-ec9f-466b-a2f4-6dc6a552d49a");
    private static readonly Guid TrCallerDetailsGa = Guid.Parse("46e89eb3-0dff-4f27-a4f7-dde66f8ef067");
    private static readonly Guid TrAlcoholUseEn = Guid.Parse("f0b455f6-e4d7-4f5f-a639-9f4f3fc39978");
    private static readonly Guid TrAlcoholUseGa = Guid.Parse("6d27e8bc-6c00-4ed1-bd6e-8d0f03e76fe9");
    private static readonly Guid TrCallerNameLabelEn = Guid.Parse("aeaf7968-0e8a-4931-a9d2-64a063169b84");
    private static readonly Guid TrCallerNameLabelGa = Guid.Parse("e5f7cc59-675a-4e3d-b0f1-5d90ce7ed4c3");
    private static readonly Guid TrAgeLabelEn = Guid.Parse("aa669e44-a7a4-4f6f-9f37-0dd695f73790");
    private static readonly Guid TrAgeLabelGa = Guid.Parse("3de27e13-afd4-4f01-8fa1-a8df16f25880");
    private static readonly Guid TrDrinksPerDayLabelEn = Guid.Parse("16d7f20f-2ab8-4325-b24b-0ee04a1ce44c");
    private static readonly Guid TrDrinksPerDayLabelGa = Guid.Parse("2d3f8ea2-a2e4-4b82-aca8-df3fe1b1092b");
    private static readonly Guid TrWithdrawalHistoryLabelEn = Guid.Parse("d17f0d3f-f9bc-4b37-8427-f5340bd6ea2e");
    private static readonly Guid TrWithdrawalHistoryLabelGa = Guid.Parse("47fb09a7-49a7-4a1c-b7c5-ac30e3a4fa2f");
    private static readonly Guid TrReferralSourceLabelEn = Guid.Parse("44fdd6e6-c3cd-4f5d-8268-4ca95d85f962");
    private static readonly Guid TrReferralSourceLabelGa = Guid.Parse("8c41630d-33b7-404d-9aa7-4cb57ea6d6c0");
    private static readonly Guid TrReferralGpEn = Guid.Parse("5dc539ca-2b43-4ed3-a9f9-923870b6d94f");
    private static readonly Guid TrReferralGpGa = Guid.Parse("6ccb80f3-f60f-4112-9ba0-cc9ec9bcbf18");
    private static readonly Guid TrReferralFamilyEn = Guid.Parse("b6d49719-9a31-4fd5-82e8-96c13fd6e56a");
    private static readonly Guid TrReferralFamilyGa = Guid.Parse("813d456f-a9b8-44e8-bd9d-0dbf0e9bf338");
    private static readonly Guid TrReferralSelfEn = Guid.Parse("6285e2e3-40ce-4e61-a503-c7fecf6842dd");
    private static readonly Guid TrReferralSelfGa = Guid.Parse("46e35a4f-e5bf-4c17-86ea-f3a3d5ad3e87");
    private static readonly Guid TrReferralOtherEn = Guid.Parse("4d66d847-8d32-4dd1-95ec-7cba0a6455fc");
    private static readonly Guid TrReferralOtherGa = Guid.Parse("9c3c9ef4-bf2b-4482-8aa3-3628f0d9a769");
    private static readonly Guid TrAppBrandEn = Guid.Parse("5f980db7-64be-4249-89a7-38497a4a1602");
    private static readonly Guid TrAppBrandGa = Guid.Parse("f2f7bc01-26ef-4eb3-924b-a62ed84065f4");
    private static readonly Guid TrAppCentreBrureeEn = Guid.Parse("c4d6c866-1a33-447e-9d7f-0f1d365088d5");
    private static readonly Guid TrAppCentreBrureeGa = Guid.Parse("722449a8-6b10-4c6f-aa79-8734aef62e3d");
    private static readonly Guid TrHeaderCapacityEn = Guid.Parse("5f0f60da-b1b7-47f3-a83b-15980885cf15");
    private static readonly Guid TrHeaderCapacityGa = Guid.Parse("250dca2f-c7a5-4b2e-a620-90980db0f64c");
    private static readonly Guid TrHeaderCurrentTimeEn = Guid.Parse("1baab78d-fe35-4465-bcae-978043cca9b5");
    private static readonly Guid TrHeaderCurrentTimeGa = Guid.Parse("32fe6f4f-f5df-4fe2-8712-3ee3ec39f536");
    private static readonly Guid TrHeaderSignedInAsEn = Guid.Parse("ca3f25d7-e3bf-4d17-b659-d72d48168f94");
    private static readonly Guid TrHeaderSignedInAsGa = Guid.Parse("1c920635-c1b3-4f25-9033-f104ace6192c");
    private static readonly Guid TrHeaderLoginDifferentEn = Guid.Parse("d7963194-b40b-43fe-8ebf-0c4f09b6139e");
    private static readonly Guid TrHeaderLoginDifferentGa = Guid.Parse("28f2d9e0-2c6f-453f-bd0a-adce33d28153");
    private static readonly Guid TrHeaderLogoutEn = Guid.Parse("5987cdb5-f425-406a-9152-ea7f30f90918");
    private static readonly Guid TrHeaderLogoutGa = Guid.Parse("f3748ca5-c6ab-4810-a4dc-8f6d78d7f8cb");
    private static readonly Guid TrScreeningTabCallsEn = Guid.Parse("23b0507e-4dbc-4a89-96e3-07936db8bac3");
    private static readonly Guid TrScreeningTabCallsGa = Guid.Parse("a5f4ff2f-d318-4549-8a4e-5eb0c8188d8b");
    private static readonly Guid TrScreeningTabEvaluationEn = Guid.Parse("9fbf3e9a-64db-4a96-b559-8528d272cd0c");
    private static readonly Guid TrScreeningTabEvaluationGa = Guid.Parse("6138db68-8907-4f99-8ca9-188f9eea6d01");
    private static readonly Guid TrScreeningTabSchedulingEn = Guid.Parse("ec0552e9-c6dc-4eb5-a80d-62f5548f252f");
    private static readonly Guid TrScreeningTabSchedulingGa = Guid.Parse("c562be30-0d52-43f4-bef7-c7ca01a61ac0");
    private static readonly Guid DefaultScreeningControlId = Guid.Parse("9df9c2b5-e728-4327-8a6b-f22f73dcd22d");
    private static readonly Guid BrureeCentreId = Guid.Parse("aaaaaaaa-1111-1111-1111-111111111111");
    private static readonly Guid AlcoholUnitId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid DetoxUnitId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private static readonly Guid DrugsUnitId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    private static readonly Guid LadiesUnitId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    private static readonly Guid ConfigurationManagePermissionId = Guid.Parse("55555555-1111-1111-1111-111111111111");
    private static readonly Guid ThemeManagePermissionId = Guid.Parse("55555555-1212-1212-1212-121212121212");
    private static readonly Guid UnitsManagePermissionId = Guid.Parse("55555555-2222-2222-2222-222222222222");
    private static readonly Guid AccessManagePermissionId = Guid.Parse("55555555-3333-3333-3333-333333333333");
    private static readonly Guid ScreeningViewPermissionId = Guid.Parse("55555555-4444-4444-4444-444444444444");
    private static readonly Guid ResidentsViewPermissionId = Guid.Parse("55555555-5555-5555-5555-555555555555");
    private static readonly Guid MediaViewPermissionId = Guid.Parse("55555555-6666-6666-6666-666666666666");
    private static readonly Guid GroupTherapyViewPermissionId = Guid.Parse("55555555-7777-7777-7777-777777777777");
    private static readonly Guid UnitOperationsViewPermissionId = Guid.Parse("55555555-8888-8888-8888-888888888888");
    private static readonly Guid PlatformAdminRoleId = Guid.Parse("66666666-1111-1111-1111-111111111111");
    private static readonly Guid ClinicalViewerRoleId = Guid.Parse("66666666-2222-2222-2222-222222222222");

    private const string SchemaJson = """
        {
          "type": "object",
          "properties": {
            "callerName": { "type": "string", "minLength": 2, "maxLength": 120 },
            "age": { "type": "integer", "minimum": 16, "maximum": 120 },
            "drinksPerDay": { "type": "number", "minimum": 0, "maximum": 100 },
            "withdrawalHistory": { "type": "boolean" },
            "referralSource": { "type": "enum", "optionSetKey": "referral_source" }
          },
          "required": [ "age", "drinksPerDay", "referralSource" ]
        }
        """;

    private const string UiJson = """
        {
          "sections": [
            { "titleKey": "screening.section.caller_details", "items": [ "callerName", "age" ] },
            { "titleKey": "screening.section.alcohol_use", "items": [ "drinksPerDay", "withdrawalHistory", "referralSource" ] }
          ],
          "widgets": {
            "callerName": "input",
            "age": "number",
            "drinksPerDay": "number",
            "withdrawalHistory": "toggle",
            "referralSource": "select"
          },
          "labelKeys": {
            "callerName": "screening.field.caller_name.label",
            "age": "screening.field.age.label",
            "drinksPerDay": "screening.field.drinks_per_day.label",
            "withdrawalHistory": "screening.field.withdrawal_history.label",
            "referralSource": "screening.field.referral_source.label"
          },
          "helpKeys": {
            "drinksPerDay": "screening.field.drinks_per_day.help"
          }
        }
        """;

    private const string RulesJson = """
        [
          {
            "if": { "field": "withdrawalHistory", "equals": false },
            "then": {},
            "else": {}
          }
        ]
        """;

    private const string SchemaJsonV2 = """
        {
          "type": "object",
          "properties": {
            "callerName": { "type": "string", "minLength": 2, "maxLength": 120 },
            "age": { "type": "integer", "minimum": 16, "maximum": 120 },
            "drinksPerDay": { "type": "number", "minimum": 0, "maximum": 100 },
            "withdrawalHistory": { "type": "boolean" },
            "referralSource": { "type": "enum", "optionSetKey": "referral_source" },
            "currentlyUnsafe": { "type": "boolean" },
            "housingStatus": { "type": "string", "maxLength": 120 },
            "assessorNotes": { "type": "text", "maxLength": 2000 }
          },
          "required": [ "age", "drinksPerDay", "referralSource" ]
        }
        """;

    private const string UiJsonV2 = """
        {
          "sections": [
            { "titleKey": "screening.section.caller_details", "items": [ "callerName", "age" ] },
            { "titleKey": "screening.section.alcohol_use", "items": [ "drinksPerDay", "withdrawalHistory", "referralSource" ] },
            { "titleKey": "screening.section.stability", "items": [ "currentlyUnsafe", "housingStatus" ] },
            { "titleKey": "screening.section.follow_up", "items": [ "assessorNotes" ] }
          ],
          "widgets": {
            "callerName": "input",
            "age": "number",
            "drinksPerDay": "number",
            "withdrawalHistory": "toggle",
            "referralSource": "select",
            "currentlyUnsafe": "toggle",
            "housingStatus": "select",
            "assessorNotes": "textarea"
          },
          "labelKeys": {
            "callerName": "screening.field.caller_name.label",
            "age": "screening.field.age.label",
            "drinksPerDay": "screening.field.drinks_per_day.label",
            "withdrawalHistory": "screening.field.withdrawal_history.label",
            "referralSource": "screening.field.referral_source.label",
            "currentlyUnsafe": "screening.field.currently_unsafe.label",
            "housingStatus": "screening.field.housing_status.label",
            "assessorNotes": "screening.field.assessor_notes.label"
          },
          "helpKeys": {
            "drinksPerDay": "screening.field.drinks_per_day.help",
            "assessorNotes": "screening.field.assessor_notes.help"
          }
        }
        """;

    private const string SchemaJsonV3 = """
        {
          "type": "object",
          "properties": {
            "callerName": { "type": "string", "minLength": 2, "maxLength": 120 },
            "phoneNumber": { "type": "string", "minLength": 8, "maxLength": 20, "pattern": "^[+0-9()\\-\\s]+$", "format": "phone" },
            "emailAddress": { "type": "string", "maxLength": 120, "format": "email" },
            "age": { "type": "integer", "minimum": 16, "maximum": 120 },
            "drinksPerDay": { "type": "number", "minimum": 0, "maximum": 100 },
            "daysDrinkingPerWeek": { "type": "integer", "minimum": 0, "maximum": 7 },
            "lastDrinkDate": { "type": "date" },
            "withdrawalHistory": { "type": "boolean" },
            "historyOfSeizures": { "type": "boolean" },
            "currentlyUnsafe": { "type": "boolean" },
            "suicidalIdeation": { "type": "boolean" },
            "referralSource": { "type": "enum", "optionSetKey": "referral_source" },
            "housingStatus": { "type": "string", "maxLength": 120 },
            "supportNetwork": { "type": "string", "maxLength": 300 },
            "medicalNotes": { "type": "text", "maxLength": 1000 },
            "assessorNotes": { "type": "text", "maxLength": 2000 },
            "nextSteps": { "type": "text", "maxLength": 1000 }
          },
          "required": [ "callerName", "phoneNumber", "age", "drinksPerDay", "referralSource" ]
        }
        """;

    private const string UiJsonV3 = """
        {
          "sections": [
            { "titleKey": "screening.section.caller_details", "items": [ "callerName", "phoneNumber", "emailAddress", "age" ] },
            { "titleKey": "screening.section.alcohol_use", "items": [ "drinksPerDay", "daysDrinkingPerWeek", "lastDrinkDate", "withdrawalHistory", "historyOfSeizures", "referralSource" ] },
            { "titleKey": "screening.section.stability", "items": [ "currentlyUnsafe", "suicidalIdeation", "housingStatus", "supportNetwork" ] },
            { "titleKey": "screening.section.follow_up", "items": [ "medicalNotes", "assessorNotes", "nextSteps" ] }
          ],
          "widgets": {
            "callerName": "input",
            "phoneNumber": "input",
            "emailAddress": "input",
            "age": "number",
            "drinksPerDay": "number",
            "daysDrinkingPerWeek": "number",
            "lastDrinkDate": "input",
            "withdrawalHistory": "toggle",
            "historyOfSeizures": "toggle",
            "currentlyUnsafe": "toggle",
            "suicidalIdeation": "toggle",
            "referralSource": "select",
            "housingStatus": "select",
            "supportNetwork": "input",
            "medicalNotes": "textarea",
            "assessorNotes": "textarea",
            "nextSteps": "textarea"
          },
          "labelKeys": {
            "callerName": "screening.field.caller_name.label",
            "phoneNumber": "screening.field.phone_number.label",
            "emailAddress": "screening.field.email_address.label",
            "age": "screening.field.age.label",
            "drinksPerDay": "screening.field.drinks_per_day.label",
            "daysDrinkingPerWeek": "screening.field.days_drinking_per_week.label",
            "lastDrinkDate": "screening.field.last_drink_date.label",
            "withdrawalHistory": "screening.field.withdrawal_history.label",
            "historyOfSeizures": "screening.field.history_of_seizures.label",
            "currentlyUnsafe": "screening.field.currently_unsafe.label",
            "suicidalIdeation": "screening.field.suicidal_ideation.label",
            "referralSource": "screening.field.referral_source.label",
            "housingStatus": "screening.field.housing_status.label",
            "supportNetwork": "screening.field.support_network.label",
            "medicalNotes": "screening.field.medical_notes.label",
            "assessorNotes": "screening.field.assessor_notes.label",
            "nextSteps": "screening.field.next_steps.label"
          },
          "helpKeys": {
            "drinksPerDay": "screening.field.drinks_per_day.help",
            "assessorNotes": "screening.field.assessor_notes.help",
            "nextSteps": "screening.field.next_steps.help"
          }
        }
        """;

    private const string SchemaJsonV4 = """
        {
          "type": "object",
          "properties": {
            "callerName": { "type": "string", "minLength": 2, "maxLength": 120 },
            "phoneNumber": { "type": "string", "minLength": 8, "maxLength": 20, "pattern": "^\\+?[1-9][0-9()\\-\\s]{7,19}$", "format": "phone" },
            "emailAddress": { "type": "string", "maxLength": 120, "pattern": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", "format": "email" },
            "age": { "type": "integer", "minimum": 16, "maximum": 120 },
            "drinkType": { "type": "enum", "optionSetKey": "drink_type" },
            "drinkTypeOther": { "type": "string", "maxLength": 80 },
            "drinksPerDay": { "type": "number", "minimum": 0, "maximum": 100 },
            "drinksPerDayUnit": { "type": "enum", "optionSetKey": "drink_measure_unit" },
            "daysDrinkingPerWeek": { "type": "integer", "minimum": 0, "maximum": 7 },
            "lastDrinkDate": { "type": "date" },
            "withdrawalHistory": { "type": "boolean" },
            "historyOfSeizures": { "type": "boolean" },
            "currentlyUnsafe": { "type": "boolean" },
            "suicidalIdeation": { "type": "boolean" },
            "referralSource": { "type": "enum", "optionSetKey": "referral_source" },
            "housingStatus": { "type": "enum", "optionSetKey": "housing_status" },
            "supportNetwork": { "type": "string", "maxLength": 300 },
            "medicalNotes": { "type": "text", "maxLength": 1000 },
            "assessorNotes": { "type": "text", "maxLength": 2000 },
            "nextSteps": { "type": "text", "maxLength": 1000 }
          },
          "required": [ "callerName", "phoneNumber", "age", "drinkType", "drinksPerDay", "drinksPerDayUnit", "referralSource", "housingStatus" ]
        }
        """;

    private const string UiJsonV4 = """
        {
          "sections": [
            { "titleKey": "screening.section.caller_details", "items": [ "callerName", "phoneNumber", "emailAddress", "age" ] },
            { "titleKey": "screening.section.alcohol_use", "items": [ "drinkType", "drinksPerDay", "drinksPerDayUnit", "drinkTypeOther", "daysDrinkingPerWeek", "lastDrinkDate", "withdrawalHistory", "historyOfSeizures", "referralSource" ] },
            { "titleKey": "screening.section.stability", "items": [ "currentlyUnsafe", "suicidalIdeation", "housingStatus", "supportNetwork" ] },
            { "titleKey": "screening.section.follow_up", "items": [ "medicalNotes", "assessorNotes", "nextSteps" ] }
          ],
          "widgets": {
            "callerName": "input",
            "phoneNumber": "input",
            "emailAddress": "input",
            "age": "number",
            "drinkType": "select",
            "drinkTypeOther": "input",
            "drinksPerDay": "number",
            "drinksPerDayUnit": "select",
            "daysDrinkingPerWeek": "number",
            "lastDrinkDate": "input",
            "withdrawalHistory": "toggle",
            "historyOfSeizures": "toggle",
            "currentlyUnsafe": "toggle",
            "suicidalIdeation": "toggle",
            "referralSource": "select",
            "housingStatus": "input",
            "supportNetwork": "input",
            "medicalNotes": "textarea",
            "assessorNotes": "textarea",
            "nextSteps": "textarea"
          },
          "labelKeys": {
            "callerName": "screening.field.caller_name.label",
            "phoneNumber": "screening.field.phone_number.label",
            "emailAddress": "screening.field.email_address.label",
            "age": "screening.field.age.label",
            "drinkType": "screening.field.drink_type.label",
            "drinkTypeOther": "screening.field.drink_type_other.label",
            "drinksPerDay": "screening.field.drinks_per_day.label",
            "drinksPerDayUnit": "screening.field.drinks_per_day_unit.label",
            "daysDrinkingPerWeek": "screening.field.days_drinking_per_week.label",
            "lastDrinkDate": "screening.field.last_drink_date.label",
            "withdrawalHistory": "screening.field.withdrawal_history.label",
            "historyOfSeizures": "screening.field.history_of_seizures.label",
            "currentlyUnsafe": "screening.field.currently_unsafe.label",
            "suicidalIdeation": "screening.field.suicidal_ideation.label",
            "referralSource": "screening.field.referral_source.label",
            "housingStatus": "screening.field.housing_status.label",
            "supportNetwork": "screening.field.support_network.label",
            "medicalNotes": "screening.field.medical_notes.label",
            "assessorNotes": "screening.field.assessor_notes.label",
            "nextSteps": "screening.field.next_steps.label"
          },
          "helpKeys": {
            "drinksPerDay": "screening.field.drinks_per_day.help",
            "drinksPerDayUnit": "screening.field.drinks_per_day_unit.help",
            "assessorNotes": "screening.field.assessor_notes.help",
            "nextSteps": "screening.field.next_steps.help"
          }
        }
        """;

    private const string RulesJsonV4 = """
        [
          {
            "if": { "field": "drinkType", "equals": "other" },
            "then": { "show": [ "drinkTypeOther" ], "enable": [ "drinkTypeOther" ] },
            "else": { "hide": [ "drinkTypeOther" ], "disable": [ "drinkTypeOther" ], "clear": [ "drinkTypeOther" ] }
          }
        ]
        """;

    private const string SchemaJsonV5 = """
        {
          "type": "object",
          "properties": {
            "service_user_full_name": { "type": "string", "minLength": 2, "maxLength": 160 },
            "first_name": { "type": "string", "minLength": 1, "maxLength": 80 },
            "surname": { "type": "string", "minLength": 1, "maxLength": 80 },
            "date_of_birth": { "type": "date" },
            "phone_number": { "type": "string", "maxLength": 20, "pattern": "^\\+?[0-9()\\-\\s]{7,20}$", "format": "phone" },
            "email_address": { "type": "string", "maxLength": 120, "pattern": "^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$", "format": "email" },
            "gp_name": { "type": "string", "maxLength": 160 },
            "medical_card_status": { "type": "boolean" },
            "assessment_completion_status": { "type": "boolean" },
            "assessment_completion_date": { "type": "date" },
            "consent_mental_health_shared_record": { "type": "boolean" },
            "source_of_referral": { "type": "enum" },
            "ever_treated_for_substance_use": { "type": "boolean" },
            "ever_treated_for_alcohol": { "type": "boolean" },
            "total_previous_treatments": { "type": "integer", "minimum": 0, "maximum": 250 },
            "age_first_treated": { "type": "integer", "minimum": 0, "maximum": 120 },
            "treatment_providers": { "type": "text", "maxLength": 1000 },
            "reason_for_leaving_treatment": { "type": "text", "maxLength": 1000 },
            "longest_time_abstinent": { "type": "string", "maxLength": 120 },
            "current_opiate_agonist_treatment": { "type": "boolean" },
            "other_current_treatment_medication": { "type": "boolean" },
            "physical_health_concerns": { "type": "boolean" },
            "known_allergies": { "type": "boolean" },
            "history_of_head_injury": { "type": "boolean" },
            "last_gp_checkup": { "type": "date" },
            "relevant_medical_history": { "type": "text", "maxLength": 2000 },
            "current_medications": { "type": "text", "maxLength": 2000 },
            "history_of_seizures": { "type": "boolean" },
            "mental_health_concerns": { "type": "boolean" },
            "mental_health_professional_engagement": { "type": "boolean" },
            "history_of_psychiatric_care": { "type": "boolean" },
            "history_of_self_harm_or_suicidal_thoughts": { "type": "boolean" },
            "mood_last_month": { "type": "enum" },
            "mental_health_details": { "type": "text", "maxLength": 2000 },
            "comprehensive_assessment_needed": { "type": "boolean" },
            "comprehensive_assessment_arranged": { "type": "boolean" },
            "additional_comments_details": { "type": "text", "maxLength": 2000 }
          },
          "required": [
            "service_user_full_name",
            "first_name",
            "surname",
            "date_of_birth",
            "assessment_completion_status",
            "consent_mental_health_shared_record"
          ]
        }
        """;

    private const string UiJsonV5 = """
        {
          "sections": [
            {
              "titleKey": "Intake and Administrative Identity",
              "items": [
                "service_user_full_name",
                "first_name",
                "surname",
                "date_of_birth",
                "phone_number",
                "email_address",
                "gp_name",
                "medical_card_status",
                "source_of_referral"
              ]
            },
            {
              "titleKey": "Consent and Confidentiality",
              "items": [
                "assessment_completion_status",
                "assessment_completion_date",
                "consent_mental_health_shared_record"
              ]
            },
            {
              "titleKey": "Substance and Treatment History",
              "items": [
                "ever_treated_for_substance_use",
                "ever_treated_for_alcohol",
                "total_previous_treatments",
                "age_first_treated",
                "treatment_providers",
                "reason_for_leaving_treatment",
                "longest_time_abstinent",
                "current_opiate_agonist_treatment",
                "other_current_treatment_medication"
              ]
            },
            {
              "titleKey": "Physical Health",
              "items": [
                "physical_health_concerns",
                "known_allergies",
                "history_of_head_injury",
                "last_gp_checkup",
                "relevant_medical_history",
                "current_medications",
                "history_of_seizures"
              ]
            },
            {
              "titleKey": "Mental Health",
              "items": [
                "mental_health_concerns",
                "mental_health_professional_engagement",
                "history_of_psychiatric_care",
                "history_of_self_harm_or_suicidal_thoughts",
                "mood_last_month",
                "mental_health_details"
              ]
            },
            {
              "titleKey": "Assessor Actions Required",
              "items": [
                "comprehensive_assessment_needed",
                "comprehensive_assessment_arranged",
                "additional_comments_details"
              ]
            }
          ],
          "widgets": {
            "service_user_full_name": "input",
            "first_name": "input",
            "surname": "input",
            "date_of_birth": "input",
            "phone_number": "input",
            "email_address": "input",
            "gp_name": "input",
            "medical_card_status": "toggle",
            "assessment_completion_status": "toggle",
            "assessment_completion_date": "input",
            "consent_mental_health_shared_record": "toggle",
            "source_of_referral": "select",
            "ever_treated_for_substance_use": "toggle",
            "ever_treated_for_alcohol": "toggle",
            "total_previous_treatments": "number",
            "age_first_treated": "number",
            "treatment_providers": "textarea",
            "reason_for_leaving_treatment": "textarea",
            "longest_time_abstinent": "input",
            "current_opiate_agonist_treatment": "toggle",
            "other_current_treatment_medication": "toggle",
            "physical_health_concerns": "toggle",
            "known_allergies": "toggle",
            "history_of_head_injury": "toggle",
            "last_gp_checkup": "input",
            "relevant_medical_history": "textarea",
            "current_medications": "textarea",
            "history_of_seizures": "toggle",
            "mental_health_concerns": "toggle",
            "mental_health_professional_engagement": "toggle",
            "history_of_psychiatric_care": "toggle",
            "history_of_self_harm_or_suicidal_thoughts": "toggle",
            "mood_last_month": "select",
            "mental_health_details": "textarea",
            "comprehensive_assessment_needed": "toggle",
            "comprehensive_assessment_arranged": "toggle",
            "additional_comments_details": "textarea"
          },
          "labelKeys": {
            "service_user_full_name": "Service User Name",
            "first_name": "First Name",
            "surname": "Surname",
            "date_of_birth": "Date of Birth",
            "phone_number": "Phone Number",
            "email_address": "Email Address",
            "gp_name": "GP Name",
            "medical_card_status": "Medical Card",
            "assessment_completion_status": "Comprehensive Assessment Completed",
            "assessment_completion_date": "Assessment Completion Date",
            "consent_mental_health_shared_record": "Consent to Shared Mental Health Record",
            "source_of_referral": "Source of Referral",
            "ever_treated_for_substance_use": "Ever Treated for Substance Use",
            "ever_treated_for_alcohol": "Ever Treated for Alcohol",
            "total_previous_treatments": "Total Number of Previous Treatments",
            "age_first_treated": "Age First Treated",
            "treatment_providers": "Name of Treatment Provider(s)",
            "reason_for_leaving_treatment": "Reason for Leaving",
            "longest_time_abstinent": "Longest Time Abstinent",
            "current_opiate_agonist_treatment": "Current Opiate Agonist Treatment",
            "other_current_treatment_medication": "Other Current Treatment / Prescribed Medications",
            "physical_health_concerns": "Concerns About Physical Health",
            "known_allergies": "Known Allergies",
            "history_of_head_injury": "History of Head Injury",
            "last_gp_checkup": "Last GP Check-Up",
            "relevant_medical_history": "Relevant Medical History",
            "current_medications": "Current Medications",
            "history_of_seizures": "History of Seizures",
            "mental_health_concerns": "Concerns About Mental Health",
            "mental_health_professional_engagement": "Seen or Seeing a Mental Health Professional",
            "history_of_psychiatric_care": "History of Psychiatric Care",
            "history_of_self_harm_or_suicidal_thoughts": "History of Self Harm or Suicidal Thoughts",
            "mood_last_month": "Mood Over the Last Month",
            "mental_health_details": "Mental Health Details",
            "comprehensive_assessment_needed": "Comprehensive Assessment Needed",
            "comprehensive_assessment_arranged": "Comprehensive Assessment Arranged",
            "additional_comments_details": "Additional Comments Details"
          },
          "helpKeys": {
            "assessment_completion_status": "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json",
            "consent_mental_health_shared_record": "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json",
            "source_of_referral": "HSE library source: Intake and admin identity / AF Printed Page 6.html / json",
            "ever_treated_for_substance_use": "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json",
            "physical_health_concerns": "HSE library source: Physical health / AF Printed Page 12.html / json",
            "mental_health_concerns": "HSE library source: Mental health / AF Printed Page 13.html / json",
            "comprehensive_assessment_needed": "HSE library source: Assessor actions required / AF Printed Page 15.html / json"
          },
          "selectOptions": {
            "source_of_referral": [
              { "value": "gp", "label": "GP" },
              { "value": "family", "label": "Family" },
              { "value": "self", "label": "Self" },
              { "value": "other", "label": "Other" }
            ],
            "mood_last_month": [
              { "value": "very_low", "label": "Very low" },
              { "value": "low", "label": "Low" },
              { "value": "reasonable", "label": "Reasonable" },
              { "value": "good", "label": "Good" }
            ]
          }
        }
        """;

    private const string RulesJsonV5 = """
        [
          {
            "if": { "field": "assessment_completion_status", "equals": false },
            "then": { "hide": [ "assessment_completion_date" ], "clear": [ "assessment_completion_date" ] },
            "else": { "show": [ "assessment_completion_date" ] }
          }
        ]
        """;

    private readonly IHttpContextAccessor? _httpContextAccessor;
    private bool _suppressAutomaticAudit;

    public AcutisDbContext(DbContextOptions<AcutisDbContext> options, IHttpContextAccessor? httpContextAccessor = null)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        IncrementLookupTypeVersions();
        return SaveChangesWithAuditAsync(acceptAllChangesOnSuccess, CancellationToken.None).GetAwaiter().GetResult();
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        IncrementLookupTypeVersions();
        return SaveChangesWithAuditAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    public DbSet<Call> Calls => Set<Call>();
    public DbSet<FormDefinition> FormDefinitions => Set<FormDefinition>();
    public DbSet<OptionSet> OptionSets => Set<OptionSet>();
    public DbSet<OptionItem> OptionItems => Set<OptionItem>();
    public DbSet<TextResource> TextResources => Set<TextResource>();
    public DbSet<TextTranslation> TextTranslations => Set<TextTranslation>();
    public DbSet<FormSubmission> FormSubmissions => Set<FormSubmission>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<ScreeningControl> ScreeningControls => Set<ScreeningControl>();
    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<ResidentPreviousTreatment> ResidentPreviousTreatments => Set<ResidentPreviousTreatment>();
    public DbSet<ElementGroup> ElementGroups => Set<ElementGroup>();
    public DbSet<ElementDefinition> ElementDefinitions => Set<ElementDefinition>();
    public DbSet<GroupTherapySubjectTemplate> GroupTherapySubjectTemplates => Set<GroupTherapySubjectTemplate>();
    public DbSet<GroupTherapyDailyQuestion> GroupTherapyDailyQuestions => Set<GroupTherapyDailyQuestion>();
    public DbSet<GroupTherapyResidentRemark> GroupTherapyResidentRemarks => Set<GroupTherapyResidentRemark>();
    public DbSet<GroupTherapyResidentObservation> GroupTherapyResidentObservations => Set<GroupTherapyResidentObservation>();
    public DbSet<TherapyTopic> TherapyTopics => Set<TherapyTopic>();
    public DbSet<ResidentCase> ResidentCases => Set<ResidentCase>();
    public DbSet<ResidentProgrammeEpisode> ResidentProgrammeEpisodes => Set<ResidentProgrammeEpisode>();
    public DbSet<ScheduledIntake> ScheduledIntakes => Set<ScheduledIntake>();
    public DbSet<ScreeningScheduleSlot> ScreeningScheduleSlots => Set<ScreeningScheduleSlot>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<IncidentType> IncidentTypes => Set<IncidentType>();
    public DbSet<WeeklyTherapyRun> WeeklyTherapyRuns => Set<WeeklyTherapyRun>();
    public DbSet<ResidentWeeklyTherapyAssignment> ResidentWeeklyTherapyAssignments => Set<ResidentWeeklyTherapyAssignment>();
    public DbSet<TherapyTopicCompletion> TherapyTopicCompletions => Set<TherapyTopicCompletion>();
    public DbSet<EpisodeEvent> EpisodeEvents => Set<EpisodeEvent>();
    public DbSet<EpisodeEventTypeLookup> EpisodeEventTypes => Set<EpisodeEventTypeLookup>();
    public DbSet<TherapySchedulingConfig> TherapySchedulingConfigs => Set<TherapySchedulingConfig>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<UnitQuoteCuration> UnitQuoteCurations => Set<UnitQuoteCuration>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<UnitVideoCuration> UnitVideoCurations => Set<UnitVideoCuration>();
    public DbSet<LookupType> LookupTypes => Set<LookupType>();
    public DbSet<LookupValue> LookupValues => Set<LookupValue>();
    public DbSet<LookupValueLabel> LookupValueLabels => Set<LookupValueLabel>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<AppRole> AppRoles => Set<AppRole>();
    public DbSet<AppPermission> AppPermissions => Set<AppPermission>();
    public DbSet<AppRolePermission> AppRolePermissions => Set<AppRolePermission>();
    public DbSet<AppUserRoleAssignment> AppUserRoleAssignments => Set<AppUserRoleAssignment>();

    private async Task<int> SaveChangesWithAuditAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken)
    {
        if (_suppressAutomaticAudit || _httpContextAccessor is null)
        {
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        var pendingAuditEntries = BuildPendingAuditEntries();
        var result = await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);

        if (pendingAuditEntries.Count == 0)
        {
            return result;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        var occurredAt = DateTime.UtcNow;
        var actorUserId = ResolveActorUserId(httpContext?.User);
        var actorRole = httpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
        var correlationId = httpContext?.Request.Headers["X-Correlation-Id"].ToString();
        if (string.IsNullOrWhiteSpace(correlationId))
        {
            correlationId = Guid.NewGuid().ToString("N");
        }

        foreach (var auditEntry in pendingAuditEntries)
        {
            AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                OccurredAt = occurredAt,
                ActorUserId = actorUserId,
                ActorRole = actorRole,
                CentreId = auditEntry.CentreId,
                UnitId = auditEntry.UnitId,
                EntityType = auditEntry.EntityType,
                EntityId = ResolveEntityId(auditEntry.Entry),
                Action = auditEntry.Action,
                BeforeJson = AuditJsonSanitizer.Serialize(auditEntry.Before, AuditJsonOptions),
                AfterJson = AuditJsonSanitizer.Serialize(CreateCurrentSnapshot(auditEntry.Entry), AuditJsonOptions),
                Reason = null,
                CorrelationId = correlationId,
                RequestPath = httpContext?.Request.Path.Value ?? string.Empty,
                RequestMethod = httpContext?.Request.Method ?? string.Empty,
                ClientIp = httpContext?.Connection.RemoteIpAddress?.ToString(),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString()
            });
        }

        try
        {
            _suppressAutomaticAudit = true;
            await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }
        finally
        {
            _suppressAutomaticAudit = false;
        }

        return result;
    }

    private List<PendingAuditEntry> BuildPendingAuditEntries()
    {
        return ChangeTracker.Entries()
            .Where(entry =>
                entry.Entity is not AuditLog &&
                entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted &&
                !AutoAuditSkippedEntityTypes.Contains(entry.Metadata.ClrType.Name))
            .Select(entry => new PendingAuditEntry(
                Entry: entry,
                EntityType: entry.Metadata.ClrType.Name,
                Action: entry.State switch
                {
                    EntityState.Added => "Create",
                    EntityState.Modified => "Update",
                    EntityState.Deleted => "Delete",
                    _ => "Update"
                },
                CentreId: TryGetGuidProperty(entry, "CentreId"),
                UnitId: TryGetGuidProperty(entry, "UnitId"),
                Before: entry.State == EntityState.Added ? null : CreateOriginalSnapshot(entry)))
            .ToList();
    }

    private static Dictionary<string, object?> CreateOriginalSnapshot(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        var snapshot = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        foreach (var property in entry.Properties.Where(property => !property.Metadata.IsShadowProperty()))
        {
            snapshot[property.Metadata.Name] = property.OriginalValue;
        }

        return snapshot;
    }

    private static Dictionary<string, object?> CreateCurrentSnapshot(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        var snapshot = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        foreach (var property in entry.Properties.Where(property => !property.Metadata.IsShadowProperty()))
        {
            snapshot[property.Metadata.Name] = property.CurrentValue;
        }

        return snapshot;
    }

    private static Guid? TryGetGuidProperty(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry, string propertyName)
    {
        var property = entry.Properties.FirstOrDefault(item => item.Metadata.Name == propertyName);
        var currentValue = property?.CurrentValue;
        return currentValue switch
        {
            Guid guid => guid,
            _ => null
        };
    }

    private static string ResolveEntityId(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
    {
        var primaryKey = entry.Metadata.FindPrimaryKey();
        if (primaryKey is null)
        {
            return string.Empty;
        }

        return string.Join("|", primaryKey.Properties.Select(property =>
        {
            var value = entry.Property(property.Name).CurrentValue;
            return value?.ToString() ?? string.Empty;
        }));
    }

    private static Guid ResolveActorUserId(ClaimsPrincipal? user)
    {
        if (user is null)
        {
            return SystemActorUserId;
        }

        foreach (var claimType in new[] { ClaimTypes.NameIdentifier, "sub", "userid", "user_id" })
        {
            var claimValue = user.FindFirst(claimType)?.Value;
            if (!string.IsNullOrWhiteSpace(claimValue) && Guid.TryParse(claimValue, out var parsed))
            {
                return parsed;
            }
        }

        return SystemActorUserId;
    }

    private sealed record PendingAuditEntry(
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry,
        string EntityType,
        string Action,
        Guid? CentreId,
        Guid? UnitId,
        Dictionary<string, object?>? Before);
    public DbSet<Centre> Centres => Set<Centre>();

    private void IncrementLookupTypeVersions()
    {
        ChangeTracker.DetectChanges();

        var typeIdsToIncrement = new HashSet<Guid>();

        foreach (var entry in ChangeTracker.Entries<LookupValue>())
        {
            if (entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            {
                typeIdsToIncrement.Add(entry.Entity.LookupTypeId);
            }
        }

        var lookupValueIdToTypeId = ChangeTracker.Entries<LookupValue>()
            .Where(entry => entry.Entity.LookupValueId != Guid.Empty && entry.Entity.LookupTypeId != Guid.Empty)
            .ToDictionary(entry => entry.Entity.LookupValueId, entry => entry.Entity.LookupTypeId);

        var unresolvedLookupValueIds = new HashSet<Guid>();
        foreach (var entry in ChangeTracker.Entries<LookupValueLabel>())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
            {
                continue;
            }

            if (lookupValueIdToTypeId.TryGetValue(entry.Entity.LookupValueId, out var lookupTypeId))
            {
                typeIdsToIncrement.Add(lookupTypeId);
                continue;
            }

            unresolvedLookupValueIds.Add(entry.Entity.LookupValueId);
        }

        if (unresolvedLookupValueIds.Count > 0)
        {
            var resolvedTypeIds = LookupValues
                .AsNoTracking()
                .Where(value => unresolvedLookupValueIds.Contains(value.LookupValueId))
                .Select(value => value.LookupTypeId)
                .ToList();

            foreach (var lookupTypeId in resolvedTypeIds)
            {
                typeIdsToIncrement.Add(lookupTypeId);
            }
        }

        typeIdsToIncrement.Remove(Guid.Empty);
        if (typeIdsToIncrement.Count == 0)
        {
            return;
        }

        var trackedLookupTypes = ChangeTracker.Entries<LookupType>()
            .Where(entry => typeIdsToIncrement.Contains(entry.Entity.LookupTypeId))
            .ToDictionary(entry => entry.Entity.LookupTypeId);

        foreach (var lookupTypeId in typeIdsToIncrement.ToList())
        {
            if (trackedLookupTypes.TryGetValue(lookupTypeId, out var trackedEntry))
            {
                if (trackedEntry.State == EntityState.Added)
                {
                    typeIdsToIncrement.Remove(lookupTypeId);
                    continue;
                }

                trackedEntry.Entity.Version = Math.Max(1, trackedEntry.Entity.Version) + 1;
                trackedEntry.State = EntityState.Modified;
                typeIdsToIncrement.Remove(lookupTypeId);
            }
        }

        if (typeIdsToIncrement.Count == 0)
        {
            return;
        }

        var lookupTypesFromDatabase = LookupTypes
            .Where(type => typeIdsToIncrement.Contains(type.LookupTypeId))
            .ToList();

        foreach (var lookupType in lookupTypesFromDatabase)
        {
            lookupType.Version = Math.Max(1, lookupType.Version) + 1;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Call>(entity =>
        {
            entity.ToTable("Calls");
            entity.HasKey(call => call.Id);
            entity.Property(call => call.Caller).HasMaxLength(200);
            entity.Property(call => call.PhoneNumber).HasMaxLength(50);
            entity.Property(call => call.Notes).HasMaxLength(2000);
            entity.Property(call => call.Source).HasMaxLength(200);
            entity.Property(call => call.CallTimeUtc).IsRequired();
        });

        modelBuilder.Entity<FormDefinition>(entity =>
        {
            entity.ToTable("FormDefinition");
            entity.HasKey(form => form.Id);
            entity.Property(form => form.Code).HasMaxLength(100).IsRequired();
            entity.Property(form => form.Status).HasMaxLength(20).IsRequired();
            entity.Property(form => form.TitleKey).HasMaxLength(200).IsRequired();
            entity.Property(form => form.DescriptionKey).HasMaxLength(200);
            entity.Property(form => form.SchemaJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(form => form.UiJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(form => form.RulesJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(form => form.CreatedAt).HasColumnType("datetime2").IsRequired();
            entity.HasIndex(form => new { form.Code, form.Version }).IsUnique();
            entity.HasIndex(form => new { form.Code, form.Status });
        });

        modelBuilder.Entity<OptionSet>(entity =>
        {
            entity.ToTable("OptionSet");
            entity.HasKey(optionSet => optionSet.Id);
            entity.Property(optionSet => optionSet.Key).HasMaxLength(100).IsRequired();
            entity.HasIndex(optionSet => optionSet.Key).IsUnique();
        });

        modelBuilder.Entity<OptionItem>(entity =>
        {
            entity.ToTable("OptionItem");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Code).HasMaxLength(100).IsRequired();
            entity.Property(item => item.LabelKey).HasMaxLength(200).IsRequired();
            entity.Property(item => item.IsActive).IsRequired();
            entity.Property(item => item.ValidFrom).HasColumnType("datetime2");
            entity.Property(item => item.ValidTo).HasColumnType("datetime2");
            entity.HasIndex(item => new { item.OptionSetId, item.Code }).IsUnique();
            entity.HasOne(item => item.OptionSet)
                .WithMany(set => set.Items)
                .HasForeignKey(item => item.OptionSetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TextResource>(entity =>
        {
            entity.ToTable("TextResource");
            entity.HasKey(resource => resource.Key);
            entity.Property(resource => resource.Key).HasMaxLength(200).IsRequired();
            entity.Property(resource => resource.DefaultText).HasMaxLength(1000).IsRequired();
        });

        modelBuilder.Entity<TextTranslation>(entity =>
        {
            entity.ToTable("TextTranslation");
            entity.HasKey(translation => translation.Id);
            entity.Property(translation => translation.Key).HasMaxLength(200).IsRequired();
            entity.Property(translation => translation.Locale).HasMaxLength(20).IsRequired();
            entity.Property(translation => translation.Text).HasMaxLength(1000).IsRequired();
            entity.HasIndex(translation => new { translation.Key, translation.Locale }).IsUnique();
            entity.HasOne(translation => translation.Resource)
                .WithMany(resource => resource.Translations)
                .HasForeignKey(translation => translation.Key)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FormSubmission>(entity =>
        {
            entity.ToTable("FormSubmission");
            entity.HasKey(submission => submission.Id);
            entity.Property(submission => submission.FormCode).HasMaxLength(100).IsRequired();
            entity.Property(submission => submission.SubjectType).HasMaxLength(30).IsRequired();
            entity.Property(submission => submission.SubjectId).HasMaxLength(100);
            entity.Property(submission => submission.Status).HasMaxLength(20).IsRequired();
            entity.Property(submission => submission.AnswersJson).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(submission => submission.CreatedAt).HasColumnType("datetime2").IsRequired();
            entity.Property(submission => submission.UpdatedAt).HasColumnType("datetime2").IsRequired();
            entity.Property(submission => submission.CompletedAt).HasColumnType("datetime2");
            entity.HasIndex(submission => new
            {
                submission.FormCode,
                submission.FormVersion,
                submission.SubjectType,
                submission.SubjectId,
                submission.Status
            });
        });

        modelBuilder.ApplyConfiguration(new UnitConfiguration());

        modelBuilder.Entity<ScreeningControl>(entity =>
        {
            entity.ToTable("ScreeningControl");
            entity.HasKey(control => control.Id);
            entity.Property(control => control.UnitCode).HasMaxLength(100).IsRequired();
            entity.Property(control => control.UnitName).HasMaxLength(200).IsRequired();
            entity.Property(control => control.UnitCapacity).IsRequired();
            entity.Property(control => control.CurrentOccupancy).IsRequired();
            entity.Property(control => control.CapacityWarningThreshold).IsRequired();
            entity.Property(control => control.CallLogsCacheSeconds).IsRequired();
            entity.Property(control => control.EvaluationQueueCacheSeconds).IsRequired();
            entity.Property(control => control.LocalizationCacheSeconds).IsRequired();
            entity.Property(control => control.EnableClientCacheOverride).IsRequired();
            entity.Property(control => control.UpdatedAt).HasColumnType("datetime2").IsRequired();
            entity.HasIndex(control => control.UnitCode).IsUnique();
        });

        modelBuilder.Entity<Resident>(entity =>
        {
            entity.ToTable("Resident");
            entity.HasKey(resident => resident.Id);
            entity.Property(resident => resident.Psn).HasMaxLength(50);
            entity.Property(resident => resident.UnitCode).HasMaxLength(20);
            entity.Property(resident => resident.FirstName).HasMaxLength(100);
            entity.Property(resident => resident.Surname).HasMaxLength(100);
            entity.Property(resident => resident.Nationality).HasMaxLength(100);
            entity.Property(resident => resident.RoomNumber).HasMaxLength(20);
            entity.Property(resident => resident.PhotoUrl).HasMaxLength(500);
            entity.Property(resident => resident.PrimaryAddiction).HasMaxLength(100);
            entity.Property(resident => resident.CreatedAtUtc).HasColumnType("datetime2").IsRequired();
            entity.Property(resident => resident.UpdatedAtUtc).HasColumnType("datetime2").IsRequired();
            entity.HasIndex(resident => new { resident.UnitCode, resident.RoomNumber });
            entity.HasIndex(resident => resident.Psn).IsUnique();
        });

        modelBuilder.ApplyConfiguration(new LookupTypeConfiguration());
        modelBuilder.ApplyConfiguration(new LookupValueConfiguration());
        modelBuilder.ApplyConfiguration(new LookupValueLabelConfiguration());
        modelBuilder.ApplyConfiguration(new AppUserConfiguration());
        modelBuilder.ApplyConfiguration(new AppRoleConfiguration());
        modelBuilder.ApplyConfiguration(new AppPermissionConfiguration());
        modelBuilder.ApplyConfiguration(new AppRolePermissionConfiguration());
        modelBuilder.ApplyConfiguration(new AppUserRoleAssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new CentreConfiguration());
        modelBuilder.ApplyConfiguration(new ElementGroupConfiguration());
        modelBuilder.ApplyConfiguration(new ElementDefinitionConfiguration());
        modelBuilder.ApplyConfiguration(new GroupTherapySubjectTemplateConfiguration());
        modelBuilder.ApplyConfiguration(new GroupTherapyDailyQuestionConfiguration());
        modelBuilder.ApplyConfiguration(new GroupTherapyResidentRemarkConfiguration());
        modelBuilder.ApplyConfiguration(new GroupTherapyResidentObservationConfiguration());
        modelBuilder.ApplyConfiguration(new TherapyTopicConfiguration());
        modelBuilder.ApplyConfiguration(new ResidentCaseConfiguration());
        modelBuilder.ApplyConfiguration(new ResidentPreviousTreatmentConfiguration());
        modelBuilder.ApplyConfiguration(new ResidentProgrammeEpisodeConfiguration());
        modelBuilder.ApplyConfiguration(new ScheduledIntakeConfiguration());
        modelBuilder.ApplyConfiguration(new ScreeningScheduleSlotConfiguration());
        modelBuilder.ApplyConfiguration(new IncidentTypeConfiguration());
        modelBuilder.ApplyConfiguration(new IncidentConfiguration());
        modelBuilder.ApplyConfiguration(new WeeklyTherapyRunConfiguration());
        modelBuilder.ApplyConfiguration(new ResidentWeeklyTherapyAssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new TherapyTopicCompletionConfiguration());
        modelBuilder.ApplyConfiguration(new EpisodeEventTypeLookupConfiguration());
        modelBuilder.ApplyConfiguration(new EpisodeEventConfiguration());
        modelBuilder.ApplyConfiguration(new TherapySchedulingConfigConfiguration());
        modelBuilder.ApplyConfiguration(new AuditLogConfiguration());
        modelBuilder.ApplyConfiguration(new MediaAssetConfiguration());
        modelBuilder.ApplyConfiguration(new QuoteConfiguration());
        modelBuilder.ApplyConfiguration(new UnitQuoteCurationConfiguration());
        modelBuilder.ApplyConfiguration(new VideoConfiguration());
        modelBuilder.ApplyConfiguration(new UnitVideoCurationConfiguration());

        SeedFormDefinition(modelBuilder);
        SeedOptionSets(modelBuilder);
        SeedTranslations(modelBuilder);
        SeedCentres(modelBuilder);
        SeedUnits(modelBuilder);
        SeedResidents(modelBuilder);
        SeedAuthorizationModel(modelBuilder);
        SeedScreeningControls(modelBuilder);
        SeedElementLibrary(modelBuilder);
        SeedGroupTherapyProgram(modelBuilder);
        SeedGroupTherapyRemarks(modelBuilder);
        SeedTherapyTopics(modelBuilder);
        SeedEpisodeEventTypes(modelBuilder);
        SeedIncidentTypes(modelBuilder);
    }

    private static void SeedCentres(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Centre>().HasData(
            new Centre
            {
                Id = BrureeCentreId,
                Code = "bruree",
                Name = "Bruree",
                Description = "Primary centre used for the current unit configuration.",
                BrandName = "Acutis",
                BrandSubtitle = "Bruree Centre",
                BrandLogoUrl = "/acutis-icon.svg",
                BrowserTitle = "Acutis",
                FaviconUrl = "/acutis-icon.svg",
                ThemeKey = "acutis",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            });
    }

    private static void SeedUnits(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Unit>().HasData(
            new Unit
            {
                Id = AlcoholUnitId,
                CentreId = BrureeCentreId,
                Code = "alcohol",
                Name = "Alcohol",
                Description = "Primary alcohol treatment unit.",
                Capacity = 120,
                CurrentOccupancy = 63,
                CapacityWarningThreshold = 96,
                DefaultResidentWeekNumber = 1,
                DisplayOrder = 1,
                IsActive = true,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            },
            new Unit
            {
                Id = DetoxUnitId,
                CentreId = BrureeCentreId,
                Code = "detox",
                Name = "Detox",
                Description = "Detox and medically supervised stabilisation unit.",
                Capacity = 16,
                CurrentOccupancy = 11,
                CapacityWarningThreshold = 14,
                DefaultResidentWeekNumber = 1,
                DisplayOrder = 2,
                IsActive = true,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            },
            new Unit
            {
                Id = DrugsUnitId,
                CentreId = BrureeCentreId,
                Code = "drugs",
                Name = "Drugs",
                Description = "Drug recovery residential unit.",
                Capacity = 22,
                CurrentOccupancy = 18,
                CapacityWarningThreshold = 20,
                DefaultResidentWeekNumber = 1,
                DisplayOrder = 3,
                IsActive = true,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            },
            new Unit
            {
                Id = LadiesUnitId,
                CentreId = BrureeCentreId,
                Code = "ladies",
                Name = "Ladies",
                Description = "Women-specific residential recovery unit.",
                Capacity = 18,
                CurrentOccupancy = 14,
                CapacityWarningThreshold = 16,
                DefaultResidentWeekNumber = 1,
                DisplayOrder = 4,
                IsActive = true,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            });
    }

    private static void SeedAuthorizationModel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppPermission>().HasData(
            new AppPermission
            {
                Id = ConfigurationManagePermissionId,
                Key = "configuration.manage",
                Name = "Manage configuration",
                Description = "Manage global application configuration.",
                Category = "configuration",
                IsActive = true
            },
            new AppPermission
            {
                Id = ThemeManagePermissionId,
                Key = "theme.manage",
                Name = "Manage theme",
                Description = "Choose and override application themes where allowed.",
                Category = "configuration",
                IsActive = true
            },
            new AppPermission
            {
                Id = UnitsManagePermissionId,
                Key = "units.manage",
                Name = "Manage units",
                Description = "Create, update, and archive units.",
                Category = "units",
                IsActive = true
            },
            new AppPermission
            {
                Id = AccessManagePermissionId,
                Key = "access.manage",
                Name = "Manage access",
                Description = "Manage users, roles, and role assignments.",
                Category = "security",
                IsActive = true
            },
            new AppPermission
            {
                Id = ScreeningViewPermissionId,
                Key = "screening.view",
                Name = "View screening",
                Description = "Access screening controls and screening workflow data.",
                Category = "screening",
                IsActive = true
            },
            new AppPermission
            {
                Id = ResidentsViewPermissionId,
                Key = "residents.view",
                Name = "View residents",
                Description = "Access resident lists scoped to a unit.",
                Category = "residents",
                IsActive = true
            },
            new AppPermission
            {
                Id = MediaViewPermissionId,
                Key = "media.view",
                Name = "View media",
                Description = "Access unit media catalogues and media assets.",
                Category = "media",
                IsActive = true
            },
            new AppPermission
            {
                Id = GroupTherapyViewPermissionId,
                Key = "group_therapy.view",
                Name = "View group therapy",
                Description = "Access group therapy programmes and remarks.",
                Category = "group_therapy",
                IsActive = true
            },
            new AppPermission
            {
                Id = UnitOperationsViewPermissionId,
                Key = "unit_operations.view",
                Name = "View unit operations",
                Description = "Access room assignments and OT schedules.",
                Category = "units",
                IsActive = true
            });

        modelBuilder.Entity<AppRole>().HasData(
            new AppRole
            {
                Id = PlatformAdminRoleId,
                Key = "platform_admin",
                Name = "Platform admin",
                Description = "Global administrator role for configuration and access control.",
                ExternalRoleName = "admin",
                DefaultScopeType = ConfigurationScopeTypes.Centre,
                IsSystemRole = true,
                IsActive = true
            },
            new AppRole
            {
                Id = ClinicalViewerRoleId,
                Key = "clinical_viewer",
                Name = "Clinical viewer",
                Description = "Read-only role for operational unit features.",
                ExternalRoleName = string.Empty,
                DefaultScopeType = ConfigurationScopeTypes.Unit,
                IsSystemRole = true,
                IsActive = true
            });

        modelBuilder.Entity<AppRolePermission>().HasData(
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = ConfigurationManagePermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = ThemeManagePermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = UnitsManagePermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = AccessManagePermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = ScreeningViewPermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = ResidentsViewPermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = MediaViewPermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = GroupTherapyViewPermissionId },
            new AppRolePermission { AppRoleId = PlatformAdminRoleId, AppPermissionId = UnitOperationsViewPermissionId },
            new AppRolePermission { AppRoleId = ClinicalViewerRoleId, AppPermissionId = ScreeningViewPermissionId },
            new AppRolePermission { AppRoleId = ClinicalViewerRoleId, AppPermissionId = ResidentsViewPermissionId },
            new AppRolePermission { AppRoleId = ClinicalViewerRoleId, AppPermissionId = MediaViewPermissionId },
            new AppRolePermission { AppRoleId = ClinicalViewerRoleId, AppPermissionId = GroupTherapyViewPermissionId },
            new AppRolePermission { AppRoleId = ClinicalViewerRoleId, AppPermissionId = UnitOperationsViewPermissionId });
    }

    private static void SeedResidents(ModelBuilder modelBuilder)
    {
        var detoxResidentSeeds = new (string FirstName, string Surname, int WeekNumber, string RoomNumber, string Nationality)[]
        {
            ("Aidan", "Byrne", 1, "D01", "Irish"),
            ("Brian", "O'Neill", 2, "D02", "Irish"),
            ("Cian", "Murphy", 3, "D03", "Irish"),
            ("Darragh", "Walsh", 4, "D04", "Irish"),
            ("Eoin", "Ryan", 5, "D05", "Irish"),
            ("Fintan", "Hayes", 6, "D06", "Irish"),
            ("Gavin", "Doyle", 7, "D07", "Irish"),
            ("Hugh", "Kavanagh", 8, "D08", "Irish"),
            ("Ian", "Fitzgerald", 9, "D09", "Irish"),
            ("John", "McCarthy", 10, "D10", "Irish"),
            ("Kevin", "Power", 11, "D11", "Irish")
        };

        var detoxResidents = detoxResidentSeeds.Select((resident, index) =>
        {
            var residentNumber = index + 1;
            return new Resident
            {
                Id = CreateDeterministicGuid($"resident:detox:{residentNumber:00}"),
                Psn = BuildResidentSecondaryKey("BRU", "DET", 26, resident.WeekNumber, residentNumber),
                UnitId = DetoxUnitId,
                UnitCode = "detox",
                FirstName = resident.FirstName,
                Surname = resident.Surname,
                Nationality = resident.Nationality,
                DateOfBirth = new DateTime(1984 + (residentNumber % 8), Math.Max(1, residentNumber), Math.Min(20, 8 + residentNumber), 0, 0, 0, DateTimeKind.Utc),
                WeekNumber = resident.WeekNumber,
                RoomNumber = resident.RoomNumber,
                PhotoUrl = BuildResidentPhotoUrl(residentNumber),
                AdmissionDate = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc).AddDays((resident.WeekNumber - 1) * 7),
                ExpectedCompletionDate = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc).AddDays((resident.WeekNumber + 11) * 7),
                PrimaryAddiction = "Alcohol",
                IsDrug = false,
                IsGambeler = residentNumber % 5 == 0,
                IsPreviousResident = residentNumber % 4 == 0,
                DietaryNeedsCode = residentNumber % 3,
                IsSnorer = residentNumber % 2 == 0,
                HasCriminalHistory = residentNumber % 3 == 0,
                IsOnProbation = residentNumber % 4 == 0,
                ArgumentativeScale = residentNumber % 5,
                LearningDifficultyScale = residentNumber % 4,
                LiteracyScale = residentNumber % 3,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            };
        }).ToArray();

        var detoxEpisodes = detoxResidents.Select((resident, index) => new ResidentProgrammeEpisode
        {
            Id = CreateDeterministicGuid($"episode:{resident.Id:D}"),
            ResidentId = resident.Id,
            CentreId = BrureeCentreId,
            UnitId = DetoxUnitId,
            StartDate = new DateOnly(2026, 1, 5),
            EndDate = null,
            CentreEpisodeCode = BuildCentreEpisodeCode("BRU", resident.AdmissionDate?.Year ?? 2026, detoxResidentSeeds[index].WeekNumber, 1),
            EntryYear = resident.AdmissionDate?.Year ?? 2026,
            EntryWeek = detoxResidentSeeds[index].WeekNumber,
            EntrySequence = 1,
            RoomNumber = resident.RoomNumber,
            ExpectedCompletionDate = resident.ExpectedCompletionDate,
            PrimaryAddiction = resident.PrimaryAddiction,
            ProgrammeType = ProgrammeType.Alcohol,
            CurrentWeekNumber = detoxResidentSeeds[index].WeekNumber,
            ParticipationMode = ParticipationMode.FullProgramme,
            CohortId = null
        }).ToArray();

        var topicCodes = new[]
        {
            "RELAPSE_PREVENTION",
            "COPING_SKILLS",
            "TRIGGERS_AND_CRAVINGS",
            "TOPIC_04",
            "TOPIC_05",
            "TOPIC_06",
            "TOPIC_07",
            "TOPIC_08",
            "TOPIC_09",
            "TOPIC_10",
            "RELAPSE_PREVENTION",
            "COPING_SKILLS"
        };

        var detoxAssignments = detoxResidents.SelectMany((resident, residentIndex) =>
            Enumerable.Range(0, 12).Select(weekOffset => new ResidentWeeklyTherapyAssignment
            {
                Id = CreateDeterministicGuid($"resident-weekly-assignment:{resident.Id:D}:{weekOffset + 1:00}"),
                ResidentId = resident.Id,
                EpisodeId = detoxEpisodes[residentIndex].Id,
                WeekStartDate = new DateOnly(2026, 1, 5).AddDays(weekOffset * 7),
                TherapyTopicId = CreateDeterministicGuid($"therapy-topic:{topicCodes[weekOffset]}"),
                AssignmentSource = AssignmentSource.Auto,
                OverrideReason = null,
                SupersedesAssignmentId = null,
                CreatedAt = SeedCreatedAt.AddDays(weekOffset),
                CreatedByUserId = CreateDeterministicGuid("system:seed")
            }));

        var alcoholFirstNames = new[]
        {
            "Alan", "Brendan", "Cathal", "Declan", "Emmet", "Finbar", "Gerard",
            "Harry", "James", "Liam", "Martin", "Niall", "Oisin", "Padraig",
            "Ronan", "Seamus", "Thomas", "Ultan", "Vincent", "William", "Zach"
        };
        var alcoholSurnameBlocks = new[]
        {
            new[] { "Allen", "Brennan", "Clarke", "Donovan", "Ennis", "Farrell", "Griffin", "Hickey", "Irwin", "Joyce", "Keane", "Larkin", "Mahon", "Nolan", "Owens", "Quinn", "Reilly", "Sullivan", "Tierney", "Usher", "Whelan" },
            new[] { "Archer", "Burke", "Conway", "Dunne", "Egan", "Foley", "Gilmore", "Hogan", "Ivors", "Jordan", "Kennedy", "Lennon", "Mooney", "Nestor", "O'Brien", "Prendergast", "Roche", "Shanahan", "Tracey", "Vaughan", "White" },
            new[] { "Aylward", "Boyle", "Coffey", "Delaney", "Evans", "Fitzpatrick", "Gannon", "Healy", "Ingram", "Keegan", "Lawlor", "Maguire", "Noonan", "O'Connor", "Phelan", "Reardon", "Scanlon", "Tobin", "Walsh", "Walton", "Young" }
        };
        var alcoholNationalities = new[] { "Irish", "Polish", "British", "Lithuanian", "Romanian", "Latvian" };

        var alcoholResidents = Enumerable.Range(1, 63).Select(residentNumber =>
        {
            var firstNameIndex = (residentNumber - 1) % alcoholFirstNames.Length;
            var surnameBlockIndex = (residentNumber - 1) / alcoholFirstNames.Length;
            var weekNumber = ((residentNumber - 1) % 12) + 1;
            var admissionDate = new DateTime(2026, 1, 5, 0, 0, 0, DateTimeKind.Utc).AddDays((weekNumber - 1) * 7);

            return new Resident
            {
                Id = CreateDeterministicGuid($"resident:alcohol:{residentNumber:00}"),
                Psn = BuildResidentSecondaryKey("BRU", "ALC", 26, weekNumber, residentNumber),
                UnitId = AlcoholUnitId,
                UnitCode = "alcohol",
                FirstName = alcoholFirstNames[firstNameIndex],
                Surname = alcoholSurnameBlocks[surnameBlockIndex][firstNameIndex],
                Nationality = alcoholNationalities[(residentNumber - 1) % alcoholNationalities.Length],
                DateOfBirth = new DateTime(1978 + (residentNumber % 18), ((residentNumber - 1) % 12) + 1, Math.Min(28, 5 + ((residentNumber - 1) % 20)), 0, 0, 0, DateTimeKind.Utc),
                WeekNumber = weekNumber,
                RoomNumber = $"A{residentNumber:00}",
                PhotoUrl = BuildResidentPhotoUrl(detoxResidents.Length + residentNumber),
                AdmissionDate = admissionDate,
                ExpectedCompletionDate = admissionDate.AddDays(84),
                PrimaryAddiction = "Alcohol",
                IsDrug = false,
                IsGambeler = residentNumber % 11 == 0,
                IsPreviousResident = residentNumber % 7 == 0,
                DietaryNeedsCode = residentNumber % 4,
                IsSnorer = residentNumber % 3 == 0,
                HasCriminalHistory = residentNumber % 5 == 0,
                IsOnProbation = residentNumber % 8 == 0,
                ArgumentativeScale = residentNumber % 5,
                LearningDifficultyScale = residentNumber % 4,
                LiteracyScale = residentNumber % 3,
                CreatedAtUtc = SeedCreatedAt,
                UpdatedAtUtc = SeedCreatedAt
            };
        }).ToArray();

        var alcoholCases = alcoholResidents.Select((resident, index) =>
        {
            var referralReceivedAtUtc = (resident.AdmissionDate ?? SeedCreatedAt).AddDays(-21);
            var screeningStartedAtUtc = referralReceivedAtUtc.AddDays(2);
            var screeningCompletedAtUtc = referralReceivedAtUtc.AddDays(9);
            var admissionDecisionAtUtc = referralReceivedAtUtc.AddDays(12);

            return new ResidentCase
            {
                Id = CreateDeterministicGuid($"resident-case:alcohol:{index + 1:00}"),
                ResidentId = resident.Id,
                CentreId = BrureeCentreId,
                UnitId = AlcoholUnitId,
                CaseStatus = "admitted",
                CasePhase = "admission",
                IntakeSource = "screening_call",
                ReferralSource = index % 3 == 0 ? "gp" : index % 3 == 1 ? "family" : "self",
                ReferralReference = $"ALC-REF-{index + 1:000}",
                ReferralReceivedAtUtc = referralReceivedAtUtc,
                ScreeningStartedAtUtc = screeningStartedAtUtc,
                ScreeningCompletedAtUtc = screeningCompletedAtUtc,
                AdmissionDecisionAtUtc = admissionDecisionAtUtc,
                AdmissionDecisionStatus = "admitted",
                AdmissionDecisionReason = "Suitable for residential alcohol programme admission.",
                ClosedWithoutAdmissionAtUtc = null,
                RequiresComprehensiveAssessment = index % 4 == 0,
                ComprehensiveAssessmentCompleted = true,
                OpenedAtUtc = referralReceivedAtUtc,
                LastContactAtUtc = admissionDecisionAtUtc,
                ClosedAtUtc = null,
                SummaryNotes = "Admitted to the alcohol programme following screening and admission decision."
            };
        }).ToArray();

        var alcoholEpisodes = alcoholResidents.Select((resident, index) =>
        {
            var entrySequence = 10 + alcoholResidents
                .Take(index + 1)
                .Count(x => x.WeekNumber == resident.WeekNumber);

            return new ResidentProgrammeEpisode
            {
                Id = CreateDeterministicGuid($"episode:{resident.Id:D}"),
                ResidentCaseId = alcoholCases[index].Id,
                ResidentId = resident.Id,
                CentreId = BrureeCentreId,
                UnitId = AlcoholUnitId,
                StartDate = DateOnly.FromDateTime(resident.AdmissionDate ?? SeedCreatedAt),
                EndDate = null,
                CentreEpisodeCode = BuildCentreEpisodeCode("BRU", resident.AdmissionDate?.Year ?? 2026, resident.WeekNumber, entrySequence),
                EntryYear = resident.AdmissionDate?.Year ?? 2026,
                EntryWeek = resident.WeekNumber,
                EntrySequence = entrySequence,
                RoomNumber = resident.RoomNumber,
                ExpectedCompletionDate = resident.ExpectedCompletionDate,
                PrimaryAddiction = resident.PrimaryAddiction,
                ProgrammeType = ProgrammeType.Alcohol,
                CurrentWeekNumber = resident.WeekNumber,
                ParticipationMode = ParticipationMode.FullProgramme,
                CohortId = null
            };
        }).ToArray();

        modelBuilder.Entity<Resident>().HasData(detoxResidents.Concat(alcoholResidents));
        modelBuilder.Entity<ResidentCase>().HasData(alcoholCases);
        modelBuilder.Entity<ResidentProgrammeEpisode>().HasData(detoxEpisodes.Concat(alcoholEpisodes));
        modelBuilder.Entity<ResidentWeeklyTherapyAssignment>().HasData(detoxAssignments);
    }

    private static void SeedFormDefinition(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FormDefinition>().HasData(
            new FormDefinition
            {
                Id = ScreeningFormId,
                Code = ScreeningFormCode,
                Version = 1,
                Status = "published",
                TitleKey = "screening.form.alcohol_screening_call.title",
                DescriptionKey = "screening.form.alcohol_screening_call.description",
                SchemaJson = SchemaJson,
                UiJson = UiJson,
                RulesJson = RulesJson,
                CreatedAt = SeedCreatedAt
            },
            new FormDefinition
            {
                Id = ScreeningFormV2Id,
                Code = ScreeningFormCode,
                Version = 2,
                Status = "published",
                TitleKey = "screening.form.alcohol_screening_call.title",
                DescriptionKey = "screening.form.alcohol_screening_call.description",
                SchemaJson = SchemaJsonV2,
                UiJson = UiJsonV2,
                RulesJson = RulesJson,
                CreatedAt = SeedCreatedAt.AddDays(1)
            },
            new FormDefinition
            {
                Id = ScreeningFormV3Id,
                Code = ScreeningFormCode,
                Version = 3,
                Status = "published",
                TitleKey = "screening.form.alcohol_screening_call.title",
                DescriptionKey = "screening.form.alcohol_screening_call.description",
                SchemaJson = SchemaJsonV3,
                UiJson = UiJsonV3,
                RulesJson = RulesJson,
                CreatedAt = SeedCreatedAt.AddDays(2)
            },
            new FormDefinition
            {
                Id = ScreeningFormV4Id,
                Code = ScreeningFormCode,
                Version = 4,
                Status = "published",
                TitleKey = "screening.form.alcohol_screening_call.title",
                DescriptionKey = "screening.form.alcohol_screening_call.description",
                SchemaJson = SchemaJsonV4,
                UiJson = UiJsonV4,
                RulesJson = RulesJsonV4,
                CreatedAt = SeedCreatedAt.AddDays(3)
            },
            new FormDefinition
            {
                Id = ScreeningFormV5Id,
                Code = ScreeningFormCode,
                Version = 5,
                Status = "published",
                TitleKey = "Resident Case Screening and Admission Assessment",
                DescriptionKey = "First real HSE-derived case assessment assembled from Element Library items.",
                SchemaJson = SchemaJsonV5,
                UiJson = UiJsonV5,
                RulesJson = RulesJsonV5,
                CreatedAt = SeedCreatedAt.AddDays(4)
            });
    }

    private static void SeedOptionSets(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OptionSet>().HasData(
            new OptionSet
            {
                Id = ReferralSourceOptionSetId,
                Key = "referral_source"
            },
            new OptionSet
            {
                Id = DrinkTypeOptionSetId,
                Key = "drink_type"
            },
            new OptionSet
            {
                Id = DrinkMeasureUnitOptionSetId,
                Key = "drink_measure_unit"
            },
            new OptionSet
            {
                Id = HousingStatusOptionSetId,
                Key = "housing_status"
            });

        modelBuilder.Entity<OptionItem>().HasData(
            new OptionItem
            {
                Id = GpOptionItemId,
                OptionSetId = ReferralSourceOptionSetId,
                Code = "gp",
                LabelKey = "screening.options.referral_source.gp",
                IsActive = true,
                SortOrder = 1
            },
            new OptionItem
            {
                Id = FamilyOptionItemId,
                OptionSetId = ReferralSourceOptionSetId,
                Code = "family",
                LabelKey = "screening.options.referral_source.family",
                IsActive = true,
                SortOrder = 2
            },
            new OptionItem
            {
                Id = SelfOptionItemId,
                OptionSetId = ReferralSourceOptionSetId,
                Code = "self",
                LabelKey = "screening.options.referral_source.self",
                IsActive = true,
                SortOrder = 3
            },
            new OptionItem
            {
                Id = OtherOptionItemId,
                OptionSetId = ReferralSourceOptionSetId,
                Code = "other",
                LabelKey = "screening.options.referral_source.other",
                IsActive = true,
                SortOrder = 4
            },
            new OptionItem
            {
                Id = DrinkTypeBeerOptionItemId,
                OptionSetId = DrinkTypeOptionSetId,
                Code = "beer",
                LabelKey = "screening.options.drink_type.beer",
                IsActive = true,
                SortOrder = 1
            },
            new OptionItem
            {
                Id = DrinkTypeWineOptionItemId,
                OptionSetId = DrinkTypeOptionSetId,
                Code = "wine",
                LabelKey = "screening.options.drink_type.wine",
                IsActive = true,
                SortOrder = 2
            },
            new OptionItem
            {
                Id = DrinkTypeSpiritsOptionItemId,
                OptionSetId = DrinkTypeOptionSetId,
                Code = "spirits",
                LabelKey = "screening.options.drink_type.spirits",
                IsActive = true,
                SortOrder = 3
            },
            new OptionItem
            {
                Id = DrinkTypeCiderOptionItemId,
                OptionSetId = DrinkTypeOptionSetId,
                Code = "cider",
                LabelKey = "screening.options.drink_type.cider",
                IsActive = true,
                SortOrder = 4
            },
            new OptionItem
            {
                Id = DrinkTypeOtherOptionItemId,
                OptionSetId = DrinkTypeOptionSetId,
                Code = "other",
                LabelKey = "screening.options.drink_type.other",
                IsActive = true,
                SortOrder = 5
            },
            new OptionItem
            {
                Id = DrinkMeasureUnitPintsOptionItemId,
                OptionSetId = DrinkMeasureUnitOptionSetId,
                Code = "pints",
                LabelKey = "screening.options.drink_measure_unit.pints",
                IsActive = true,
                SortOrder = 1
            },
            new OptionItem
            {
                Id = DrinkMeasureUnitLitresOptionItemId,
                OptionSetId = DrinkMeasureUnitOptionSetId,
                Code = "litres",
                LabelKey = "screening.options.drink_measure_unit.litres",
                IsActive = true,
                SortOrder = 2
            },
            new OptionItem
            {
                Id = DrinkMeasureUnitBottlesOptionItemId,
                OptionSetId = DrinkMeasureUnitOptionSetId,
                Code = "bottles",
                LabelKey = "screening.options.drink_measure_unit.bottles",
                IsActive = true,
                SortOrder = 3
            },
            new OptionItem
            {
                Id = HousingStatusStableOptionItemId,
                OptionSetId = HousingStatusOptionSetId,
                Code = "stable",
                LabelKey = "screening.options.housing_status.stable",
                IsActive = true,
                SortOrder = 1
            },
            new OptionItem
            {
                Id = HousingStatusTemporaryOptionItemId,
                OptionSetId = HousingStatusOptionSetId,
                Code = "temporary",
                LabelKey = "screening.options.housing_status.temporary",
                IsActive = true,
                SortOrder = 2
            },
            new OptionItem
            {
                Id = HousingStatusHomelessOptionItemId,
                OptionSetId = HousingStatusOptionSetId,
                Code = "homeless",
                LabelKey = "screening.options.housing_status.homeless",
                IsActive = true,
                SortOrder = 3
            },
            new OptionItem
            {
                Id = HousingStatusSupportedOptionItemId,
                OptionSetId = HousingStatusOptionSetId,
                Code = "supported",
                LabelKey = "screening.options.housing_status.supported",
                IsActive = true,
                SortOrder = 4
            },
            new OptionItem
            {
                Id = HousingStatusOtherOptionItemId,
                OptionSetId = HousingStatusOptionSetId,
                Code = "other",
                LabelKey = "screening.options.housing_status.other",
                IsActive = true,
                SortOrder = 5
            });
    }

    private static void SeedTranslations(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TextResource>().HasData(
            new TextResource { Key = "screening.form.alcohol_screening_call.title", DefaultText = "Alcohol Screening Call" },
            new TextResource { Key = "screening.form.alcohol_screening_call.description", DefaultText = "Capture first-call screening details." },
            new TextResource { Key = "screening.section.caller_details", DefaultText = "Caller Details" },
            new TextResource { Key = "screening.section.alcohol_use", DefaultText = "Alcohol Use" },
            new TextResource { Key = "screening.field.caller_name.label", DefaultText = "Caller Name" },
            new TextResource { Key = "screening.field.age.label", DefaultText = "Age" },
            new TextResource { Key = "screening.field.drink_type.label", DefaultText = "Drink Type" },
            new TextResource { Key = "screening.field.drink_type_other.label", DefaultText = "If other, specify drink type" },
            new TextResource { Key = "screening.field.drinks_per_day.label", DefaultText = "Drinks Per Day" },
            new TextResource { Key = "screening.field.drinks_per_day.help", DefaultText = "Approximate average on drinking days. Select the unit used for this quantity." },
            new TextResource { Key = "screening.field.drinks_per_day_unit.label", DefaultText = "Drink Unit" },
            new TextResource { Key = "screening.field.drinks_per_day_unit.help", DefaultText = "Record whether the quantity is in pints, litres or bottles." },
            new TextResource { Key = "screening.field.withdrawal_history.label", DefaultText = "Has withdrawal history?" },
            new TextResource { Key = "screening.field.referral_source.label", DefaultText = "Referral Source" },
            new TextResource { Key = "screening.field.currently_unsafe.label", DefaultText = "Is immediate concern?" },
            new TextResource { Key = "screening.field.housing_status.label", DefaultText = "Housing Status" },
            new TextResource { Key = "screening.field.phone_number.label", DefaultText = "Phone Number" },
            new TextResource { Key = "screening.field.email_address.label", DefaultText = "Email Address" },
            new TextResource { Key = "screening.field.days_drinking_per_week.label", DefaultText = "Days Drinking Per Week" },
            new TextResource { Key = "screening.field.last_drink_date.label", DefaultText = "Last Drink Date" },
            new TextResource { Key = "screening.field.history_of_seizures.label", DefaultText = "Has seizure history?" },
            new TextResource { Key = "screening.field.suicidal_ideation.label", DefaultText = "Suicidal Ideation" },
            new TextResource { Key = "screening.field.support_network.label", DefaultText = "Support Network" },
            new TextResource { Key = "screening.field.medical_notes.label", DefaultText = "Medical Notes" },
            new TextResource { Key = "screening.field.assessor_notes.label", DefaultText = "Assessor Notes" },
            new TextResource { Key = "screening.field.next_steps.label", DefaultText = "Next Steps" },
            new TextResource { Key = "screening.field.assessor_notes.help", DefaultText = "Add contextual details for follow-up and handover." },
            new TextResource { Key = "screening.field.next_steps.help", DefaultText = "Capture agreed actions and ownership." },
            new TextResource { Key = "screening.section.stability", DefaultText = "Stability & Safety" },
            new TextResource { Key = "screening.section.follow_up", DefaultText = "Follow Up Notes" },
            new TextResource { Key = "screening.options.referral_source.gp", DefaultText = "GP" },
            new TextResource { Key = "screening.options.referral_source.family", DefaultText = "Family" },
            new TextResource { Key = "screening.options.referral_source.self", DefaultText = "Self" },
            new TextResource { Key = "screening.options.referral_source.other", DefaultText = "Other" },
            new TextResource { Key = "screening.options.drink_type.beer", DefaultText = "Beer" },
            new TextResource { Key = "screening.options.drink_type.wine", DefaultText = "Wine" },
            new TextResource { Key = "screening.options.drink_type.spirits", DefaultText = "Spirits" },
            new TextResource { Key = "screening.options.drink_type.cider", DefaultText = "Cider" },
            new TextResource { Key = "screening.options.drink_type.other", DefaultText = "Other" },
            new TextResource { Key = "screening.options.drink_measure_unit.pints", DefaultText = "Pints" },
            new TextResource { Key = "screening.options.drink_measure_unit.litres", DefaultText = "Litres" },
            new TextResource { Key = "screening.options.drink_measure_unit.bottles", DefaultText = "Bottles" },
            new TextResource { Key = "screening.options.housing_status.stable", DefaultText = "Stable Accommodation" },
            new TextResource { Key = "screening.options.housing_status.temporary", DefaultText = "Temporary Accommodation" },
            new TextResource { Key = "screening.options.housing_status.homeless", DefaultText = "Homeless" },
            new TextResource { Key = "screening.options.housing_status.supported", DefaultText = "Supported Accommodation" },
            new TextResource { Key = "screening.options.housing_status.other", DefaultText = "Other" },
            new TextResource { Key = "app.brand", DefaultText = "Acutis" },
            new TextResource { Key = "app.centre.bruree", DefaultText = "Bruree Treatment Center" },
            new TextResource { Key = "header.capacity", DefaultText = "Capacity" },
            new TextResource { Key = "header.current_time", DefaultText = "Current Time" },
            new TextResource { Key = "header.signed_in_as", DefaultText = "Signed in as" },
            new TextResource { Key = "header.login_different_user", DefaultText = "Log in as different user" },
            new TextResource { Key = "header.logout", DefaultText = "Log out" },
            new TextResource { Key = "screening.page.title", DefaultText = "Screening & Evaluation" },
            new TextResource { Key = "screening.tab.calls", DefaultText = "Call Logging" },
            new TextResource { Key = "screening.tab.evaluation", DefaultText = "Evaluation" },
            new TextResource { Key = "screening.tab.scheduling", DefaultText = "Scheduling" },
            new TextResource { Key = "evaluation.queue.title", DefaultText = "Evaluation Queue" },
            new TextResource { Key = "evaluation.queue.all", DefaultText = "All Queues" },
            new TextResource { Key = "evaluation.queue.alcohol", DefaultText = "Alcohol" },
            new TextResource { Key = "evaluation.queue.drugs", DefaultText = "Drugs" },
            new TextResource { Key = "evaluation.queue.gambling", DefaultText = "Gambling" },
            new TextResource { Key = "evaluation.queue.ladies", DefaultText = "Ladies" },
            new TextResource { Key = "evaluation.queue.general_query", DefaultText = "General Query" },
            new TextResource { Key = "evaluation.stats.pending", DefaultText = "Pending" },
            new TextResource { Key = "evaluation.stats.in_progress", DefaultText = "In Progress" },
            new TextResource { Key = "evaluation.stats.scheduled", DefaultText = "Scheduled" },
            new TextResource { Key = "evaluation.stats.completed", DefaultText = "Completed" },
            new TextResource { Key = "evaluation.table.surname", DefaultText = "Surname" },
            new TextResource { Key = "evaluation.table.name", DefaultText = "Name" },
            new TextResource { Key = "evaluation.table.phone", DefaultText = "Phone Number" },
            new TextResource { Key = "evaluation.table.queue", DefaultText = "Queue" },
            new TextResource { Key = "evaluation.table.unit", DefaultText = "Unit" },
            new TextResource { Key = "evaluation.table.source", DefaultText = "Source" },
            new TextResource { Key = "evaluation.table.last_call_date", DefaultText = "Last Call Date" },
            new TextResource { Key = "evaluation.table.num_calls", DefaultText = "Num Calls" },
            new TextResource { Key = "evaluation.table.status", DefaultText = "Status" },
            new TextResource { Key = "evaluation.table.action", DefaultText = "Action" },
            new TextResource { Key = "evaluation.action.view", DefaultText = "View" },
            new TextResource { Key = "evaluation.action.awaiting", DefaultText = "Awaiting" },
            new TextResource { Key = "evaluation.action.open", DefaultText = "Open Evaluation" },
            new TextResource { Key = "evaluation.action.start", DefaultText = "Start Screening" },
            new TextResource { Key = "evaluation.action.review", DefaultText = "Review Screening" },
            new TextResource { Key = "evaluation.modal.subtitle", DefaultText = "Phone Evaluation" },
            new TextResource { Key = "evaluation.loading.queue", DefaultText = "Loading evaluation queue..." },
            new TextResource { Key = "evaluation.empty.queue", DefaultText = "No evaluation candidates available." },
            new TextResource { Key = "evaluation.loading.form", DefaultText = "Loading evaluation form..." },
            new TextResource { Key = "evaluation.empty.form", DefaultText = "No evaluation form available." },
            new TextResource { Key = "evaluation.status.pending", DefaultText = "Pending" },
            new TextResource { Key = "evaluation.status.in_progress", DefaultText = "In Progress" },
            new TextResource { Key = "evaluation.status.scheduled", DefaultText = "Scheduled" },
            new TextResource { Key = "evaluation.status.completed", DefaultText = "Completed" },
            new TextResource { Key = "evaluation.status.awaiting", DefaultText = "Awaiting" },
            new TextResource { Key = "evaluation.status.entity_missing", DefaultText = "Awaiting Scheduling" },
            new TextResource { Key = "form.group.default", DefaultText = "Group" },
            new TextResource { Key = "form.select.placeholder", DefaultText = "Select..." },
            new TextResource { Key = "form.status.saving_progress", DefaultText = "Saving progress..." },
            new TextResource { Key = "form.status.progress_saved_on_blur", DefaultText = "Progress saves on field blur." },
            new TextResource { Key = "form.status.draft_saved", DefaultText = "Draft saved." },
            new TextResource { Key = "form.status.rejected", DefaultText = "Rejected." },
            new TextResource { Key = "form.status.submitted", DefaultText = "Submitted." },
            new TextResource { Key = "form.status.draft_saved_at", DefaultText = "Draft saved at {time}." },
            new TextResource { Key = "form.progress.label", DefaultText = "Progress" },
            new TextResource { Key = "form.progress.step", DefaultText = "Step {current} of {total}" },
            new TextResource { Key = "form.boolean.applies", DefaultText = "Applies" },
            new TextResource { Key = "form.boolean.not_applies", DefaultText = "Does not apply" },
            new TextResource { Key = "form.action.previous", DefaultText = "Previous" },
            new TextResource { Key = "form.action.next", DefaultText = "Next" },
            new TextResource { Key = "form.action.cancel", DefaultText = "Cancel" },
            new TextResource { Key = "form.action.save_draft", DefaultText = "Save Draft" },
            new TextResource { Key = "form.action.saving", DefaultText = "Saving..." },
            new TextResource { Key = "form.action.accept", DefaultText = "Accept" },
            new TextResource { Key = "form.action.accepting", DefaultText = "Accepting..." },
            new TextResource { Key = "form.action.reject", DefaultText = "Reject" },
            new TextResource { Key = "form.action.submit", DefaultText = "Submit" },
            new TextResource { Key = "form.action.submitting", DefaultText = "Submitting..." },
            new TextResource { Key = "toast.action.close", DefaultText = "Close" },
            new TextResource { Key = "form.error.save_progress", DefaultText = "Unable to save progress." },
            new TextResource { Key = "form.error.rejection_failed", DefaultText = "Rejection failed." },
            new TextResource { Key = "form.error.rejection_reason_required", DefaultText = "Rejection reason is required." },
            new TextResource { Key = "form.error.submission_failed", DefaultText = "Submission failed." },
            new TextResource { Key = "form.field.rejection_reason", DefaultText = "Reason for rejection" },
            new TextResource { Key = "form.field.rejection_reason_placeholder", DefaultText = "Enter the reason for rejection" },
            new TextResource { Key = "form.modal.reject.title", DefaultText = "Reject Assessment" },
            new TextResource { Key = "form.modal.reject.confirm", DefaultText = "Confirm Reject" },
            new TextResource { Key = "form.status.accepted", DefaultText = "Accepted." },
            new TextResource { Key = "form.validation.required", DefaultText = "This field is required." },
            new TextResource { Key = "form.validation.expected_type", DefaultText = "Expected {type}." },
            new TextResource { Key = "form.validation.expected_boolean", DefaultText = "Expected boolean." },
            new TextResource { Key = "form.validation.expected_integer", DefaultText = "Expected integer." },
            new TextResource { Key = "form.validation.expected_number", DefaultText = "Expected number." },
            new TextResource { Key = "form.validation.expected_option_list", DefaultText = "Expected a list of option codes." },
            new TextResource { Key = "form.validation.min_length", DefaultText = "Minimum length is {value}." },
            new TextResource { Key = "form.validation.max_length", DefaultText = "Maximum length is {value}." },
            new TextResource { Key = "form.validation.pattern", DefaultText = "Value does not match required format." },
            new TextResource { Key = "form.validation.invalid_format", DefaultText = "Invalid {format} format." },
            new TextResource { Key = "form.validation.min_value", DefaultText = "Minimum value is {value}." },
            new TextResource { Key = "form.validation.max_value", DefaultText = "Maximum value is {value}." },
            new TextResource { Key = "form.validation.invalid_option", DefaultText = "Invalid option value." },
            new TextResource { Key = "form.validation.invalid_option_list", DefaultText = "One or more options are invalid." },
            new TextResource { Key = "Intake and Administrative Identity", DefaultText = "Intake and Administrative Identity" },
            new TextResource { Key = "Consent and Confidentiality", DefaultText = "Consent and Confidentiality" },
            new TextResource { Key = "Substance and Treatment History", DefaultText = "Substance and Treatment History" },
            new TextResource { Key = "Physical Health", DefaultText = "Physical Health" },
            new TextResource { Key = "Mental Health", DefaultText = "Mental Health" },
            new TextResource { Key = "Assessor Actions Required", DefaultText = "Assessor Actions Required" },
            new TextResource { Key = "Service User Name", DefaultText = "Service User Name" },
            new TextResource { Key = "First Name", DefaultText = "First Name" },
            new TextResource { Key = "Surname", DefaultText = "Surname" },
            new TextResource { Key = "Date of Birth", DefaultText = "Date of Birth" },
            new TextResource { Key = "Phone Number", DefaultText = "Phone Number" },
            new TextResource { Key = "Email Address", DefaultText = "Email Address" },
            new TextResource { Key = "GP Name", DefaultText = "GP Name" },
            new TextResource { Key = "Medical Card", DefaultText = "Medical Card Held" },
            new TextResource { Key = "Comprehensive Assessment Completed", DefaultText = "Comprehensive Assessment Completed" },
            new TextResource { Key = "Assessment Completion Date", DefaultText = "Assessment Completion Date" },
            new TextResource { Key = "Consent to Shared Mental Health Record", DefaultText = "Consent Given to Share the Mental Health Record" },
            new TextResource { Key = "Source of Referral", DefaultText = "Source of Referral" },
            new TextResource { Key = "Ever Treated for Substance Use", DefaultText = "Previously Treated for Substance Use" },
            new TextResource { Key = "Ever Treated for Alcohol", DefaultText = "Previously Treated for Alcohol Use" },
            new TextResource { Key = "Total Number of Previous Treatments", DefaultText = "Total Number of Previous Treatments" },
            new TextResource { Key = "Age First Treated", DefaultText = "Age First Treated" },
            new TextResource { Key = "Name of Treatment Provider(s)", DefaultText = "Name of Treatment Provider(s)" },
            new TextResource { Key = "Reason for Leaving", DefaultText = "Reason for Leaving" },
            new TextResource { Key = "Longest Time Abstinent", DefaultText = "Longest Time Abstinent" },
            new TextResource { Key = "Current Opiate Agonist Treatment", DefaultText = "Currently Receiving Opiate Agonist Treatment" },
            new TextResource { Key = "Other Current Treatment / Prescribed Medications", DefaultText = "Currently Taking Other Treatment or Prescribed Medication" },
            new TextResource { Key = "Concerns About Physical Health", DefaultText = "Physical Health Concerns Identified" },
            new TextResource { Key = "Known Allergies", DefaultText = "Known Allergies (More Info)" },
            new TextResource { Key = "History of Head Injury", DefaultText = "History of Head Injury" },
            new TextResource { Key = "Last GP Check-Up", DefaultText = "Last GP Check-Up" },
            new TextResource { Key = "Relevant Medical History", DefaultText = "Relevant Medical History" },
            new TextResource { Key = "Current Medications", DefaultText = "Current Medications" },
            new TextResource { Key = "History of Seizures", DefaultText = "History of Seizures" },
            new TextResource { Key = "Concerns About Mental Health", DefaultText = "Mental Health Concerns Identified" },
            new TextResource { Key = "Seen or Seeing a Mental Health Professional", DefaultText = "Seen or Seeing a Mental Health Professional (More Info)" },
            new TextResource { Key = "History of Psychiatric Care", DefaultText = "History of Psychiatric Care" },
            new TextResource { Key = "History of Self Harm or Suicidal Thoughts", DefaultText = "History of Self-Harm or Suicidal Thoughts" },
            new TextResource { Key = "Mood Over the Last Month", DefaultText = "Mood Over the Last Month" },
            new TextResource { Key = "Mental Health Details", DefaultText = "Mental Health Details" },
            new TextResource { Key = "Comprehensive Assessment Needed", DefaultText = "Comprehensive Assessment Needed" },
            new TextResource { Key = "Comprehensive Assessment Arranged", DefaultText = "Comprehensive Assessment Arranged" },
            new TextResource { Key = "Additional Comments Details", DefaultText = "Additional Comments Details" },
            new TextResource { Key = "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json", DefaultText = "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json" },
            new TextResource { Key = "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json", DefaultText = "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json" },
            new TextResource { Key = "HSE library source: Intake and admin identity / AF Printed Page 6.html / json", DefaultText = "HSE library source: Intake and admin identity / AF Printed Page 6.html / json" },
            new TextResource { Key = "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json", DefaultText = "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json" },
            new TextResource { Key = "HSE library source: Physical health / AF Printed Page 12.html / json", DefaultText = "HSE library source: Physical health / AF Printed Page 12.html / json" },
            new TextResource { Key = "HSE library source: Mental health / AF Printed Page 13.html / json", DefaultText = "HSE library source: Mental health / AF Printed Page 13.html / json" },
            new TextResource { Key = "HSE library source: Assessor actions required / AF Printed Page 15.html / json", DefaultText = "HSE library source: Assessor actions required / AF Printed Page 15.html / json" },
            new TextResource { Key = "GP", DefaultText = "GP" },
            new TextResource { Key = "Family", DefaultText = "Family" },
            new TextResource { Key = "Self", DefaultText = "Self" },
            new TextResource { Key = "Other", DefaultText = "Other" },
            new TextResource { Key = "Very low", DefaultText = "Very low" },
            new TextResource { Key = "Low", DefaultText = "Low" },
            new TextResource { Key = "Reasonable", DefaultText = "Reasonable" },
            new TextResource { Key = "Good", DefaultText = "Good" });

        modelBuilder.Entity<TextTranslation>().HasData(
            new TextTranslation { Id = TrScreeningFormTitleEn, Key = "screening.form.alcohol_screening_call.title", Locale = "en-IE", Text = "Alcohol Screening Call" },
            new TextTranslation { Id = TrScreeningFormTitleGa, Key = "screening.form.alcohol_screening_call.title", Locale = "ga-IE", Text = "Scagadh Glao Alcóil" },
            new TextTranslation { Id = TrScreeningFormDescriptionEn, Key = "screening.form.alcohol_screening_call.description", Locale = "en-IE", Text = "Capture first-call screening details." },
            new TextTranslation { Id = TrScreeningFormDescriptionGa, Key = "screening.form.alcohol_screening_call.description", Locale = "ga-IE", Text = "Gabh sonraí scagtha ón gcéad ghlao." },
            new TextTranslation { Id = TrCallerDetailsEn, Key = "screening.section.caller_details", Locale = "en-IE", Text = "Caller Details" },
            new TextTranslation { Id = TrCallerDetailsGa, Key = "screening.section.caller_details", Locale = "ga-IE", Text = "Sonraí an Ghlaoiteora" },
            new TextTranslation { Id = TrAlcoholUseEn, Key = "screening.section.alcohol_use", Locale = "en-IE", Text = "Alcohol Use" },
            new TextTranslation { Id = TrAlcoholUseGa, Key = "screening.section.alcohol_use", Locale = "ga-IE", Text = "Úsáid Alcóil" },
            new TextTranslation { Id = TrCallerNameLabelEn, Key = "screening.field.caller_name.label", Locale = "en-IE", Text = "Caller Name" },
            new TextTranslation { Id = TrCallerNameLabelGa, Key = "screening.field.caller_name.label", Locale = "ga-IE", Text = "Ainm an Ghlaoiteora" },
            new TextTranslation { Id = TrAgeLabelEn, Key = "screening.field.age.label", Locale = "en-IE", Text = "Age" },
            new TextTranslation { Id = TrAgeLabelGa, Key = "screening.field.age.label", Locale = "ga-IE", Text = "Aois" },
            new TextTranslation { Id = TrDrinksPerDayLabelEn, Key = "screening.field.drinks_per_day.label", Locale = "en-IE", Text = "Drinks Per Day" },
            new TextTranslation { Id = TrDrinksPerDayLabelGa, Key = "screening.field.drinks_per_day.label", Locale = "ga-IE", Text = "Deochanna sa Lá" },
            new TextTranslation { Id = Guid.Parse("1035cb17-ebaa-4856-b3dd-1c9f91ba69d0"), Key = "screening.field.drinks_per_day.help", Locale = "en-IE", Text = "Approximate average on drinking days. Select the unit used for this quantity." },
            new TextTranslation { Id = Guid.Parse("55f4cbcf-81ef-4f9b-836a-88ca2b85b33e"), Key = "screening.field.drinks_per_day.help", Locale = "ga-IE", Text = "Meán garbh ar laethanta óil. Roghnaigh an t-aonad a úsáideadh don chainníocht seo." },
            new TextTranslation { Id = Guid.Parse("97b5d82c-8238-45cb-ab63-a2dc560d0aad"), Key = "screening.field.drinks_per_day_unit.label", Locale = "en-IE", Text = "Drink Unit" },
            new TextTranslation { Id = Guid.Parse("0bec25c1-749d-4edf-9ba1-bc95176206c1"), Key = "screening.field.drinks_per_day_unit.label", Locale = "ga-IE", Text = "Aonad Dí" },
            new TextTranslation { Id = Guid.Parse("2ee869f2-6efd-421a-b956-8836a99cb1d5"), Key = "screening.field.drinks_per_day_unit.help", Locale = "en-IE", Text = "Record whether the quantity is in pints, litres or bottles." },
            new TextTranslation { Id = Guid.Parse("3bc4532a-c13a-4d14-a184-68fc3707eec4"), Key = "screening.field.drinks_per_day_unit.help", Locale = "ga-IE", Text = "Taifead an bhfuil an chainníocht i bpiontaí, i lítear nó i mbuidéil." },
            new TextTranslation { Id = TrWithdrawalHistoryLabelEn, Key = "screening.field.withdrawal_history.label", Locale = "en-IE", Text = "Has withdrawal history?" },
            new TextTranslation { Id = TrWithdrawalHistoryLabelGa, Key = "screening.field.withdrawal_history.label", Locale = "ga-IE", Text = "Stair Aistarraingthe" },
            new TextTranslation { Id = TrReferralSourceLabelEn, Key = "screening.field.referral_source.label", Locale = "en-IE", Text = "Referral Source" },
            new TextTranslation { Id = TrReferralSourceLabelGa, Key = "screening.field.referral_source.label", Locale = "ga-IE", Text = "Foinse Atreoraithe" },
            new TextTranslation { Id = TrReferralGpEn, Key = "screening.options.referral_source.gp", Locale = "en-IE", Text = "GP" },
            new TextTranslation { Id = TrReferralGpGa, Key = "screening.options.referral_source.gp", Locale = "ga-IE", Text = "Dochtúir Teaghlaigh" },
            new TextTranslation { Id = TrReferralFamilyEn, Key = "screening.options.referral_source.family", Locale = "en-IE", Text = "Family" },
            new TextTranslation { Id = TrReferralFamilyGa, Key = "screening.options.referral_source.family", Locale = "ga-IE", Text = "Teaghlach" },
            new TextTranslation { Id = TrReferralSelfEn, Key = "screening.options.referral_source.self", Locale = "en-IE", Text = "Self" },
            new TextTranslation { Id = TrReferralSelfGa, Key = "screening.options.referral_source.self", Locale = "ga-IE", Text = "Féin" },
            new TextTranslation { Id = TrReferralOtherEn, Key = "screening.options.referral_source.other", Locale = "en-IE", Text = "Other" },
            new TextTranslation { Id = TrReferralOtherGa, Key = "screening.options.referral_source.other", Locale = "ga-IE", Text = "Eile" },
            new TextTranslation { Id = TrAppBrandEn, Key = "app.brand", Locale = "en-IE", Text = "Acutis" },
            new TextTranslation { Id = TrAppBrandGa, Key = "app.brand", Locale = "ga-IE", Text = "Acutis" },
            new TextTranslation { Id = TrAppCentreBrureeEn, Key = "app.centre.bruree", Locale = "en-IE", Text = "Bruree Treatment Center" },
            new TextTranslation { Id = TrAppCentreBrureeGa, Key = "app.centre.bruree", Locale = "ga-IE", Text = "Ionad Cóireála Brú Rí" },
            new TextTranslation { Id = TrHeaderCapacityEn, Key = "header.capacity", Locale = "en-IE", Text = "Capacity" },
            new TextTranslation { Id = TrHeaderCapacityGa, Key = "header.capacity", Locale = "ga-IE", Text = "Acmhainn" },
            new TextTranslation { Id = TrHeaderCurrentTimeEn, Key = "header.current_time", Locale = "en-IE", Text = "Current Time" },
            new TextTranslation { Id = TrHeaderCurrentTimeGa, Key = "header.current_time", Locale = "ga-IE", Text = "Am Reatha" },
            new TextTranslation { Id = TrHeaderSignedInAsEn, Key = "header.signed_in_as", Locale = "en-IE", Text = "Signed in as" },
            new TextTranslation { Id = TrHeaderSignedInAsGa, Key = "header.signed_in_as", Locale = "ga-IE", Text = "Logáilte isteach mar" },
            new TextTranslation { Id = TrHeaderLoginDifferentEn, Key = "header.login_different_user", Locale = "en-IE", Text = "Log in as different user" },
            new TextTranslation { Id = TrHeaderLoginDifferentGa, Key = "header.login_different_user", Locale = "ga-IE", Text = "Logáil isteach mar úsáideoir eile" },
            new TextTranslation { Id = TrHeaderLogoutEn, Key = "header.logout", Locale = "en-IE", Text = "Log out" },
            new TextTranslation { Id = TrHeaderLogoutGa, Key = "header.logout", Locale = "ga-IE", Text = "Logáil amach" },
            new TextTranslation { Id = TrScreeningTabCallsEn, Key = "screening.tab.calls", Locale = "en-IE", Text = "Call Logging" },
            new TextTranslation { Id = TrScreeningTabCallsGa, Key = "screening.tab.calls", Locale = "ga-IE", Text = "Logáil Glaonna" },
            new TextTranslation { Id = TrScreeningTabEvaluationEn, Key = "screening.tab.evaluation", Locale = "en-IE", Text = "Evaluation" },
            new TextTranslation { Id = TrScreeningTabEvaluationGa, Key = "screening.tab.evaluation", Locale = "ga-IE", Text = "Meastóireacht" },
            new TextTranslation { Id = TrScreeningTabSchedulingEn, Key = "screening.tab.scheduling", Locale = "en-IE", Text = "Scheduling" },
            new TextTranslation { Id = TrScreeningTabSchedulingGa, Key = "screening.tab.scheduling", Locale = "ga-IE", Text = "Sceidealú" },
            new TextTranslation { Id = Guid.Parse("4269e3d4-d0aa-4b0c-858a-044de3b2c5f1"), Key = "evaluation.table.source", Locale = "en-IE", Text = "Source" },
            new TextTranslation { Id = Guid.Parse("8cc436ab-cc73-44aa-b3b6-b4cfb48bce1b"), Key = "evaluation.table.source", Locale = "ga-IE", Text = "Foinse" },
            new TextTranslation { Id = Guid.Parse("9e0ddd4f-3339-46e1-8ab8-d485be7fca8d"), Key = "screening.field.currently_unsafe.label", Locale = "en-IE", Text = "Is immediate concern?" },
            new TextTranslation { Id = Guid.Parse("66f4f9bf-1f15-4c9f-a59f-317b0b7c4f19"), Key = "screening.field.history_of_seizures.label", Locale = "en-IE", Text = "Has seizure history?" },
            new TextTranslation { Id = Guid.Parse("9f306145-c17e-4234-ae46-aaf8e22c6205"), Key = "screening.field.drink_type.label", Locale = "en-IE", Text = "Drink Type" },
            new TextTranslation { Id = Guid.Parse("53f00dd8-5fc4-45f5-afeb-21d68eeb4228"), Key = "screening.field.drink_type_other.label", Locale = "en-IE", Text = "If other, specify drink type" },
            new TextTranslation { Id = Guid.Parse("59229ca1-a056-4f56-b6f4-c72ef1906e63"), Key = "screening.options.drink_type.beer", Locale = "en-IE", Text = "Beer" },
            new TextTranslation { Id = Guid.Parse("886f313a-d179-4f6d-a1c6-d00de9cb1521"), Key = "screening.options.drink_type.wine", Locale = "en-IE", Text = "Wine" },
            new TextTranslation { Id = Guid.Parse("bf9ac4ba-c73e-45f4-af54-b0e56f5addfe"), Key = "screening.options.drink_type.spirits", Locale = "en-IE", Text = "Spirits" },
            new TextTranslation { Id = Guid.Parse("ea12f2ff-b9de-4f6d-a237-3f68f812283b"), Key = "screening.options.drink_type.cider", Locale = "en-IE", Text = "Cider" },
            new TextTranslation { Id = Guid.Parse("7694c676-287f-4509-969e-c8de65c89a0d"), Key = "screening.options.drink_type.other", Locale = "en-IE", Text = "Other" },
            new TextTranslation { Id = Guid.Parse("901beca6-df0d-4e43-b7b4-d5b7e6eb9d7a"), Key = "screening.options.drink_measure_unit.pints", Locale = "en-IE", Text = "Pints" },
            new TextTranslation { Id = Guid.Parse("90442b48-cf66-4736-b8ca-297ec7757627"), Key = "screening.options.drink_measure_unit.litres", Locale = "en-IE", Text = "Litres" },
            new TextTranslation { Id = Guid.Parse("f47ee5fd-986d-4201-bd12-6337ec372cae"), Key = "screening.options.drink_measure_unit.bottles", Locale = "en-IE", Text = "Bottles" },
            new TextTranslation { Id = Guid.Parse("558d984c-a398-45b4-8782-d8921a7ea3c7"), Key = "screening.options.drink_measure_unit.pints", Locale = "ga-IE", Text = "Piontaí" },
            new TextTranslation { Id = Guid.Parse("72357518-4d77-49e6-802a-4c5dc11e9547"), Key = "screening.options.drink_measure_unit.litres", Locale = "ga-IE", Text = "Lítear" },
            new TextTranslation { Id = Guid.Parse("0b63ed08-b49d-4381-a918-a5b7a208ed1a"), Key = "screening.options.drink_measure_unit.bottles", Locale = "ga-IE", Text = "Buidéil" },
            new TextTranslation { Id = Guid.Parse("48eabf4d-5e05-48ef-a2b5-d0e6fe78fe0f"), Key = "screening.options.housing_status.stable", Locale = "en-IE", Text = "Stable Accommodation" },
            new TextTranslation { Id = Guid.Parse("4e9dc7d2-99fe-4e1d-9ba3-5f3d8b00d121"), Key = "screening.options.housing_status.temporary", Locale = "en-IE", Text = "Temporary Accommodation" },
            new TextTranslation { Id = Guid.Parse("3c750a0f-7db5-4d1b-b0d7-f53d4ce5d426"), Key = "screening.options.housing_status.homeless", Locale = "en-IE", Text = "Homeless" },
            new TextTranslation { Id = Guid.Parse("2e639d62-1f38-48f8-abaf-28baf60c31fd"), Key = "screening.options.housing_status.supported", Locale = "en-IE", Text = "Supported Accommodation" },
            new TextTranslation { Id = Guid.Parse("d72a6db0-2378-46ca-b7da-bcd08464f61a"), Key = "screening.options.housing_status.other", Locale = "en-IE", Text = "Other" },
            new TextTranslation { Id = Guid.Parse("46d87e14-f05d-49d2-bf58-c1df236704b8"), Key = "screening.options.housing_status.stable", Locale = "ga-IE", Text = "Cóiríocht Chobhsaí" },
            new TextTranslation { Id = Guid.Parse("e7d8d088-d5fd-4680-8dd4-b92f1423014a"), Key = "screening.options.housing_status.temporary", Locale = "ga-IE", Text = "Cóiríocht Shealadach" },
            new TextTranslation { Id = Guid.Parse("632d6f38-31bb-4ad8-9cca-260f13fe4219"), Key = "screening.options.housing_status.homeless", Locale = "ga-IE", Text = "Gan Dídean" },
            new TextTranslation { Id = Guid.Parse("45c3b5fd-66dd-45ee-acf1-5d1bc3bb1d8f"), Key = "screening.options.housing_status.supported", Locale = "ga-IE", Text = "Cóiríocht Thacaithe" },
            new TextTranslation { Id = Guid.Parse("b170fe66-550e-4d77-9de9-c67bdde23357"), Key = "screening.options.housing_status.other", Locale = "ga-IE", Text = "Eile" },
            new TextTranslation { Id = Guid.Parse("fd0a7865-43f1-4cc3-b57f-4c4b5ca47c57"), Key = "app.brand", Locale = "ar", Text = "Acutis" },
            new TextTranslation { Id = Guid.Parse("b3f0a417-2cf8-4b91-806f-e6f42c9d9f19"), Key = "app.centre.bruree", Locale = "ar", Text = "Bruree Treatment Center" },
            new TextTranslation { Id = Guid.Parse("c2de6b57-2080-4b71-9f6b-50f2a23a66f7"), Key = "header.capacity", Locale = "ar", Text = "Capacity" },
            new TextTranslation { Id = Guid.Parse("f3ed034f-87d6-4734-af96-2f7778e4cafa"), Key = "header.current_time", Locale = "ar", Text = "Current Time" },
            new TextTranslation { Id = Guid.Parse("1a19939b-9f4c-4783-b43b-86a4d8c4dbd9"), Key = "header.signed_in_as", Locale = "ar", Text = "Signed in as" },
            new TextTranslation { Id = Guid.Parse("20ef3681-0b10-4526-8919-f3f18c1a0b43"), Key = "header.login_different_user", Locale = "ar", Text = "Log in as different user" },
            new TextTranslation { Id = Guid.Parse("272a7260-95ef-4d73-b656-cc48d72e09c2"), Key = "header.logout", Locale = "ar", Text = "Log out" },
            new TextTranslation { Id = Guid.Parse("ff5fa5b9-f580-45c9-8ef3-019c95c0a63f"), Key = "screening.tab.calls", Locale = "ar", Text = "تسجيل المكالمات" },
            new TextTranslation { Id = Guid.Parse("d7d6a30a-5947-4a66-b34a-23b9a06ca95f"), Key = "screening.tab.evaluation", Locale = "ar", Text = "التقييم" },
            new TextTranslation { Id = Guid.Parse("9713a4d9-8d94-47d8-9f90-4e5af6847e11"), Key = "screening.tab.scheduling", Locale = "ar", Text = "الجدولة" },
            new TextTranslation { Id = Guid.Parse("a0c33630-5d24-4cb8-af88-b66bf166fdd0"), Key = "screening.form.alcohol_screening_call.title", Locale = "ar", Text = "مكالمة فحص تعاطي الكحول" },
            new TextTranslation { Id = Guid.Parse("f3a4f595-f595-4fe8-a8e3-d8fc553bc5fc"), Key = "screening.section.caller_details", Locale = "ar", Text = "بيانات المتصل" },
            new TextTranslation { Id = Guid.Parse("df2b06f6-a231-41ab-bf5f-4f4fabce11d3"), Key = "screening.section.alcohol_use", Locale = "ar", Text = "استخدام الكحول" },
            new TextTranslation { Id = Guid.Parse("dd0715dc-5164-4699-b0a0-6a8b0a55fceb"), Key = "screening.section.stability", Locale = "ar", Text = "الاستقرار والسلامة" },
            new TextTranslation { Id = Guid.Parse("bc8fd9b5-b638-4564-b0df-b839ca9dcde5"), Key = "screening.section.follow_up", Locale = "ar", Text = "ملاحظات المتابعة" },
            new TextTranslation { Id = Guid.Parse("46648eca-e4fd-4f91-95c1-21f4419df2c6"), Key = "screening.field.drink_type.label", Locale = "ar", Text = "نوع المشروب" },
            new TextTranslation { Id = Guid.Parse("cb8f1cb3-f093-4f42-b867-48c26127fcdd"), Key = "screening.field.drink_type_other.label", Locale = "ar", Text = "إذا كان غير ذلك، حدده" },
            new TextTranslation { Id = Guid.Parse("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"), Key = "screening.field.drinks_per_day.label", Locale = "ar", Text = "عدد المشروبات يوميا" },
            new TextTranslation { Id = Guid.Parse("0220c221-3807-4d17-9894-9f7404824de4"), Key = "screening.field.drinks_per_day.help", Locale = "ar", Text = "المتوسط التقريبي في أيام الشرب. اختر الوحدة المستخدمة لهذه الكمية." },
            new TextTranslation { Id = Guid.Parse("7fcf3345-9d76-4f40-a13c-5590ae74d0ec"), Key = "screening.field.drinks_per_day_unit.label", Locale = "ar", Text = "وحدة المشروب" },
            new TextTranslation { Id = Guid.Parse("9de7ce65-d77d-426f-ab43-519c6ec5f180"), Key = "screening.field.drinks_per_day_unit.help", Locale = "ar", Text = "سجل ما إذا كانت الكمية بالباينت أو اللترات أو الزجاجات." },
            new TextTranslation { Id = Guid.Parse("1e7f1d6c-bdb5-4e89-90e2-970336aeb586"), Key = "screening.field.withdrawal_history.label", Locale = "ar", Text = "هل لديه تاريخ أعراض انسحاب؟" },
            new TextTranslation { Id = Guid.Parse("e9abb6e3-58b1-4171-85dc-0fec30ff6a2c"), Key = "screening.field.history_of_seizures.label", Locale = "ar", Text = "هل لديه تاريخ نوبات صرع؟" },
            new TextTranslation { Id = Guid.Parse("2f88fd06-b8bd-4d8c-b744-0c0591f45a99"), Key = "screening.field.currently_unsafe.label", Locale = "ar", Text = "هل توجد خطورة فورية؟" },
            new TextTranslation { Id = Guid.Parse("28c66812-cc83-4456-bb50-2ef5ded6e48e"), Key = "screening.options.drink_measure_unit.pints", Locale = "ar", Text = "باينت" },
            new TextTranslation { Id = Guid.Parse("a7dc7a55-80e6-4a14-8b06-1f1ea99e2f0f"), Key = "screening.options.drink_measure_unit.litres", Locale = "ar", Text = "لترات" },
            new TextTranslation { Id = Guid.Parse("484d26d9-f2ea-42dc-85db-1f6762f67288"), Key = "screening.options.drink_measure_unit.bottles", Locale = "ar", Text = "زجاجات" },
            new TextTranslation { Id = Guid.Parse("9472301b-33f4-40f0-8238-e597553fb2e9"), Key = "screening.options.housing_status.stable", Locale = "ar", Text = "سكن مستقر" },
            new TextTranslation { Id = Guid.Parse("3c9bf986-b9e7-47bb-a907-991b89b09e20"), Key = "screening.options.housing_status.temporary", Locale = "ar", Text = "سكن مؤقت" },
            new TextTranslation { Id = Guid.Parse("94cc584c-e4c3-4269-b477-5aa98768bb12"), Key = "screening.options.housing_status.homeless", Locale = "ar", Text = "بلا مأوى" },
            new TextTranslation { Id = Guid.Parse("23fc56e2-c146-4bc9-b214-c9c30cf18f01"), Key = "screening.options.housing_status.supported", Locale = "ar", Text = "سكن مدعوم" },
            new TextTranslation { Id = Guid.Parse("9a865c81-0bb6-4d54-9240-7376ea28a90a"), Key = "screening.options.housing_status.other", Locale = "ar", Text = "أخرى" },
            new TextTranslation { Id = Guid.Parse("b0a3d81e-584f-4756-a727-b2e93b430590"), Key = "screening.page.title", Locale = "ar", Text = "الفحص والتقييم" },
            new TextTranslation { Id = Guid.Parse("3b977d28-f3d9-4766-8ffb-573df38cbeb4"), Key = "evaluation.queue.title", Locale = "ar", Text = "قائمة التقييم" },
            new TextTranslation { Id = Guid.Parse("a4823b67-4145-48ca-8dcb-987e931e478a"), Key = "evaluation.queue.all", Locale = "ar", Text = "كل القوائم" },
            new TextTranslation { Id = Guid.Parse("400ca48a-cb25-4170-a286-fd7ab1684989"), Key = "evaluation.queue.alcohol", Locale = "ar", Text = "الكحول" },
            new TextTranslation { Id = Guid.Parse("db2c6ce7-bc37-4af4-9a68-5081ea4ea807"), Key = "evaluation.queue.drugs", Locale = "ar", Text = "المخدرات" },
            new TextTranslation { Id = Guid.Parse("d886900e-b6b6-42aa-b018-2022044770df"), Key = "evaluation.queue.gambling", Locale = "ar", Text = "القمار" },
            new TextTranslation { Id = Guid.Parse("00fd3cde-ac1b-483c-b742-e5781688b9d4"), Key = "evaluation.queue.ladies", Locale = "ar", Text = "السيدات" },
            new TextTranslation { Id = Guid.Parse("02269162-87e9-4952-b2df-5575dbe2fa90"), Key = "evaluation.queue.general_query", Locale = "ar", Text = "الاستفسارات العامة" },
            new TextTranslation { Id = Guid.Parse("1c25f5e8-cc6d-4ae2-8475-b4591bce426c"), Key = "evaluation.stats.pending", Locale = "ar", Text = "قيد الانتظار" },
            new TextTranslation { Id = Guid.Parse("887273d1-9f36-4af0-b8c8-20006830b54d"), Key = "evaluation.stats.in_progress", Locale = "ar", Text = "قيد التنفيذ" },
            new TextTranslation { Id = Guid.Parse("95f3a857-7c59-4eef-a6ca-8e1ca02610e2"), Key = "evaluation.stats.scheduled", Locale = "ar", Text = "مجدول" },
            new TextTranslation { Id = Guid.Parse("4556f72e-ebce-4a18-b61d-fd614b43f78f"), Key = "evaluation.stats.completed", Locale = "ar", Text = "مكتمل" },
            new TextTranslation { Id = Guid.Parse("61685d4e-6ef8-4477-95f5-77ff4ab690d4"), Key = "evaluation.table.surname", Locale = "ar", Text = "اللقب" },
            new TextTranslation { Id = Guid.Parse("f58fca32-e6d6-4ea1-a81e-c52ca3108e04"), Key = "evaluation.table.name", Locale = "ar", Text = "الاسم" },
            new TextTranslation { Id = Guid.Parse("7ef25e4d-3fbf-4afe-96bb-9e55ea97894d"), Key = "evaluation.table.phone", Locale = "ar", Text = "رقم الهاتف" },
            new TextTranslation { Id = Guid.Parse("51451a8c-29c6-4d77-a3fd-01f5a7696ae7"), Key = "evaluation.table.queue", Locale = "ar", Text = "القائمة" },
            new TextTranslation { Id = Guid.Parse("86ef317b-1afd-4714-a620-6f81d174ec0a"), Key = "evaluation.table.unit", Locale = "ar", Text = "الوحدة" },
            new TextTranslation { Id = Guid.Parse("c719b3eb-1df5-43fc-b65f-2a1c4fbf2df8"), Key = "evaluation.table.source", Locale = "ar", Text = "المصدر" },
            new TextTranslation { Id = Guid.Parse("5701e3ea-fec4-4f5c-ab4a-f75c1e23a334"), Key = "evaluation.table.last_call_date", Locale = "ar", Text = "تاريخ آخر مكالمة" },
            new TextTranslation { Id = Guid.Parse("6ad7f2dd-0c03-4bb8-a398-f00f80518f95"), Key = "evaluation.table.num_calls", Locale = "ar", Text = "عدد المكالمات" },
            new TextTranslation { Id = Guid.Parse("a2f1f7ee-f45c-4ca9-a233-ce6197f09d48"), Key = "evaluation.table.status", Locale = "ar", Text = "الحالة" },
            new TextTranslation { Id = Guid.Parse("c2727290-34ec-4a5d-9c78-cfca7191d2de"), Key = "evaluation.table.action", Locale = "ar", Text = "إجراء" },
            new TextTranslation { Id = Guid.Parse("cc93ab8e-7c97-46c5-8ee4-e85ce391f3ff"), Key = "evaluation.action.view", Locale = "ar", Text = "عرض" },
            new TextTranslation { Id = Guid.Parse("5e89bcfb-bc40-4139-a36e-893b4534805f"), Key = "evaluation.action.awaiting", Locale = "ar", Text = "بانتظار" },
            new TextTranslation { Id = Guid.Parse("fc698803-34b1-4f59-a0c1-7c1c2bfec276"), Key = "evaluation.action.open", Locale = "ar", Text = "فتح التقييم" },
            new TextTranslation { Id = Guid.Parse("a1e1e245-82d6-46c9-af3c-f685ec5bc93f"), Key = "evaluation.action.start", Locale = "ar", Text = "بدء الفحص" },
            new TextTranslation { Id = Guid.Parse("66758eea-e1f4-472b-a762-e251f310f3e4"), Key = "evaluation.action.review", Locale = "ar", Text = "مراجعة الفحص" },
            new TextTranslation { Id = Guid.Parse("cd374ce7-c9be-40ac-a8de-157e1f5ef8a6"), Key = "evaluation.modal.subtitle", Locale = "ar", Text = "تقييم هاتفي" },
            new TextTranslation { Id = Guid.Parse("697d0e4f-4fd8-4978-aebd-f19a5fbd7d2f"), Key = "evaluation.loading.queue", Locale = "ar", Text = "جار تحميل قائمة التقييم..." },
            new TextTranslation { Id = Guid.Parse("3194c14a-e73f-4fbe-8f3f-5b17445bd128"), Key = "evaluation.empty.queue", Locale = "ar", Text = "لا توجد حالات تقييم متاحة." },
            new TextTranslation { Id = Guid.Parse("fd2bf3bf-8c66-4422-b965-c8ca1f4f74d8"), Key = "evaluation.loading.form", Locale = "ar", Text = "جار تحميل نموذج التقييم..." },
            new TextTranslation { Id = Guid.Parse("f022f542-c0af-4339-a85a-f1c840b4ac4a"), Key = "evaluation.empty.form", Locale = "ar", Text = "لا يوجد نموذج تقييم متاح." },
            new TextTranslation { Id = Guid.Parse("060098f3-091e-426c-a6a7-4d2bffb09ff8"), Key = "evaluation.status.pending", Locale = "ar", Text = "قيد الانتظار" },
            new TextTranslation { Id = Guid.Parse("f66d9b1d-3871-4cd2-b15e-e100db7c9b3f"), Key = "evaluation.status.in_progress", Locale = "ar", Text = "قيد التنفيذ" },
            new TextTranslation { Id = Guid.Parse("dbbd3650-7578-48eb-8ff1-850f4494de2c"), Key = "evaluation.status.scheduled", Locale = "ar", Text = "مجدول" },
            new TextTranslation { Id = Guid.Parse("7f1f55d9-6d09-4075-9d6b-c54c14490515"), Key = "evaluation.status.completed", Locale = "ar", Text = "مكتمل" },
            new TextTranslation { Id = Guid.Parse("dc5b7061-a7e2-4422-a5c4-0c4949c363fe"), Key = "evaluation.status.awaiting", Locale = "ar", Text = "بانتظار" },
            new TextTranslation { Id = Guid.Parse("2c5919be-4289-4727-9845-8d94b404bf0f"), Key = "evaluation.status.entity_missing", Locale = "ar", Text = "بانتظار الجدولة" },
            new TextTranslation { Id = Guid.Parse("6b4561f1-fd40-487f-9e59-f0e0e7f65fd0"), Key = "form.group.default", Locale = "ar", Text = "مجموعة" },
            new TextTranslation { Id = Guid.Parse("5fef526c-0f52-4bc2-91ba-5933ef0c8397"), Key = "form.select.placeholder", Locale = "ar", Text = "اختر..." },
            new TextTranslation { Id = Guid.Parse("a388e4e0-1d7a-4359-adf7-9d60715b27df"), Key = "form.status.saving_progress", Locale = "ar", Text = "جار حفظ التقدم..." },
            new TextTranslation { Id = Guid.Parse("60410c00-c9ab-4c75-8c16-a38fe2c9112d"), Key = "form.status.progress_saved_on_blur", Locale = "ar", Text = "يتم حفظ التقدم عند مغادرة الحقل." },
            new TextTranslation { Id = Guid.Parse("d3fc7953-cbe0-41f8-9f15-948ad1d21f3c"), Key = "form.status.draft_saved", Locale = "ar", Text = "تم حفظ المسودة." },
            new TextTranslation { Id = Guid.Parse("26b6854b-f11f-49bb-9f3e-f535fdbf62a0"), Key = "form.status.rejected", Locale = "ar", Text = "تم الرفض." },
            new TextTranslation { Id = Guid.Parse("2adf4542-ab8f-431e-8c9c-12328b3baf24"), Key = "form.status.submitted", Locale = "ar", Text = "تم الإرسال." },
            new TextTranslation { Id = Guid.Parse("97f4810f-1bdb-4354-9ff4-f2ef11b07e6d"), Key = "form.status.draft_saved_at", Locale = "ar", Text = "تم حفظ المسودة في {time}." },
            new TextTranslation { Id = Guid.Parse("3d9338d2-b2b8-4c6f-a9ec-1bf2336d3b9a"), Key = "form.progress.label", Locale = "ar", Text = "التقدم" },
            new TextTranslation { Id = Guid.Parse("0f8b5f6c-f7fb-4eab-9694-2b301430c154"), Key = "form.progress.step", Locale = "ar", Text = "الخطوة {current} من {total}" },
            new TextTranslation { Id = Guid.Parse("241b3662-2a41-4f67-8769-d3bcf9dca9c2"), Key = "form.boolean.applies", Locale = "ar", Text = "ينطبق" },
            new TextTranslation { Id = Guid.Parse("61fd6f0d-0bb0-4cfc-9c0d-60f00998d950"), Key = "form.boolean.not_applies", Locale = "ar", Text = "لا ينطبق" },
            new TextTranslation { Id = Guid.Parse("839b371f-e118-4dab-bd57-37d6a9a0725b"), Key = "form.action.previous", Locale = "ar", Text = "السابق" },
            new TextTranslation { Id = Guid.Parse("99a9c9e6-20c7-40c3-be53-47e56ddda35b"), Key = "form.action.next", Locale = "ar", Text = "التالي" },
            new TextTranslation { Id = Guid.Parse("f177ea1d-0c2c-4aa1-b11a-97cb3e2d8574"), Key = "form.action.cancel", Locale = "ar", Text = "إلغاء" },
            new TextTranslation { Id = Guid.Parse("6b295df7-f278-4614-bae0-c5111e2dcd95"), Key = "form.action.save_draft", Locale = "ar", Text = "حفظ المسودة" },
            new TextTranslation { Id = Guid.Parse("1a2990a2-b9c0-49ec-9af9-7eaf3bf1171e"), Key = "form.action.saving", Locale = "ar", Text = "جار الحفظ..." },
            new TextTranslation { Id = Guid.Parse("84ef093f-f27a-4977-9b06-80af1e0fb027"), Key = "form.action.accept", Locale = "ar", Text = "قبول" },
            new TextTranslation { Id = Guid.Parse("54d5b060-2b3d-4d42-ad3b-7be3467d953a"), Key = "form.action.accepting", Locale = "ar", Text = "جار القبول..." },
            new TextTranslation { Id = Guid.Parse("9cda1c6a-00de-4f45-a2cb-6c2f3061fe59"), Key = "form.action.reject", Locale = "ar", Text = "رفض" },
            new TextTranslation { Id = Guid.Parse("324dd734-5c19-4f26-8fc9-f8abebfba4b8"), Key = "form.action.submit", Locale = "ar", Text = "إرسال" },
            new TextTranslation { Id = Guid.Parse("5df2111d-a81a-4cf8-b822-fb4cbe670f89"), Key = "form.action.submitting", Locale = "ar", Text = "جار الإرسال..." },
            new TextTranslation { Id = Guid.Parse("e33731c2-0b64-496f-b4de-e561242cf65f"), Key = "toast.action.close", Locale = "ar", Text = "إغلاق" },
            new TextTranslation { Id = Guid.Parse("06b4cf6c-fea5-4b6f-8674-62f87c79d355"), Key = "form.error.save_progress", Locale = "ar", Text = "تعذر حفظ التقدم." },
            new TextTranslation { Id = Guid.Parse("9f03d4ec-5582-4ccd-87b7-64dd5e817d57"), Key = "form.error.rejection_failed", Locale = "ar", Text = "فشل الرفض." },
            new TextTranslation { Id = Guid.Parse("6593a7e7-dcef-4a7d-b3fe-6c8900c36849"), Key = "form.error.rejection_reason_required", Locale = "ar", Text = "سبب الرفض مطلوب." },
            new TextTranslation { Id = Guid.Parse("ed9ec0b5-d97c-41d3-bb6d-b1df8274cb76"), Key = "form.error.submission_failed", Locale = "ar", Text = "فشل الإرسال." },
            new TextTranslation { Id = Guid.Parse("c52a6bf9-fc9f-45e4-92ea-e46dfbd66b35"), Key = "form.field.rejection_reason", Locale = "ar", Text = "سبب الرفض" },
            new TextTranslation { Id = Guid.Parse("7ab92c1b-49cc-43c6-a812-63bf0b8fe1ef"), Key = "form.field.rejection_reason_placeholder", Locale = "ar", Text = "أدخل سبب الرفض" },
            new TextTranslation { Id = Guid.Parse("1fa62ace-f077-4357-86c4-bff00d66fd3f"), Key = "form.modal.reject.title", Locale = "ar", Text = "رفض التقييم" },
            new TextTranslation { Id = Guid.Parse("420b766e-69be-4ef4-88be-6d75c2eeccf4"), Key = "form.modal.reject.confirm", Locale = "ar", Text = "تأكيد الرفض" },
            new TextTranslation { Id = Guid.Parse("5fe57bbf-cd34-4f82-84ec-6727ea241f05"), Key = "form.status.accepted", Locale = "ar", Text = "تم القبول." },
            new TextTranslation { Id = Guid.Parse("f4bfa3d7-b1ab-43a4-a8ec-0356d9f43b4d"), Key = "form.validation.required", Locale = "ar", Text = "هذا الحقل مطلوب." },
            new TextTranslation { Id = Guid.Parse("651f170e-57b0-491a-a2b4-0b2423072ae3"), Key = "form.validation.expected_type", Locale = "ar", Text = "القيمة المتوقعة هي {type}." },
            new TextTranslation { Id = Guid.Parse("4d26b5f0-b4a7-46e4-958e-fd5046426e8e"), Key = "form.validation.expected_boolean", Locale = "ar", Text = "القيمة المتوقعة منطقية." },
            new TextTranslation { Id = Guid.Parse("5a711fec-e093-4f12-a160-490deaf93702"), Key = "form.validation.expected_integer", Locale = "ar", Text = "القيمة المتوقعة عدد صحيح." },
            new TextTranslation { Id = Guid.Parse("f5ff2911-4b8d-4d3e-b8c8-7415df4e90e8"), Key = "form.validation.expected_number", Locale = "ar", Text = "القيمة المتوقعة رقم." },
            new TextTranslation { Id = Guid.Parse("7d2e4f98-74e9-4e83-88cf-31af3fdd3f14"), Key = "form.validation.expected_option_list", Locale = "ar", Text = "المتوقع قائمة من رموز الخيارات." },
            new TextTranslation { Id = Guid.Parse("9f311ef4-cf7b-4976-849f-ebd2335194f1"), Key = "form.validation.min_length", Locale = "ar", Text = "الحد الأدنى للطول هو {value}." },
            new TextTranslation { Id = Guid.Parse("eb6eff4b-6370-40ee-b2bb-4689decae667"), Key = "form.validation.max_length", Locale = "ar", Text = "الحد الأقصى للطول هو {value}." },
            new TextTranslation { Id = Guid.Parse("64c905cf-cdbe-43f5-90a7-8f4c0733f3be"), Key = "form.validation.pattern", Locale = "ar", Text = "القيمة لا تطابق التنسيق المطلوب." },
            new TextTranslation { Id = Guid.Parse("87a3b3df-08bb-4c18-aefc-b29af3147634"), Key = "form.validation.invalid_format", Locale = "ar", Text = "تنسيق {format} غير صالح." },
            new TextTranslation { Id = Guid.Parse("53550d97-8d2e-4df7-9e08-8fe6f3b40f6e"), Key = "form.validation.min_value", Locale = "ar", Text = "الحد الأدنى للقيمة هو {value}." },
            new TextTranslation { Id = Guid.Parse("b7a4475a-75d0-44a5-8ca1-6ef72ad6e95b"), Key = "form.validation.max_value", Locale = "ar", Text = "الحد الأقصى للقيمة هو {value}." },
            new TextTranslation { Id = Guid.Parse("5477f6d8-20c3-4d8d-a904-4f4d98602021"), Key = "form.validation.invalid_option", Locale = "ar", Text = "قيمة الخيار غير صالحة." },
            new TextTranslation { Id = Guid.Parse("6bb77c7c-c6b5-4cb0-a2e3-130baed2569d"), Key = "form.validation.invalid_option_list", Locale = "ar", Text = "خيار واحد أو أكثر غير صالح." },
            new TextTranslation { Id = Guid.Parse("c4609f85-60d1-4f03-bc41-85133b847891"), Key = "Intake and Administrative Identity", Locale = "ar", Text = "الاستقبال والهوية الإدارية" },
            new TextTranslation { Id = Guid.Parse("93c26d2d-4a14-480f-8951-fbb6b00b610b"), Key = "Consent and Confidentiality", Locale = "ar", Text = "الموافقة والسرية" },
            new TextTranslation { Id = Guid.Parse("2b6c5d2d-ce64-4fb6-ad54-b5d1006bb615"), Key = "Substance and Treatment History", Locale = "ar", Text = "تاريخ التعاطي والعلاج" },
            new TextTranslation { Id = Guid.Parse("a12aff89-f092-4d15-8090-ed658f749eb2"), Key = "Physical Health", Locale = "ar", Text = "الصحة الجسدية" },
            new TextTranslation { Id = Guid.Parse("a466b8ab-c0c5-4f84-81e2-fefba79ac784"), Key = "Mental Health", Locale = "ar", Text = "الصحة النفسية" },
            new TextTranslation { Id = Guid.Parse("41a58f89-3087-4adf-a124-393a7b5d8fc0"), Key = "Assessor Actions Required", Locale = "ar", Text = "الإجراءات المطلوبة من المقيم" },
            new TextTranslation { Id = Guid.Parse("f73ae6be-e73c-4e7c-8482-e36b641acb7c"), Key = "Service User Name", Locale = "ar", Text = "اسم متلقي الخدمة" },
            new TextTranslation { Id = Guid.Parse("561c40aa-850b-46ed-bca1-fc5a6e3ce91e"), Key = "First Name", Locale = "ar", Text = "الاسم الأول" },
            new TextTranslation { Id = Guid.Parse("554d445a-b2c5-4b54-8d73-4687d304bb76"), Key = "Surname", Locale = "ar", Text = "اللقب" },
            new TextTranslation { Id = Guid.Parse("69a5e0ed-f649-4582-b64e-48d3f95af261"), Key = "Date of Birth", Locale = "ar", Text = "تاريخ الميلاد" },
            new TextTranslation { Id = Guid.Parse("348725bb-8682-4499-8997-28e4d04bc250"), Key = "Phone Number", Locale = "ar", Text = "رقم الهاتف" },
            new TextTranslation { Id = Guid.Parse("c78f0c59-e220-49d0-a8fc-9333f802777d"), Key = "Email Address", Locale = "ar", Text = "البريد الإلكتروني" },
            new TextTranslation { Id = Guid.Parse("8c2d9d4f-9560-4c2b-9222-8348d66ad3bb"), Key = "GP Name", Locale = "ar", Text = "اسم الطبيب العام" },
            new TextTranslation { Id = Guid.Parse("b3069cc6-6dc3-46dd-a942-f2b5396a51e7"), Key = "Medical Card", Locale = "ar", Text = "بطاقة طبية متوفرة" },
            new TextTranslation { Id = Guid.Parse("ecbb8470-5ff5-45cb-80e8-238f5bcbe779"), Key = "Comprehensive Assessment Completed", Locale = "ar", Text = "اكتمل التقييم الشامل" },
            new TextTranslation { Id = Guid.Parse("0f9b886d-1538-4a88-8f07-bab77cf88269"), Key = "Assessment Completion Date", Locale = "ar", Text = "تاريخ اكتمال التقييم" },
            new TextTranslation { Id = Guid.Parse("57d2224b-e3ec-4dfe-9a5f-b5c51d1770b0"), Key = "Consent to Shared Mental Health Record", Locale = "ar", Text = "تم منح الموافقة على مشاركة سجل الصحة النفسية" },
            new TextTranslation { Id = Guid.Parse("7de6b3d0-204f-4ebd-bfb0-8d689592dedb"), Key = "Source of Referral", Locale = "ar", Text = "مصدر الإحالة" },
            new TextTranslation { Id = Guid.Parse("a351a748-18c8-4ad5-9d1b-d3dc75abd273"), Key = "Ever Treated for Substance Use", Locale = "ar", Text = "تلقى علاجاً سابقاً لتعاطي المواد" },
            new TextTranslation { Id = Guid.Parse("70c4577c-50f2-41c6-9174-f35453295d85"), Key = "Ever Treated for Alcohol", Locale = "ar", Text = "تلقى علاجاً سابقاً لتعاطي الكحول" },
            new TextTranslation { Id = Guid.Parse("600e1524-10bb-4be6-a3c1-203377d8b5e5"), Key = "Total Number of Previous Treatments", Locale = "ar", Text = "إجمالي عدد العلاجات السابقة" },
            new TextTranslation { Id = Guid.Parse("cc0638f0-d318-408d-966c-5451a8ac20e8"), Key = "Age First Treated", Locale = "ar", Text = "العمر عند أول علاج" },
            new TextTranslation { Id = Guid.Parse("507d041d-ec45-4fdd-802b-c32f58e0f6ca"), Key = "Name of Treatment Provider(s)", Locale = "ar", Text = "اسم جهة أو جهات تقديم العلاج" },
            new TextTranslation { Id = Guid.Parse("adcd199b-85e2-4d1d-a18f-8d4b09cf45b0"), Key = "Reason for Leaving", Locale = "ar", Text = "سبب المغادرة" },
            new TextTranslation { Id = Guid.Parse("135cc8e6-330d-4ad5-8f17-f6a12b60a7a8"), Key = "Longest Time Abstinent", Locale = "ar", Text = "أطول مدة امتناع" },
            new TextTranslation { Id = Guid.Parse("9d31db4c-8a78-4a39-bf28-978e05377a87"), Key = "Current Opiate Agonist Treatment", Locale = "ar", Text = "يتلقى حالياً علاجاً بناهضات الأفيونات" },
            new TextTranslation { Id = Guid.Parse("57cf1cf1-557e-4efc-b51c-8ff265838780"), Key = "Other Current Treatment / Prescribed Medications", Locale = "ar", Text = "يتناول حالياً علاجاً آخر أو دواءً موصوفاً" },
            new TextTranslation { Id = Guid.Parse("7a6c0acb-5c6e-4460-9dd3-b0f77afca2ea"), Key = "Concerns About Physical Health", Locale = "ar", Text = "تم تحديد مخاوف تتعلق بالصحة الجسدية" },
            new TextTranslation { Id = Guid.Parse("604c88c3-1e6b-4f3f-b8ca-72da79cbc9d2"), Key = "Known Allergies", Locale = "ar", Text = "حساسيات معروفة (مزيد من المعلومات)" },
            new TextTranslation { Id = Guid.Parse("01bd91d0-d906-45bf-ba71-0ab6de2f89d4"), Key = "History of Head Injury", Locale = "ar", Text = "تاريخ إصابات الرأس" },
            new TextTranslation { Id = Guid.Parse("5919ffba-7147-4365-9838-1681eb1247ff"), Key = "Last GP Check-Up", Locale = "ar", Text = "آخر فحص عند الطبيب العام" },
            new TextTranslation { Id = Guid.Parse("2398ebc8-9128-4f48-9e30-b02872edbba1"), Key = "Relevant Medical History", Locale = "ar", Text = "التاريخ الطبي ذي الصلة" },
            new TextTranslation { Id = Guid.Parse("8981d1e4-f4a1-45e5-b2da-4a3b884737ab"), Key = "Current Medications", Locale = "ar", Text = "الأدوية الحالية" },
            new TextTranslation { Id = Guid.Parse("bc0c8777-2c67-4a47-8466-b371f0a178d9"), Key = "History of Seizures", Locale = "ar", Text = "تاريخ النوبات" },
            new TextTranslation { Id = Guid.Parse("37efcbaf-2539-44ca-aac3-bb8cca1d2acf"), Key = "Concerns About Mental Health", Locale = "ar", Text = "تم تحديد مخاوف تتعلق بالصحة النفسية" },
            new TextTranslation { Id = Guid.Parse("e510b335-5ff1-4a32-b4f5-f6fbaeb0e2f4"), Key = "Seen or Seeing a Mental Health Professional", Locale = "ar", Text = "راجع أو يراجع مختصاً في الصحة النفسية (مزيد من المعلومات)" },
            new TextTranslation { Id = Guid.Parse("a5786ff5-7c1d-42ff-a826-7e72d14c537c"), Key = "History of Psychiatric Care", Locale = "ar", Text = "تاريخ الرعاية النفسية" },
            new TextTranslation { Id = Guid.Parse("954d6b17-b2f8-441f-9d91-a7ee5db65379"), Key = "History of Self Harm or Suicidal Thoughts", Locale = "ar", Text = "تاريخ إيذاء النفس أو الأفكار الانتحارية" },
            new TextTranslation { Id = Guid.Parse("efab4558-c9a2-4c76-8098-a279ce2fe167"), Key = "Mood Over the Last Month", Locale = "ar", Text = "الحالة المزاجية خلال الشهر الماضي" },
            new TextTranslation { Id = Guid.Parse("c7e03c2c-1946-4ceb-b252-79a3eb5bfa8c"), Key = "Mental Health Details", Locale = "ar", Text = "تفاصيل الصحة النفسية" },
            new TextTranslation { Id = Guid.Parse("cb9c1bb2-f682-4c11-861d-284238769783"), Key = "Comprehensive Assessment Needed", Locale = "ar", Text = "التقييم الشامل مطلوب" },
            new TextTranslation { Id = Guid.Parse("8ef8a084-1220-4454-aac4-b9c7d90ed1a1"), Key = "Comprehensive Assessment Arranged", Locale = "ar", Text = "تم ترتيب التقييم الشامل" },
            new TextTranslation { Id = Guid.Parse("cb1f6f13-f5a1-4544-9093-83d2f57bf679"), Key = "Additional Comments Details", Locale = "ar", Text = "تفاصيل التعليقات الإضافية" },
            new TextTranslation { Id = Guid.Parse("0333296b-637b-4b7a-8913-ad14bc58c6c3"), Key = "HSE library source: Consent and confidentiality / AF Printed Page 1.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: الموافقة والسرية / AF Printed Page 1.html / json" },
            new TextTranslation { Id = Guid.Parse("a283092b-aa56-4c4c-b43d-37f8dc1be4db"), Key = "HSE library source: Consent and confidentiality / AF Printed Page 3.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: الموافقة والسرية / AF Printed Page 3.html / json" },
            new TextTranslation { Id = Guid.Parse("0c0f3029-002e-40c4-a242-51c764a43103"), Key = "HSE library source: Intake and admin identity / AF Printed Page 6.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: الاستقبال والهوية الإدارية / AF Printed Page 6.html / json" },
            new TextTranslation { Id = Guid.Parse("fb237fca-f632-4874-b8e1-0180dbf21f84"), Key = "HSE library source: Substance use and treatment history / AF Printed Page 10.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: تاريخ التعاطي والعلاج / AF Printed Page 10.html / json" },
            new TextTranslation { Id = Guid.Parse("8ab90d8f-45f3-4e11-8e97-863a03cd6e61"), Key = "HSE library source: Physical health / AF Printed Page 12.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: الصحة الجسدية / AF Printed Page 12.html / json" },
            new TextTranslation { Id = Guid.Parse("7aa6f38d-55ca-404d-84da-3b28ecbf4252"), Key = "HSE library source: Mental health / AF Printed Page 13.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: الصحة النفسية / AF Printed Page 13.html / json" },
            new TextTranslation { Id = Guid.Parse("ca371ef4-2ccc-49e4-b28a-7807700d5239"), Key = "HSE library source: Assessor actions required / AF Printed Page 15.html / json", Locale = "ar", Text = "مصدر مكتبة HSE: الإجراءات المطلوبة من المقيم / AF Printed Page 15.html / json" },
            new TextTranslation { Id = Guid.Parse("b8346b69-3d68-4a47-b090-c08de8ba66fc"), Key = "GP", Locale = "ar", Text = "الطبيب العام" },
            new TextTranslation { Id = Guid.Parse("1da9883a-d053-4e26-a0fb-d62f6f5580d8"), Key = "Family", Locale = "ar", Text = "الأسرة" },
            new TextTranslation { Id = Guid.Parse("88802650-d75c-4370-b112-57ee8010dbf7"), Key = "Self", Locale = "ar", Text = "الذات" },
            new TextTranslation { Id = Guid.Parse("bc6e4c19-46dd-4200-b775-a47dfecdb43f"), Key = "Other", Locale = "ar", Text = "أخرى" },
            new TextTranslation { Id = Guid.Parse("8ffcf90e-18ea-45f1-b874-55ba56aede9e"), Key = "Very low", Locale = "ar", Text = "منخفض جدا" },
            new TextTranslation { Id = Guid.Parse("8fa2f5f8-f75d-4cb8-a662-123efbf2866e"), Key = "Low", Locale = "ar", Text = "منخفض" },
            new TextTranslation { Id = Guid.Parse("74a4d715-f638-4ad7-93d3-e19333656d1d"), Key = "Reasonable", Locale = "ar", Text = "معقول" },
            new TextTranslation { Id = Guid.Parse("c65d20ca-d618-4a83-80bd-4c6389ca6d6b"), Key = "Good", Locale = "ar", Text = "جيد" });
    }

    private static void SeedGroupTherapyProgram(ModelBuilder modelBuilder)
    {
        const string unitCode = "alcohol";
        const string programCode = "bruree_alcohol_gt";

        var weeklyTopics = new[]
        {
            new
            {
                Week = 1,
                Topic = "Spirituality",
                Intro =
                    "Week focus: spirituality as connection, meaning, and values in recovery. Sessions are reflective, practical, and respectful of each resident's personal belief framework.",
                Days = new[]
                {
                    new[]
                    {
                        "What does spirituality mean to you personally, if anything?",
                        "When do you feel most connected to purpose or meaning?",
                        "What daily practice helps you feel grounded for recovery?"
                    },
                    new[]
                    {
                        "How has addiction impacted your sense of purpose?",
                        "What value do you want to rebuild this week?",
                        "Who or what reminds you of your better self?"
                    },
                    new[]
                    {
                        "What are three things you are grateful for today?",
                        "How can gratitude support you during cravings?",
                        "What small act of kindness can you offer today?"
                    },
                    new[]
                    {
                        "What does forgiveness mean in your own words?",
                        "Is there someone you need to forgive to move forward?",
                        "What would self-forgiveness look like this week?"
                    },
                    new[]
                    {
                        "What fear are you carrying right now?",
                        "What helps you let go when you cannot control an outcome?",
                        "How can trust be rebuilt one action at a time?"
                    },
                    new[]
                    {
                        "What is one boundary that protects your peace?",
                        "How does silence or reflection help your recovery?",
                        "What personal ritual can you commit to each morning?"
                    },
                    new[]
                    {
                        "What did you learn this week about your inner life?",
                        "Which practice from this week will you continue?",
                        "How will spirituality support your plan for next week?"
                    }
                }
            },
            new
            {
                Week = 2,
                Topic = "Change",
                Intro =
                    "Week focus: understanding change as a process. Residents identify patterns, barriers, motivation, and practical actions that turn intention into behavior.",
                Days = new[]
                {
                    new[]
                    {
                        "What change are you most committed to right now?",
                        "What makes this change important to you today?",
                        "What is one action you can take in the next 24 hours?"
                    },
                    new[]
                    {
                        "Which old pattern appears most often before relapse behavior?",
                        "What is your earliest warning sign that you are slipping?",
                        "What replacement behavior can you use immediately?"
                    },
                    new[]
                    {
                        "How do you usually respond to stress without substances?",
                        "Which coping strategy has worked for you in the past?",
                        "What support do you need when pressure rises?"
                    },
                    new[]
                    {
                        "What belief about yourself needs to change for recovery to last?",
                        "How does self-talk affect your daily choices?",
                        "What new statement can you repeat when discouraged?"
                    },
                    new[]
                    {
                        "Who supports your change and how do they help?",
                        "What relationships make change harder?",
                        "What boundary protects your recovery progress?"
                    },
                    new[]
                    {
                        "What setback taught you something useful?",
                        "How can you recover quickly after a difficult day?",
                        "What does progress look like besides perfection?"
                    },
                    new[]
                    {
                        "What has changed in you this week?",
                        "Which habit will you strengthen next week?",
                        "How will you measure progress over the next 7 days?"
                    }
                }
            },
            new
            {
                Week = 3,
                Topic = "Healing the Hurts of the Past",
                Intro =
                    "Week focus: safe reflection on past hurt, shame, and unresolved pain. The goal is emotional processing with boundaries, accountability, and healthier meaning-making.",
                Days = new[]
                {
                    new[]
                    {
                        "What past hurt still affects you most today?",
                        "How has this hurt influenced your addiction story?",
                        "What support helps you discuss this safely?"
                    },
                    new[]
                    {
                        "What emotions do you avoid most often?",
                        "How do avoided emotions show up in your behavior?",
                        "What healthy way can you express one difficult emotion today?"
                    },
                    new[]
                    {
                        "What shame narrative do you carry about your past?",
                        "What facts challenge that shame narrative?",
                        "What compassionate truth can replace it?"
                    },
                    new[]
                    {
                        "What apology do you owe, and what accountability is needed first?",
                        "Where do you need to make amends without causing further harm?",
                        "How can you prepare for difficult conversations responsibly?"
                    },
                    new[]
                    {
                        "What boundaries protect you when discussing trauma?",
                        "How do you know when to pause and regulate?",
                        "Which grounding technique works best for you?"
                    },
                    new[]
                    {
                        "What does healing look like in practical daily life?",
                        "What relationship needs rebuilding through consistent action?",
                        "How can you show trustworthiness this week?"
                    },
                    new[]
                    {
                        "What insight from this week changed your perspective?",
                        "What unfinished hurt needs ongoing support after discharge?",
                        "What is your next healing step with your care team?"
                    }
                }
            },
            new
            {
                Week = 4,
                Topic = "Relapse Prevention",
                Intro =
                    "Week focus: practical relapse prevention planning. Residents define triggers, rehearse response plans, and build support structures for high-risk situations post-treatment.",
                Days = new[]
                {
                    new[]
                    {
                        "What are your top three relapse triggers?",
                        "Which trigger is highest risk in the next month?",
                        "What is your first-step response when that trigger appears?"
                    },
                    new[]
                    {
                        "What thoughts usually come before a lapse?",
                        "How can you challenge those thoughts in real time?",
                        "Who can you contact immediately when those thoughts appear?"
                    },
                    new[]
                    {
                        "What places or people increase relapse risk for you?",
                        "Which boundaries are non-negotiable after discharge?",
                        "What exit plan will you use in unsafe environments?"
                    },
                    new[]
                    {
                        "How does poor sleep, hunger, or stress affect your risk level?",
                        "What daily routine keeps you stable?",
                        "What early warning signs tell you to seek support quickly?"
                    },
                    new[]
                    {
                        "What does your emergency relapse plan include?",
                        "Where is your written plan stored and who has a copy?",
                        "How will you reduce harm if you feel close to using?"
                    },
                    new[]
                    {
                        "What healthy reward can reinforce sobriety milestones?",
                        "How will you stay connected to peer or community support?",
                        "What commitment can you make to your future self today?"
                    },
                    new[]
                    {
                        "Which relapse prevention tools were most useful this week?",
                        "What is your first 7-day post-program action plan?",
                        "What is your key message to yourself when cravings hit?"
                    }
                }
            },
            new
            {
                Week = 5,
                Topic = "Listening",
                Intro =
                    "Week focus: strengthening active listening in recovery groups. Residents practice presence, reflection, and empathy so conversations become safer, clearer, and more supportive.",
                Days = new[]
                {
                    new[]
                    {
                        "What does active listening look like in group therapy?",
                        "When do you notice yourself listening to reply rather than to understand?",
                        "What is one habit that would improve how you listen this week?"
                    },
                    new[]
                    {
                        "How can you reflect back what someone said without judging?",
                        "What gets in the way of listening when emotions run high?",
                        "What phrase can you use to show empathy in a difficult conversation?"
                    },
                    new[]
                    {
                        "How does better listening reduce conflict in recovery settings?",
                        "How can listening improve accountability between peers?",
                        "What listening commitment will you keep before next session?"
                    }
                }
            }
        };

        var subjects = new List<GroupTherapySubjectTemplate>();
        var questions = new List<GroupTherapyDailyQuestion>();

        foreach (var topic in weeklyTopics)
        {
            var subjectId = CreateDeterministicGuid($"group-therapy:subject:{unitCode}:{programCode}:{topic.Week}");
            subjects.Add(new GroupTherapySubjectTemplate
            {
                Id = subjectId,
                UnitCode = unitCode,
                ProgramCode = programCode,
                WeekNumber = topic.Week,
                Topic = topic.Topic,
                IntroText = topic.Intro,
                IsActive = true
            });

            for (var dayIndex = 0; dayIndex < topic.Days.Length; dayIndex++)
            {
                var dayNumber = dayIndex + 1;
                for (var questionIndex = 0; questionIndex < topic.Days[dayIndex].Length; questionIndex++)
                {
                    var sortOrder = questionIndex + 1;
                    questions.Add(new GroupTherapyDailyQuestion
                    {
                        Id = CreateDeterministicGuid(
                            $"group-therapy:question:{unitCode}:{programCode}:{topic.Week}:{dayNumber}:{sortOrder}"),
                        SubjectTemplateId = subjectId,
                        DayNumber = dayNumber,
                        SortOrder = sortOrder,
                        QuestionText = topic.Days[dayIndex][questionIndex],
                        IsActive = true
                    });
                }
            }
        }

        modelBuilder.Entity<GroupTherapySubjectTemplate>().HasData(subjects);
        modelBuilder.Entity<GroupTherapyDailyQuestion>().HasData(questions);
    }

    private static void SeedGroupTherapyRemarks(ModelBuilder modelBuilder)
    {
        const string unitCode = "alcohol";
        const string programCode = "bruree_alcohol_gt";

        var seedUtc = new DateTime(2026, 3, 1, 9, 0, 0, DateTimeKind.Utc);
        var records = new[]
        {
            new
            {
                ResidentId = 1,
                ModuleKey = "spirituality",
                NoteLines = new[]
                {
                    "Excellent insight",
                    "Reflective Awareness [Strength]: Can identify personal meaning and values."
                },
                FreeText = "Resident engaged well and linked gratitude practice to daily recovery structure."
            },
            new
            {
                ResidentId = 2,
                ModuleKey = "change",
                NoteLines = new[]
                {
                    "Good participation",
                    "Behavioral Flexibility [Developing]: Acknowledges old patterns and can name one replacement behaviour."
                },
                FreeText = "Shows motivation but needs reminders to turn intentions into concrete same-day actions."
            },
            new
            {
                ResidentId = 3,
                ModuleKey = "relapse-prevention",
                NoteLines = new[]
                {
                    "Needs encouragement",
                    "Trigger Awareness [Developing]: Identifies high-risk cues but hesitates to activate support."
                },
                FreeText = "Agreed to write and carry an emergency contact plan before next session."
            }
        };

        var seededRemarks = records.Select((record, index) => new GroupTherapyResidentRemark
        {
            Id = CreateDeterministicGuid(
                $"group-therapy:remark:{unitCode}:{programCode}:{record.ModuleKey}:{record.ResidentId}"),
            UnitCode = unitCode,
            ProgramCode = programCode,
            ResidentId = record.ResidentId,
            ModuleKey = record.ModuleKey,
            NoteLinesJson = System.Text.Json.JsonSerializer.Serialize(record.NoteLines),
            FreeText = record.FreeText,
            CreatedAtUtc = seedUtc.AddMinutes(index),
            UpdatedAtUtc = seedUtc.AddMinutes(index)
        });

        modelBuilder.Entity<GroupTherapyResidentRemark>().HasData(seededRemarks);
    }

    private static void SeedElementLibrary(ModelBuilder modelBuilder)
    {
        var createdAt = SeedCreatedAt;
        var groups = BuildRealHseElementGroups(createdAt);
        var definitions = BuildRealHseElementDefinitions(groups, createdAt);

        modelBuilder.Entity<ElementGroup>().HasData(groups);
        modelBuilder.Entity<ElementDefinition>().HasData(definitions);
    }

    private static ElementGroup[] BuildRealHseElementGroups(DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementGroup("consent_confidentiality", "Consent and Confidentiality", "HSE consent, confidentiality, additional consent, and service-user signature elements derived from AF Printed Pages 1 to 5.", "AF Printed Page 1-5.html", 1, createdAtUtc),
            CreateElementGroup("intake_admin_identity", "Intake / Admin Identity", "Admission and intake identity, referral, contact, and administration elements derived from AF Printed Pages 6 and 7.", "AF Printed Page 6-7.html", 2, createdAtUtc),
            CreateElementGroup("substance_use_alcohol_treatment_history", "Substance Use / Alcohol / Treatment History", "Substance, gambling, family history, alcohol treatment, and harm-reduction elements derived from AF Printed Pages 9 to 11.", "AF Printed Page 9-11.html", 3, createdAtUtc),
            CreateElementGroup("physical_health", "Physical Health", "Physical health and screening access elements derived from AF Printed Page 12.", "AF Printed Page 12.html", 4, createdAtUtc),
            CreateElementGroup("sexual_wellbeing", "Sexual Wellbeing", "Sexual orientation and sexual wellbeing elements derived from AF Printed Pages 6 and 13.", "AF Printed Page 6,13.html", 5, createdAtUtc),
            CreateElementGroup("mental_health", "Mental Health", "Mental health consent and assessment elements derived from AF Printed Pages 3 and 13.", "AF Printed Page 3,13.html", 6, createdAtUtc),
            CreateElementGroup("domestic_violence_justice_health_safety", "Domestic Violence / Justice / Health and Safety", "Safeguarding, justice, and service safety elements derived from AF Printed Page 14.", "AF Printed Page 14.html", 7, createdAtUtc),
            CreateElementGroup("happiness_scale", "Happiness Scale", "HSE happiness scale matrix derived from AF Printed Page 15.", "AF Printed Page 15.html", 8, createdAtUtc),
            CreateElementGroup("assessor_actions_required", "Assessor Actions Required", "Post-assessment action checklist and follow-up elements derived from AF Printed Page 15.", "AF Printed Page 15.html", 9, createdAtUtc)
        };
    }

    private static ElementDefinition[] BuildRealHseElementDefinitions(ElementGroup[] groups, DateTime createdAtUtc)
    {
        var groupByKey = groups.ToDictionary(group => group.Key, StringComparer.Ordinal);

        return BuildConsentDefinitions(groupByKey["consent_confidentiality"], createdAtUtc)
            .Concat(BuildIdentityDefinitions(groupByKey["intake_admin_identity"], createdAtUtc))
            .Concat(BuildSubstanceDefinitions(groupByKey["substance_use_alcohol_treatment_history"], createdAtUtc))
            .Concat(BuildPhysicalHealthDefinitions(groupByKey["physical_health"], createdAtUtc))
            .Concat(BuildSexualWellbeingDefinitions(groupByKey["sexual_wellbeing"], createdAtUtc))
            .Concat(BuildMentalHealthDefinitions(groupByKey["mental_health"], createdAtUtc))
            .Concat(BuildSafetyDefinitions(groupByKey["domestic_violence_justice_health_safety"], createdAtUtc))
            .Concat(BuildHappinessScaleDefinitions(groupByKey["happiness_scale"], createdAtUtc))
            .Concat(BuildAssessorActionDefinitions(groupByKey["assessor_actions_required"], createdAtUtc))
            .ToArray();
    }

    private static ElementGroup CreateElementGroup(
        string key,
        string name,
        string description,
        string sourceReference,
        int displayOrder,
        DateTime createdAtUtc) => new()
    {
        Id = CreateDeterministicGuid($"element-group:{key}"),
        Key = key,
        Name = name,
        Description = description,
        SourceDocumentReference = sourceReference,
        Version = 1,
        Status = "published",
        DisplayOrder = displayOrder,
        IsActive = true,
        CreatedAtUtc = createdAtUtc,
        UpdatedAtUtc = createdAtUtc
    };

    private static string BuildElementFieldConfig(
        bool required = false,
        string? placeholder = null,
        string? defaultValue = null,
        int? min = null,
        int? max = null,
        string? pattern = null,
        string? customMessage = null,
        IEnumerable<(string Value, string Label)>? options = null)
    {
        return System.Text.Json.JsonSerializer.Serialize(new
        {
            required,
            placeholder,
            defaultValue,
            validation = (min.HasValue || max.HasValue || !string.IsNullOrWhiteSpace(pattern) || !string.IsNullOrWhiteSpace(customMessage))
                ? new { min, max, pattern, customMessage }
                : null,
            options = options?.Select(option => new { value = option.Value, label = option.Label }).ToArray() ?? Array.Empty<object>()
        });
    }

    private static ElementDefinition CreateElementDefinition(
        ElementGroup group,
        string key,
        string label,
        string elementType,
        string sourceKind,
        string sourceReference,
        int displayOrder,
        DateTime createdAtUtc,
        string? description = null,
        string? helpText = null,
        string? canonicalFieldKey = null,
        string? optionSetKey = null,
        string? fieldConfigJson = null) => new()
    {
        Id = CreateDeterministicGuid($"element-definition:{key}"),
        GroupId = group.Id,
        Key = key,
        Label = label,
        Description = description,
        HelpText = helpText,
        ElementType = elementType,
        SourceKind = sourceKind,
        CanonicalFieldKey = canonicalFieldKey,
        OptionSetKey = optionSetKey,
        SourceDocumentReference = sourceReference,
        FieldConfigJson = fieldConfigJson ?? BuildElementFieldConfig(),
        Version = 1,
        Status = "published",
        DisplayOrder = displayOrder,
        IsActive = true,
        CreatedAtUtc = createdAtUtc,
        UpdatedAtUtc = createdAtUtc
    };

    private static IEnumerable<ElementDefinition> BuildConsentDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "assessment_completion_status", "Comprehensive Assessment Completed", "yes-no", "json", "AF Printed Page 1.html", 1, createdAtUtc, "Records whether the comprehensive assessment is completed.", fieldConfigJson: BuildElementFieldConfig(required: true)),
            CreateElementDefinition(group, "assessment_completion_date", "Assessment Completion Date", "date", "json", "AF Printed Page 1.html", 2, createdAtUtc, "Date comprehensive assessment was completed."),
            CreateElementDefinition(group, "consent_explainer", "Consent and Confidentiality Explainer", "instructional-text", "unbound", "AF Printed Page 1-3.html", 3, createdAtUtc, "Instructional content reminding the assessor to explain consent and confidentiality."),
            CreateElementDefinition(group, "assessment_checklist", "Assessment Checklist", "checklist", "json", "AF Printed Page 1.html", 4, createdAtUtc, "Checklist used at the start of assessment.", fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("consent_signed_understood", "Consent signed and understood by Service User"),
                ("initial_care_plan_agreed", "Initial care plan developed and agreed with Service User based on assessment"),
                ("consent_explained", "Explain consent and confidentiality"),
                ("new_treatment_episode", "Is this a new treatment episode?"),
                ("circumstances_changed", "Have the Service User's circumstances changed? If so, update this assessment")
            })),
            CreateElementDefinition(group, "service_user_signature", "Service User Signature", "signature", "json", "AF Printed Page 3.html", 5, createdAtUtc, "Signature of service user confirming consent."),
            CreateElementDefinition(group, "staff_signature", "Staff Signature", "signature", "json", "AF Printed Page 3.html", 6, createdAtUtc, "Signature of staff witnessing or confirming consent."),
            CreateElementDefinition(group, "consent_mental_health_shared_record", "Consent to Shared Mental Health Record", "yes-no", "json", "AF Printed Page 3.html", 7, createdAtUtc, "Consent specific to shared mental health records.", fieldConfigJson: BuildElementFieldConfig(required: true)),
            CreateElementDefinition(group, "additional_consent_contacts", "Additional Consent Contacts", "checklist", "json", "AF Printed Page 4.html", 8, createdAtUtc, "Named people or services with whom information can be shared."),
            CreateElementDefinition(group, "pass_database_consent", "PASS Database Consent", "signature", "json", "AF Printed Page 4.html", 9, createdAtUtc, "Consent specific to homeless services PASS database."),
            CreateElementDefinition(group, "national_waiting_list_consent", "National Waiting List Consent", "signature", "json", "AF Printed Page 5.html", 10, createdAtUtc, "Consent for placement on the HSE National Waiting List for Opiate Addiction Treatment.")
        };
    }

    private static IEnumerable<ElementDefinition> BuildIdentityDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "service_user_full_name", "Service User Name", "text", "json", "AF Printed Page 6.html", 1, createdAtUtc, "Full service user name as captured on admission.", fieldConfigJson: BuildElementFieldConfig(required: true, placeholder: "Block capitals")),
            CreateElementDefinition(group, "first_name", "First Name", "text", "canonical", "AF Printed Page 6.html", 2, createdAtUtc, "Resident first name.", canonicalFieldKey: "resident.firstName", fieldConfigJson: BuildElementFieldConfig(required: true)),
            CreateElementDefinition(group, "surname", "Surname", "text", "canonical", "AF Printed Page 6.html", 3, createdAtUtc, "Resident surname.", canonicalFieldKey: "resident.surname", fieldConfigJson: BuildElementFieldConfig(required: true)),
            CreateElementDefinition(group, "date_of_birth", "Date of Birth", "date", "canonical", "AF Printed Page 6.html", 4, createdAtUtc, "Resident date of birth.", canonicalFieldKey: "resident.dateOfBirth", fieldConfigJson: BuildElementFieldConfig(required: true)),
            CreateElementDefinition(group, "nationality", "Nationality", "text", "canonical", "AF Printed Page 6.html", 5, createdAtUtc, "Resident nationality.", canonicalFieldKey: "resident.nationality"),
            CreateElementDefinition(group, "source_of_referral", "Source of Referral", "single-choice", "json", "AF Printed Page 6.html", 6, createdAtUtc, "Referral source captured on intake.", optionSetKey: "referral_source", fieldConfigJson: BuildElementFieldConfig(options: new[] { ("gp", "GP"), ("family", "Family"), ("self", "Self"), ("other", "Other") })),
            CreateElementDefinition(group, "referral_reference_number", "Referral Reference Number", "text", "json", "AF Printed Page 6.html", 7, createdAtUtc),
            CreateElementDefinition(group, "referral_date", "Date of Referral", "date", "json", "AF Printed Page 6.html", 8, createdAtUtc),
            CreateElementDefinition(group, "phone_number", "Phone Number", "text", "json", "AF Printed Page 6.html", 9, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(pattern: @"^\+?[0-9()\-\s]{7,20}$")),
            CreateElementDefinition(group, "mobile_number", "Mobile Number", "text", "json", "AF Printed Page 6.html", 10, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(pattern: @"^\+?[0-9()\-\s]{7,20}$")),
            CreateElementDefinition(group, "email_address", "Email Address", "text", "json", "AF Printed Page 6.html", 11, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(pattern: @"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")),
            CreateElementDefinition(group, "contact_permissions", "Contact Permissions", "checklist", "json", "AF Printed Page 6.html", 12, createdAtUtc, "Consent to be contacted via different channels.", fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("contact_at_address", "Agree to be contacted at the above address"),
                ("contact_via_phone_text", "Agree to be contacted via phone text"),
                ("contact_by_email", "Agree to be contacted by email")
            })),
            CreateElementDefinition(group, "country_of_birth", "Country of Birth", "text", "json", "AF Printed Page 6.html", 13, createdAtUtc),
            CreateElementDefinition(group, "preferred_language", "Preferred Language to Work With", "text", "json", "AF Printed Page 6.html", 14, createdAtUtc),
            CreateElementDefinition(group, "employment_status", "Employment Status", "text", "json", "AF Printed Page 7.html", 15, createdAtUtc),
            CreateElementDefinition(group, "source_of_income", "Source of Income", "text", "json", "AF Printed Page 7.html", 16, createdAtUtc),
            CreateElementDefinition(group, "gp_name", "GP Name", "text", "json", "AF Printed Page 7.html", 17, createdAtUtc),
            CreateElementDefinition(group, "medical_card_status", "Medical Card", "yes-no", "json", "AF Printed Page 7.html", 18, createdAtUtc),
            CreateElementDefinition(group, "next_of_kin_details", "Next of Kin Details", "checklist", "json", "AF Printed Page 7.html", 19, createdAtUtc, "Captures next of kin and emergency contact context.")
        };
    }

    private static IEnumerable<ElementDefinition> BuildSubstanceDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "substance_problem_overview", "Substance Use / Gambling / Eating Disorder Overview", "instructional-text", "unbound", "AF Printed Page 9.html", 1, createdAtUtc, "Section guidance text introducing current need and care-plan discussion."),
            CreateElementDefinition(group, "gambling_history", "Gambling History", "yes-no", "json", "AF Printed Page 9.html", 2, createdAtUtc),
            CreateElementDefinition(group, "eating_disorder_history", "Eating Disorder History", "yes-no", "json", "AF Printed Page 9.html", 3, createdAtUtc),
            CreateElementDefinition(group, "main_problem_drug_assessability", "Difficulty Assessing Main Problem Drug", "yes-no", "json", "AF Printed Page 9.html", 4, createdAtUtc),
            CreateElementDefinition(group, "ever_treated_for_substance_use", "Ever Treated for Substance Use", "yes-no", "json", "AF Printed Page 10.html", 5, createdAtUtc),
            CreateElementDefinition(group, "ever_treated_for_alcohol", "Ever Treated for Alcohol", "yes-no", "json", "AF Printed Page 10.html", 6, createdAtUtc),
            CreateElementDefinition(group, "total_previous_treatments", "Total Number of Previous Treatments", "number", "json", "AF Printed Page 10.html", 7, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(min: 0)),
            CreateElementDefinition(group, "age_first_treated", "Age First Treated", "number", "json", "AF Printed Page 10.html", 8, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(min: 0, max: 120)),
            CreateElementDefinition(group, "treatment_types", "Treatment Type(s)", "multi-checkbox", "json", "AF Printed Page 10.html", 9, createdAtUtc),
            CreateElementDefinition(group, "treatment_providers", "Name of Treatment Provider(s)", "textarea", "json", "AF Printed Page 10.html", 10, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 1000)),
            CreateElementDefinition(group, "reason_for_leaving_treatment", "Reason for Leaving", "textarea", "json", "AF Printed Page 10.html", 11, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 1000)),
            CreateElementDefinition(group, "longest_time_abstinent", "Longest Time Abstinent", "text", "json", "AF Printed Page 10.html", 12, createdAtUtc),
            CreateElementDefinition(group, "current_opiate_agonist_treatment", "Current Opiate Agonist Treatment", "yes-no", "json", "AF Printed Page 10.html", 13, createdAtUtc),
            CreateElementDefinition(group, "other_current_treatment_medication", "Other Current Treatment / Prescribed Medications", "yes-no", "json", "AF Printed Page 10.html", 14, createdAtUtc),
            CreateElementDefinition(group, "risk_behaviour_history", "Risk Behaviour History", "checklist", "json", "AF Printed Page 11.html", 15, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("ever_injected", "Ever injected"),
                ("shared_needles", "Ever shared needles / syringes"),
                ("shared_paraphernalia", "Ever shared other paraphernalia")
            })),
            CreateElementDefinition(group, "harm_reduction_advice_given", "Harm Reduction Advice Given", "checklist", "json", "AF Printed Page 11.html", 16, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("needle_exchange", "Needle Exchange time and places"),
                ("drug_use", "Drug Use"),
                ("drug_interactions", "Drug Interactions"),
                ("alcohol_use", "Alcohol Use"),
                ("overdose_prevention", "Overdose Prevention"),
                ("access_to_naloxone", "Access to Naloxone"),
                ("safe_injecting_practice", "Safe Injecting Practice"),
                ("sexual_activity", "Sexual Activity")
            })),
            CreateElementDefinition(group, "family_substance_use_history", "Family Substance Use History", "yes-no", "json", "AF Printed Page 7.html", 17, createdAtUtc)
        };
    }

    private static IEnumerable<ElementDefinition> BuildPhysicalHealthDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "physical_health_concerns", "Concerns About Physical Health", "yes-no", "json", "AF Printed Page 12.html", 1, createdAtUtc),
            CreateElementDefinition(group, "known_allergies", "Known Allergies", "yes-no", "json", "AF Printed Page 12.html", 2, createdAtUtc),
            CreateElementDefinition(group, "history_of_head_injury", "History of Head Injury", "yes-no", "json", "AF Printed Page 12.html", 3, createdAtUtc),
            CreateElementDefinition(group, "last_gp_checkup", "Last GP Check-Up", "text", "json", "AF Printed Page 12.html", 4, createdAtUtc),
            CreateElementDefinition(group, "relevant_medical_history", "Relevant Medical History", "textarea", "json", "AF Printed Page 12.html", 5, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000)),
            CreateElementDefinition(group, "current_medications", "Current Medications", "textarea", "json", "AF Printed Page 12.html", 6, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000)),
            CreateElementDefinition(group, "can_access_medication", "Can Access Medication", "yes-no", "json", "AF Printed Page 12.html", 7, createdAtUtc),
            CreateElementDefinition(group, "adheres_to_medication", "Adheres to Medication", "yes-no", "json", "AF Printed Page 12.html", 8, createdAtUtc),
            CreateElementDefinition(group, "history_of_seizures", "History of Seizures", "yes-no", "json", "AF Printed Page 12.html", 9, createdAtUtc),
            CreateElementDefinition(group, "physical_health_details", "Physical Health Details", "textarea", "json", "AF Printed Page 12.html", 10, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000)),
            CreateElementDefinition(group, "national_screening_interest", "Would Like Access to National Screening Service", "yes-no", "json", "AF Printed Page 12.html", 11, createdAtUtc)
        };
    }

    private static IEnumerable<ElementDefinition> BuildSexualWellbeingDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "self_defined_sexual_orientation", "Self-Defined Sexual Orientation", "single-choice", "json", "AF Printed Page 6.html", 1, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("heterosexual", "Heterosexual or Straight"),
                ("bisexual", "Bisexual"),
                ("other", "Other sexual orientation not listed")
            })),
            CreateElementDefinition(group, "sexual_health_concerns", "Concerns About Sexual Health and Wellbeing", "yes-no", "json", "AF Printed Page 13.html", 2, createdAtUtc),
            CreateElementDefinition(group, "uses_condoms_or_barriers", "Uses Condoms or Other Physical Barriers", "yes-no", "json", "AF Printed Page 13.html", 3, createdAtUtc),
            CreateElementDefinition(group, "knows_barrier_access_points", "Knows Where Barriers Are Freely Available", "yes-no", "json", "AF Printed Page 13.html", 4, createdAtUtc),
            CreateElementDefinition(group, "sti_screening_history", "History of STI Screening / Testing", "yes-no", "json", "AF Printed Page 13.html", 5, createdAtUtc),
            CreateElementDefinition(group, "sexual_wellbeing_details", "Sexual Wellbeing Details", "textarea", "json", "AF Printed Page 13.html", 6, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000))
        };
    }

    private static IEnumerable<ElementDefinition> BuildMentalHealthDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "mental_health_consent_shared_record", "Mental Health Shared Record Consent", "yes-no", "json", "AF Printed Page 3.html", 1, createdAtUtc),
            CreateElementDefinition(group, "mental_health_concerns", "Concerns About Mental Health", "yes-no", "json", "AF Printed Page 13.html", 2, createdAtUtc),
            CreateElementDefinition(group, "mental_health_professional_engagement", "Seen or Seeing a Mental Health Professional", "yes-no", "json", "AF Printed Page 13.html", 3, createdAtUtc),
            CreateElementDefinition(group, "history_of_psychiatric_care", "History of Psychiatric Care", "yes-no", "json", "AF Printed Page 13.html", 4, createdAtUtc),
            CreateElementDefinition(group, "history_of_self_harm_or_suicidal_thoughts", "History of Self Harm or Suicidal Thoughts", "yes-no", "json", "AF Printed Page 13.html", 5, createdAtUtc),
            CreateElementDefinition(group, "mood_last_month", "Mood Over the Last Month", "single-choice", "json", "AF Printed Page 13.html", 6, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("very_low", "Very low"),
                ("low", "Low"),
                ("reasonable", "Reasonable"),
                ("good", "Good")
            })),
            CreateElementDefinition(group, "mental_health_details", "Mental Health Details", "textarea", "json", "AF Printed Page 13.html", 7, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000))
        };
    }

    private static IEnumerable<ElementDefinition> BuildSafetyDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "current_relationship_safety", "Feels Safe in Current Relationship", "yes-no", "json", "AF Printed Page 14.html", 1, createdAtUtc),
            CreateElementDefinition(group, "history_of_abuse", "History of Physical / Mental / Sexual Abuse", "yes-no", "json", "AF Printed Page 14.html", 2, createdAtUtc),
            CreateElementDefinition(group, "domestic_violence_details", "Domestic Violence Details", "textarea", "json", "AF Printed Page 14.html", 3, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000)),
            CreateElementDefinition(group, "probation_service_engagement", "Engaged With Probation Services", "yes-no", "json", "AF Printed Page 14.html", 4, createdAtUtc),
            CreateElementDefinition(group, "custodial_sentence_history", "History of Custodial Sentence", "yes-no", "json", "AF Printed Page 14.html", 5, createdAtUtc),
            CreateElementDefinition(group, "pending_court_cases", "Pending Court Cases", "yes-no", "json", "AF Printed Page 14.html", 6, createdAtUtc),
            CreateElementDefinition(group, "has_solicitor", "Has a Solicitor", "yes-no", "json", "AF Printed Page 14.html", 7, createdAtUtc),
            CreateElementDefinition(group, "justice_details", "Justice Details", "textarea", "json", "AF Printed Page 14.html", 8, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000)),
            CreateElementDefinition(group, "behaviour_impacting_treatment_plan", "Behaviour May Impact Treatment Plan", "yes-no", "json", "AF Printed Page 14.html", 9, createdAtUtc),
            CreateElementDefinition(group, "health_and_safety_details", "Health and Safety Details", "textarea", "json", "AF Printed Page 14.html", 10, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000)),
            CreateElementDefinition(group, "additional_comments_needed", "Additional Comments Required", "yes-no", "json", "AF Printed Page 14.html", 11, createdAtUtc),
            CreateElementDefinition(group, "additional_comments_details", "Additional Comments Details", "textarea", "json", "AF Printed Page 14.html", 12, createdAtUtc, fieldConfigJson: BuildElementFieldConfig(max: 2000))
        };
    }

    private static IEnumerable<ElementDefinition> BuildHappinessScaleDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "happiness_scale_matrix", "Happiness Scale Matrix", "matrix/rating", "json", "AF Printed Page 15.html", 1, createdAtUtc, "Current happiness over the last 30 days across HSE-defined domains.", "Low numbers indicate lower happiness; high numbers indicate greater happiness.", fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("confidence_in_self", "Confidence in self"),
                ("mental_health_and_happiness", "Mental health and happiness"),
                ("job_role", "Job/role"),
                ("social_life", "Social life"),
                ("physical_health", "Physical health"),
                ("inner_peace", "Inner peace"),
                ("relationships", "Relationships"),
                ("family", "Family"),
                ("legal_issues", "Legal issues"),
                ("appearance_life", "Appearance / life"),
                ("communication_skills", "Communication Skills"),
                ("housing", "Housing"),
                ("spirituality", "Spirituality"),
                ("other", "Other (be specific)")
            }))
        };
    }

    private static IEnumerable<ElementDefinition> BuildAssessorActionDefinitions(ElementGroup group, DateTime createdAtUtc)
    {
        return new[]
        {
            CreateElementDefinition(group, "assessor_actions_required", "Assessor Actions Required", "checklist", "json", "AF Printed Page 15.html", 1, createdAtUtc, "Checklist of actions required after initial assessment.", fieldConfigJson: BuildElementFieldConfig(options: new[]
            {
                ("child_protection_referral", "Children First / Child Protection / social work referral"),
                ("medical_assessment", "Medical assessment"),
                ("psychiatric_assessment", "Psychiatric assessment"),
                ("multi_agency_meeting", "Multi-agency meeting or review"),
                ("opiate_substitution_protocols", "Progress to opiate substitution protocols"),
                ("register_screening_service", "Register with National Screening Service"),
                ("homeless_action_team", "Referral to a homeless Action Team"),
                ("key_work_other_service", "Key work engagement from other service provider"),
                ("other_action", "Other action (e.g. placement on waiting list)")
            })),
            CreateElementDefinition(group, "key_work_other_service_details", "Key Work Other Service Details", "text", "json", "AF Printed Page 15.html", 2, createdAtUtc),
            CreateElementDefinition(group, "comprehensive_assessment_needed", "Comprehensive Assessment Needed", "yes-no", "json", "AF Printed Page 15.html", 3, createdAtUtc),
            CreateElementDefinition(group, "comprehensive_assessment_arranged", "Comprehensive Assessment Arranged", "yes-no", "json", "AF Printed Page 15.html", 4, createdAtUtc)
        };
    }

    private static void SeedTherapyTopics(ModelBuilder modelBuilder)
    {
        var topics = new[]
        {
            ("RELAPSE_PREVENTION", "Relapse Prevention"),
            ("COPING_SKILLS", "Coping Skills"),
            ("TRIGGERS_AND_CRAVINGS", "Triggers and Cravings"),
            ("TOPIC_04", "Topic 4 (TBD)"),
            ("TOPIC_05", "Topic 5 (TBD)"),
            ("TOPIC_06", "Topic 6 (TBD)"),
            ("TOPIC_07", "Topic 7 (TBD)"),
            ("TOPIC_08", "Topic 8 (TBD)"),
            ("TOPIC_09", "Topic 9 (TBD)"),
            ("TOPIC_10", "Topic 10 (TBD)")
        };

        var seededTopics = topics.Select(topic => new TherapyTopic
        {
            Id = CreateDeterministicGuid($"therapy-topic:{topic.Item1}"),
            Code = topic.Item1,
            DefaultName = topic.Item2,
            IsActive = true
        });

        modelBuilder.Entity<TherapyTopic>().HasData(seededTopics);
    }

    private static void SeedEpisodeEventTypes(ModelBuilder modelBuilder)
    {
        var eventTypes = Enum.GetValues<EpisodeEventType>()
            .Select(eventType => new EpisodeEventTypeLookup
            {
                Id = (int)eventType,
                Code = eventType.ToString().ToUpperInvariant(),
                DefaultName = eventType.ToString(),
                IsActive = true
            });

        modelBuilder.Entity<EpisodeEventTypeLookup>().HasData(eventTypes);
    }

    private static void SeedIncidentTypes(ModelBuilder modelBuilder)
    {
        var incidentTypes = new[]
        {
            new IncidentType { Id = 1, Code = "BEHAVIOURAL_INCIDENT", DefaultName = "Behavioural incident", IsActive = true },
            new IncidentType { Id = 2, Code = "MEDICAL_ISSUE", DefaultName = "Medical issue", IsActive = true },
            new IncidentType { Id = 3, Code = "SMOKING_BREACH", DefaultName = "Smoking in non-designated area", IsActive = true },
            new IncidentType { Id = 4, Code = "BOUNDARY_BREACH", DefaultName = "Boundary breach", IsActive = true },
            new IncidentType { Id = 5, Code = "FIRE_ALARM", DefaultName = "Fire alarm", IsActive = true }
        };

        modelBuilder.Entity<IncidentType>().HasData(incidentTypes);
    }

    private static Guid CreateDeterministicGuid(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        var hash = MD5.HashData(bytes);
        return new Guid(hash);
    }

    private static string BuildCentreEpisodeCode(string centreCode, int year, int weekNumber, int entrySequence)
    {
        return $"{centreCode}-{year}W{weekNumber:00}-{entrySequence:000}";
    }

    private static string BuildResidentSecondaryKey(string centreCode, string unitCode, int year, int weekNumber, int residentNumber)
    {
        return $"{centreCode}-{unitCode}-{year:00}-{weekNumber:00}-{residentNumber:00}";
    }

    private static string BuildResidentPhotoUrl(int residentNumber)
    {
        var avatarNumber = ((residentNumber - 1) % 70) + 1;
        return $"https://i.pravatar.cc/300?img={avatarNumber}";
    }

    private static void SeedScreeningControls(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ScreeningControl>().HasData(
            new ScreeningControl
            {
                Id = DefaultScreeningControlId,
                UnitCode = "alcohol",
                UnitName = "Alcohol Unit",
                UnitCapacity = 120,
                CurrentOccupancy = 92,
                CapacityWarningThreshold = 96,
                CallLogsCacheSeconds = 15,
                EvaluationQueueCacheSeconds = 30,
                LocalizationCacheSeconds = 300,
                EnableClientCacheOverride = true,
                UpdatedAt = SeedCreatedAt
            });
    }
}


