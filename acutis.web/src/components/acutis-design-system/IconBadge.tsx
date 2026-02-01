import React from 'react';
import { designTokens } from './tokens';

type BadgeColor = keyof typeof designTokens.colors.primary;
type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconBadgeProps {
  icon: React.ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  label?: string;
  sublabel?: string;
  onClick?: () => void;
  active?: boolean;
  showIndicator?: boolean;
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  color = 'blue',
  size = 'lg',
  label,
  sublabel,
  onClick,
  active = false,
  showIndicator = false,
}) => {
  const sizeMap = {
    sm: '40px',
    md: '56px',
    lg: '72px',
    xl: '96px',
  };

  const iconSizeMap = {
    sm: designTokens.iconSize.md,
    md: designTokens.iconSize.lg,
    lg: designTokens.iconSize.xl,
    xl: '40px',
  };

  const badgeSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
  };

  const badgeStyles: React.CSSProperties = {
    width: badgeSize,
    height: badgeSize,
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.primary[color],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: designTokens.colors.text.inverse,
    fontSize: iconSize,
    boxShadow: active ? designTokens.shadows.lg : designTokens.shadows.md,
    transition: `all ${designTokens.transitions.normal}`,
    transform: active ? 'scale(1.1)' : 'scale(1)',
    position: 'relative',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text.primary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.tight,
  };

  const sublabelStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  };

  const indicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '12px',
    height: '12px',
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.status.danger,
    border: `2px solid ${designTokens.colors.background.primary}`,
  };

  return (
    <div style={containerStyles} onClick={onClick}>
      <div style={badgeStyles}>
        {showIndicator && <div style={indicatorStyles} />}
        {icon}
      </div>
      {label && (
        <div>
          <div style={labelStyles}>{label}</div>
          {sublabel && <div style={sublabelStyles}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
};

interface TimelineBadgeProps extends IconBadgeProps {
  time: string;
  description: string;
}

export const TimelineBadge: React.FC<TimelineBadgeProps> = ({
  time,
  description,
  ...props
}) => {
  return <IconBadge {...props} label={time} sublabel={description} />;
};
