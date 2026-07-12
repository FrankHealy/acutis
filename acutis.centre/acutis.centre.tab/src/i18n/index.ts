import common from "./en/common";

type Dictionary = typeof common;

function getValue(source: unknown, path: string): string | undefined {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, source) as string | undefined;
}

export function t(path: string, fallback?: string): string {
  return getValue(common as Dictionary, path) ?? fallback ?? path;
}

export { common };
