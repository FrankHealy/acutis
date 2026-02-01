/**
 * FUNCTIONAL Admissions Dashboard
 * 
 * This version includes:
 * - Real state management
 * - API integration hooks
 * - Admission flow navigation
 * - Form handling
 * - Error states
 * - Loading states
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { designTokens } from '@/components/design-system/tokens';
import { Card, CardHeader } from '@/components/design-system/Card';
import { StatCard, StatGrid } from '@/components/design-system/StatCard';
import { QuickAction, QuickActionsGrid } from '@/components/design-system/QuickAction';
import { IconBadge } from '@/components/design-system/IconBadge';

// Types
interface Admission {
  id: string;
  firstName: string;
  lastName: string;
  status: 'expected' | 'arrived' | 'in_progress' | 'completed';
  expectedTime?: string;
  admissionType: 'alcohol' | 'drugs' | 'gambling';
  phoneEvalCompleted: boolean;
  isReturning: boolean;
  notes?: string;
}

interface AdmissionsStats {
  expectedToday: number;
  completedToday: number;
  needsReview: number;
  occupancy: {
    current: number;
    total: number;
    percentage: number;
  };
}

// Mock icons - replace with your actual icon library
const CalendarIcon = () => <span>📅</span>;
const CheckIcon = () => <span>✓</span>;
const AlertIcon = () => <span>⚠</span>;
const UsersIcon = () => <span>👥</span>;
const ClipboardIcon = () => <span>📋</span>;
const SettingsIcon = () => <span>⚙️</span>;
const ChartIcon = () => <span>📊</span>;
const UserPlusIcon = () => <span>➕</span>;

export function AdmissionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data - replace with your actual API calls
  const { stats, admissions, isLoadingData } = useAdmissionsData();

  // Handlers
  const handleStartWalkIn = () => {
    router.push('/detox/admissions/new?type=walk-in');
  };

  const handleStartAdmission = async (admissionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get or create admission session
      const session = await startAdmissionSession(admissionId);
      router.push(`/detox/admissions/${admissionId}/intake?sessionId=${session.id}`);
    } catch (err) {
      setError('Failed to start admission. Please try again.');
      console.error('Start admission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAdmission = async (admissionId: string) => {
    setIsLoading(true);
    
    try {
      // Get existing session
      const session = await getAdmissionSession(admissionId);
      router.push(`/detox/admissions/${admissionId}/intake?sessionId=${session.id}&step=${session.currentStep}`);
    } catch (err) {
      setError('Failed to continue admission. Please try again.');
      console.error('Continue admission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = () => {
    router.push('/detox/admissions/list');
  };

  const handleFormConfig = () => {
    router.push('/detox/admissions/config');
  };

  const handleReports = () => {
    router.push('/detox/admissions/reports');
  };

  if (isLoadingData) {
    return <LoadingState />;
  }

  return (
    <div
      style={{
        backgroundColor: designTokens.colors.background.secondary,
        minHeight: '100vh',
        padding: designTokens.spacing['2xl'],
      }}
    >
      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: designTokens.colors.status.danger,
            color: designTokens.colors.text.inverse,
            padding: designTokens.spacing.md,
            borderRadius: designTokens.borderRadius.md,
            marginBottom: designTokens.spacing.lg,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: designTokens.colors.text.inverse,
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader />

      {/* Stats Grid */}
      <StatGrid columns={4}>
        <StatCard
          icon={<CalendarIcon />}
          label="Expected Today"
          value={stats.expectedToday}
          subtitle={`${stats.expectedToday} pending arrival`}
          color="blue"
          onClick={handleViewAll}
        />
        <StatCard
          icon={<CheckIcon />}
          label="Completed Today"
          value={stats.completedToday}
          color="green"
          trend={{ value: '+2 from yesterday', direction: 'up' }}
        />
        <StatCard
          icon={<AlertIcon />}
          label="Needs Review"
          value={stats.needsReview}
          subtitle="Requires attention"
          color="orange"
          onClick={() => router.push('/detox/admissions/review')}
        />
        <StatCard
          icon={<UsersIcon />}
          label="Current Occupancy"
          value={`${stats.occupancy.percentage}%`}
          subtitle={`${stats.occupancy.current} of ${stats.occupancy.total} beds`}
          color="purple"
          onClick={() => router.push('/detox/occupancy')}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.lg }}>
          {/* Walk-in Banner */}
          <WalkInBanner onClick={handleStartWalkIn} disabled={isLoading} />

          {/* Expected Admissions */}
          <Card padding="lg" shadow="md">
            <CardHeader title={`Expected Admissions (${admissions.length})`} />

            {admissions.length === 0 ? (
              <EmptyState message="No admissions expected today" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                {admissions.map((admission) => (
                  <AdmissionListItem
                    key={admission.id}
                    admission={admission}
                    onStartAdmission={handleStartAdmission}
                    onContinueAdmission={handleContinueAdmission}
                    disabled={isLoading}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <Sidebar
          onViewAll={handleViewAll}
          onFormConfig={handleFormConfig}
          onReports={handleReports}
        />
      </div>
    </div>
  );
}

// Supporting Components

function PageHeader() {
  return (
    <div style={{ marginBottom: designTokens.spacing.xl }}>
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
        {new Date().toLocaleDateString('en-IE', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })}
      </p>
    </div>
  );
}

interface WalkInBannerProps {
  onClick: () => void;
  disabled: boolean;
}

function WalkInBanner({ onClick, disabled }: WalkInBannerProps) {
  return (
    <Card padding="lg" shadow="md" onClick={disabled ? undefined : onClick}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: designTokens.colors.primary.blue,
          padding: designTokens.spacing.lg,
          borderRadius: designTokens.borderRadius.md,
          margin: `-${designTokens.spacing.lg}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.lg }}>
          <IconBadge icon={<UserPlusIcon />} color="blue" size="md" />
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
  );
}

interface AdmissionListItemProps {
  admission: Admission;
  onStartAdmission: (id: string) => void;
  onContinueAdmission: (id: string) => void;
  disabled: boolean;
}

function AdmissionListItem({ 
  admission, 
  onStartAdmission, 
  onContinueAdmission,
  disabled 
}: AdmissionListItemProps) {
  const initials = `${admission.firstName[0]}${admission.lastName[0]}`.toUpperCase();
  const fullName = `${admission.firstName} ${admission.lastName}`;
  
  const badgeColor = admission.status === 'arrived' ? 'green' : 'blue';
  const statusLabel = admission.status === 'arrived' ? 'Arrived' : 
                      admission.status === 'in_progress' ? 'In Progress' : 'Expected';
  
  const actionLabel = admission.status === 'in_progress' ? 'Continue Admission' : 'Start Admission';
  const handleAction = admission.status === 'in_progress' 
    ? () => onContinueAdmission(admission.id)
    : () => onStartAdmission(admission.id);

  const details = [
    admission.expectedTime ? `Expected: ${admission.expectedTime}` : null,
    admission.admissionType.charAt(0).toUpperCase() + admission.admissionType.slice(1),
    admission.phoneEvalCompleted ? 'Phone Eval ✓' : null,
    admission.isReturning ? 'Returning' : null,
  ].filter(Boolean);

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
            {fullName}
          </span>
          <span
            style={{
              fontSize: designTokens.typography.fontSize.xs,
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
              backgroundColor:
                admission.status === 'arrived' || admission.status === 'in_progress'
                  ? designTokens.colors.status.success
                  : designTokens.colors.status.info,
              color: designTokens.colors.text.inverse,
              borderRadius: designTokens.borderRadius.sm,
              fontWeight: designTokens.typography.fontWeight.medium,
            }}
          >
            {statusLabel}
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
          {details.map((detail, i) => (
            <span key={i}>
              {i > 0 && '•'} {detail}
            </span>
          ))}
        </div>
        {admission.notes && (
          <div
            style={{
              marginTop: designTokens.spacing.xs,
              fontSize: designTokens.typography.fontSize.xs,
              color: designTokens.colors.text.tertiary,
              fontStyle: 'italic',
            }}
          >
            Note: {admission.notes}
          </div>
        )}
      </div>

      <button
        onClick={handleAction}
        disabled={disabled}
        style={{
          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
          backgroundColor: disabled 
            ? designTokens.colors.neutral[400]
            : designTokens.colors.primary.blue,
          color: designTokens.colors.text.inverse,
          border: 'none',
          borderRadius: designTokens.borderRadius.md,
          fontSize: designTokens.typography.fontSize.sm,
          fontWeight: designTokens.typography.fontWeight.semibold,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: `all ${designTokens.transitions.normal}`,
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

interface SidebarProps {
  onViewAll: () => void;
  onFormConfig: () => void;
  onReports: () => void;
}

function Sidebar({ onViewAll, onFormConfig, onReports }: SidebarProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.lg }}>
      <Card padding="lg" shadow="md">
        <CardHeader title="Quick Actions" />
        <QuickActionsGrid columns={2}>
          <QuickAction icon={<ClipboardIcon />} label="View All Admissions" color="blue" onClick={onViewAll} />
          <QuickAction icon={<SettingsIcon />} label="Form Configuration" color="purple" onClick={onFormConfig} />
          <QuickAction icon={<ChartIcon />} label="Reports & Analytics" color="green" onClick={onReports} />
        </QuickActionsGrid>
      </Card>

      <RecentActivity />
    </div>
  );
}

function RecentActivity() {
  // Fetch from your API
  const activities = useRecentActivity();

  return (
    <Card padding="lg" shadow="md">
      <CardHeader title="Recent Activity" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
        {activities.map((activity, i) => (
          <ActivityItem key={i} {...activity} />
        ))}
      </div>
    </Card>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  text: string;
  time: string;
  user: string;
  color: keyof typeof designTokens.colors.primary;
}

function ActivityItem({ icon, text, time, user, color }: ActivityItemProps) {
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
}

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: designTokens.typography.fontSize.xl,
        color: designTokens.colors.text.secondary,
      }}
    >
      Loading admissions...
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: designTokens.spacing['2xl'],
        color: designTokens.colors.text.tertiary,
      }}
    >
      {message}
    </div>
  );
}

// Custom Hooks - Replace with your actual API integration

function useAdmissionsData() {
  // Replace with your actual data fetching
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Mock data - replace with real API call
  const stats: AdmissionsStats = {
    expectedToday: 4,
    completedToday: 5,
    needsReview: 2,
    occupancy: {
      current: 47,
      total: 60,
      percentage: 78,
    },
  };

  const admissions: Admission[] = [
    {
      id: '1',
      firstName: 'Michael',
      lastName: "O'Brien",
      status: 'expected',
      expectedTime: '10:00',
      admissionType: 'alcohol',
      phoneEvalCompleted: true,
      isReturning: false,
    },
    {
      id: '2',
      firstName: 'Patrick',
      lastName: 'Murphy',
      status: 'expected',
      expectedTime: '11:30',
      admissionType: 'alcohol',
      phoneEvalCompleted: true,
      isReturning: false,
    },
    {
      id: '3',
      firstName: 'John',
      lastName: 'Fitzgerald',
      status: 'arrived',
      expectedTime: '14:00',
      admissionType: 'alcohol',
      phoneEvalCompleted: true,
      isReturning: true,
      notes: 'Previous stay in 2023',
    },
  ];

  return { stats, admissions, isLoadingData };
}

function useRecentActivity() {
  // Replace with real API call
  return [
    {
      icon: <UserPlusIcon />,
      text: 'New admission completed for David Walsh',
      time: '30 minutes ago',
      user: 'Sarah Murphy',
      color: 'green' as const,
    },
    {
      icon: <AlertIcon />,
      text: 'Admission flagged for review - Emma Kelly',
      time: '1 hour ago',
      user: 'John Kelly',
      color: 'orange' as const,
    },
  ];
}

// API Functions - Replace with your actual backend calls

async function startAdmissionSession(admissionId: string) {
  // Replace with your API call
  const response = await fetch(`/api/admissions/${admissionId}/start`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to start admission session');
  }
  
  return response.json();
}

async function getAdmissionSession(admissionId: string) {
  // Replace with your API call
  const response = await fetch(`/api/admissions/${admissionId}/session`);
  
  if (!response.ok) {
    throw new Error('Failed to get admission session');
  }
  
  return response.json();
}
