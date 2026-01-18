import React from 'react';
import { designTokens } from './tokens';
import { Card } from './Card';
import { IconBadge } from './IconBadge';

type StatColor = keyof typeof designTokens.colors.primary;

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: StatColor;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  color = 'blue',
  trend,
  onClick,
}) => {
  const trendColors = {
    up: designTokens.colors.status.success,
    down: designTokens.colors.status.danger,
    neutral: designTokens.colors.text.secondary,
  };

  return (
    <Card padding="lg" shadow="md" onClick={onClick}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: designTokens.spacing.lg,
        }}
      >
        <IconBadge icon={icon} color={color} size="md" />
        
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: designTokens.typography.fontSize.sm,
              color: designTokens.colors.text.secondary,
              marginBottom: designTokens.spacing.xs,
              fontWeight: designTokens.typography.fontWeight.medium,
            }}
          >
            {label}
          </div>
          
          <div
            style={{
              fontSize: designTokens.typography.fontSize['3xl'],
              fontWeight: designTokens.typography.fontWeight.bold,
              color: designTokens.colors.text.primary,
              lineHeight: designTokens.typography.lineHeight.tight,
            }}
          >
            {value}
          </div>
          
          {subtitle && (
            <div
              style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: designTokens.colors.text.tertiary,
                marginTop: designTokens.spacing.xs,
              }}
            >
              {subtitle}
            </div>
          )}
          
          {trend && (
            <div
              style={{
                fontSize: designTokens.typography.fontSize.xs,
                color: trendColors[trend.direction],
                marginTop: designTokens.spacing.sm,
                fontWeight: designTokens.typography.fontWeight.medium,
                display: 'flex',
                alignItems: 'center',
                gap: designTokens.spacing.xs,
              }}
            >
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export const StatGrid: React.FC<StatGridProps> = ({
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
