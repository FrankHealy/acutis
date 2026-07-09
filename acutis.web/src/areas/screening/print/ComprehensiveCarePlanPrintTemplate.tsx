"use client";

import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  PrintPage,
  SectionBanner,
  SignatureBlock,
  printStyles as styles,
  readString,
  type Answers,
} from "./PrintPrimitives";

const FORM = "care_plan_1";

const DOMAINS: Array<{ key: string; label: string }> = [
  { key: "drug_alcohol_use", label: "Drug and Alcohol Use" },
  { key: "physical_mental_health", label: "Physical and Mental Health" },
  { key: "relationships_children_social_supports", label: "Relationships, Children and Social Supports" },
  { key: "education_accommodation", label: "Education and Accommodation" },
  { key: "financial_legal", label: "Financial and Legal" },
];

export default function ComprehensiveCarePlanPrintTemplate({ answers = {} }: { answers?: Answers }) {
  const { t } = useLocalization();

  return (
    <>
      <PrintPage>
        <h1 className={styles.banner} style={{ fontSize: "13pt" }}>
          {t("Comprehensive Care Plan")}
        </h1>
        <p style={{ fontWeight: 700, color: "#0e7490", marginBottom: 8 }}>
          {t("Please be SMART (Specific, Measurable, Achievable, Realistic, Time lined)")}
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>{t("State actions to be undertaken")}</th>
              <th>{t("By whom?")}</th>
              <th>{t("When?")}</th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((domain) => (
              <tr key={domain.key}>
                <td style={{ fontWeight: 700 }}>
                  {t(domain.label)}
                  <div style={{ fontWeight: 400, marginTop: 4, whiteSpace: "pre-wrap" }}>
                    {readString(answers, `${FORM}.goals.${domain.key}.actions_to_be_undertaken`)}
                  </div>
                </td>
                <td>{readString(answers, `${FORM}.goals.${domain.key}.by_whom`)}</td>
                <td>{readString(answers, `${FORM}.goals.${domain.key}.when_date`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintPage>

      <PrintPage>
        <SectionBanner label="Comprehensive Care Plan — Outcome to Date" />
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>{t("Domain")}</th>
              <th>{t("Outcome to Date")}</th>
            </tr>
          </thead>
          <tbody>
            {DOMAINS.map((domain) => (
              <tr key={domain.key}>
                <td style={{ fontWeight: 700 }}>{t(domain.label)}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>{readString(answers, `${FORM}.goals.${domain.key}.outcome_to_date`)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SignatureBlock
          items={[
            { label: "Signature of Service User", answers, fieldKey: `${FORM}.signatures.service_user`, dateFieldKey: `${FORM}.signatures.sign_date` },
            { label: "Signature of Staff", answers, fieldKey: `${FORM}.signatures.staff`, dateFieldKey: `${FORM}.signatures.sign_date` },
          ]}
        />
      </PrintPage>
    </>
  );
}
