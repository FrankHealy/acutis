using Acutis.Domain.Entities;
using Acutis.Domain.Lookups;
using Acutis.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Acutis.Infrastructure.Data;

public sealed class AcutisDbContext : DbContext
{
    private static readonly DateTime SeedCreatedAt = new(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc);

    private const string ScreeningFormCode = "alcohol_screening_call";
    private static readonly Guid ScreeningFormId = Guid.Parse("ed6af9de-1397-41f6-b165-b11b5d426f90");
    private static readonly Guid ScreeningFormV2Id = Guid.Parse("9ed5438e-70f7-4567-a8f6-b8402b645a69");
    private static readonly Guid ScreeningFormV3Id = Guid.Parse("1159096f-504f-4892-bcce-b4e3245a99ab");
    private static readonly Guid ScreeningFormV4Id = Guid.Parse("e17d8a7c-9c8f-4ea9-b13a-b43dc6f8f028");
    private static readonly Guid ReferralSourceOptionSetId = Guid.Parse("20745f28-8b1d-4b28-bafb-4c8a89ca7bc5");
    private static readonly Guid DrinkTypeOptionSetId = Guid.Parse("5215043d-b92f-47c8-9650-f39f4f9fd7ca");
    private static readonly Guid GpOptionItemId = Guid.Parse("4cdab4a6-537f-42dd-a88d-5cc04c4e9d03");
    private static readonly Guid FamilyOptionItemId = Guid.Parse("4167ea3e-95e1-4578-8dbf-1b04af0f87ce");
    private static readonly Guid SelfOptionItemId = Guid.Parse("6f2838eb-16ca-41c0-bb69-0bc6e7ba93f9");
    private static readonly Guid OtherOptionItemId = Guid.Parse("838674f5-05c6-4422-9515-6f92907f0963");
    private static readonly Guid DrinkTypeBeerOptionItemId = Guid.Parse("7d71172d-38bf-46fd-b4ec-8258ab2bf389");
    private static readonly Guid DrinkTypeWineOptionItemId = Guid.Parse("8f5ef9ba-3853-48f9-9f8a-dd99f6ebf5f4");
    private static readonly Guid DrinkTypeSpiritsOptionItemId = Guid.Parse("44f81460-88f7-4d58-9fd2-2f86f9f55f3d");
    private static readonly Guid DrinkTypeCiderOptionItemId = Guid.Parse("7a607ff4-0a82-4402-a85a-4b8ed64d09c0");
    private static readonly Guid DrinkTypeOtherOptionItemId = Guid.Parse("1f0fca56-5f9a-49a5-b4df-3f8c7f413d32");
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
            "housingStatus": "input",
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
            "phoneNumber": { "type": "string", "minLength": 8, "maxLength": 20, "pattern": "^[+0-9()\\-\\s]+$", "format": "phone" },
            "emailAddress": { "type": "string", "maxLength": 120, "format": "email" },
            "age": { "type": "integer", "minimum": 16, "maximum": 120 },
            "drinkType": { "type": "enum", "optionSetKey": "drink_type" },
            "drinkTypeOther": { "type": "string", "maxLength": 80 },
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
          "required": [ "callerName", "phoneNumber", "age", "drinkType", "drinksPerDay", "referralSource" ]
        }
        """;

    private const string UiJsonV4 = """
        {
          "sections": [
            { "titleKey": "screening.section.caller_details", "items": [ "callerName", "phoneNumber", "emailAddress", "age" ] },
            { "titleKey": "screening.section.alcohol_use", "items": [ "drinkType", "drinksPerDay", "drinkTypeOther", "daysDrinkingPerWeek", "lastDrinkDate", "withdrawalHistory", "historyOfSeizures", "referralSource" ] },
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

    private const string RulesJsonV4 = """
        [
          {
            "if": { "field": "drinkType", "equals": "other" },
            "then": { "show": [ "drinkTypeOther" ], "enable": [ "drinkTypeOther" ] },
            "else": { "hide": [ "drinkTypeOther" ], "disable": [ "drinkTypeOther" ], "clear": [ "drinkTypeOther" ] }
          }
        ]
        """;

    public AcutisDbContext(DbContextOptions<AcutisDbContext> options)
        : base(options)
    {
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        IncrementLookupTypeVersions();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        IncrementLookupTypeVersions();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
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
    public DbSet<GroupTherapySubjectTemplate> GroupTherapySubjectTemplates => Set<GroupTherapySubjectTemplate>();
    public DbSet<GroupTherapyDailyQuestion> GroupTherapyDailyQuestions => Set<GroupTherapyDailyQuestion>();
    public DbSet<GroupTherapyResidentRemark> GroupTherapyResidentRemarks => Set<GroupTherapyResidentRemark>();
    public DbSet<TherapyTopic> TherapyTopics => Set<TherapyTopic>();
    public DbSet<ResidentProgrammeEpisode> ResidentProgrammeEpisodes => Set<ResidentProgrammeEpisode>();
    public DbSet<WeeklyTherapyRun> WeeklyTherapyRuns => Set<WeeklyTherapyRun>();
    public DbSet<ResidentWeeklyTherapyAssignment> ResidentWeeklyTherapyAssignments => Set<ResidentWeeklyTherapyAssignment>();
    public DbSet<TherapyTopicCompletion> TherapyTopicCompletions => Set<TherapyTopicCompletion>();
    public DbSet<EpisodeEvent> EpisodeEvents => Set<EpisodeEvent>();
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
        modelBuilder.ApplyConfiguration(new GroupTherapySubjectTemplateConfiguration());
        modelBuilder.ApplyConfiguration(new GroupTherapyDailyQuestionConfiguration());
        modelBuilder.ApplyConfiguration(new GroupTherapyResidentRemarkConfiguration());
        modelBuilder.ApplyConfiguration(new TherapyTopicConfiguration());
        modelBuilder.ApplyConfiguration(new ResidentProgrammeEpisodeConfiguration());
        modelBuilder.ApplyConfiguration(new WeeklyTherapyRunConfiguration());
        modelBuilder.ApplyConfiguration(new ResidentWeeklyTherapyAssignmentConfiguration());
        modelBuilder.ApplyConfiguration(new TherapyTopicCompletionConfiguration());
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
        SeedGroupTherapyProgram(modelBuilder);
        SeedGroupTherapyRemarks(modelBuilder);
        SeedTherapyTopics(modelBuilder);
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
                CurrentOccupancy = 92,
                CapacityWarningThreshold = 96,
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
        var residentSeeds = new (string FirstName, string Surname, int WeekNumber, string RoomNumber, string Nationality)[]
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

        var residents = residentSeeds.Select((resident, index) =>
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
                PhotoUrl = null,
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

        var episodes = residents.Select((resident, index) => new ResidentProgrammeEpisode
        {
            Id = CreateDeterministicGuid($"episode:{resident.Id:D}"),
            ResidentId = resident.Id,
            CentreId = BrureeCentreId,
            UnitId = DetoxUnitId,
            StartDate = new DateOnly(2026, 1, 5),
            EndDate = null,
            ProgrammeType = ProgrammeType.Alcohol,
            CurrentWeekNumber = residentSeeds[index].WeekNumber,
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

        var assignments = residents.SelectMany((resident, residentIndex) =>
            Enumerable.Range(0, 12).Select(weekOffset => new ResidentWeeklyTherapyAssignment
            {
                Id = CreateDeterministicGuid($"resident-weekly-assignment:{resident.Id:D}:{weekOffset + 1:00}"),
                ResidentId = resident.Id,
                EpisodeId = episodes[residentIndex].Id,
                WeekStartDate = new DateOnly(2026, 1, 5).AddDays(weekOffset * 7),
                TherapyTopicId = CreateDeterministicGuid($"therapy-topic:{topicCodes[weekOffset]}"),
                AssignmentSource = AssignmentSource.Auto,
                OverrideReason = null,
                SupersedesAssignmentId = null,
                CreatedAt = SeedCreatedAt.AddDays(weekOffset),
                CreatedByUserId = CreateDeterministicGuid("system:seed")
            }));

        modelBuilder.Entity<Resident>().HasData(residents);
        modelBuilder.Entity<ResidentProgrammeEpisode>().HasData(episodes);
        modelBuilder.Entity<ResidentWeeklyTherapyAssignment>().HasData(assignments);
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
            new TextResource { Key = "screening.field.drinks_per_day.label", DefaultText = "Drinks Per Day (for selected type)" },
            new TextResource { Key = "screening.field.drinks_per_day.help", DefaultText = "Approximate average on drinking days." },
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
            new TextResource { Key = "app.brand", DefaultText = "Acutis" },
            new TextResource { Key = "app.centre.bruree", DefaultText = "Bruree Treatment Center" },
            new TextResource { Key = "header.capacity", DefaultText = "Capacity" },
            new TextResource { Key = "header.current_time", DefaultText = "Current Time" },
            new TextResource { Key = "header.signed_in_as", DefaultText = "Signed in as" },
            new TextResource { Key = "header.login_different_user", DefaultText = "Log in as different user" },
            new TextResource { Key = "header.logout", DefaultText = "Log out" },
            new TextResource { Key = "screening.tab.calls", DefaultText = "Call Logging" },
            new TextResource { Key = "screening.tab.evaluation", DefaultText = "Evaluation" },
            new TextResource { Key = "screening.tab.scheduling", DefaultText = "Scheduling" },
            new TextResource { Key = "evaluation.queue.title", DefaultText = "Evaluation Queue" },
            new TextResource { Key = "evaluation.stats.pending", DefaultText = "Pending" },
            new TextResource { Key = "evaluation.stats.in_progress", DefaultText = "In Progress" },
            new TextResource { Key = "evaluation.stats.scheduled", DefaultText = "Scheduled" },
            new TextResource { Key = "evaluation.stats.completed", DefaultText = "Completed" },
            new TextResource { Key = "evaluation.table.surname", DefaultText = "Surname" },
            new TextResource { Key = "evaluation.table.name", DefaultText = "Name" },
            new TextResource { Key = "evaluation.table.unit", DefaultText = "Unit" },
            new TextResource { Key = "evaluation.table.last_call_date", DefaultText = "Last Call Date" },
            new TextResource { Key = "evaluation.table.num_calls", DefaultText = "Num Calls" },
            new TextResource { Key = "evaluation.table.status", DefaultText = "Status" },
            new TextResource { Key = "evaluation.table.action", DefaultText = "Action" },
            new TextResource { Key = "evaluation.action.view", DefaultText = "View" },
            new TextResource { Key = "evaluation.modal.subtitle", DefaultText = "Phone Evaluation" },
            new TextResource { Key = "evaluation.loading.queue", DefaultText = "Loading evaluation queue..." },
            new TextResource { Key = "evaluation.empty.queue", DefaultText = "No evaluation candidates available." },
            new TextResource { Key = "evaluation.loading.form", DefaultText = "Loading evaluation form..." },
            new TextResource { Key = "evaluation.empty.form", DefaultText = "No evaluation form available." },
            new TextResource { Key = "evaluation.status.pending", DefaultText = "Pending" },
            new TextResource { Key = "evaluation.status.in_progress", DefaultText = "In Progress" },
            new TextResource { Key = "evaluation.status.scheduled", DefaultText = "Scheduled" },
            new TextResource { Key = "evaluation.status.completed", DefaultText = "Completed" });

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
            new TextTranslation { Id = TrDrinksPerDayLabelEn, Key = "screening.field.drinks_per_day.label", Locale = "en-IE", Text = "Drinks Per Day (for selected type)" },
            new TextTranslation { Id = TrDrinksPerDayLabelGa, Key = "screening.field.drinks_per_day.label", Locale = "ga-IE", Text = "Deochanna sa Lá" },
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
            new TextTranslation { Id = Guid.Parse("9e0ddd4f-3339-46e1-8ab8-d485be7fca8d"), Key = "screening.field.currently_unsafe.label", Locale = "en-IE", Text = "Is immediate concern?" },
            new TextTranslation { Id = Guid.Parse("66f4f9bf-1f15-4c9f-a59f-317b0b7c4f19"), Key = "screening.field.history_of_seizures.label", Locale = "en-IE", Text = "Has seizure history?" },
            new TextTranslation { Id = Guid.Parse("9f306145-c17e-4234-ae46-aaf8e22c6205"), Key = "screening.field.drink_type.label", Locale = "en-IE", Text = "Drink Type" },
            new TextTranslation { Id = Guid.Parse("53f00dd8-5fc4-45f5-afeb-21d68eeb4228"), Key = "screening.field.drink_type_other.label", Locale = "en-IE", Text = "If other, specify drink type" },
            new TextTranslation { Id = Guid.Parse("59229ca1-a056-4f56-b6f4-c72ef1906e63"), Key = "screening.options.drink_type.beer", Locale = "en-IE", Text = "Beer" },
            new TextTranslation { Id = Guid.Parse("886f313a-d179-4f6d-a1c6-d00de9cb1521"), Key = "screening.options.drink_type.wine", Locale = "en-IE", Text = "Wine" },
            new TextTranslation { Id = Guid.Parse("bf9ac4ba-c73e-45f4-af54-b0e56f5addfe"), Key = "screening.options.drink_type.spirits", Locale = "en-IE", Text = "Spirits" },
            new TextTranslation { Id = Guid.Parse("ea12f2ff-b9de-4f6d-a237-3f68f812283b"), Key = "screening.options.drink_type.cider", Locale = "en-IE", Text = "Cider" },
            new TextTranslation { Id = Guid.Parse("7694c676-287f-4509-969e-c8de65c89a0d"), Key = "screening.options.drink_type.other", Locale = "en-IE", Text = "Other" },
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
            new TextTranslation { Id = Guid.Parse("ba5e6e98-0488-4f2c-b73f-bcb2f2aa7574"), Key = "screening.field.drinks_per_day.label", Locale = "ar", Text = "عدد المشروبات يوميا (حسب النوع)" },
            new TextTranslation { Id = Guid.Parse("1e7f1d6c-bdb5-4e89-90e2-970336aeb586"), Key = "screening.field.withdrawal_history.label", Locale = "ar", Text = "هل لديه تاريخ أعراض انسحاب؟" },
            new TextTranslation { Id = Guid.Parse("e9abb6e3-58b1-4171-85dc-0fec30ff6a2c"), Key = "screening.field.history_of_seizures.label", Locale = "ar", Text = "هل لديه تاريخ نوبات صرع؟" },
            new TextTranslation { Id = Guid.Parse("2f88fd06-b8bd-4d8c-b744-0c0591f45a99"), Key = "screening.field.currently_unsafe.label", Locale = "ar", Text = "هل توجد خطورة فورية؟" },
            new TextTranslation { Id = Guid.Parse("3b977d28-f3d9-4766-8ffb-573df38cbeb4"), Key = "evaluation.queue.title", Locale = "ar", Text = "قائمة التقييم" },
            new TextTranslation { Id = Guid.Parse("1c25f5e8-cc6d-4ae2-8475-b4591bce426c"), Key = "evaluation.stats.pending", Locale = "ar", Text = "قيد الانتظار" },
            new TextTranslation { Id = Guid.Parse("887273d1-9f36-4af0-b8c8-20006830b54d"), Key = "evaluation.stats.in_progress", Locale = "ar", Text = "قيد التنفيذ" },
            new TextTranslation { Id = Guid.Parse("95f3a857-7c59-4eef-a6ca-8e1ca02610e2"), Key = "evaluation.stats.scheduled", Locale = "ar", Text = "مجدول" },
            new TextTranslation { Id = Guid.Parse("4556f72e-ebce-4a18-b61d-fd614b43f78f"), Key = "evaluation.stats.completed", Locale = "ar", Text = "مكتمل" },
            new TextTranslation { Id = Guid.Parse("61685d4e-6ef8-4477-95f5-77ff4ab690d4"), Key = "evaluation.table.surname", Locale = "ar", Text = "اللقب" },
            new TextTranslation { Id = Guid.Parse("f58fca32-e6d6-4ea1-a81e-c52ca3108e04"), Key = "evaluation.table.name", Locale = "ar", Text = "الاسم" },
            new TextTranslation { Id = Guid.Parse("86ef317b-1afd-4714-a620-6f81d174ec0a"), Key = "evaluation.table.unit", Locale = "ar", Text = "الوحدة" },
            new TextTranslation { Id = Guid.Parse("5701e3ea-fec4-4f5c-ab4a-f75c1e23a334"), Key = "evaluation.table.last_call_date", Locale = "ar", Text = "تاريخ آخر مكالمة" },
            new TextTranslation { Id = Guid.Parse("6ad7f2dd-0c03-4bb8-a398-f00f80518f95"), Key = "evaluation.table.num_calls", Locale = "ar", Text = "عدد المكالمات" },
            new TextTranslation { Id = Guid.Parse("a2f1f7ee-f45c-4ca9-a233-ce6197f09d48"), Key = "evaluation.table.status", Locale = "ar", Text = "الحالة" },
            new TextTranslation { Id = Guid.Parse("c2727290-34ec-4a5d-9c78-cfca7191d2de"), Key = "evaluation.table.action", Locale = "ar", Text = "إجراء" },
            new TextTranslation { Id = Guid.Parse("cc93ab8e-7c97-46c5-8ee4-e85ce391f3ff"), Key = "evaluation.action.view", Locale = "ar", Text = "عرض" },
            new TextTranslation { Id = Guid.Parse("cd374ce7-c9be-40ac-a8de-157e1f5ef8a6"), Key = "evaluation.modal.subtitle", Locale = "ar", Text = "تقييم هاتفي" },
            new TextTranslation { Id = Guid.Parse("697d0e4f-4fd8-4978-aebd-f19a5fbd7d2f"), Key = "evaluation.loading.queue", Locale = "ar", Text = "جار تحميل قائمة التقييم..." },
            new TextTranslation { Id = Guid.Parse("3194c14a-e73f-4fbe-8f3f-5b17445bd128"), Key = "evaluation.empty.queue", Locale = "ar", Text = "لا توجد حالات تقييم متاحة." },
            new TextTranslation { Id = Guid.Parse("fd2bf3bf-8c66-4422-b965-c8ca1f4f74d8"), Key = "evaluation.loading.form", Locale = "ar", Text = "جار تحميل نموذج التقييم..." },
            new TextTranslation { Id = Guid.Parse("f022f542-c0af-4339-a85a-f1c840b4ac4a"), Key = "evaluation.empty.form", Locale = "ar", Text = "لا يوجد نموذج تقييم متاح." },
            new TextTranslation { Id = Guid.Parse("060098f3-091e-426c-a6a7-4d2bffb09ff8"), Key = "evaluation.status.pending", Locale = "ar", Text = "قيد الانتظار" },
            new TextTranslation { Id = Guid.Parse("f66d9b1d-3871-4cd2-b15e-e100db7c9b3f"), Key = "evaluation.status.in_progress", Locale = "ar", Text = "قيد التنفيذ" },
            new TextTranslation { Id = Guid.Parse("dbbd3650-7578-48eb-8ff1-850f4494de2c"), Key = "evaluation.status.scheduled", Locale = "ar", Text = "مجدول" },
            new TextTranslation { Id = Guid.Parse("7f1f55d9-6d09-4075-9d6b-c54c14490515"), Key = "evaluation.status.completed", Locale = "ar", Text = "مكتمل" });
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

    private static Guid CreateDeterministicGuid(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        var hash = MD5.HashData(bytes);
        return new Guid(hash);
    }

    private static string BuildResidentSecondaryKey(string centreCode, string unitCode, int year, int weekNumber, int residentNumber)
    {
        return $"{centreCode}-{unitCode}-{year:00}-{weekNumber:00}-{residentNumber:00}";
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


