"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Heart,
  HeartHandshake,
  Pill,
  Settings,
  Users,
  Video,
  Wine,
  Radio,
  type LucideProps,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { useAppAccess } from "@/areas/shared/hooks/useAppAccess";
import { hasSuperAdminAccess, type AppAccess } from "@/lib/adminAccess";
import { isAuthorizationDisabled } from "@/lib/authMode";
import { logoutFromAcutis } from "@/lib/logout";

type LandingView = "main" | "centre" | "community";
type Accent = "blue" | "teal" | "indigo" | "green" | "purple" | "pink" | "cyan" | "orange";
type LandingIcon = ComponentType<LucideProps>;

type LandingItem = {
  id: string;
  labelKey: string;
  fallbackLabel: string;
  descriptionKey?: string;
  fallbackDescription?: string;
  icon: LandingIcon;
  accent: Accent;
  href?: string;
  targetView?: LandingView;
  delayMs: number;
  canAccess: (access: AppAccess) => boolean;
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/[-_\s]+/g, "");

const hasAnyAccessValue = (values: string[], aliases: string[]) => {
  const normalizedAliases = new Set(aliases.map(normalize));
  return values.some((value) => normalizedAliases.has(normalize(value)));
};

const hasPermission = (access: AppAccess, aliases: string[]) =>
  hasAnyAccessValue(access.permissions, aliases) ||
  access.unitPermissions.some((permission) => {
    const [, permissionName = permission] = permission.split("|");
    return hasAnyAccessValue([permissionName], aliases);
  });

const hasUnitAccess = (access: AppAccess, aliases: string[]) =>
  hasAnyAccessValue(access.unitAccess, aliases) ||
  access.unitPermissions.some((permission) => {
    const [unitId] = permission.split("|");
    return hasAnyAccessValue([unitId], aliases);
  }) ||
  hasPermission(access, aliases);

const canSeeAll = (access: AppAccess) => isAuthorizationDisabled || hasSuperAdminAccess(access.roles);
const hasPlatformDemoAccess = (access: AppAccess) => hasAnyAccessValue(access.roles, ["AcutisPlatformDemo"]);

const hasNoAssignedAccess = (access: AppAccess) =>
  access.roles.length === 0 &&
  access.permissions.length === 0 &&
  access.unitAccess.length === 0 &&
  access.unitPermissions.length === 0;

const canOpenUnit = (aliases: string[]) => (access: AppAccess) =>
  canSeeAll(access) || hasNoAssignedAccess(access) || hasUnitAccess(access, aliases);

const canOpenConfiguration = (access: AppAccess) =>
  canSeeAll(access) || hasNoAssignedAccess(access) || hasPermission(access, ["configuration.manage", "config.manage", "configuration"]);

const canOpenPractitioner = (access: AppAccess) =>
  canSeeAll(access) ||
  hasNoAssignedAccess(access) ||
  hasPermission(access, ["practitioner.access", "practitioner.manage", "ambulatory.access"]) ||
  hasAnyAccessValue(access.roles, ["practitioner", "clinician", "therapist"]);

const centreItems: LandingItem[] = [
  {
    id: "screening",
    labelKey: "landing.centre.screening",
    fallbackLabel: "Screening & Forecasting",
    icon: ClipboardCheck,
    accent: "green",
    href: "/units/screening",
    delayMs: 100,
    canAccess: canOpenUnit(["screening", "evaluation", "forecasting", "admissions"]),
  },
  {
    id: "detox",
    labelKey: "landing.centre.detox",
    fallbackLabel: "Detox",
    icon: Heart,
    accent: "teal",
    href: "/units/detox",
    delayMs: 200,
    canAccess: canOpenUnit(["detox"]),
  },
  {
    id: "alcohol",
    labelKey: "landing.centre.alcohol",
    fallbackLabel: "Alcohol & Gambling",
    icon: Wine,
    accent: "blue",
    href: "/units/alcohol",
    delayMs: 300,
    canAccess: canOpenUnit(["alcohol", "gambling"]),
  },
  {
    id: "drugs",
    labelKey: "landing.centre.drugs",
    fallbackLabel: "Drugs",
    icon: Pill,
    accent: "purple",
    href: "/units/drugs",
    delayMs: 400,
    canAccess: canOpenUnit(["drugs"]),
  },
  {
    id: "ladies",
    labelKey: "landing.centre.ladies",
    fallbackLabel: "Ladies",
    icon: Users,
    accent: "pink",
    href: "/units/ladies",
    delayMs: 500,
    canAccess: canOpenUnit(["ladies", "women"]),
  },
];

const communityItems: LandingItem[] = [
  {
    id: "assessment",
    labelKey: "landing.community.assessment",
    fallbackLabel: "Assessment",
    icon: ClipboardList,
    accent: "cyan",
    href: "/units/screening",
    delayMs: 100,
    canAccess: canOpenUnit(["screening", "assessment", "evaluation", "communityassessment"]),
  },
  {
    id: "community",
    labelKey: "landing.community.community",
    fallbackLabel: "Community",
    icon: HeartHandshake,
    accent: "teal",
    href: process.env.NEXT_PUBLIC_COMMUNITY_WEB_URL || "https://community.salientrecovery.com",
    delayMs: 200,
    canAccess: canOpenUnit(["community", "ambulatory"]),
  },
];

const productItems: LandingItem[] = [
  {
    id: "centre",
    labelKey: "landing.product.centre",
    fallbackLabel: "Acutis Centre",
    descriptionKey: "landing.product.centre.description",
    fallbackDescription: "Residential treatment management",
    icon: Building2,
    accent: "blue",
    targetView: "centre",
    delayMs: 150,
    canAccess: (access) => hasPlatformDemoAccess(access) || centreItems.some((item) => item.canAccess(access)) || canOpenConfiguration(access),
  },
  {
    id: "community",
    labelKey: "landing.product.community",
    fallbackLabel: "Acutis Community",
    descriptionKey: "landing.product.community.description",
    fallbackDescription: "Community based treatment",
    icon: HeartHandshake,
    accent: "teal",
    targetView: "community",
    delayMs: 350,
    canAccess: (access) => hasPlatformDemoAccess(access) || communityItems.some((item) => item.canAccess(access)),
  },
  {
    id: "practitioner",
    labelKey: "landing.product.practitioner",
    fallbackLabel: "Acutis Practitioner",
    descriptionKey: "landing.product.practitioner.description",
    fallbackDescription: "Clinical practitioner workspace",
    icon: Video,
    accent: "indigo",
    href: process.env.NEXT_PUBLIC_PRACTITIONER_WEB_URL || "https://practitioner.salientrecovery.com",
    delayMs: 550,
    canAccess: (access) => hasPlatformDemoAccess(access) || canOpenPractitioner(access),
  },
  {
    id: "outreach",
    labelKey: "landing.product.outreach",
    fallbackLabel: "Acutis Outreach",
    descriptionKey: "landing.product.outreach.description",
    fallbackDescription: "Preview only",
    icon: Radio,
    accent: "orange",
    href: process.env.NEXT_PUBLIC_OUTREACH_WEB_URL,
    delayMs: 650,
    canAccess: hasPlatformDemoAccess,
  },
];

const i18nKeys = [
  "app.brand",
  "app.recovery_management",
  "landing.back_home",
  "landing.select_unit",
  "landing.select_phase",
  "landing.enter",
  "landing.no_access_title",
  "landing.no_access_description",
  "landing.loading_access",
  "landing.product.centre",
  "landing.product.centre.description",
  "landing.product.community",
  "landing.product.community.description",
  "landing.product.practitioner",
  "landing.product.practitioner.description",
  "landing.product.outreach",
  "landing.product.outreach.description",
  "landing.centre.title",
  "landing.centre.screening",
  "landing.centre.detox",
  "landing.centre.alcohol",
  "landing.centre.drugs",
  "landing.centre.ladies",
  "landing.centre.configuration",
  "landing.community.title",
  "landing.community.assessment",
  "landing.community.community",
  "header.signed_in_as",
  "header.login_different_user",
  "header.logout",
];

const accentStyles: Record<Accent, { hairline: string; tile: string; border: string; ghost: string; text: string; icon: string }> = {
  blue: {
    hairline: "from-blue-400 to-blue-600",
    tile: "from-blue-500 to-blue-600",
    border: "hover:border-blue-200",
    ghost: "bg-blue-50/60 border-blue-100",
    text: "text-blue-700",
    icon: "text-blue-600",
  },
  teal: {
    hairline: "from-teal-400 to-teal-600",
    tile: "from-teal-500 to-teal-600",
    border: "hover:border-teal-200",
    ghost: "bg-teal-50/60 border-teal-100",
    text: "text-teal-700",
    icon: "text-teal-600",
  },
  indigo: {
    hairline: "from-indigo-400 to-indigo-600",
    tile: "from-indigo-500 to-indigo-600",
    border: "hover:border-indigo-200",
    ghost: "bg-indigo-50/60 border-indigo-100",
    text: "text-indigo-700",
    icon: "text-indigo-600",
  },
  green: {
    hairline: "from-green-400 to-green-600",
    tile: "from-green-500 to-green-600",
    border: "hover:border-green-200",
    ghost: "bg-green-50/60 border-green-100",
    text: "text-green-700",
    icon: "text-green-600",
  },
  purple: {
    hairline: "from-purple-400 to-purple-600",
    tile: "from-purple-500 to-purple-600",
    border: "hover:border-purple-200",
    ghost: "bg-purple-50/60 border-purple-100",
    text: "text-purple-700",
    icon: "text-purple-600",
  },
  pink: {
    hairline: "from-pink-400 to-pink-600",
    tile: "from-pink-500 to-pink-600",
    border: "hover:border-pink-200",
    ghost: "bg-pink-50/60 border-pink-100",
    text: "text-pink-700",
    icon: "text-pink-600",
  },
  cyan: {
    hairline: "from-cyan-400 to-cyan-600",
    tile: "from-cyan-500 to-cyan-600",
    border: "hover:border-cyan-200",
    ghost: "bg-cyan-50/60 border-cyan-100",
    text: "text-cyan-700",
    icon: "text-cyan-600",
  },
  orange: {
    hairline: "from-orange-400 to-orange-600",
    tile: "from-orange-500 to-orange-600",
    border: "hover:border-orange-200",
    ghost: "bg-orange-50/60 border-orange-100",
    text: "text-orange-700",
    icon: "text-orange-600",
  },
};

function AccountMenu() {
  const { data: session, status } = useSession();
  const { t } = useLocalization();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const displayName =
    session?.username ?? session?.user?.name ?? session?.user?.email ?? (isAuthorizationDisabled ? "Guest" : "User");
  const initials = useMemo(
    () =>
      displayName
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U",
    [displayName],
  );
  const text = (key: string, fallback: string) => (t(key) === key ? fallback : t(key));

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (status !== "authenticated" && !isAuthorizationDisabled) {
    return null;
  }

  return (
    <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-sm font-semibold text-emerald-800 shadow-sm"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Account menu"
      >
        {initials}
      </button>
      {menuOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-lg">
          <div className="border-b border-emerald-50 px-4 py-3 text-sm text-gray-700">
            {text("header.signed_in_as", "Signed in as")} <span className="font-semibold">{displayName}</span>
          </div>
          {!isAuthorizationDisabled && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => signIn("keycloak")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
              >
                {text("header.login_different_user", "Log in as different user")}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => void logoutFromAcutis(session)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                {text("header.logout", "Log out")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AcutisLogo({ compact = false }: { compact?: boolean }) {
  const { t } = useLocalization();
  const brand = t("app.brand") === "app.brand" ? "ACUTIS" : t("app.brand").toUpperCase();
  const subtitle = t("app.recovery_management") === "app.recovery_management" ? "Recovery Management" : t("app.recovery_management");
  const iconSize = compact ? 44 : 72;

  return (
    <div className="flex items-center justify-center gap-4">
      <img src="/acutis-icon.svg" alt="" className={compact ? "h-11 w-11" : "h-[72px] w-[72px]"} />
      <div className="text-left">
        <h1 className={`${compact ? "text-2xl" : "text-5xl"} font-extrabold leading-none text-blue-800`}>{brand}</h1>
        <p className={`${compact ? "text-[10px]" : "text-sm"} mt-1 font-semibold uppercase text-blue-600`} style={{ letterSpacing: compact ? "0.25em" : "0.3em" }}>
          {subtitle}
        </p>
      </div>
      <span className="sr-only">{iconSize}</span>
    </div>
  );
}

function ProductCard({ item, onSelect }: { item: LandingItem; onSelect: (item: LandingItem) => void }) {
  const { t } = useLocalization();
  const [visible, setVisible] = useState(false);
  const styles = accentStyles[item.accent];
  const Icon = item.icon;
  const label = t(item.labelKey) === item.labelKey ? item.fallbackLabel : t(item.labelKey);
  const description =
    item.descriptionKey && t(item.descriptionKey) !== item.descriptionKey ? t(item.descriptionKey) : item.fallbackDescription;

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), item.delayMs);
    return () => window.clearTimeout(timeout);
  }, [item.delayMs]);

  return (
    <div className={`group relative transition-all duration-500 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
      <div className={`absolute inset-0 rotate-[-2.5deg] scale-[0.97] rounded-[2rem] border ${styles.ghost} transition-transform duration-300 group-hover:-translate-x-2 group-hover:rotate-[-5deg]`} />
      <div className={`absolute inset-0 rotate-[2.5deg] scale-[0.97] rounded-[2rem] border ${styles.ghost} transition-transform duration-300 group-hover:translate-x-2 group-hover:rotate-[5deg]`} />
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={`relative flex h-72 w-64 flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-gray-200 bg-white px-6 text-center shadow-sm transition-all duration-300 hover:shadow-xl group-hover:-translate-y-2 ${styles.border}`}
      >
        <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${styles.hairline} opacity-60 transition-opacity group-hover:opacity-100`} />
        <Icon className={`absolute -bottom-8 -right-8 h-36 w-36 ${styles.icon} opacity-[0.085] transition-opacity duration-500 group-hover:opacity-[0.13]`} />
        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${styles.tile} shadow-md transition-transform duration-300 group-hover:scale-105`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold leading-tight text-gray-900">{label}</h2>
        {description && <p className="mt-2 text-sm leading-snug text-gray-500">{description}</p>}
        <div className={`mt-5 flex translate-x-[-6px] items-center gap-1 text-sm font-semibold ${styles.text} opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100`}>
          <span>{t("landing.enter") === "landing.enter" ? "Enter" : t("landing.enter")}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
}

function UnitTile({ item, onSelect }: { item: LandingItem; onSelect: (item: LandingItem) => void }) {
  const { t } = useLocalization();
  const [visible, setVisible] = useState(false);
  const styles = accentStyles[item.accent];
  const Icon = item.icon;
  const label = t(item.labelKey) === item.labelKey ? item.fallbackLabel : t(item.labelKey);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), item.delayMs);
    return () => window.clearTimeout(timeout);
  }, [item.delayMs]);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`group relative flex h-48 w-48 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white px-4 text-center shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg ${styles.border} ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${styles.hairline} opacity-60 transition-opacity group-hover:opacity-100`} />
      <Icon className={`absolute -bottom-6 -right-6 h-28 w-28 ${styles.icon} opacity-[0.09] transition-opacity duration-500 group-hover:opacity-[0.14]`} />
      <div className={`relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${styles.tile} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <span className={`text-center text-base font-semibold leading-tight ${styles.text}`}>{label}</span>
    </button>
  );
}

function EmptyAccessNotice() {
  const { t } = useLocalization();
  const title = t("landing.no_access_title") === "landing.no_access_title" ? "No available workspaces" : t("landing.no_access_title");
  const description =
    t("landing.no_access_description") === "landing.no_access_description"
      ? "Your account is signed in, but no landing destinations are assigned yet. Ask an administrator to update your role, membership, or unit access."
      : t("landing.no_access_description");

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-amber-950">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6">{description}</p>
    </section>
  );
}

function SubLanding({
  titleKey,
  fallbackTitle,
  subtitleKey,
  fallbackSubtitle,
  items,
  onBack,
  onSelect,
  footer,
}: {
  titleKey: string;
  fallbackTitle: string;
  subtitleKey: string;
  fallbackSubtitle: string;
  items: LandingItem[];
  onBack: () => void;
  onSelect: (item: LandingItem) => void;
  footer?: React.ReactNode;
}) {
  const { t } = useLocalization();
  const title = t(titleKey) === titleKey ? fallbackTitle : t(titleKey);
  const subtitle = t(subtitleKey) === subtitleKey ? fallbackSubtitle : t(subtitleKey);
  const back = t("landing.back_home") === "landing.back_home" ? "Acutis" : t("landing.back_home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-10 sm:p-8">
      <div className="w-full max-w-4xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{back}</span>
        </button>
      </div>
      <div className="mb-12 flex flex-col items-center text-center">
        <AcutisLogo compact />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-gray-500">{subtitle}</p>
      </div>
      {items.length > 0 ? (
        <div className="flex max-w-4xl flex-wrap items-center justify-center gap-6">
          {items.map((item) => (
            <UnitTile key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <EmptyAccessNotice />
      )}
      {footer}
    </main>
  );
}

export default function StartupLanding() {
  const router = useRouter();
  const { access, loading } = useAppAccess();
  const { loadKeys, t } = useLocalization();
  const [view, setView] = useState<LandingView>("main");

  useEffect(() => {
    void loadKeys(i18nKeys);
  }, [loadKeys]);

  const visibleProducts = useMemo(() => productItems.filter((item) => item.canAccess(access)), [access]);
  const visibleCentreItems = useMemo(() => centreItems.filter((item) => item.canAccess(access)), [access]);
  const visibleCommunityItems = useMemo(() => communityItems.filter((item) => item.canAccess(access)), [access]);
  const canSeeConfiguration = canOpenConfiguration(access);

  const openItem = (item: LandingItem) => {
    if (item.targetView) {
      setView(item.targetView);
      return;
    }
    if (item.href) {
      if (/^https?:\/\//i.test(item.href)) {
        window.location.assign(item.href);
      } else {
        router.push(item.href);
      }
    }
  };

  const loadingText = t("landing.loading_access") === "landing.loading_access" ? "Loading your workspaces..." : t("landing.loading_access");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-blue-50/60 to-slate-100">
      <AccountMenu />
      {loading ? (
        <main className="flex min-h-screen items-center justify-center px-6 text-sm font-semibold text-slate-500">{loadingText}</main>
      ) : (
        <>
          {view === "main" && (
            <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:p-8">
              <div className="mb-14 sm:mb-16">
                <AcutisLogo />
              </div>
              {visibleProducts.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-10">
                  {visibleProducts.map((item) => (
                    <ProductCard key={item.id} item={item} onSelect={openItem} />
                  ))}
                </div>
              ) : (
                <EmptyAccessNotice />
              )}
            </main>
          )}
          {view === "centre" && (
            <SubLanding
              titleKey="landing.centre.title"
              fallbackTitle="Acutis Centre"
              subtitleKey="landing.select_unit"
              fallbackSubtitle="Select a unit"
              items={visibleCentreItems}
              onBack={() => setView("main")}
              onSelect={openItem}
              footer={
                canSeeConfiguration ? (
                  <button
                    type="button"
                    onClick={() => router.push("/units/config")}
                    className="group mt-10 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50/70 px-5 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                  >
                    <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                    <span>{t("landing.centre.configuration") === "landing.centre.configuration" ? "Configuration" : t("landing.centre.configuration")}</span>
                  </button>
                ) : null
              }
            />
          )}
          {view === "community" && (
            <SubLanding
              titleKey="landing.community.title"
              fallbackTitle="Acutis Community"
              subtitleKey="landing.select_phase"
              fallbackSubtitle="Select a phase"
              items={visibleCommunityItems}
              onBack={() => setView("main")}
              onSelect={openItem}
            />
          )}
        </>
      )}
    </div>
  );
}
