export { directionForLocale, directionAwareIcon } from "@acutis/rtl";
export type TranslationResource = { key: string; defaultText: string; namespace: string };
export type TranslationDictionary = Record<string, string>;

export function translate(dictionary: TranslationDictionary, key: string, replacements: Record<string, string> = {}) {
  return Object.entries(replacements).reduce((value, [name, replacement]) => value.replaceAll(`{{${name}}}`, replacement), dictionary[key] ?? key);
}

const resources: Record<string, TranslationDictionary> = {
  "en-IE": {
    "product.centre": "Acutis Centre", "product.practitioner": "Acutis Practitioner", "product.community": "Acutis Community", "product.outreach": "Acutis Outreach",
    "common.demo": "Demo", "common.powered_by": "Powered by", "common.preview": "Preview only", "common.forms": "Forms", "common.appointments": "Appointments", "common.participants": "Participants",
    "practitioner.home": "Practitioner appointments and assigned client forms.", "practitioner.appointments": "Practitioner appointment workspace.", "practitioner.forms": "Practitioner-owned form definitions, assignments and responses.",
    "community.home": "Community participants, sessions and forms.", "community.participants": "Community participant workspace.", "community.forms": "Community-owned form definitions, assignments and responses.",
    "outreach.preview": "Preview only. Product workflows are not enabled."
  },
  ar: {
    "product.centre": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u0645\u0631\u0627\u0643\u0632", "product.practitioner": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u0645\u0645\u0627\u0631\u0633\u064a\u0646", "product.community": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u0645\u062c\u062a\u0645\u0639", "product.outreach": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a",
    "common.demo": "\u0639\u0631\u0636 \u062a\u062c\u0631\u064a\u0628\u064a", "common.powered_by": "\u0645\u062f\u0639\u0648\u0645 \u0645\u0646", "common.preview": "\u0644\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0641\u0642\u0637", "common.forms": "\u0627\u0644\u0646\u0645\u0627\u0630\u062c", "common.appointments": "\u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f", "common.participants": "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0648\u0646",
    "practitioner.home": "\u0645\u0648\u0627\u0639\u064a\u062f \u0627\u0644\u0645\u0645\u0627\u0631\u0633 \u0648\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0639\u064a\u0651\u0646\u0629.", "practitioner.appointments": "\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0645\u0648\u0627\u0639\u064a\u062f \u0627\u0644\u0645\u0645\u0627\u0631\u0633.", "practitioner.forms": "\u062a\u0639\u0631\u064a\u0641\u0627\u062a \u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0645\u0645\u0627\u0631\u0633 \u0648\u062a\u0639\u064a\u064a\u0646\u0627\u062a\u0647\u0627 \u0648\u0631\u062f\u0648\u062f\u0647\u0627.",
    "community.home": "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0648\u0646 \u0648\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0648\u0627\u0644\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u0629.", "community.participants": "\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u064a\u0646 \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u064a\u0646.", "community.forms": "\u062a\u0639\u0631\u064a\u0641\u0627\u062a \u0627\u0644\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u0629 \u0648\u062a\u0639\u064a\u064a\u0646\u0627\u062a\u0647\u0627 \u0648\u0631\u062f\u0648\u062f\u0647\u0627.",
    "outreach.preview": "\u0644\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0641\u0642\u0637. \u0645\u0633\u0627\u0631\u0627\u062a \u0639\u0645\u0644 \u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u0641\u0639\u0644\u0629."
  }
};

export function productText(locale: string, key: string) {
  const exact = resources[locale];
  const base = resources[locale.split("-")[0]];
  return exact?.[key] ?? base?.[key] ?? resources["en-IE"][key] ?? key;
}
