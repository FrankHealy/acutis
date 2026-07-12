import type { ProductKey } from "@acutis/shared-contracts";

export type BrandThemeTokens = {
  primary: string;
  secondary: string;
  surface: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
};

export type TenantBranding = {
  tenantId: string;
  product: ProductKey;
  productNameOverride?: string;
  organisationName: string;
  logoUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
  emailLogoUrl?: string;
  fontFamily?: string;
  domain?: string;
  terminology: Record<string, string>;
  featureFlags: Record<string, boolean>;
  poweredByAcutis: boolean;
  theme: BrandThemeTokens;
  isDemo: boolean;
};
