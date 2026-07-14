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
  ga: {
    "product.centre": "Acutis Centre", "product.community": "Acutis Community",
    "common.demo": "Taispeántas", "common.powered_by": "Á chumhachtú ag", "common.preview": "Réamhamharc amháin", "common.forms": "Foirmeacha", "common.appointments": "Coinní", "common.participants": "Rannpháirtithe",
    "community.home": "Rannpháirtithe, seisiúin agus foirmeacha pobail.", "community.participants": "Spás oibre rannpháirtithe pobail.", "community.forms": "Sainmhínithe, sannacháin agus freagraí foirmeacha pobail."
  },
  ar: {
    "product.centre": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u0645\u0631\u0627\u0643\u0632", "product.practitioner": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u0645\u0645\u0627\u0631\u0633\u064a\u0646", "product.community": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u0645\u062c\u062a\u0645\u0639", "product.outreach": "\u0623\u0643\u0648\u062a\u064a\u0633 \u0644\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0645\u064a\u062f\u0627\u0646\u064a",
    "common.demo": "\u0639\u0631\u0636 \u062a\u062c\u0631\u064a\u0628\u064a", "common.powered_by": "\u0645\u062f\u0639\u0648\u0645 \u0645\u0646", "common.preview": "\u0644\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0641\u0642\u0637", "common.forms": "\u0627\u0644\u0646\u0645\u0627\u0630\u062c", "common.appointments": "\u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f", "common.participants": "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0648\u0646",
    "practitioner.home": "\u0645\u0648\u0627\u0639\u064a\u062f \u0627\u0644\u0645\u0645\u0627\u0631\u0633 \u0648\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0639\u064a\u0651\u0646\u0629.", "practitioner.appointments": "\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0645\u0648\u0627\u0639\u064a\u062f \u0627\u0644\u0645\u0645\u0627\u0631\u0633.", "practitioner.forms": "\u062a\u0639\u0631\u064a\u0641\u0627\u062a \u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0645\u0645\u0627\u0631\u0633 \u0648\u062a\u0639\u064a\u064a\u0646\u0627\u062a\u0647\u0627 \u0648\u0631\u062f\u0648\u062f\u0647\u0627.",
    "community.home": "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0648\u0646 \u0648\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0648\u0627\u0644\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u0629.", "community.participants": "\u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u064a\u0646 \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u064a\u0646.", "community.forms": "\u062a\u0639\u0631\u064a\u0641\u0627\u062a \u0627\u0644\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u0629 \u0648\u062a\u0639\u064a\u064a\u0646\u0627\u062a\u0647\u0627 \u0648\u0631\u062f\u0648\u062f\u0647\u0627.",
    "outreach.preview": "\u0644\u0644\u0645\u0639\u0627\u064a\u0646\u0629 \u0641\u0642\u0637. \u0645\u0633\u0627\u0631\u0627\u062a \u0639\u0645\u0644 \u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u0641\u0639\u0644\u0629."
  }
};

const interfaceResources: Record<string, TranslationDictionary> = {
  "en-IE": {
    "common.language": "Language", "common.theme": "Theme", "common.refresh": "Refresh", "common.retry": "Try again", "common.loading": "Loading", "common.access_unavailable": "Access unavailable", "common.no_records": "No records are available yet.", "common.english": "English", "common.irish": "Gaeilge", "common.arabic": "Arabic",
    "common.theme.default": "Default", "common.theme.calm": "Calm", "common.theme.dark": "Dark",
    "nav.dashboard": "Dashboard", "nav.service_users": "Service users", "nav.clients": "Clients", "nav.calendar": "Calendar", "nav.assessments": "Assessments", "nav.care_plans": "Care plans", "nav.notes.community": "Contact records", "nav.notes.practitioner": "Session records", "nav.forms": "Forms", "nav.configuration": "Configuration",
    "community.eyebrow": "Community recovery", "community.description": "Service users, community programmes, outreach and scheduled contacts.", "community.staff": "Community staff", "community.scope": "Community-wide",
    "practitioner.eyebrow": "Independent practice", "practitioner.description": "Clinical work, programmes and secure consultations in one practice workspace.", "practitioner.role": "Practitioner", "practitioner.practice_scope": "Practice-wide", "practitioner.caseload_scope": "My caseload"
  },
  ga: {
    "common.language": "Teanga", "common.theme": "Téama", "common.refresh": "Athnuaigh", "common.retry": "Bain triail eile as", "common.loading": "Á lódáil", "common.access_unavailable": "Níl rochtain ar fáil", "common.no_records": "Níl aon taifid ar fáil fós.", "common.english": "Béarla", "common.irish": "Gaeilge", "common.arabic": "Araibis",
    "common.theme.default": "Cian", "common.theme.calm": "Socair", "common.theme.dark": "Dorcha",
    "nav.dashboard": "Deais", "nav.service_users": "Úsáideoirí seirbhíse", "nav.calendar": "Féilire", "nav.assessments": "Measúnuithe", "nav.care_plans": "Pleananna cúraim", "nav.notes.community": "Taifid teagmhála", "nav.forms": "Foirmeacha", "nav.configuration": "Cumraíocht",
    "community.eyebrow": "Téarnamh pobail", "community.description": "Úsáideoirí seirbhíse, cláir phobail, for-rochtain agus teagmhálacha sceidealaithe.", "community.staff": "Foireann phobail", "community.scope": "Ar fud an phobail"
  },
  ar: {
    "common.language": "\u0627\u0644\u0644\u063a\u0629", "common.theme": "\u0627\u0644\u0645\u0638\u0647\u0631", "common.refresh": "\u062a\u062d\u062f\u064a\u062b", "common.retry": "\u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649", "common.loading": "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644", "common.access_unavailable": "\u0627\u0644\u0648\u0635\u0648\u0644 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d", "common.no_records": "\u0644\u0627 \u062a\u0648\u062c\u062f \u0633\u062c\u0644\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u0628\u0639\u062f.", "common.english": "\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629", "common.irish": "\u0627\u0644\u0623\u064a\u0631\u0644\u0646\u062f\u064a\u0629", "common.arabic": "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    "common.theme.default": "\u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a", "common.theme.calm": "\u0647\u0627\u062f\u0626", "common.theme.dark": "\u062f\u0627\u0643\u0646",
    "nav.dashboard": "\u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a", "nav.service_users": "\u0645\u0633\u062a\u062e\u062f\u0645\u0648 \u0627\u0644\u062e\u062f\u0645\u0629", "nav.clients": "\u0627\u0644\u0639\u0645\u0644\u0627\u0621", "nav.calendar": "\u0627\u0644\u062a\u0642\u0648\u064a\u0645", "nav.assessments": "\u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a", "nav.care_plans": "\u062e\u0637\u0637 \u0627\u0644\u0631\u0639\u0627\u064a\u0629", "nav.notes.community": "\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644", "nav.notes.practitioner": "\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u062c\u0644\u0633\u0627\u062a", "nav.forms": "\u0627\u0644\u0646\u0645\u0627\u0630\u062c", "nav.configuration": "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    "community.eyebrow": "\u0627\u0644\u062a\u0639\u0627\u0641\u064a \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a", "community.description": "\u0645\u0633\u062a\u062e\u062f\u0645\u0648 \u0627\u0644\u062e\u062f\u0645\u0629 \u0648\u0627\u0644\u0628\u0631\u0627\u0645\u062c \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u064a\u0629 \u0648\u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f.", "community.staff": "\u0641\u0631\u064a\u0642 \u0627\u0644\u0645\u062c\u062a\u0645\u0639", "community.scope": "\u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u062c\u062a\u0645\u0639",
    "practitioner.eyebrow": "\u0645\u0645\u0627\u0631\u0633\u0629 \u0645\u0633\u062a\u0642\u0644\u0629", "practitioner.description": "\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0633\u0631\u064a\u0631\u064a \u0648\u0627\u0644\u0628\u0631\u0627\u0645\u062c \u0648\u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a \u0627\u0644\u0622\u0645\u0646\u0629 \u0641\u064a \u0645\u0633\u0627\u062d\u0629 \u0639\u0645\u0644 \u0648\u0627\u062d\u062f\u0629.", "practitioner.role": "\u0645\u0645\u0627\u0631\u0633", "practitioner.practice_scope": "\u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u0649 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629", "practitioner.caseload_scope": "\u0642\u0627\u0626\u0645\u0629 \u062d\u0627\u0644\u0627\u062a\u064a"
  }
};

export function productText(locale: string, key: string) {
  const interfaceExact = interfaceResources[locale];
  const interfaceBase = interfaceResources[locale.split("-")[0]];
  const exact = resources[locale];
  const base = resources[locale.split("-")[0]];
  return interfaceExact?.[key] ?? interfaceBase?.[key] ?? exact?.[key] ?? base?.[key] ?? interfaceResources["en-IE"][key] ?? resources["en-IE"][key] ?? key;
}
