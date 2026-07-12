import type { JsonSchemaDto, JsonValue, OptionSetDto, UiSectionDto } from "@/areas/screening/forms/ApiClient";

export type SectionDefinition = {
  section: UiSectionDto;
  schema: JsonSchemaDto;
  labels: Record<string, string>;
  widgets: Record<string, string>;
  optionSets: OptionSetDto[];
  selectOptions?: Record<string, Array<{ value: string; label: string }>>;
};

export type SuggestedPatch = {
  fieldKey: string;
  proposedValue: JsonValue;
  confidence: number | null;
  rationale: string;
  requiresReview: boolean;
};

const notesFieldPattern = /(note|notes|narrative|summary|comment|comments|detail|details|observation|observations)/i;
const negativePattern = /\b(no|not|none|never|denies|without|negative)\b/i;
const positivePattern = /\b(yes|has|had|with|reports|confirms|positive)\b/i;
const leadingConnectorPattern = /^(is|as|are|was|were|equals|equal to|to be|:|-|=)\s+/i;
const monthLookup: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const getSectionFieldKeys = (section: UiSectionDto): string[] => {
  const items = section.items ?? [];
  const groupedItems = (section.groups ?? []).flatMap((group) => group.items);
  return Array.from(new Set([...items, ...groupedItems]));
};

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fieldAliases: Record<string, string[]> = {
  service_user_full_name: ["service user name", "service user full name", "full name", "resident name"],
  first_name: ["first name", "forename", "given name"],
  surname: ["surname", "last name", "family name"],
  date_of_birth: ["date of birth", "dob", "birth date"],
  phone_number: ["phone number", "phone", "mobile", "mobile number", "telephone"],
  email_address: ["email address", "email"],
  gp_name: ["gp name", "doctor", "doctor name"],
  assessment_completion_status: [
    "comprehensive assessment completed",
    "assessment completed",
    "assessment completion status",
  ],
  assessment_completion_date: [
    "assessment completion date",
    "assessment completed date",
    "assessment date",
    "completed date",
    "completion date",
  ],
  consent_mental_health_shared_record: [
    "consent given to share the mental health record",
    "consent given to share mental health record",
    "consent given to share personal health record",
    "share mental health record",
    "share personal health record",
  ],
  ever_treated_for_substance_use: [
    "previously treated for substance use",
    "ever treated for substance use",
    "treated for substance use",
    "substance use treatment",
  ],
  ever_treated_for_alcohol: [
    "previously treated for alcohol use",
    "previously treated for alcohol",
    "ever treated for alcohol",
    "treated for alcohol use",
    "treated for alcohol",
    "alcohol treatment",
  ],
  total_previous_treatments: [
    "total number of previous treatments",
    "number of previous treatments",
    "previous treatments",
    "total treatments",
  ],
  age_first_treated: ["age first treated", "first treated age", "age when first treated"],
  treatment_providers: [
    "name of treatment providers",
    "name of treatment provider",
    "treatment providers",
    "treatment provider",
    "provider name",
  ],
  reason_for_leaving_treatment: [
    "reason for leaving treatment",
    "reason for leaving",
    "leaving reason",
    "why left treatment",
  ],
  longest_time_abstinent: [
    "longest time abstinent",
    "longest abstinent",
    "longest abstinence",
    "time abstinent",
  ],
  current_opiate_agonist_treatment: [
    "currently receiving opiate agonist treatment",
    "current opiate agonist treatment",
    "receiving opiate agonist treatment",
    "opiate agonist treatment",
  ],
  other_current_treatment_medication: [
    "currently taking other treatment or prescribed medication",
    "other current treatment medication",
    "other current treatment",
    "prescribed medication",
    "prescribed medications",
  ],
  physical_health_concerns: [
    "physical health concerns identified",
    "concerns about physical health",
    "physical health concerns",
    "physical health",
  ],
  known_allergies: ["known allergies", "allergies", "allergy"],
  history_of_head_injury: ["history of head injury", "head injury", "head injuries"],
  last_gp_checkup: ["last gp check-up", "last gp checkup", "last gp check", "gp check-up", "gp checkup"],
  relevant_medical_history: ["relevant medical history", "medical history"],
  current_medications: ["current medications", "current medication", "medications", "medication"],
  history_of_seizures: ["history of seizures", "seizures", "seizure history"],
  mental_health_concerns: [
    "mental health concerns identified",
    "concerns about mental health",
    "mental health concerns",
    "mental health",
  ],
  mental_health_professional_engagement: [
    "seen or seeing a mental health professional",
    "seeing a mental health professional",
    "seen a mental health professional",
    "mental health professional",
  ],
  history_of_psychiatric_care: ["history of psychiatric care", "psychiatric care"],
  history_of_self_harm_or_suicidal_thoughts: [
    "history of self-harm or suicidal thoughts",
    "history of self harm or suicidal thoughts",
    "self-harm or suicidal thoughts",
    "self harm or suicidal thoughts",
    "suicidal thoughts",
    "self harm",
    "self-harm",
  ],
  mood_last_month: ["mood over the last month", "mood last month", "mood"],
  mental_health_details: ["mental health details", "mental health detail", "details"],
  comprehensive_assessment_needed: ["comprehensive assessment needed", "assessment needed"],
  comprehensive_assessment_arranged: ["comprehensive assessment arranged", "assessment arranged"],
  additional_comments_details: ["additional comments details", "additional comments", "comments", "details"],
};

const spokenNumberLookup: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const getOptions = (
  definition: SectionDefinition,
  fieldKey: string
): Array<{ value: string; label: string }> => {
  const schemaProperty = definition.schema.properties[fieldKey];
  if (schemaProperty?.optionSetKey) {
    return (definition.optionSets.find((set) => set.key === schemaProperty.optionSetKey)?.items ?? [])
      .filter((item) => item.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => ({ value: item.code, label: definition.labels[item.labelKey] ?? item.labelKey }));
  }

  return definition.selectOptions?.[fieldKey] ?? [];
};

const extractLabelledText = (transcript: string, label: string): string | null => {
  const normalizedLabel = normalize(label);
  if (!normalizedLabel) {
    return null;
  }

  const lines = transcript
    .split(/\r?\n|[.;]/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const normalizedLine = normalize(line);
    if (!normalizedLine.startsWith(normalizedLabel)) {
      continue;
    }

    const separatorIndex = Math.max(line.indexOf(":"), line.indexOf("-"));
    if (separatorIndex >= 0) {
      return line.slice(separatorIndex + 1).trim();
    }

    return line.replace(new RegExp(label, "i"), "").trim();
  }

  return null;
};

const getAliases = (fieldKey: string, label: string): string[] =>
  Array.from(new Set([label, fieldKey.replaceAll("_", " "), ...(fieldAliases[fieldKey] ?? [])]))
    .map((alias) => alias.trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

const extractBetweenAliases = (
  transcript: string,
  aliases: string[],
  allAliases: string[]
): string | null => {
  const lowerTranscript = transcript.toLowerCase();
  const sortedAliases = aliases.map((alias) => alias.toLowerCase()).sort((left, right) => right.length - left.length);
  const sortedAllAliases = allAliases
    .map((alias) => alias.toLowerCase())
    .filter((alias) => alias.length > 1)
    .sort((left, right) => right.length - left.length);

  for (const alias of sortedAliases) {
    const match = new RegExp(`(?:^|\\b)${escapeRegExp(alias)}(?:\\b|$)`, "i").exec(transcript);
    if (!match || typeof match.index !== "number") {
      continue;
    }

    const valueStart = match.index + match[0].length;
    let valueEnd = transcript.length;

    for (const nextAlias of sortedAllAliases) {
      const searchFrom = Math.max(valueStart + 1, 0);
      const nextIndex = lowerTranscript.indexOf(nextAlias, searchFrom);
      if (nextIndex > valueStart && nextIndex < valueEnd) {
        valueEnd = nextIndex;
      }
    }

    const punctuationMatch = /[.;\n\r]/.exec(transcript.slice(valueStart, valueEnd));
    if (punctuationMatch?.index !== undefined) {
      valueEnd = valueStart + punctuationMatch.index;
    }

    const extracted = transcript
      .slice(valueStart, valueEnd)
      .replace(leadingConnectorPattern, "")
      .replace(/,$/, "")
      .trim();

    if (extracted) {
      return extracted;
    }
  }

  return null;
};

const coerceTextValue = (value: string, maxLength?: number): string => {
  const trimmed = value.trim();
  return typeof maxLength === "number" ? trimmed.slice(0, maxLength) : trimmed;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const toIsoDate = (day: number, month: number, year: number): string | null => {
  if (year < 100) {
    year += year > 30 ? 1900 : 2000;
  }

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
};

const todayIsoDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
};

const normalizeSpokenDate = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\b(the|of|born|dob|date of birth|birth date|is|was|equals)\b/g, " ")
    .replace(/\b(first|1st)\b/g, "1")
    .replace(/\b(second|2nd)\b/g, "2")
    .replace(/\b(third|3rd)\b/g, "3")
    .replace(/\b(fourth|4th)\b/g, "4")
    .replace(/\b(fifth|5th)\b/g, "5")
    .replace(/\b(sixth|6th)\b/g, "6")
    .replace(/\b(seventh|7th)\b/g, "7")
    .replace(/\b(eighth|8th)\b/g, "8")
    .replace(/\b(ninth|9th)\b/g, "9")
    .replace(/\b(tenth|10th)\b/g, "10")
    .replace(/\b(eleventh|11th)\b/g, "11")
    .replace(/\b(twelfth|12th)\b/g, "12")
    .replace(/\b(thirteenth|13th)\b/g, "13")
    .replace(/\b(fourteenth|14th)\b/g, "14")
    .replace(/\b(fifteenth|15th)\b/g, "15")
    .replace(/\b(sixteenth|16th)\b/g, "16")
    .replace(/\b(seventeenth|17th)\b/g, "17")
    .replace(/\b(eighteenth|18th)\b/g, "18")
    .replace(/\b(nineteenth|19th)\b/g, "19")
    .replace(/\b(twentieth|20th)\b/g, "20")
    .replace(/\b(twenty first|21st)\b/g, "21")
    .replace(/\b(twenty second|22nd)\b/g, "22")
    .replace(/\b(twenty third|23rd)\b/g, "23")
    .replace(/\b(twenty fourth|24th)\b/g, "24")
    .replace(/\b(twenty fifth|25th)\b/g, "25")
    .replace(/\b(twenty sixth|26th)\b/g, "26")
    .replace(/\b(twenty seventh|27th)\b/g, "27")
    .replace(/\b(twenty eighth|28th)\b/g, "28")
    .replace(/\b(twenty ninth|29th)\b/g, "29")
    .replace(/\b(thirtieth|30th)\b/g, "30")
    .replace(/\b(thirty first|31st)\b/g, "31")
    .replace(/\s+/g, " ")
    .trim();
};

const parseDateValue = (value: string): string | null => {
  const normalized = normalizeSpokenDate(value);
  if (/\b(today|todays|today's)\b/.test(normalized)) {
    return todayIsoDate();
  }

  const numericMatch = /\b(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})\b/.exec(normalized);
  if (numericMatch) {
    return toIsoDate(Number(numericMatch[1]), Number(numericMatch[2]), Number(numericMatch[3]));
  }

  const digitTokens = normalized.match(/\d+/g) ?? [];
  if (digitTokens.length >= 5) {
    const compactDigits = digitTokens.join("");
    if (compactDigits.length >= 8) {
      const day = Number(compactDigits.slice(0, 2));
      const month = Number(compactDigits.slice(2, 4));
      const year = Number(compactDigits.slice(4, 8));
      const parsed = toIsoDate(day, month, year);
      if (parsed) {
        return parsed;
      }
    }
  }

  const namedMonthMatch = /\b(\d{1,2})\s+([a-z]+)\s+(\d{2,4})\b/.exec(normalized);
  if (namedMonthMatch) {
    return toIsoDate(
      Number(namedMonthMatch[1]),
      monthLookup[namedMonthMatch[2]] ?? 0,
      Number(namedMonthMatch[3])
    );
  }

  const monthFirstMatch = /\b([a-z]+)\s+(\d{1,2})\s+(\d{2,4})\b/.exec(normalized);
  if (monthFirstMatch) {
    return toIsoDate(
      Number(monthFirstMatch[2]),
      monthLookup[monthFirstMatch[1]] ?? 0,
      Number(monthFirstMatch[3])
    );
  }

  return null;
};

const normalizeEmailValue = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+at\s+/g, "@")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s+underscore\s+/g, "_")
    .replace(/\s+dash\s+/g, "-")
    .replace(/\s+hyphen\s+/g, "-")
    .replace(/\s+plus\s+/g, "+")
    .replace(/\s+/g, "")
    .replace(/,+/g, ".");
};

const sanitizeEmail = (value: string): string => value.trim().replace(/^[<([{]+/, "").replace(/[>)]},;:!?]+$/g, "");

const findEmailInTranscript = (transcript: string): string | null => {
  const rawEmailMatch = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?:\.[A-Z]{2,})*\b/i.exec(transcript);
  if (rawEmailMatch?.[0]) {
    return sanitizeEmail(rawEmailMatch[0]);
  }

  const normalizedEmail = normalizeEmailValue(transcript);
  const emailMatch = /^[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,255}\.[A-Z]{2,}(?:\.[A-Z]{2,})*$/i.exec(normalizedEmail);
  return emailMatch?.[0] ? sanitizeEmail(emailMatch[0]) : null;
};

const findPhoneInTranscript = (transcript: string): string | null => {
  const phoneContextMatch = /(?:phone number|phone|mobile|telephone)\s+(?:is\s+)?([\d\s()+-]{7,30})/i.exec(transcript);
  const phoneMatch = /\+?[0-9][0-9()\-\s]{6,20}/.exec(phoneContextMatch?.[1] ?? transcript);
  return phoneMatch?.[0]?.trim() ?? null;
};

const parseNumberValue = (value: string): number => {
  const numericMatch = /-?\d+(?:\.\d+)?/.exec(value);
  if (numericMatch?.[0]) {
    return Number(numericMatch[0]);
  }

  const tokens = normalize(value).split(" ").filter(Boolean);
  let total = 0;
  let found = false;

  for (const token of tokens) {
    const number = spokenNumberLookup[token];
    if (number === undefined) {
      continue;
    }

    total += number;
    found = true;
  }

  return found ? total : Number.NaN;
};

const coerceSuggestedValue = (
  value: string,
  schemaProperty: SectionDefinition["schema"]["properties"][string]
): JsonValue | null => {
  if (schemaProperty.type === "date") {
    return parseDateValue(value);
  }

  if (schemaProperty.format === "email") {
    return findEmailInTranscript(value);
  }

  if (schemaProperty.format === "phone") {
    const phoneMatch = /\+?[0-9][0-9()\-\s]{6,20}/.exec(value);
    return phoneMatch?.[0]?.trim() ?? null;
  }

  if (schemaProperty.type === "integer") {
    const parsed = parseNumberValue(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (schemaProperty.type === "number") {
    const parsed = parseNumberValue(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return coerceTextValue(value, schemaProperty.maxLength);
};

const upsertPatch = (patches: SuggestedPatch[], patch: SuggestedPatch) => {
  const existingPatchIndex = patches.findIndex((item) => item.fieldKey === patch.fieldKey);
  if (existingPatchIndex >= 0) {
    patches[existingPatchIndex] = patch;
    return;
  }

  patches.push(patch);
};

const getPatchValue = (patches: SuggestedPatch[], fieldKey: string): JsonValue | undefined =>
  patches.find((patch) => patch.fieldKey === fieldKey)?.proposedValue;

const addDerivedFullNamePatch = (
  patches: SuggestedPatch[],
  currentValues: Record<string, JsonValue>,
  fieldKeys: string[]
) => {
  if (!fieldKeys.includes("service_user_full_name")) {
    return;
  }

  const firstName = getPatchValue(patches, "first_name") ?? currentValues.first_name;
  const surname = getPatchValue(patches, "surname") ?? currentValues.surname;
  const fullName = [firstName, surname]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();

  if (!fullName || currentValues.service_user_full_name === fullName) {
    return;
  }

  upsertPatch(patches, {
    fieldKey: "service_user_full_name",
    proposedValue: fullName,
    confidence: 0.8,
    rationale: "Defaulted from first name and surname suggestions.",
    requiresReview: true,
  });
};

const addTranscriptWideFallbackPatches = (
  patches: SuggestedPatch[],
  sectionDefinition: SectionDefinition,
  currentValues: Record<string, JsonValue>,
  transcript: string,
  fieldKeys: string[]
) => {
  if (fieldKeys.includes("email_address") && currentValues.email_address !== findEmailInTranscript(transcript)) {
    const allAliases = Object.values(
      Object.fromEntries(
        fieldKeys.map((fieldKey) => [
          fieldKey,
          getAliases(fieldKey, sectionDefinition.labels[fieldKey] ?? fieldKey),
        ])
      )
    ).flat();
    const emailText = extractBetweenAliases(
      transcript,
      getAliases("email_address", sectionDefinition.labels.email_address ?? "Email Address"),
      allAliases
    ) ?? transcript;
    const email = findEmailInTranscript(emailText);
    if (email) {
      upsertPatch(patches, {
        fieldKey: "email_address",
        proposedValue: email,
        confidence: 0.75,
        rationale: "Detected an email address in the section transcript.",
        requiresReview: true,
      });
    }
  }

  if (fieldKeys.includes("phone_number")) {
    const phone = findPhoneInTranscript(transcript);
    if (phone && currentValues.phone_number !== phone) {
      upsertPatch(patches, {
        fieldKey: "phone_number",
        proposedValue: phone,
        confidence: 0.7,
        rationale: "Detected a phone number in the section transcript.",
        requiresReview: true,
      });
    }
  }

  if (fieldKeys.includes("date_of_birth")) {
    const dateText = extractBetweenAliases(
      transcript,
      getAliases("date_of_birth", sectionDefinition.labels.date_of_birth ?? "Date of Birth"),
      Object.values(
        Object.fromEntries(
          fieldKeys.map((fieldKey) => [
            fieldKey,
            getAliases(fieldKey, sectionDefinition.labels[fieldKey] ?? fieldKey),
          ])
        )
      ).flat()
    ) ?? transcript;
    const date = parseDateValue(dateText);
    if (date && currentValues.date_of_birth !== date) {
      upsertPatch(patches, {
        fieldKey: "date_of_birth",
        proposedValue: date,
        confidence: 0.7,
        rationale: "Detected a date of birth in the section transcript.",
        requiresReview: true,
      });
    }
  }
};

export const mapTranscriptToSectionFields = (
  sectionDefinition: SectionDefinition,
  currentValues: Record<string, JsonValue>,
  transcriptText: string
): SuggestedPatch[] => {
  const transcript = transcriptText.trim();
  if (!transcript) {
    return [];
  }

  const patches: SuggestedPatch[] = [];
  const normalizedTranscript = normalize(transcript);
  const fieldKeys = getSectionFieldKeys(sectionDefinition.section);
  const aliasesByField = Object.fromEntries(
    fieldKeys.map((fieldKey) => [
      fieldKey,
      getAliases(fieldKey, sectionDefinition.labels[fieldKey] ?? fieldKey),
    ])
  );
  const allAliases = Object.values(aliasesByField).flat();

  for (const fieldKey of fieldKeys) {
    const schemaProperty = sectionDefinition.schema.properties[fieldKey];
    if (!schemaProperty) {
      continue;
    }

    const label = sectionDefinition.labels[fieldKey] ?? fieldKey;
    const aliases = aliasesByField[fieldKey] ?? [label];
    const widget = sectionDefinition.widgets[fieldKey] ?? "input";
    const currentValue = currentValues[fieldKey];

    if (schemaProperty.type === "boolean" || widget === "toggle") {
      const matchedAlias = aliases.find((alias) => normalizedTranscript.includes(normalize(alias)));
      if (matchedAlias) {
        const relevantText = extractBetweenAliases(transcript, [matchedAlias], allAliases) ?? transcript;
        const proposedValue = negativePattern.test(relevantText) ? false : positivePattern.test(relevantText) ? true : null;
        if (proposedValue !== null && proposedValue !== currentValue) {
          upsertPatch(patches, {
            fieldKey,
            proposedValue,
            confidence: 0.45,
            rationale: `Detected a yes/no statement near "${label}".`,
            requiresReview: true,
          });
        }
      }
      continue;
    }

    const options = getOptions(sectionDefinition, fieldKey);
    if ((schemaProperty.type === "enum" || schemaProperty.type === "multiEnum" || widget === "select") && options.length > 0) {
      const labelledText = extractBetweenAliases(transcript, aliases, allAliases);
      const optionSearchText = labelledText ?? transcript;
      const normalizedOptionSearchText = normalize(optionSearchText);
      const matchedOptions = options.filter((option) => {
        const normalizedOptionLabel = normalize(option.label);
        const normalizedOptionValue = normalize(option.value);
        return normalizedOptionSearchText.includes(normalizedOptionLabel) ||
          normalizedOptionSearchText.includes(normalizedOptionValue);
      });
      const matchedOption = matchedOptions[0];
      if (schemaProperty.type === "multiEnum" && matchedOptions.length > 0) {
        const proposedValue = matchedOptions.map((option) => option.value);
        if (JSON.stringify(currentValue) !== JSON.stringify(proposedValue)) {
          upsertPatch(patches, {
            fieldKey,
            proposedValue,
            confidence: 0.5,
            rationale: labelledText
              ? `Matched ${matchedOptions.length} option(s) after "${label}".`
              : `Matched ${matchedOptions.length} option(s) in the transcript.`,
            requiresReview: true,
          });
        }
        continue;
      }
      if (matchedOption && currentValue !== matchedOption.value) {
        upsertPatch(patches, {
          fieldKey,
          proposedValue: matchedOption.value,
          confidence: 0.5,
          rationale: labelledText
            ? `Matched option "${matchedOption.label}" after "${label}".`
            : `Matched option "${matchedOption.label}" in the transcript.`,
          requiresReview: true,
        });
      }
      continue;
    }

    const labelledText = extractBetweenAliases(transcript, aliases, allAliases) ?? extractLabelledText(transcript, label);
    const proposedValue = labelledText ? coerceSuggestedValue(labelledText, schemaProperty) : null;
    if (proposedValue !== null && proposedValue !== "" && proposedValue !== currentValue) {
      upsertPatch(patches, {
        fieldKey,
        proposedValue,
        confidence: 0.55,
        rationale: `Found text that appears to follow "${label}".`,
        requiresReview: true,
      });
      continue;
    }

    const isNarrativeField =
      schemaProperty.type === "text" ||
      widget === "textarea" ||
      notesFieldPattern.test(fieldKey) ||
      notesFieldPattern.test(label);
    if (isNarrativeField && !currentValue) {
      upsertPatch(patches, {
        fieldKey,
        proposedValue: coerceTextValue(transcript, schemaProperty.maxLength),
        confidence: null,
        rationale: "Placed the transcript into this section narrative field for review.",
        requiresReview: true,
      });
    }
  }

  addTranscriptWideFallbackPatches(patches, sectionDefinition, currentValues, transcript, fieldKeys);
  addDerivedFullNamePatch(patches, currentValues, fieldKeys);

  return patches;
};
