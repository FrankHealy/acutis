"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLocalization } from '@/areas/shared/i18n/LocalizationProvider';
import { getScreeningControl } from '@/areas/screening/services/screeningControlService';
import { isAuthorizationDisabled } from '@/lib/authMode';

interface HeaderProps {
  showCapacity?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showCapacity = true }) => {
  const { data: session } = useSession();
  const { locale, setLocale, t, loadKeys } = useLocalization();
  const [today, setToday] = useState<string>("");
  const [now, setNow] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [capacityText, setCapacityText] = useState('92/120');
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

    const loadControl = async () => {
      const accessToken = session?.accessToken;
      if (!accessToken && !isAuthorizationDisabled) return;
      try {
        const control = await getScreeningControl(accessToken);
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
  }, [session?.accessToken]);

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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                aria-label="Go to home"
                onClick={() => router.push('/')}
                className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-blue-200 flex items-center justify-center hover:ring-2 hover:ring-blue-200 transition"
              >
                <img src="/acutis-icon.svg" alt="Acutis" className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('app.brand')}</h1>
                <p className="text-xs text-gray-500">{t('app.centre.bruree')}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              {showCapacity && (
                <>
                  <span>{t('header.capacity')}: {capacityText}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                </>
              )}
              <span>{today || "\u00A0"}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{t('header.current_time')}: {now || "\u00A0"}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="hidden md:flex items-center gap-2 text-xs text-gray-600">
              <span>Language</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
              >
                <option value="en-IE">EN</option>
                <option value="ga-IE">GA</option>
                <option value="ar">AR</option>
              </select>
            </label>
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <AlertTriangle className="h-5 w-5" />
              </button>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center justify-center"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                {initials}
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-emerald-100 bg-white shadow-lg z-50"
                >
                  <div className="px-4 py-3 text-sm text-gray-700 border-b border-emerald-50">
                    {t('header.signed_in_as')} <span className="font-semibold">{displayName}</span>
                  </div>
                  {!isAuthorizationDisabled && (
                    <>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => signIn('keycloak')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
                      >
                        {t('header.login_different_user')}
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
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        {t('header.logout')}
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
