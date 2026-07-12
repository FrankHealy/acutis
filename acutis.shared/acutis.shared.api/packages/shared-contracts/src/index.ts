export type ProductKey = "centre" | "practitioner" | "community" | "outreach";
export type Direction = "ltr" | "rtl";

export type ProductEntitlement = {
  product: ProductKey;
  available: boolean;
  frontendUrl: string;
};

export type TenantMembership = {
  tenantId: string;
  product: ProductKey;
  organisationName: string;
  roleCodes: string[];
  isDemo: boolean;
};

export type ProductAccess = {
  subject: string;
  platformDemo: boolean;
  products: ProductEntitlement[];
  memberships: TenantMembership[];
};
