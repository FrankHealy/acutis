"use client";

import type { ReactNode } from "react";
import type { JsonValue } from "../forms/ApiClient";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import styles from "./print.module.css";

export type Answers = Record<string, JsonValue>;

export const readString = (answers: Answers, key: string): string => {
  const value = answers[key];
  return typeof value === "string" ? value : "";
};

export const readBoolean = (answers: Answers, key: string): boolean | null => {
  const value = answers[key];
  return typeof value === "boolean" ? value : null;
};

export function PrintPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.page} ${className ?? ""}`}>{children}</div>;
}

export function PrintToolbar({ label = "Print" }: { label?: string }) {
  return (
    <div className="mx-auto mb-4 flex w-[210mm] max-w-full items-center justify-end print:hidden">
      <button type="button" className={styles.printButton} onClick={() => window.print()}>
        {label}
      </button>
    </div>
  );
}

export function SectionBanner({ label }: { label: string }) {
  const { t } = useLocalization();
  return <div className={styles.banner}>{t(label)}</div>;
}

export function GroupTitle({ label }: { label: string }) {
  const { t } = useLocalization();
  return <p className={styles.groupTitle}>{t(label)}</p>;
}

/** A field label paired with a single dotted answer line. */
export function LinedField({
  label,
  answers,
  fieldKey,
}: {
  label: string;
  answers: Answers;
  fieldKey: string;
}) {
  const { t } = useLocalization();
  const value = readString(answers, fieldKey);
  return (
    <div className={styles.field}>
      <p className={styles.fieldLabel}>{t(label)}</p>
      <p className={`${styles.linedValue} ${value ? "" : styles.empty}`}>{value}</p>
    </div>
  );
}

/** A field label paired with a multi-line (wrapping) dotted answer block. */
export function LinedTextBlock({
  label,
  answers,
  fieldKey,
  lines = 3,
}: {
  label: string;
  answers: Answers;
  fieldKey: string;
  lines?: number;
}) {
  const { t } = useLocalization();
  const value = readString(answers, fieldKey);
  const filler = Array.from({ length: Math.max(0, lines - 1) });
  return (
    <div className={styles.field}>
      <p className={styles.fieldLabel}>{t(label)}</p>
      <p className={styles.multilineValue}>{value}</p>
      {filler.map((_, index) => (
        <p key={index} className={styles.multilineValue} />
      ))}
    </div>
  );
}

export function YesNo({
  label,
  answers,
  fieldKey,
}: {
  label: string;
  answers: Answers;
  fieldKey: string;
}) {
  const { t } = useLocalization();
  const value = readBoolean(answers, fieldKey);
  return (
    <div className={styles.field}>
      <p className={styles.fieldLabel}>{t(label)}</p>
      <span className={styles.yesNo}>
        <span className={`${styles.box} ${value === true ? styles.boxChecked : ""}`}>{value === true ? "X" : ""}</span>
        Yes
        <span className={`${styles.box} ${value === false ? styles.boxChecked : ""}`} style={{ marginLeft: 10 }}>
          {value === false ? "X" : ""}
        </span>
        No
      </span>
    </div>
  );
}

/** The recurring "Name & Org / Phone-email" three-row services block. */
export function ServicesTable({
  answers,
  sectionKey,
  rows = 3,
}: {
  answers: Answers;
  sectionKey: string;
  rows?: number;
}) {
  const { t } = useLocalization();
  return (
    <table className={`${styles.table} ${styles.avoidBreak}`}>
      <thead>
        <tr>
          <th>{t("Name & Org")}</th>
          <th>{t("Phone/email")}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, index) => index + 1).map((row) => (
          <tr key={row}>
            <td>{readString(answers, `${sectionKey}.involved_services.${row}.name_and_org`)}</td>
            <td>{readString(answers, `${sectionKey}.involved_services.${row}.phone_or_email`)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The two-row cross-impact block (substance use / housing situation). */
export function CrossImpacts({
  answers,
  sectionKey,
  substanceLabel,
  housingLabel,
}: {
  answers: Answers;
  sectionKey: string;
  substanceLabel: string;
  housingLabel: string;
}) {
  return (
    <div className={styles.avoidBreak}>
      <GroupTitle label="Cross Impacts" />
      <YesNo label={substanceLabel} answers={answers} fieldKey={`${sectionKey}.cross_impacts.substance_use_impacts`} />
      <LinedField label="Details" answers={answers} fieldKey={`${sectionKey}.cross_impacts.substance_use_impacts_details`} />
      <YesNo label={housingLabel} answers={answers} fieldKey={`${sectionKey}.cross_impacts.housing_situation_impacts`} />
      <LinedField label="Details" answers={answers} fieldKey={`${sectionKey}.cross_impacts.housing_situation_impacts_details`} />
    </div>
  );
}

export function SignatureBlock({
  items,
}: {
  items: Array<{ label: string; answers: Answers; fieldKey: string; dateFieldKey?: string }>;
}) {
  const { t } = useLocalization();
  return (
    <div className={styles.signatureBlock}>
      {items.map((item) => (
        <div key={item.fieldKey} className={styles.signatureLine}>
          <p className={styles.fieldLabel}>{t(item.label)}</p>
          <p className={styles.linedValue}>{readString(item.answers, item.fieldKey)}</p>
          {item.dateFieldKey && (
            <>
              <p className={styles.fieldLabel} style={{ marginTop: 6 }}>
                {t("Date")}
              </p>
              <p className={styles.linedValue}>{readString(item.answers, item.dateFieldKey)}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/** Compact "label ... Yes [] No []" row, several of which are laid out via ChecklistGrid. */
export function ChecklistRow({
  label,
  answers,
  fieldKey,
}: {
  label: string;
  answers: Answers;
  fieldKey: string;
}) {
  const { t } = useLocalization();
  const value = readBoolean(answers, fieldKey);
  return (
    <>
      <span className={styles.item}>{t(label)}</span>
      <span className={styles.yesNo}>
        <span className={`${styles.box} ${value === true ? styles.boxChecked : ""}`}>{value === true ? "X" : ""}</span>
        Yes
        <span className={`${styles.box} ${value === false ? styles.boxChecked : ""}`} style={{ marginLeft: 8 }}>
          {value === false ? "X" : ""}
        </span>
        No
      </span>
    </>
  );
}

export function ChecklistGrid({ children }: { children: ReactNode }) {
  return <div className={styles.checklistGrid}>{children}</div>;
}

export function Callout({ children }: { children: ReactNode }) {
  return <div className={styles.calloutBubble}>{children}</div>;
}

export { styles as printStyles };
