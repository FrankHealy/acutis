"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Pill, Shield, Venus, Wine } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLocalization } from '@/areas/shared/i18n/LocalizationProvider';
import { getScreeningControl } from '@/areas/screening/services/screeningControlService';
import { isAuthorizationDisabled } from '@/lib/authMode';
import type { UnitDefinition } from '@/areas/shared/unit/unitTypes';
import { UnitDefinitions } from '@/areas/shared/unit/unitTypes';
import { unitIdentityService } from '@/services/unitIdentityService';
import { availableThemes, useTheme } from '@/areas/shared/theme/ThemeProvider';
import { DEFAULT_THEME_KEY, type ThemeKey } from '@/areas/shared/theme/themeSystem';
import { useAppAccess } from '@/areas/shared/hooks/useAppAccess';
import { staffRosterService, type UnitStaffRosterShiftDto } from '@/services/staffRosterService';

const THEME_MANAGE_PERMISSION = 'theme.manage';

interface HeaderProps {
  showCapacity?: boolean;
  unitCode?: string;
  unitName?: string;
  unitLabel?: string;
  unitAccentClass?: string;
  unitIconKey?: UnitDefinition["iconKey"];
  onOpenIncidentCapture?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showCapacity = true,
  unitCode,
  unitName,
  unitLabel = "Current Unit",
  unitAccentClass,
  unitIconKey,
  onOpenIncidentCapture,
}) => {
  const { access } = useAppAccess();
  const { centreThemeKey, userThemeKey, setCentreThemeKey, setUserThemeKey } = useTheme();
  const { data: session } = useSession();
  const { locale, setLocale, t, loadKeys } = useLocalization();
  const [today, setToday] = useState<string>("");
  const [now, setNow] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [capacityText, setCapacityText] = useState('92/120');
  const [brandName, setBrandName] = useState<string>("");
  const [brandSubtitle, setBrandSubtitle] = useState<string>("");
  const [brandLogoUrl, setBrandLogoUrl] = useState<string>("");
  const [resolvedUnitId, setResolvedUnitId] = useState<string>("");
  const [counsellorOnDutyText, setCounsellorOnDutyText] = useState<string>("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const displayName =
    session?.username ?? session?.user?.name ?? session?.user?.email ?? (isAuthorizationDisabled ? 'Guest' : 'User');
  const initials = useMemo(() => {
    return displayName
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';
  }, [displayName]);
  const unitIconMap = {
    wine: Wine,
    shield: Shield,
    pill: Pill,
    venus: Venus,
  } as const;
  const unitTabletThemeMap = {
    wine: "border-blue-200 bg-blue-50 text-blue-800 shadow-blue-100/80",
    shield: "border-red-200 bg-red-50 text-red-800 shadow-red-100/80",
    pill: "border-orange-200 bg-orange-50 text-orange-800 shadow-orange-100/80",
    venus: "border-pink-200 bg-pink-50 text-pink-800 shadow-pink-100/80",
  } as const;
  const UnitIcon = unitIconKey ? unitIconMap[unitIconKey] : null;
  const unitTabletTheme = unitIconKey ? unitTabletThemeMap[unitIconKey] : "";

  useEffect(() => {
    void loadKeys([
      'app.brand',
      'app.centre.bruree',
      'header.capacity',
      'header.current_time',
      'header.signed_in_as',
      'header.login_different_user',
      'header.logout',
    ]);
  }, [loadKeys]);

  useEffect(() => {
    let active = true;

    const loadBranding = async () => {
      if (!unitCode) {
        return;
      }

      try {
        const unit = await unitIdentityService.resolveByCode(unitCode, session?.accessToken);
        if (!active) {
          return;
        }

        setBrandName(unit.brandName?.trim() || "");
        setBrandSubtitle(unit.brandSubtitle?.trim() || "");
        setBrandLogoUrl(unit.brandLogoUrl?.trim() || "");
        setResolvedUnitId(unit.unitId);
        setCentreThemeKey((unit.themeKey?.trim().toLowerCase() || DEFAULT_THEME_KEY) as ThemeKey);
      } catch {
        if (!active) {
          return;
        }

        setBrandName("");
        setBrandSubtitle("");
        setBrandLogoUrl("");
        setResolvedUnitId("");
        setCentreThemeKey(DEFAULT_THEME_KEY);
      }
    };

    void loadBranding();

    return () => {
      active = false;
    };
  }, [session?.accessToken, setCentreThemeKey, unitCode]);

  useEffect(() => {
    let active = true;

    const loadControl = async () => {
      const accessToken = session?.accessToken;
      if (!showCapacity) return;
      if (!unitCode || !(unitCode in UnitDefinitions)) return;
      if (!accessToken && !isAuthorizationDisabled) return;
      try {
        const control = await getScreeningControl(accessToken, { unitId: unitCode as keyof typeof UnitDefinitions });
        if (!active) return;
        setCapacityText(`${control.currentOccupancy}/${control.unitCapacity}`);
      } catch {
        // Keep fallback header values if control cannot be loaded.
      }
    };

    void loadControl();

    return () => {
      active = false;
    };
  }, [session?.accessToken, showCapacity, unitCode]);

  useEffect(() => {
    // Compute on client to avoid SSR/client mismatch
    const update = () => {
      const d = new Date();
      setToday(
        d.toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
      setNow(
        d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [locale]);

  useEffect(() => {
    let active = true;

    const isActiveShift = (shift: UnitStaffRosterShiftDto, currentMinutes: number) => {
      const normalizedCurrentMinutes =
        currentMinutes < shift.startMinutes && shift.endMinutes > 1440
          ? currentMinutes + 1440
          : currentMinutes;
      return normalizedCurrentMinutes >= shift.startMinutes && normalizedCurrentMinutes < shift.endMinutes;
    };

    const loadCounsellorOnDuty = async () => {
      if (!unitCode) {
        if (active) {
          setCounsellorOnDutyText("");
        }
        return;
      }

      if (!session?.accessToken && !isAuthorizationDisabled) {
        return;
      }

      try {
        const board = await staffRosterService.getBoard(
          session?.accessToken,
          unitCode,
          new Date().toISOString().slice(0, 10),
        );
        if (!active) {
          return;
        }

        const codShifts = board.shifts.filter(
          (shift) =>
            shift.shiftType === "CouncillorOnDutyMorning" ||
            shift.shiftType === "CouncillorOnDutyEvening",
        );
        const currentMinutes = (() => {
          const date = new Date();
          return date.getHours() * 60 + date.getMinutes();
        })();
        const activeShift = codShifts.find((shift) => isActiveShift(shift, currentMinutes));
        const displayName = activeShift?.assignedStaffName || codShifts.find((shift) => shift.assignedStaffName)?.assignedStaffName || "";
        setCounsellorOnDutyText(displayName ? `COD: ${displayName}` : "");
      } catch {
        if (active) {
          setCounsellorOnDutyText("");
        }
      }
    };

    void loadCounsellorOnDuty();
    return () => {
      active = false;
    };
  }, [session?.accessToken, unitCode]);

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const resolvedBrandName = brandName || text('app.brand', 'Acutis');
  const resolvedBrandSubtitle = brandSubtitle || text('app.centre.bruree', 'Bruree Treatment Center');
  const resolvedBrandLogoUrl = brandLogoUrl || "/acutis-icon.svg";
  const canManageTheme =
    access.permissions.includes(THEME_MANAGE_PERMISSION) ||
    (resolvedUnitId
      ? access.unitPermissions.includes(`${resolvedUnitId}|${THEME_MANAGE_PERMISSION}`)
      : false);
  const selectedThemeKey = userThemeKey ?? centreThemeKey;

  return (
    <header className="app-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2">
              <button
                aria-label="Go to home"
                onClick={() => router.push('/')}
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border bg-[var(--app-surface)] transition hover:ring-2 hover:ring-[color:var(--app-primary-soft)] sm:h-16 sm:w-16"
              >
                <img
                  src={resolvedBrandLogoUrl}
                  alt={resolvedBrandName}
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                  onError={(event) => {
                    if (event.currentTarget.src.endsWith("/acutis-icon.svg")) {
                      return;
                    }

                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/acutis-icon.svg";
                  }}
                />
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text)] sm:text-4xl">{resolvedBrandName}</h1>
                <p className="text-sm text-[var(--app-text-muted)]">{resolvedBrandSubtitle}</p>
              </div>
            </div>
            {unitName && UnitIcon && (
              <div className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm ${unitTabletTheme}`}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-inner">
                  <UnitIcon className={`h-5 w-5 ${unitAccentClass ?? ""}`} />
                </div>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--app-text-muted)]">{unitLabel}</p>
                  <p className={`text-base font-bold sm:text-lg ${unitAccentClass ?? ""}`}>{unitName}</p>
                </div>
              </div>
            )}
            <div className="hidden xl:flex items-center space-x-4 text-sm text-[var(--app-text-muted)]">
              {showCapacity && (
                <>
                  <span>{text('header.capacity', 'Capacity')}: {capacityText}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                </>
              )}
              <span>{today || "\u00A0"}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{text('header.current_time', 'Current time')}: {now || "\u00A0"}</span>
              {counsellorOnDutyText && (
                <>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{counsellorOnDutyText}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <label className="hidden md:flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
              <span>Language</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value)}
                className="rounded border bg-[var(--app-surface)] px-2 py-1 text-xs text-[var(--app-text)]"
              >
                <option value="en-IE">EN</option>
                <option value="ga-IE">GA</option>
                <option value="ar">AR</option>
              </select>
            </label>
            {canManageTheme && (
              <label className="hidden md:flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                <span>Theme</span>
                <select
                  value={selectedThemeKey}
                  onChange={(event) => setUserThemeKey(event.target.value as ThemeKey)}
                  className="rounded border bg-[var(--app-surface)] px-2 py-1 text-xs text-[var(--app-text)]"
                >
                  {availableThemes.map((theme) => (
                    <option key={theme.key} value={theme.key}>
                      {theme.name}
                    </option>
                  ))}
                </select>
                {userThemeKey && (
                  <button
                    type="button"
                    onClick={() => setUserThemeKey(null)}
                    className="text-xs font-semibold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)]"
                  >
                    Reset
                  </button>
                )}
              </label>
            )}
            {onOpenIncidentCapture && (
              <button
                type="button"
                onClick={onOpenIncidentCapture}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                New Incident
              </button>
            )}
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
              <button className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                <AlertTriangle className="h-5 w-5" />
              </button>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-[var(--app-primary-soft)] text-sm font-semibold text-[var(--app-primary-strong)]"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                {initials}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-60 rounded-xl border bg-[var(--app-surface)] shadow-lg"
                >
                  <div className="border-b px-4 py-3 text-sm text-[var(--app-text)]">
                    {text('header.signed_in_as', 'Signed in as')} <span className="font-semibold">{displayName}</span>
                  </div>
                  {!isAuthorizationDisabled && (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => signIn('keycloak')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--app-surface-muted)]"
                      >
                        {text('header.login_different_user', 'Log in as different user')}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          await signOut({ redirect: false });
                          const issuer = session?.issuer;
                          const idToken = session?.idToken;
                          if (issuer && idToken) {
                            const logoutUrl = new URL(`${issuer}/protocol/openid-connect/logout`);
                            logoutUrl.searchParams.set('id_token_hint', idToken);
                            logoutUrl.searchParams.set(
                              'post_logout_redirect_uri',
                              `${window.location.origin}/api/auth/signin`
                            );
                            window.location.href = logoutUrl.toString();
                            return;
                          }
                          signIn('keycloak', { prompt: 'login' });
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[var(--app-danger)] hover:bg-[var(--app-surface-muted)]"
                      >
                        {text('header.logout', 'Log out')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
