import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck, Heart, Wine, Pill, Users, Settings,
  HeartHandshake, Video, ArrowLeft, Building2, ClipboardList, ArrowRight
} from 'lucide-react';

// ─────────────────────────────────────────────
// Acutis logo — cross, heart accent, rising path
// ─────────────────────────────────────────────
const AcutisLogo = ({ size = 'large' }) => {
  const dims = size === 'large' ? { icon: 72, title: 'text-5xl', sub: 'text-sm tracking-[0.3em]' }
                                : { icon: 44, title: 'text-2xl', sub: 'text-[10px] tracking-[0.25em]' };
  return (
    <div className="flex items-center justify-center space-x-4">
      <svg width={dims.icon} height={dims.icon} viewBox="0 0 64 64">
        <path d="M 4 52 Q 16 30, 28 36 T 50 18 T 62 8"
          fill="none" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" />
        <rect x="26" y="12" width="12" height="44" rx="3" fill="#1d4ed8" />
        <rect x="14" y="24" width="36" height="12" rx="3" fill="#1d4ed8" />
        <path d="M 40 10 C 40 7, 43.5 5.5, 45.5 8 C 47.5 5.5, 51 7, 51 10 C 51 14, 45.5 19, 45.5 19 C 45.5 19, 40 14, 40 10"
          fill="#3b82f6" />
      </svg>
      <div className="text-left">
        <h1 className={`${dims.title} font-extrabold text-blue-800 leading-none`}>ACUTIS</h1>
        <p className={`${dims.sub} font-semibold text-blue-600 uppercase mt-1`}>Recovery Management</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ProductCard — stacked deck, hairline accent,
// watermark icon, gradient icon tile, hover enter.
// ─────────────────────────────────────────────
const ProductCard = ({ delayMs, label, sublabel, Icon, accent, onClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const accents = {
    blue: {
      hairline: 'from-blue-400 to-blue-600',
      iconTile: 'from-blue-500 to-blue-600',
      border: 'hover:border-blue-200',
      ghost: 'bg-blue-50/60 border-blue-100',
      watermark: 'text-blue-600',
      enter: 'text-blue-600'
    },
    teal: {
      hairline: 'from-teal-400 to-teal-600',
      iconTile: 'from-teal-500 to-teal-600',
      border: 'hover:border-teal-200',
      ghost: 'bg-teal-50/60 border-teal-100',
      watermark: 'text-teal-600',
      enter: 'text-teal-600'
    },
    indigo: {
      hairline: 'from-indigo-400 to-indigo-600',
      iconTile: 'from-indigo-500 to-indigo-600',
      border: 'hover:border-indigo-200',
      ghost: 'bg-indigo-50/60 border-indigo-100',
      watermark: 'text-indigo-600',
      enter: 'text-indigo-600'
    }
  };
  const a = accents[accent];

  return (
    <div
      className={`relative group transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* ghost stack layers */}
      <div className={`absolute inset-0 rounded-2xl border ${a.ghost}
        transition-transform duration-300
        rotate-[-2.5deg] scale-[0.97] group-hover:rotate-[-5deg] group-hover:-translate-x-2`} />
      <div className={`absolute inset-0 rounded-2xl border ${a.ghost}
        transition-transform duration-300
        rotate-[2.5deg] scale-[0.97] group-hover:rotate-[5deg] group-hover:translate-x-2`} />

      {/* face card */}
      <button
        onClick={onClick}
        className={`relative w-64 h-72 bg-white rounded-2xl border border-gray-200 ${a.border}
          shadow-sm hover:shadow-xl transition-all duration-300
          group-hover:-translate-y-2 overflow-hidden
          flex flex-col items-center justify-center px-6 text-center`}
      >
        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${a.hairline}
          opacity-60 group-hover:opacity-100 transition-opacity`} />

        <Icon className={`absolute -bottom-6 -right-6 h-32 w-32 ${a.watermark} opacity-[0.035]
          group-hover:opacity-[0.06] transition-opacity duration-500`} />

        <div className={`w-16 h-16 bg-gradient-to-br ${a.iconTile} rounded-2xl shadow-md
          flex items-center justify-center mb-5
          group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">{label}</h2>
        <p className="text-sm text-gray-500 mt-2 leading-snug">{sublabel}</p>

        <div className={`flex items-center space-x-1 mt-5 text-sm font-semibold ${a.enter}
          opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-300`}>
          <span>Enter</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// UnitTile — theme carried forward from the
// product cards: white face, hairline accent,
// and a large semi-opaque icon as the visual.
// ─────────────────────────────────────────────
const UnitTile = ({ delayMs, label, Icon, accent, onClick }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const accents = {
    green:  { hairline: 'from-green-400 to-green-600',   icon: 'text-green-600',  text: 'text-green-800',  border: 'hover:border-green-200' },
    teal:   { hairline: 'from-teal-400 to-teal-600',     icon: 'text-teal-600',   text: 'text-teal-800',   border: 'hover:border-teal-200' },
    blue:   { hairline: 'from-blue-400 to-blue-600',     icon: 'text-blue-600',   text: 'text-blue-800',   border: 'hover:border-blue-200' },
    purple: { hairline: 'from-purple-400 to-purple-600', icon: 'text-purple-600', text: 'text-purple-800', border: 'hover:border-purple-200' },
    pink:   { hairline: 'from-pink-400 to-pink-600',     icon: 'text-pink-600',   text: 'text-pink-800',   border: 'hover:border-pink-200' },
    cyan:   { hairline: 'from-cyan-400 to-cyan-600',     icon: 'text-cyan-600',   text: 'text-cyan-800',   border: 'hover:border-cyan-200' }
  };
  const a = accents[accent];

  return (
    <button
      onClick={onClick}
      className={`relative w-44 h-44 bg-white rounded-2xl border border-gray-200 ${a.border}
        shadow-sm hover:shadow-lg overflow-hidden group
        flex flex-col items-center justify-center px-4
        transition-all duration-500 ease-out hover:-translate-y-1
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* hairline accent, top edge */}
      <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${a.hairline}
        opacity-60 group-hover:opacity-100 transition-opacity`} />

      {/* watermark icon — bottom right, cropped by the corner */}
      <Icon className={`absolute -bottom-5 -right-5 h-24 w-24 ${a.icon} opacity-[0.035]
        group-hover:opacity-[0.06] transition-opacity duration-500`} />

      <span className={`text-base font-semibold text-center leading-tight ${a.text}`}>{label}</span>
    </button>
  );
};

// ─────────────────────────────────────────────
// Sub-landing shell
// ─────────────────────────────────────────────
const SubLanding = ({ title, subtitle, onBack, children, footer }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8">
    <div className="w-full max-w-4xl">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Acutis</span>
      </button>
    </div>

    <div className="flex flex-col items-center mb-12">
      <AcutisLogo size="small" />
      <h2 className="text-2xl font-bold text-gray-900 mt-6">{title}</h2>
      <p className="text-gray-500 mt-1">{subtitle}</p>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-6 max-w-4xl">
      {children}
    </div>

    {footer}
  </div>
);

// ─────────────────────────────────────────────
// Acutis Centre — five units + compact Configuration
// ─────────────────────────────────────────────
const CentreLanding = ({ onBack }) => (
  <SubLanding
    title="Acutis Centre"
    subtitle="Select a unit"
    onBack={onBack}
    footer={
      <button
        onClick={() => {}}
        className="mt-10 flex items-center space-x-2 px-5 py-2.5 rounded-xl
          border border-orange-200 bg-orange-50/70 text-orange-700
          text-sm font-semibold shadow-sm
          hover:bg-orange-50 hover:shadow transition-all"
      >
        <Settings className="h-4 w-4" />
        <span>Configuration</span>
      </button>
    }
  >
    <UnitTile delayMs={100} label="Screening & Forecasting" Icon={ClipboardCheck} accent="green" onClick={() => {}} />
    <UnitTile delayMs={200} label="Detox" Icon={Heart} accent="teal" onClick={() => {}} />
    <UnitTile delayMs={300} label="Alcohol & Gambling" Icon={Wine} accent="blue" onClick={() => {}} />
    <UnitTile delayMs={400} label="Drugs" Icon={Pill} accent="purple" onClick={() => {}} />
    <UnitTile delayMs={500} label="Ladies" Icon={Users} accent="pink" onClick={() => {}} />
  </SubLanding>
);

// ─────────────────────────────────────────────
// Acutis Community — Assessment phase, then Community
// ─────────────────────────────────────────────
const CommunityLanding = ({ onBack }) => (
  <SubLanding
    title="Acutis Community"
    subtitle="Select a phase"
    onBack={onBack}
  >
    <UnitTile delayMs={100} label="Assessment" Icon={ClipboardList} accent="cyan" onClick={() => {}} />
    <UnitTile delayMs={200} label="Community" Icon={HeartHandshake} accent="teal" onClick={() => {}} />
  </SubLanding>
);

// ─────────────────────────────────────────────
// Main landing — three products
// ─────────────────────────────────────────────
const MainLanding = ({ onEnterCentre, onEnterCommunity }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8">
    <div className="mb-16">
      <AcutisLogo size="large" />
    </div>

    <div className="flex flex-wrap items-center justify-center gap-10">
      <ProductCard
        delayMs={150}
        label="Acutis Centre"
        sublabel="Residential treatment management"
        Icon={Building2}
        accent="blue"
        onClick={onEnterCentre}
      />
      <ProductCard
        delayMs={350}
        label="Acutis Community"
        sublabel="Community based treatment"
        Icon={HeartHandshake}
        accent="teal"
        onClick={onEnterCommunity}
      />
      <ProductCard
        delayMs={550}
        label="Acutis Practitioner"
        sublabel="Clinical practitioner workspace"
        Icon={Video}
        accent="indigo"
        onClick={() => {}}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────
const AcutisLanding = () => {
  const [view, setView] = useState('main');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/60 to-slate-100">
      {view === 'main' && (
        <MainLanding
          onEnterCentre={() => setView('centre')}
          onEnterCommunity={() => setView('community')}
        />
      )}
      {view === 'centre' && <CentreLanding onBack={() => setView('main')} />}
      {view === 'community' && <CommunityLanding onBack={() => setView('main')} />}
    </div>
  );
};

export default AcutisLanding;
