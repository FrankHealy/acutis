"use client";
import React from 'react';
import { Heart, Wine, Pill, Users, ClipboardCheck, UserPlus, Settings } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6">
        {/* Logo positioned a third down the viewport */}
        <div className="pt-[28vh] flex flex-col items-center">
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
              onClick={() => router.push('/units/configuration')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupLanding;
