import React from 'react';
import { designTokens } from './tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'lg',
  shadow = 'md',
  onClick,
  style,
  onMouseEnter,
  onMouseLeave,
}) => {
  const paddingMap = {
    sm: designTokens.spacing.sm,
    md: designTokens.spacing.md,
    lg: designTokens.spacing.lg,
    xl: designTokens.spacing.xl,
  };

  const shadowMap = {
    none: designTokens.shadows.none,
    sm: designTokens.shadows.sm,
    md: designTokens.shadows.md,
    lg: designTokens.shadows.lg,
  };

  const styles: React.CSSProperties = {
    backgroundColor: designTokens.colors.background.primary,
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: shadowMap[shadow],
    padding: paddingMap[padding],
    transition: `all ${designTokens.transitions.normal}`,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const hoverStyles = onClick
    ? {
        ':hover': {
          boxShadow: designTokens.shadows.lg,
          transform: 'translateY(-2px)',
        },
      }
    : {};

  return (
    <div
      className={`acutis-card ${className}`}
      style={styles}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.md,
        marginBottom: designTokens.spacing.lg,
      }}
    >
      {icon && (
        <div
          style={{
            color: designTokens.colors.primary.blue,
            fontSize: designTokens.typography.fontSize.xl,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <h3
          style={{
            fontSize: designTokens.typography.fontSize.xl,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.text.primary,
            margin: 0,
            lineHeight: designTokens.typography.lineHeight.tight,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: designTokens.colors.text.secondary,
              margin: 0,
              marginTop: designTokens.spacing.xs,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};
