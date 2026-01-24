import React from 'react';
import { designTokens } from '../../components/acutis-design-system/tokens'
import { Card, CardHeader } from '../../components/acutis-design-system/Card';
import { StatCard, StatGrid } from '../../components/acutis-design-system/StatCard';
import { QuickAction, QuickActionsGrid } from '../../components/acutis-design-system/QuickAction';
import { IconBadge } from '../../components/acutis-design-system/IconBadge';

/**
 * Admissions Page - Redesigned using Dashboard Design System
 * 
 * This example shows how to transform the rectangular stat cards
 * and action buttons into the circular icon-based dashboard stylm e
 */

// Mock icon components - replace with your actual icon library
const CalendarIcon = () => <span>📅</span>;
const CheckIcon = () => <span>✓</span>;
const AlertIcon = () => <span>⚠</span>;
const UsersIcon = () => <span>👥</span>;
const ClipboardIcon = () => <span>📋</span>;
const SettingsIcon = () => <span>⚙️</span>;
const ChartIcon = () => <span>📊</span>;
const UserPlusIcon = () => <span>➕</span>;

export const AdmissionsPageRedesigned: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: designTokens.colors.background.secondary,
        minHeight: '100vh',
        padding: designTokens.spacing['2xl'],
      }}
    >
      {/* Page Header */}
      <div
        style={{
          marginBottom: designTokens.spacing.xl,
        }}
      >
        <h1
          style={{
            fontSize: designTokens.typography.fontSize['4xl'],
            fontWeight: designTokens.typography.fontWeight.bold,
            color: designTokens.colors.text.primary,
            margin: 0,
            marginBottom: designTokens.spacing.sm,
          }}
        >
          Admissions
        </h1>
        <p
          style={{
            fontSize: designTokens.typography.fontSize.base,
            color: designTokens.colors.text.secondary,
            margin: 0,
          }}
        >
          Sunday 18 January 2026
        </p>
      </div>

      {/* Stats Grid - Dashboard Style */}
      <StatGrid columns={4}>
        <StatCard
          icon={<CalendarIcon />}
          label="Expected Today"
          value="4"
          subtitle="4 pending arrival"
          color="blue"
        />
        <StatCard
          icon={<CheckIcon />}
          label="Completed Today"
          value="5"
          color="green"
          trend={{ value: '+2 from yesterday', direction: 'up' }}
        />
        <StatCard
          icon={<AlertIcon />}
          label="Needs Review"
          value="2"
          subtitle="Requires attention"
          color="orange"
        />
        <StatCard
          icon={<UsersIcon />}
          label="Current Occupancy"
          value="78%"
          subtitle="47 of 60 beds"
          color="purple"
        />
      </StatGrid>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: designTokens.spacing.lg,
          marginTop: designTokens.spacing.xl,
        }}
      >
        {/* Main Content */}
        <div>
          {/* Walk-in Banner */}
          <Card
            padding="lg"
            shadow="md"
            onClick={() => console.log('Start walk-in')}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: designTokens.colors.primary.blue,
                padding: designTokens.spacing.lg,
                borderRadius: designTokens.borderRadius.md,
                margin: `-${designTokens.spacing.lg}`,
                marginBottom: designTokens.spacing.lg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.lg }}>
                <IconBadge
                  icon={<UserPlusIcon />}
                  color="blue"
                  size="md"
                />
                <div>
                  <h3
                    style={{
                      color: designTokens.colors.text.inverse,
                      fontSize: designTokens.typography.fontSize.lg,
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      margin: 0,
                      marginBottom: designTokens.spacing.xs,
                    }}
                  >
                    Walk-in / Not on List
                  </h3>
                  <p
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: designTokens.typography.fontSize.sm,
                      margin: 0,
                    }}
                  >
                    Start new admission for unexpected arrival
                  </p>
                </div>
              </div>
              <span style={{ color: designTokens.colors.text.inverse, fontSize: '24px' }}>→</span>
            </div>
          </Card>

          {/* Expected Admissions */}
          <Card padding="lg" shadow="md">
            <CardHeader title="Expected Admissions (4)" />

            {/* Admission List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
              <AdmissionListItem
                initials="MO"
                name="Michael O'Brien"
                status="Expected"
                time="10:00"
                details={['Alcohol', 'Phone Eval ✓']}
                badgeColor="blue"
                actionLabel="Start Admission"
              />
              <AdmissionListItem
                initials="PM"
                name="Patrick Murphy"
                status="Expected"
                time="11:30"
                details={['Alcohol', 'Phone Eval ✓']}
                badgeColor="blue"
                actionLabel="Start Admission"
              />
              <AdmissionListItem
                initials="JF"
                name="John Fitzgerald"
                status="Arrived"
                time="14:00"
                details={['Alcohol', 'Phone Eval ✓', 'Returning']}
                badgeColor="green"
                actionLabel="Continue Admission"
              />
              <AdmissionListItem
                initials="TC"
                name="Thomas Collins"
                status="Expected"
                time=""
                details={[]}
                badgeColor="blue"
                actionLabel="Start Admission"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.lg }}>
          {/* Quick Actions */}
          <Card padding="lg" shadow="md">
            <CardHeader title="Quick Actions" />
            <QuickActionsGrid columns={2}>
              <QuickAction
                icon={<ClipboardIcon />}
                label="View All Admissions"
                color="blue"
                onClick={() => console.log('View all')}
              />
              <QuickAction
                icon={<SettingsIcon />}
                label="Form Configuration"
                color="purple"
                onClick={() => console.log('Configure')}
              />
              <QuickAction
                icon={<ChartIcon />}
                label="Reports & Analytics"
                color="green"
                onClick={() => console.log('Reports')}
              />
            </QuickActionsGrid>
          </Card>

          {/* Recent Activity */}
          <Card padding="lg" shadow="md">
            <CardHeader title="Recent Activity" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
              <ActivityItem
                icon={<UserPlusIcon />}
                text="New admission completed for David Walsh"
                time="30 minutes ago"
                user="Sarah Murphy"
                color="green"
              />
              <ActivityItem
                icon={<AlertIcon />}
                text="Admission flagged for review - Emma Kelly"
                time="1 hour ago"
                user="John Kelly"
                color="orange"
              />
              <ActivityItem
                icon={<ClipboardIcon />}
                text="Medical prescriptions updated for Michael O'Brien"
                time="2 hours ago"
                user="Dr. Murphy"
                color="blue"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Supporting components
interface AdmissionListItemProps {
  initials: string;
  name: string;
  status: string;
  time: string;
  details: string[];
  badgeColor: keyof typeof designTokens.colors.primary;
  actionLabel: string;
}

const AdmissionListItem: React.FC<AdmissionListItemProps> = ({
  initials,
  name,
  status,
  time,
  details,
  badgeColor,
  actionLabel,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.lg,
        padding: designTokens.spacing.md,
        backgroundColor: designTokens.colors.background.tertiary,
        borderRadius: designTokens.borderRadius.md,
      }}
    >
      <IconBadge icon={<span>{initials}</span>} color={badgeColor} size="sm" />
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.md }}>
          <span
            style={{
              fontSize: designTokens.typography.fontSize.base,
              fontWeight: designTokens.typography.fontWeight.semibold,
              color: designTokens.colors.text.primary,
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: designTokens.typography.fontSize.xs,
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
              backgroundColor:
                status === 'Arrived'
                  ? designTokens.colors.status.success
                  : designTokens.colors.status.info,
              color: designTokens.colors.text.inverse,
              borderRadius: designTokens.borderRadius.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
            }}
          >
            {status}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: designTokens.spacing.md,
            marginTop: designTokens.spacing.xs,
            fontSize: designTokens.typography.fontSize.sm,
            color: designTokens.colors.text.secondary,
          }}
        >
          {time && <span>⏰ Expected: {time}</span>}
          {details.map((detail, i) => (
            <span key={i}>• {detail}</span>
          ))}
        </div>
      </div>

      <button
        style={{
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
          backgroundColor: designTokens.colors.primary.blue,
          color: designTokens.colors.text.inverse,
          border: 'none',
          borderRadius: designTokens.borderRadius.md,
          fontSize: designTokens.typography.fontSize.sm,
          fontWeight: designTokens.typography.fontWeight.semibold,
          cursor: 'pointer',
          transition: `all ${designTokens.transitions.normal}`,
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
};

interface ActivityItemProps {
  icon: React.ReactNode;
  text: string;
  time: string;
  user: string;
  color: keyof typeof designTokens.colors.primary;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  text,
  time,
  user,
  color,
}) => {
  return (
    <div style={{ display: 'flex', gap: designTokens.spacing.md }}>
      <IconBadge icon={icon} color={color} size="sm" />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: designTokens.typography.fontSize.sm,
            color: designTokens.colors.text.primary,
            margin: 0,
            marginBottom: designTokens.spacing.xs,
          }}
        >
          {text}
        </p>
        <p
          style={{
            fontSize: designTokens.typography.fontSize.xs,
            color: designTokens.colors.text.tertiary,
            margin: 0,
          }}
        >
          {time} • {user}
        </p>
      </div>
    </div>
  );
};
export default AdmissionsPageRedesigned;
