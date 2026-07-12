import type { CSSProperties, ReactNode } from "react";

export const defaultTokens = {
  surface: "#ffffff", text: "#0f172a", primary: "#2563eb", secondary: "#0891b2",
  success: "#0f9f6e", warning: "#d97706", danger: "#dc2626", border: "#d7e2f1",
} as const;

export function ProductShell({ productName, organisationName, isDemo, direction, poweredByLabel, demoLabel, children }: {
  productName: string; organisationName: string; isDemo?: boolean; direction: "ltr" | "rtl"; poweredByLabel:string; demoLabel:string; children: ReactNode;
}) {
  const style = { "--surface": defaultTokens.surface, "--text": defaultTokens.text, "--primary": defaultTokens.primary, "--border": defaultTokens.border } as CSSProperties;
  return <div dir={direction} style={{ ...style, minHeight: "100vh", background: "var(--surface)", color: "var(--text)", fontFamily: "Arial, sans-serif" }}>
    <header style={{ borderBottom: "1px solid var(--border)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between" }}>
      <div><strong>{organisationName}</strong><div style={{ color: "var(--primary)" }}>{poweredByLabel} {productName}</div></div>
      {isDemo && <span role="status" style={{ padding: ".4rem .7rem", border: "1px solid var(--border)", borderRadius: "999px" }}>{demoLabel}</span>}
    </header>
    <main style={{ padding: "1.5rem" }}>{children}</main>
  </div>;
}
