export const RTL_LANGUAGE_CODES = new Set(["ar", "fa", "he", "ur"]);
export function directionForLocale(locale: string): "ltr" | "rtl" {
  return RTL_LANGUAGE_CODES.has(locale.trim().toLowerCase().split("-")[0]) ? "rtl" : "ltr";
}
export function directionAwareIcon(icon: "previous" | "next", direction: "ltr" | "rtl") {
  return direction === "rtl" ? (icon === "previous" ? "next" : "previous") : icon;
}
