"use client";
import React from 'react';
import { Heart, Wine, Pill, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <span className="text-lg font-semibold">{label}</span>
  </button>
);

const StartupLanding: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6">
        {/* Logo positioned a third down the viewport */}
        <div className="pt-[33vh] flex flex-col items-center">
          <img
            src="/acutis-logo-light.svg"
            alt="Acutis Logo"
            className="w-[520px] max-w-full logo-animate"
          />
          {/* Buttons row below logo */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Tile delayMs={100} label="Detox" Icon={Heart} color="border-green-400 bg-green-50 text-green-700" onClick={() => router.push('/units/detox')} />
            <Tile delayMs={220} label="Alcohol" Icon={Wine} color="border-blue-400 bg-blue-50 text-blue-700" onClick={() => router.push('/units/alcohol')} />
            <Tile delayMs={340} label="Drugs" Icon={Pill} color="border-purple-400 bg-purple-50 text-purple-700" onClick={() => router.push('/units/drugs')} />
            <Tile delayMs={460} label="Ladies" Icon={Users} color="border-pink-400 bg-pink-50 text-pink-700" onClick={() => router.push('/units/ladies')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupLanding;
