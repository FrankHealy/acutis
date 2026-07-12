"use client";

import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { LinedField, LinedTextBlock, PrintPage, printStyles as styles, type Answers } from "./PrintPrimitives";

const FORM = "care_plan_2";

const OBJECTIVE_FIELDS: Array<{ key: string; label: string; multiline: boolean }> = [
  { key: "in_the_area_of", label: "In the area of", multiline: false },
  { key: "i_aim_to", label: "I aim to", multiline: true },
  { key: "time_scale", label: "Time scale", multiline: false },
  { key: "actions_needed", label: "Actions needed", multiline: true },
  { key: "other_services_required", label: "Other services required", multiline: true },
  { key: "how_will_i_measure_my_progress", label: "How will I measure my progress", multiline: true },
  { key: "outcome", label: "Outcome", multiline: true },
  { key: "what_went_well_or_not_well", label: "What went well or not well", multiline: true },
];

function ObjectiveCard({ objectiveNumber, answers }: { objectiveNumber: 1 | 2 | 3; answers: Answers }) {
  const { t } = useLocalization();
  const prefix = `${FORM}.objectives.${objectiveNumber}`;
  return (
    <div className={styles.avoidBreak} style={{ border: "1px solid #b9c6d6", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
      <p className={styles.groupTitle} style={{ marginTop: 0 }}>
        {t("Objective")} {objectiveNumber}
      </p>
      {OBJECTIVE_FIELDS.map((field) =>
        field.multiline ? (
          <LinedTextBlock key={field.key} label={field.label} answers={answers} fieldKey={`${prefix}.${field.key}`} lines={2} />
        ) : (
          <LinedField key={field.key} label={field.label} answers={answers} fieldKey={`${prefix}.${field.key}`} />
        )
      )}
    </div>
  );
}

export default function InitialCarePlanPrintTemplate({ answers = {} }: { answers?: Answers }) {
  const { t } = useLocalization();

  return (
    <>
      <PrintPage>
        <h1 className={styles.banner} style={{ fontSize: "13pt" }}>
          {t("Initial Care Plan")}
        </h1>
        <p style={{ fontWeight: 700, color: "#0e7490", marginBottom: 8 }}>
          {t("Please be SMART (Specific, Measurable, Achievable, Realistic, Time lined)")}
        </p>
        <ObjectiveCard objectiveNumber={1} answers={answers} />
      </PrintPage>

      <PrintPage>
        <ObjectiveCard objectiveNumber={2} answers={answers} />
        <ObjectiveCard objectiveNumber={3} answers={answers} />
      </PrintPage>
    </>
  );
}
