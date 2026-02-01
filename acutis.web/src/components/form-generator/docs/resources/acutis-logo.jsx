import React, { useState } from 'react';

const AcutisLogo = () => {
  const [selectedVariant, setSelectedVariant] = useState('primary');

  const logoVariants = {
    primary: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      text: '#ffffff',
      accent: '#60a5fa'
    },
    light: {
      background: '#ffffff',
      text: '#1e40af',
      accent: '#3b82f6'
    },
    dark: {
      background: '#1e293b',
      text: '#ffffff',
      accent: '#60a5fa'
    },
    medical: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      text: '#ffffff',
      accent: '#34d399'
    }
  };

  const currentColors = logoVariants[selectedVariant];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Acutis Logo Design
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>
            Healthcare Management System for Addiction Treatment Facilities
          </p>
        </div>

        {/* Logo Variants Selector */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap'
        }}>
          {Object.keys(logoVariants).map(variant => (
            <button
              key={variant}
              onClick={() => setSelectedVariant(variant)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: selectedVariant === variant ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                background: selectedVariant === variant ? '#eff6ff' : 'white',
                color: selectedVariant === variant ? '#1e40af' : '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {variant}
            </button>
          ))}
        </div>

        {/* Main Logo Display */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            background: currentColors.background,
            borderRadius: '12px',
            padding: '40px'
          }}>
            <svg width="400" height="120" viewBox="0 0 400 120" style={{ maxWidth: '100%' }}>
              {/* Icon - Medical Cross with Rising Path */}
              <g transform="translate(20, 30)">
                {/* Rising path symbolizing recovery */}
                <path
                  d="M 5 50 Q 15 30, 25 35 T 45 25 T 65 15"
                  fill="none"
                  stroke={currentColors.accent}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                
                {/* Medical cross */}
                <rect x="25" y="10" width="8" height="40" rx="2" fill={currentColors.text} />
                <rect x="13" y="22" width="32" height="8" rx="2" fill={currentColors.text} />
                
                {/* Heart accent */}
                <path
                  d="M 29 15 C 29 12, 32 10, 34 12 C 36 10, 39 12, 39 15 C 39 18, 34 23, 34 23 C 34 23, 29 18, 29 15"
                  fill={currentColors.accent}
                  opacity="0.8"
                />
              </g>

              {/* Text: ACUTIS */}
              <g transform="translate(100, 60)">
                <text
                  style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    fill: currentColors.text,
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    letterSpacing: '-1px'
                  }}
                >
                  ACUTIS
                </text>
              </g>

              {/* Tagline */}
              <g transform="translate(102, 85)">
                <text
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    fill: currentColors.text,
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    letterSpacing: '2px',
                    opacity: '0.7'
                  }}
                >
                  HEALTHCARE MANAGEMENT
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Icon Only Versions */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Icon Variations
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {['Small', 'Medium', 'Large'].map(size => {
              const dimensions = { Small: 60, Medium: 80, Large: 100 };
              const dim = dimensions[size];
              return (
                <div key={size} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <svg width={dim} height={dim} viewBox="0 0 70 70">
                    <rect width="70" height="70" rx="12" fill={currentColors.background} />
                    <g transform="translate(17, 17)">
                      <path
                        d="M 2 30 Q 8 15, 15 20 T 28 10 T 36 5"
                        fill="none"
                        stroke={currentColors.accent}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        opacity="0.6"
                      />
                      <rect x="14" y="8" width="6" height="28" rx="2" fill={currentColors.text} />
                      <rect x="7" y="15" width="20" height="6" rx="2" fill={currentColors.text} />
                      <path
                        d="M 17 11 C 17 9, 19 8, 20 10 C 21 8, 23 9, 23 11 C 23 13, 20 16, 20 16 C 20 16, 17 13, 17 11"
                        fill={currentColors.accent}
                        opacity="0.9"
                      />
                    </g>
                  </svg>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#64748b' 
                  }}>
                    {size}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage Examples */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Usage Examples
          </h2>
          
          {/* App Header Example */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <div style={{
              background: currentColors.background,
              padding: '20px 30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <svg width="40" height="40" viewBox="0 0 70 70">
                  <rect width="70" height="70" rx="8" fill="rgba(255,255,255,0.2)" />
                  <g transform="translate(17, 17)">
                    <rect x="14" y="8" width="6" height="28" rx="2" fill={currentColors.text} />
                    <rect x="7" y="15" width="20" height="6" rx="2" fill={currentColors.text} />
                  </g>
                </svg>
                <div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: currentColors.text,
                    letterSpacing: '-0.5px'
                  }}>
                    ACUTIS
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: currentColors.text,
                    opacity: 0.8,
                    letterSpacing: '1px'
                  }}>
                    ADMISSIONS
                  </div>
                </div>
              </div>
              <div style={{ color: currentColors.text, opacity: 0.9 }}>
                Dashboard
              </div>
            </div>
            <div style={{ padding: '20px 30px', color: '#64748b' }}>
              App header with logo integration
            </div>
          </div>

          {/* Mobile App Icon */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Mobile App Icon</p>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="appGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <rect width="120" height="120" rx="26" fill="url(#appGrad)" />
              <g transform="translate(30, 30)">
                <path
                  d="M 5 45 Q 12 25, 22 30 T 42 18 T 55 8"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <rect x="22" y="12" width="10" height="45" rx="3" fill="white" />
                <rect x="12" y="24" width="30" height="10" rx="3" fill="white" />
                <path
                  d="M 27 16 C 27 13, 30 11, 32 14 C 34 11, 37 13, 37 16 C 37 20, 32 25, 32 25 C 32 25, 27 20, 27 16"
                  fill="#60a5fa"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Design Notes */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1e293b',
            marginBottom: '20px'
          }}>
            Design Concept
          </h2>
          <div style={{ 
            display: 'grid', 
            gap: '16px',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            <div>
              <strong style={{ color: '#1e293b' }}>Medical Cross:</strong> Represents healthcare and medical authority, central to the treatment facility's mission.
            </div>
            <div>
              <strong style={{ color: '#1e293b' }}>Rising Path:</strong> Symbolizes the journey of recovery and upward progress through treatment.
            </div>
            <div>
              <strong style={{ color: '#1e293b' }}>Heart Accent:</strong> Emphasizes care, compassion, and the human element of addiction treatment.
            </div>
            <div>
              <strong style={{ color: '#1e293b' }}>Blue Color Palette:</strong> Conveys trust, professionalism, calm, and stability - essential qualities in healthcare.
            </div>
            <div>
              <strong style={{ color: '#1e293b' }}>Clean Typography:</strong> Modern, professional, and easily readable across all platforms and sizes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcutisLogo;
