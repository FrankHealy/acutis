"use client";

import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  Callout,
  ChecklistGrid,
  ChecklistRow,
  CrossImpacts,
  GroupTitle,
  LinedField,
  LinedTextBlock,
  PrintPage,
  printStyles as styles,
  SectionBanner,
  ServicesTable,
  YesNo,
  readString,
  type Answers,
} from "./PrintPrimitives";

const FORM = "hse_extended_assessment";

type DomainField = { key: string; label: string; kind: "bool" | "text" };

type DomainSection = {
  section: string;
  titleKey: string;
  fields: DomainField[];
  crossImpacts: { substanceLabel: string; housingLabel: string } | null;
};

const DOMAIN_SECTIONS: DomainSection[] = [
  {
    section: "drug_and_alcohol_use",
    titleKey: "2. Drug & Alcohol Use and Other Addictions Such as Gambling",
    crossImpacts: null,
    fields: [
      { key: "has_substance_use_changes_since_initial", kind: "bool", label: "Have there been any changes in your drug and/or alcohol use since you completed your Initial Assessment?" },
      { key: "substance_use_changes_description", kind: "text", label: "Please describe what changes have occurred since the Initial Assessment" },
      { key: "current_needs_in_relation_to_use", kind: "text", label: "What are your needs in relation to your drug or alcohol use?" },
      { key: "has_other_addiction_changes_since_initial", kind: "bool", label: "Have there been any changes to any other addiction (e.g. gambling) since you completed your Initial Assessment?" },
      { key: "other_addiction_changes_description", kind: "text", label: "What services are currently or most recently involved in your drug or alcohol (or other addiction) use?" },
    ],
  },
  {
    section: "physical_health",
    titleKey: "3. Physical Health",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your physical health, or vice versa?",
      housingLabel: "Does your housing situation affect your physical health, or vice versa?",
    },
    fields: [
      { key: "has_physical_health_changes_since_initial", kind: "bool", label: "Have there been any changes to your physical health since you completed your Initial Assessment?" },
      { key: "physical_health_changes_description", kind: "text", label: "If so, please update the Initial Assessment and describe what changes have occurred" },
      { key: "physical_health_diagnosis_or_disability_description", kind: "text", label: "Have you any physical health diagnosis or disability? Please describe" },
      { key: "sees_need_for_making_medical_appointments", kind: "text", label: "Would you see a need for making medical appointments?" },
      { key: "has_sexual_wellbeing_changes_since_initial", kind: "bool", label: "Have there been any changes to your sexual wellbeing since you completed your Initial Assessment?" },
      { key: "sexual_wellbeing_changes_description", kind: "text", label: "If so, please update the Initial Assessment and describe what changes have occurred" },
    ],
  },
  {
    section: "mental_health",
    titleKey: "4. Mental Health",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your mental health, or vice versa?",
      housingLabel: "Does your housing situation affect your mental health, or vice versa?",
    },
    fields: [
      { key: "has_mental_health_changes_since_initial", kind: "bool", label: "Have there been any changes to your mental health since you completed your Initial Assessment?" },
      { key: "mental_health_changes_description", kind: "text", label: "If so, please update the Initial Assessment and describe what changes have occurred" },
      { key: "has_mental_health_concerns", kind: "text", label: "Have you any concerns regarding your mental health?" },
      { key: "treatment_received_for_diagnosis_or_condition", kind: "text", label: "Describe the treatment you are receiving for this diagnosis or condition" },
      { key: "has_mental_health_diagnosis_or_condition", kind: "text", label: "Have you got a mental health diagnosis or condition?" },
      { key: "sees_need_for_discussing_with_gp_mental_health_service_appointment", kind: "text", label: "Would you see the need for discussing with your GP about making an appointment?" },
    ],
  },
  {
    section: "family_and_relationships",
    titleKey: "5. Family and Relationships",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your relationships or family, or vice versa?",
      housingLabel: "Does your housing situation affect your relationships or family, or vice versa?",
    },
    fields: [
      { key: "has_family_or_relationship_changes_since_initial", kind: "bool", label: "Have there been any changes to your family/relationships circumstances since you completed your Initial Assessment?" },
      { key: "family_or_relationship_changes_description", kind: "text", label: "If so, please describe what changes have occurred" },
      { key: "who_did_you_grow_up_with_in_family", kind: "text", label: "Who did you grow up with in your family?" },
      { key: "currently_who_are_supportive_people_in_life", kind: "text", label: "Currently, who are the supportive people in your life?" },
      { key: "friend_or_family_member_to_involve_in_care_plan_details", kind: "text", label: "Is there a friend or family member you would like to be involved in your care plan? Details" },
      { key: "relationships_posing_risk_to_self_or_care_plan", kind: "text", label: "Are there any relationships which pose a risk to you or others or your care plan?" },
      { key: "concerns_with_regards_to_significant_relationship", kind: "text", label: "Have you any concerns with regards to your significant relationship? (e.g. domestic violence, substance use, criminal activity etc.)" },
      { key: "sees_need_for_attending_support_service_for_relationships", kind: "text", label: "Would you see a need for attending a support service for your relationships?" },
    ],
  },
  {
    section: "child_welfare",
    titleKey: "6. Child Welfare",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your children, or vice versa?",
      housingLabel: "Does your housing situation affect your children, or vice versa?",
    },
    fields: [
      { key: "has_significant_change_in_relation_to_children_since_initial", kind: "bool", label: "Has there been any significant change in relation to your children since you completed your Initial Assessment?" },
      { key: "significant_change_in_relation_to_children_description", kind: "text", label: "If so, please update the Initial Assessment and describe what changes have occurred" },
      { key: "relationships_posing_risk_to_children", kind: "text", label: "Are there any relationships which pose a risk to your children (including current partner)?" },
      { key: "behaviours_posing_risk_to_children", kind: "text", label: "Are there any behaviours which pose a risk to your children?" },
      { key: "sees_need_for_availing_of_family_support", kind: "text", label: "Would you see the need for availing of family support?" },
    ],
  },
  {
    section: "legal_and_offending_behaviour",
    titleKey: "7. Legal/Offending Behaviour Issues",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your legal situation/offending behaviour, or vice versa?",
      housingLabel: "Does your housing situation affect your legal situation/offending behaviour, or vice versa?",
    },
    fields: [
      { key: "has_legal_or_offending_behaviour_changes_since_initial", kind: "bool", label: "Have there been any changes to your legal/offending behaviour issues since you completed your Initial Assessment?" },
      { key: "legal_or_offending_behaviour_changes_description", kind: "text", label: "If so, please update the Initial Assessment and describe what changes have occurred" },
      { key: "has_current_or_suspected_outstanding_charges", kind: "bool", label: "Do you have current (or suspected) outstanding charges?" },
      { key: "outstanding_charges_details", kind: "text", label: "Details" },
      { key: "has_current_or_suspected_arrest_warrants", kind: "bool", label: "Do you have current (or suspected) arrest warrants?" },
      { key: "arrest_warrants_details", kind: "text", label: "Details" },
      { key: "has_upcoming_court_dates", kind: "bool", label: "Do you have upcoming court dates?" },
      { key: "upcoming_court_dates_details", kind: "text", label: "Details" },
      { key: "most_serious_charge_to_date", kind: "text", label: "What is your most serious charge to date?" },
      { key: "has_spent_time_in_prison", kind: "bool", label: "Have you spent time in prison?" },
      { key: "prison_time_details", kind: "text", label: "If so, please describe" },
      { key: "has_history_of_sexual_assault_arson_firearms_or_weapons_charges", kind: "bool", label: "Have you any history of sexual assault, arson, firearms or other weapons charges?" },
      { key: "weapons_or_assault_charges_details", kind: "text", label: "Details" },
    ],
  },
  {
    section: "financial_issues",
    titleKey: "8. Financial Issues",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your finances, or vice versa?",
      housingLabel: "Does your housing situation affect your finances, or vice versa?",
    },
    fields: [
      { key: "has_current_financial_needs_concerns_or_stressors", kind: "text", label: "Do you have any current financial needs, or financial concerns or stressors?" },
      { key: "has_current_debts", kind: "text", label: "Do you have any current debts?" },
      { key: "is_in_receipt_of_social_welfare_payment", kind: "bool", label: "Are you in receipt of social welfare payment?" },
      { key: "social_welfare_payment_details", kind: "text", label: "Please give details" },
      { key: "has_any_problems_claiming", kind: "text", label: "Do you have any problems claiming?" },
    ],
  },
  {
    section: "hobbies_interests_and_social_supports",
    titleKey: "9. Hobbies/Interests/Social Supports",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your hobbies/interests, or vice versa?",
      housingLabel: "Does your housing situation affect your hobbies/interests, or vice versa?",
    },
    fields: [
      { key: "current_non_substance_hobbies_and_interests", kind: "text", label: "What non-substance using hobbies/interests do you have?" },
      { key: "past_hobbies_and_interests", kind: "text", label: "What hobbies/interests did you have in the past?" },
      { key: "desire_to_develop_new_hobbies_or_social_supports", kind: "text", label: "Would you like to develop a new hobby/interest/social support?" },
      { key: "known_available_non_substance_activities_or_social_supports", kind: "text", label: "What non-substance using activities/social supports are there available to you that you know of?" },
      { key: "attends_fellowship_or_faith_based_support", kind: "text", label: "Do you attend any fellowship (AA, NA etc.) or Faith/Church-based support? Would you like to?" },
      { key: "has_sponsor", kind: "text", label: "Do you have a sponsor?" },
    ],
  },
  {
    section: "education_training_and_employment",
    titleKey: "10. Education/Training/Employment",
    crossImpacts: {
      substanceLabel: "If you drink or use drugs, does it affect your training or employment, or vice versa?",
      housingLabel: "Does your housing situation affect your training or employment, or vice versa?",
    },
    fields: [
      { key: "has_changes_in_training_or_employment_since_initial", kind: "bool", label: "Have there been any changes in your education, training and/or employment situation since you completed your Initial Assessment?" },
      { key: "training_or_employment_changes_description", kind: "text", label: "If so, please update and describe what changes have occurred" },
      { key: "has_completed_any_educational_or_training_courses", kind: "bool", label: "Have you completed any educational or training courses?" },
      { key: "completed_courses_details", kind: "text", label: "Details" },
      { key: "has_any_learning_difficulties_including_reading_and_writing", kind: "bool", label: "Have you any learning difficulties, including reading and writing?" },
      { key: "learning_difficulties_details", kind: "text", label: "Details" },
      { key: "would_like_to_do_more_education_or_training", kind: "bool", label: "Would you like to do more education or training?" },
      { key: "desired_education_or_training_details", kind: "text", label: "Details" },
      { key: "is_unemployed_and_has_been_in_paid_employment_past", kind: "bool", label: "If you are unemployed, have you ever been in paid employment?" },
      { key: "unemployment_and_past_employment_details", kind: "text", label: "Details" },
      { key: "is_interested_in_getting_a_job", kind: "bool", label: "Are you interested in getting a job?" },
      { key: "kind_of_job_interest_details", kind: "text", label: "If so, what kind of job?" },
    ],
  },
];

const INDEPENDENT_LIVING_SKILLS: Array<[string, string]> = [
  ["shopping_support_needed", "Shopping"],
  ["attending_course_or_job_9_to_5_support_needed", "Attending a course or job 9-5, Monday to Friday"],
  ["making_and_remembering_appointments_support_needed", "Making and remembering appointments"],
  ["finding_out_about_and_using_local_services_support_needed", "Finding out about and using local services"],
  ["understanding_tenants_rights_and_obligations_support_needed", "Understanding tenants' rights and obligations"],
  ["caring_for_your_health_support_needed", "Caring for your health"],
  ["living_within_a_budget_support_needed", "Living within a budget"],
  ["paying_rent_and_bills_support_needed", "Paying rent and bills"],
  ["caring_for_your_personal_hygiene_support_needed", "Caring for your personal hygiene"],
  ["laundry_support_needed", "Laundry"],
  ["cooking_or_nutrition_support_needed", "Cooking/nutrition"],
  ["keeping_accommodation_clean_support_needed", "Keeping accommodation clean"],
  ["dealing_with_landlord_or_housing_authorities_support_needed", "Dealing with landlord or housing authorities"],
  ["dealing_with_basic_maintenance_support_needed", "Dealing with basic maintenance e.g. changing light bulbs, fuses etc."],
  ["commitments_seeing_things_through_support_needed", "Commitments i.e. seeing things through to the end"],
  ["dealing_with_loneliness_or_isolation_support_needed", "Dealing with loneliness/isolation"],
  ["dealing_with_difficult_or_stressful_situations_support_needed", "Dealing with difficult/stressful situations"],
  ["filling_your_day_support_needed", "Filling your day"],
  ["managing_your_medication_support_needed", "Managing your medication"],
];

function DomainField({ field, answers, sectionKey }: { field: DomainField; answers: Answers; sectionKey: string }) {
  const fullKey = `${FORM}.${sectionKey}.${field.key}`;
  return field.kind === "bool" ? (
    <YesNo label={field.label} answers={answers} fieldKey={fullKey} />
  ) : (
    <LinedTextBlock label={field.label} answers={answers} fieldKey={fullKey} lines={2} />
  );
}

function DomainSectionPage({ section, answers }: { section: DomainSection; answers: Answers }) {
  return (
    <PrintPage>
      <SectionBanner label={section.titleKey} />
      {section.fields.map((field) => (
        <DomainField key={field.key} field={field} answers={answers} sectionKey={section.section} />
      ))}
      <GroupTitle label="Services Involved" />
      <ServicesTable answers={answers} sectionKey={`${FORM}.${section.section}`} />
      {section.crossImpacts && (
        <CrossImpacts
          answers={answers}
          sectionKey={`${FORM}.${section.section}`}
          substanceLabel={section.crossImpacts.substanceLabel}
          housingLabel={section.crossImpacts.housingLabel}
        />
      )}
    </PrintPage>
  );
}

export default function FullAssessmentPrintTemplate({ answers = {} }: { answers?: Answers }) {
  const { t } = useLocalization();
  const accommodation = `${FORM}.accommodation`;

  return (
    <>
      {/* Cover / front matter */}
      <PrintPage>
        <Callout>[TODO: confirm original wording with source document]</Callout>
        <h1 className={styles.banner} style={{ fontSize: "14pt" }}>
          {t("Comprehensive Assessment and Care Plan")}
        </h1>
        <p style={{ fontWeight: 700 }}>
          {t("The following section looks at areas of your life where you may be having difficulties.")}
        </p>
        <p>
          {t(
            "It is important that these areas are looked at in detail so that together with your case manager, a proper care plan can be put in place."
          )}
        </p>
        <p style={{ color: "#b91c1c", fontStyle: "italic", fontWeight: 600, margin: "8px 0" }}>
          {t("Please ensure Initial Assessment and Consents are up to date before proceeding")}
        </p>
        <p>
          {t(
            "This comprehensive assessment is appropriate for service users who will need more complex needs than one or more services are, or will need to be involved. The assessment will identify what needs you have so as to meet those needs. This comprehensive assessment should be part of an ongoing process and review so as to accommodate these needs as they change over the course of the shared care plan (National Rehabilitation Framework 2010)."
          )}
        </p>

        <GroupTitle label="Comprehensive Assessment Form completed by" />
        <LinedField label="Name of Project" answers={answers} fieldKey={`${FORM}.front_matter.project_name`} />
        <LinedField label="Project Telephone No" answers={answers} fieldKey={`${FORM}.front_matter.project_telephone`} />
        <LinedField label="Referring Agency" answers={answers} fieldKey={`${FORM}.front_matter.referring_agency`} />
        <LinedField label="Date of Assessment" answers={answers} fieldKey={`${FORM}.front_matter.assessment_date`} />

        <GroupTitle label="Other Organisations/Services Involved in Care Provision" />
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("Signed")}</th>
              <th>{t("Service")}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row}>
                <td>{readString(answers, `${FORM}.front_matter.other_organisations.${row}.signed`)}</td>
                <td>{readString(answers, `${FORM}.front_matter.other_organisations.${row}.service`)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <GroupTitle label="Case Management" />
        <YesNo label="Case management needed" answers={answers} fieldKey={`${FORM}.front_matter.case_management.needed`} />
        <YesNo
          label="Case management case conference required"
          answers={answers}
          fieldKey={`${FORM}.front_matter.case_management.conference_required`}
        />
        <LinedField
          label="Case Manager assigned (Name)"
          answers={answers}
          fieldKey={`${FORM}.front_matter.case_management.assigned_manager_name`}
        />
        <LinedField
          label="Case Managed Case Conference (Date)"
          answers={answers}
          fieldKey={`${FORM}.front_matter.case_management.conference_date`}
        />
        <LinedTextBlock
          label="Case manager contacted Key workers / Key Agencies"
          answers={answers}
          fieldKey={`${FORM}.front_matter.case_management.key_workers_contacted`}
        />
      </PrintPage>

      {/* 1. Accommodation */}
      <PrintPage>
        <SectionBanner label="1. Accommodation" />
        <YesNo
          label="Have there been any changes to your housing situation since you completed your Initial Assessment?"
          answers={answers}
          fieldKey={`${accommodation}.has_situation_changes_since_initial`}
        />
        <LinedTextBlock
          label="If so, please update the Initial Assessment and describe what changes have occurred"
          answers={answers}
          fieldKey={`${accommodation}.situation_changes_description`}
        />
        <LinedTextBlock
          label="Describe any needs or concerns you have in relation to current accommodation"
          answers={answers}
          fieldKey={`${accommodation}.current_accommodation_needs_or_concerns`}
        />

        <GroupTitle label="Is your current accommodation situation suitable for" />
        <div className={styles.row}>
          <YesNo label="Children" answers={answers} fieldKey={`${accommodation}.suitability.suitable_for_children`} />
          <YesNo label="Spouse/partner" answers={answers} fieldKey={`${accommodation}.suitability.suitable_for_spouse_or_partner`} />
          <YesNo label="Care plan" answers={answers} fieldKey={`${accommodation}.suitability.suitable_for_care_plan`} />
        </div>

        <LinedTextBlock
          label="Have you any history of involvement with any homeless services?"
          answers={answers}
          fieldKey={`${accommodation}.homeless_services_history_description`}
        />
        <LinedTextBlock
          label="Describe any difficulties you may have had in maintaining housing (this can include any history of eviction)"
          answers={answers}
          fieldKey={`${accommodation}.maintaining_housing_difficulties`}
        />
        <LinedTextBlock
          label="Describe any history of sleeping rough"
          answers={answers}
          fieldKey={`${accommodation}.sleeping_rough_history_description`}
        />
        <YesNo
          label="Have you ever had a local authority tenancy?"
          answers={answers}
          fieldKey={`${accommodation}.has_had_local_authority_tenancy`}
        />
        <LinedField label="If Yes, please give details" answers={answers} fieldKey={`${accommodation}.local_authority_tenancy_details`} />
        <YesNo
          label="Do you currently own, or part own, a house or flat?"
          answers={answers}
          fieldKey={`${accommodation}.currently_owns_or_part_owns_property`}
        />
        <YesNo
          label="Are you registered for social housing?"
          answers={answers}
          fieldKey={`${accommodation}.is_registered_for_social_housing`}
        />
        <LinedField label="Local authority name" answers={answers} fieldKey={`${accommodation}.social_housing_local_authority_name`} />
        <YesNo
          label="Are you currently, or have you previously been, in receipt of HAP or rent supplement?"
          answers={answers}
          fieldKey={`${accommodation}.is_currently_or_past_in_receipt_of_hap_or_rent_supplement`}
        />
        <LinedField label="Details" answers={answers} fieldKey={`${accommodation}.hap_or_rent_supplement_details`} />
        <YesNo
          label="Have any references been made to other housing providers?"
          answers={answers}
          fieldKey={`${accommodation}.has_references_been_made_to_other_housing_providers`}
        />
        <LinedField label="Details" answers={answers} fieldKey={`${accommodation}.other_housing_providers_references_details`} />
      </PrintPage>

      <PrintPage>
        <SectionBanner label="1. Accommodation (continued) — Previous Accommodation History" />
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("Address")}</th>
              <th>{t("Type")}</th>
              <th>{t("Dates (from/to)")}</th>
              <th>{t("Reason for leaving")}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                <td>{readString(answers, `${accommodation}.previous_accommodation_history.${row}.address`)}</td>
                <td>{readString(answers, `${accommodation}.previous_accommodation_history.${row}.type`)}</td>
                <td>{readString(answers, `${accommodation}.previous_accommodation_history.${row}.dates_from_to`)}</td>
                <td>{readString(answers, `${accommodation}.previous_accommodation_history.${row}.reason_for_leaving`)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <GroupTitle label="Services Involved" />
        <ServicesTable answers={answers} sectionKey={accommodation} />

        <div className={styles.avoidBreak}>
          <GroupTitle label="Cross Impacts" />
          <YesNo
            label="Does your drug or alcohol use affect your housing situation, or vice versa?"
            answers={answers}
            fieldKey={`${accommodation}.cross_impacts.substance_use_impacts_housing`}
          />
          <LinedField label="Details" answers={answers} fieldKey={`${accommodation}.cross_impacts.substance_use_impacts_housing_details`} />
        </div>
      </PrintPage>

      {/* Sections 2-10, generically rendered */}
      {DOMAIN_SECTIONS.map((section) => (
        <DomainSectionPage key={section.section} section={section} answers={answers} />
      ))}

      {/* Back matter */}
      <PrintPage>
        <SectionBanner label="Other Residential History" />
        <p>
          {t(
            "If you have lived in any of the list below, you can discuss this with your case manager to help inform your care plan and possibly explore other sources of funding for treatment."
          )}
        </p>
        <div className={styles.row}>
          <YesNo label="Residential Care" answers={answers} fieldKey={`${FORM}.other_residential_history.has_been_in_residential_care`} />
          <YesNo label="Foster Care" answers={answers} fieldKey={`${FORM}.other_residential_history.has_been_in_foster_care`} />
          <YesNo label="Special Needs School" answers={answers} fieldKey={`${FORM}.other_residential_history.has_been_in_special_needs_school`} />
        </div>
        <div className={styles.row}>
          <YesNo
            label="Residential Secure Unit"
            answers={answers}
            fieldKey={`${FORM}.other_residential_history.has_been_in_residential_secure_unit`}
          />
          <YesNo label="Armed Forces" answers={answers} fieldKey={`${FORM}.other_residential_history.has_been_in_armed_forces`} />
        </div>
        <LinedTextBlock
          label="If yes, or you have been in any of these outside Ireland, please give details"
          answers={answers}
          fieldKey={`${FORM}.other_residential_history.outside_ireland_history_details`}
        />

        <SectionBanner label="Independent Living Skills Assessment" />
        <p>{t("Do you feel you need support in any of the following areas? — Please tick the appropriate box.")}</p>
        <ChecklistGrid>
          {INDEPENDENT_LIVING_SKILLS.map(([key, label]) => (
            <ChecklistRow key={key} label={label} answers={answers} fieldKey={`${FORM}.independent_living_skills.${key}`} />
          ))}
        </ChecklistGrid>
      </PrintPage>

      <PrintPage>
        <SectionBanner label="Assessment of Priorities" />
        <LinedTextBlock
          label="What are your care plan priorities over the next three months?"
          answers={answers}
          fieldKey={`${FORM}.assessment_of_priorities.care_plan_priorities_over_next_three_months`}
          lines={4}
        />
        <LinedTextBlock
          label="Have you any other relevant information that you would like to add?"
          answers={answers}
          fieldKey={`${FORM}.assessment_of_priorities.other_relevant_information_to_add`}
          lines={4}
        />
        <GroupTitle label="Assessor's comments" />
        <LinedTextBlock label="Assessor's comments" answers={answers} fieldKey={`${FORM}.assessor_comments`} lines={6} />
      </PrintPage>
    </>
  );
}
