"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Heart, Wine, Pill, Users, ClipboardCheck, UserPlus, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

const Tile: React.FC<{
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  onClick: () => void;
  delayMs?: number;
}> = ({ label, Icon, color, onClick, delayMs = 0 }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center rounded-2xl border-2 ${color} w-44 h-44 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 tile-animate`}
    style={{ animationDelay: `${delayMs}ms` }}
  >
    {/* Fixed icon container with consistent height */}
    <div className="flex items-center justify-center h-12 mb-2">
      <Icon className="h-10 w-10 opacity-90" />
    </div>
    {/* Text container with consistent height and centered alignment */}
    <div className="flex items-center justify-center h-14 px-3">
      <span className="text-lg font-semibold text-center leading-tight">{label}</span>
    </div>
  </button>
);

const StartupLanding: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const name = session?.user?.name || session?.user?.email || 'User';
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      {status === 'authenticated' && (
        <div className="absolute right-6 top-6" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm font-semibold shadow-sm"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            {initials || 'U'}
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-emerald-100 bg-white shadow-lg"
            >
              <div className="px-4 py-3 text-sm text-gray-700 border-b border-emerald-50">
                Signed in as <span className="font-semibold">{name}</span>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => signIn('keycloak')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
              >
                Log in as different user
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut()}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
      <div className="max-w-5xl mx-auto px-6">
        {/* Logo positioned a third down the viewport */}
        <div className="pt-[15vh] flex flex-col items-center">
          <img
            src="/acutis-logo-light.svg"
            alt="Acutis Logo"
            className="w-[640px] max-w-[90vw] logo-animate"
          />
          {/* Buttons row below logo */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <Tile 
              delayMs={100} 
              label="Screening & Forecasting" 
              Icon={ClipboardCheck} 
              color="border-green-400 bg-green-50 text-green-700" 
              onClick={() => router.push('/units/screening')} 
            />
            <Tile 
              delayMs={220} 
              label="Detox" 
              Icon={Heart} 
              color="border-teal-400 bg-teal-50 text-teal-700" 
              onClick={() => router.push('/units/detox')} 
            />
            <Tile 
              delayMs={340} 
              label="Alcohol & Gambling" 
              Icon={Wine} 
              color="border-blue-400 bg-blue-50 text-blue-700" 
              onClick={() => router.push('/units/alcohol')} 
            />
            <Tile 
              delayMs={460} 
              label="Drugs" 
              Icon={Pill} 
              color="border-purple-400 bg-purple-50 text-purple-700" 
              onClick={() => router.push('/units/drugs')} 
            />
            <Tile 
              delayMs={580} 
              label="Ladies" 
              Icon={Users} 
              color="border-pink-400 bg-pink-50 text-pink-700" 
              onClick={() => router.push('/units/ladies')} 
            />
            <Tile 
              delayMs={700} 
              label="Admissions" 
              Icon={UserPlus} 
              color="border-cyan-400 bg-cyan-50 text-cyan-700" 
              onClick={() => router.push('/units/admissions')} 
            />
            <Tile 
              delayMs={820} 
              label="Configuration" 
              Icon={Settings} 
              color="border-orange-400 bg-orange-50 text-orange-700" 
              onClick={() => router.push('/configuration')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupLanding;
