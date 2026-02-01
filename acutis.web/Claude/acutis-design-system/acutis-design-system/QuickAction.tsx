import React from 'react';
import { designTokens } from './tokens';

type ActionColor = keyof typeof designTokens.colors.primary;

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color?: ActionColor;
  onClick: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  color = 'blue',
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const backgroundColor = (() => {
    const colorMap = {
      blue: '#E3F2FD',
      green: '#E8F5E9',
      purple: '#F3E5F5',
      orange: '#FFF3E0',
      teal: '#E0F7FA',
      red: '#FFEBEE',
    };
    return colorMap[color];
  })();

  const iconColor = designTokens.colors.primary[color];

  const containerStyles: React.CSSProperties = {
    backgroundColor,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.md,
    cursor: 'pointer',
    transition: `all ${designTokens.transitions.normal}`,
    border: `2px solid ${isHovered ? iconColor : 'transparent'}`,
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered ? designTokens.shadows.lg : designTokens.shadows.sm,
    minHeight: '140px',
  };

  const iconStyles: React.CSSProperties = {
    fontSize: designTokens.iconSize.xl,
    color: iconColor,
    transition: `all ${designTokens.transitions.normal}`,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
  };

  return (
    <div
      style={containerStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={iconStyles}>{icon}</div>
      <div style={labelStyles}>{label}</div>
    </div>
  );
};

interface QuickActionsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  children,
  columns = 4,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: designTokens.spacing.lg,
      }}
    >
      {children}
    </div>
  );
};
