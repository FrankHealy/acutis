/**
 * AdmissionsRedesigned.tsx
 * Modern admissions dashboard using design system components
 * Connects to Form Generator for dynamic admission forms
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { StatCard } from '@/components/design-system/StatCard';
import { QuickAction } from '@/components/design-system/QuickAction';
import { IconBadge } from '@/components/design-system/IconBadge';
import { designTokens } from '@/components/design-system/tokens';

interface Admission {
  id: string;
  firstName: string;
  lastName: string;
  expectedTime: string;
  status: 'expected' | 'arrived' | 'in_progress' | 'completed';
  primarySubstance: string;
  phoneEval: boolean;
  returning: boolean;
}

interface DashboardStats {
  expectedToday: number;
  completedToday: number;
  needsReview: number;
  occupancy: number;
  totalBeds: number;
  occupiedBeds: number;
  completedYesterday?: number;
}

export default function AdmissionsRedesigned() {
  const router = useRouter();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    expectedToday: 0,
    completedToday: 0,
    needsReview: 0,
    occupancy: 0,
    totalBeds: 60,
    occupiedBeds: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch admissions data
  useEffect(() => {
    fetchAdmissions();
    fetchStats();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const response = await fetch('/api/admissions?status=expected');
      const data = await response.json();
      setAdmissions(data);
    } catch (error) {
      console.error('Failed to fetch admissions:', error);
      // Fallback to mock data
      setAdmissions(getMockAdmissions());
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admissions/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Fallback to mock stats
      setStats({
        expectedToday: 4,
        completedToday: 5,
        needsReview: 2,
        occupancy: 78,
        totalBeds: 60,
        occupiedBeds: 47,
        completedYesterday: 3,
      });
    }
  };

  const getMockAdmissions = (): Admission[] => {
    return [
      {
        id: 'adm-001',
        firstName: 'Michael',
        lastName: "O'Brien",
        expectedTime: '10:00',
        status: 'expected',
        primarySubstance: 'Alcohol',
        phoneEval: true,
        returning: false,
      },
      {
        id: 'adm-002',
        firstName: 'Patrick',
        lastName: 'Murphy',
        expectedTime: '11:30',
        status: 'expected',
        primarySubstance: 'Alcohol',
        phoneEval: true,
        returning: false,
      },
      {
        id: 'adm-003',
        firstName: 'John',
        lastName: 'Fitzgerald',
        expectedTime: '14:00',
        status: 'arrived',
        primarySubstance: 'Alcohol',
        phoneEval: true,
        returning: true,
      },
      {
        id: 'adm-004',
        firstName: 'Thomas',
        lastName: 'Collins',
        expectedTime: '15:30',
        status: 'expected',
        primarySubstance: 'Drugs',
        phoneEval: true,
        returning: false,
      },
    ];
  };

  const startAdmission = (admissionId: string) => {
    // Navigate to admission intake flow
    router.push(`/admissions/intake/${admissionId}`);
  };

  const continueAdmission = (admissionId: string) => {
    // Navigate to continue admission flow
    router.push(`/admissions/intake/${admissionId}?continue=true`);
  };

  const startWalkIn = () => {
    // Navigate to walk-in admission flow
    router.push('/admissions/intake/new?type=walkin');
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'expected':
        return designTokens.colors.primary.blue;
      case 'arrived':
        return designTokens.colors.status.success;
      case 'in_progress':
        return designTokens.colors.primary.purple;
      default:
        return designTokens.colors.neutral[400];
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'expected':
        return 'Expected';
      case 'arrived':
        return 'Arrived';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  const formatDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-IE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div style={{ padding: designTokens.spacing.xl, backgroundColor: designTokens.colors.neutral[50], minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: designTokens.spacing.xl }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: designTokens.spacing.xs, color: designTokens.colors.neutral[900] }}>
          Admissions
        </h1>
        <p style={{ color: designTokens.colors.neutral[600], fontSize: designTokens.typography.fontSize.base }}>
          {formatDate()}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: designTokens.spacing.lg,
        marginBottom: designTokens.spacing.xl 
      }}>
        <StatCard
          icon="calendar"
          value={stats.expectedToday}
          label="Expected Today"
          subtext={`${stats.expectedToday} pending arrival`}
          color={designTokens.colors.primary.blue}
        />
        <StatCard
          icon="check-circle"
          value={stats.completedToday}
          label="Completed Today"
          trend={
            stats.completedYesterday
              ? {
                  direction: stats.completedToday > stats.completedYesterday ? 'up' : 'down',
                  value: Math.abs(stats.completedToday - stats.completedYesterday),
                  label: 'from yesterday',
                }
              : undefined
          }
          color={designTokens.colors.status.success}
        />
        <StatCard
          icon="alert-triangle"
          value={stats.needsReview}
          label="Needs Review"
          subtext="Requires attention"
          color={designTokens.colors.status.warning}
        />
        <StatCard
          icon="users"
          value={`${stats.occupancy}%`}
          label="Current Occupancy"
          subtext={`${stats.occupiedBeds} of ${stats.totalBeds} beds`}
          color={designTokens.colors.primary.purple}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: designTokens.spacing.xl }}>
        {/* Main Content */}
        <div>
          {/* Walk-in Banner */}
          <Card
            onClick={startWalkIn}
            style={{
              background: `linear-gradient(135deg, ${designTokens.colors.primary.blue} 0%, ${designTokens.colors.primary.purple} 100%)`,
              color: 'white',
              marginBottom: designTokens.spacing.xl,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.lg }}>
                  <IconBadge
                    icon="user-plus"
                    size="lg"
                    color="rgba(255, 255, 255, 0.2)"
                    iconColor="white"
                  />
                  <div>
                    <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: 600, marginBottom: '4px' }}>
                      Walk-in / Not on List
                    </h3>
                    <p style={{ opacity: 0.9 }}>Start new admission for unexpected arrival</p>
                  </div>
                </div>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Expected Admissions List */}
          <Card>
            <CardHeader>
              <h2 style={{ fontSize: designTokens.typography.fontSize.xl, fontWeight: 600 }}>
                Expected Admissions ({stats.expectedToday})
              </h2>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div style={{ padding: designTokens.spacing.xl, textAlign: 'center', color: designTokens.colors.neutral[500] }}>
                  Loading admissions...
                </div>
              ) : admissions.length === 0 ? (
                <div style={{ padding: designTokens.spacing.xl, textAlign: 'center', color: designTokens.colors.neutral[500] }}>
                  No expected admissions today
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                  {admissions.map((admission) => (
                    <div
                      key={admission.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: designTokens.spacing.md,
                        borderRadius: designTokens.borderRadius.lg,
                        backgroundColor: designTokens.colors.neutral[50],
                        border: `1px solid ${designTokens.colors.neutral[200]}`,
                      }}
                    >
                      {/* Left Side: Avatar + Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.md }}>
                        {/* Avatar */}
                        <IconBadge
                          icon={getInitials(admission.firstName, admission.lastName)}
                          size="md"
                          color={getStatusColor(admission.status)}
                        />

                        {/* Info */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.sm, marginBottom: '4px' }}>
                            <h3 style={{ fontSize: designTokens.typography.fontSize.base, fontWeight: 600 }}>
                              {admission.firstName} {admission.lastName}
                            </h3>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: designTokens.borderRadius.full,
                                fontSize: designTokens.typography.fontSize.xs,
                                fontWeight: 600,
                                backgroundColor: getStatusColor(admission.status),
                                color: 'white',
                              }}
                            >
                              {getStatusLabel(admission.status)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: designTokens.spacing.md, fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.neutral[600] }}>
                            {admission.expectedTime && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                                Expected: {admission.expectedTime}
                              </span>
                            )}
                            {admission.primarySubstance && (
                              <span>• {admission.primarySubstance}</span>
                            )}
                            {admission.phoneEval && (
                              <span>• Phone Eval ✓</span>
                            )}
                            {admission.returning && (
                              <span>• Returning</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Action Button */}
                      <button
                        onClick={() => {
                          if (admission.status === 'arrived') {
                            continueAdmission(admission.id);
                          } else {
                            startAdmission(admission.id);
                          }
                        }}
                        style={{
                          padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
                          borderRadius: designTokens.borderRadius.md,
                          backgroundColor: admission.status === 'arrived' 
                            ? designTokens.colors.status.success 
                            : designTokens.colors.primary.blue,
                          color: 'white',
                          border: 'none',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = designTokens.shadows.md;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {admission.status === 'arrived' ? 'Continue Admission' : 'Start Admission'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.lg }}>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: 600 }}>
                Quick Actions
              </h3>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                <QuickAction
                  icon="clipboard-list"
                  label="View All Admissions"
                  onClick={() => router.push('/admissions/list')}
                  color={designTokens.colors.primary.blue}
                />
                <QuickAction
                  icon="settings"
                  label="Form Configuration"
                  onClick={() => router.push('/configuration/forms')}
                  color={designTokens.colors.primary.purple}
                />
                <QuickAction
                  icon="bar-chart"
                  label="Reports & Analytics"
                  onClick={() => router.push('/reports/admissions')}
                  color={designTokens.colors.status.success}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 style={{ fontSize: designTokens.typography.fontSize.lg, fontWeight: 600 }}>
                Recent Activity
              </h3>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
                <ActivityItem
                  icon="user-check"
                  iconColor={designTokens.colors.status.success}
                  title="New admission completed for David Walsh"
                  time="30 minutes ago"
                  user="Sarah Murphy"
                />
                <ActivityItem
                  icon="edit"
                  iconColor={designTokens.colors.primary.blue}
                  title="Updated medical history for John Fitzgerald"
                  time="1 hour ago"
                  user="Michael O'Brien"
                />
                <ActivityItem
                  icon="calendar"
                  iconColor={designTokens.colors.primary.purple}
                  title="Scheduled admission for Mary O'Connor"
                  time="2 hours ago"
                  user="Sarah Murphy"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
interface ActivityItemProps {
  icon: string;
  iconColor: string;
  title: string;
  time: string;
  user: string;
}

function ActivityItem({ icon, iconColor, title, time, user }: ActivityItemProps) {
  return (
    <div style={{ display: 'flex', gap: designTokens.spacing.sm }}>
      <IconBadge icon={icon} size="sm" color={iconColor} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: designTokens.typography.fontSize.sm, fontWeight: 500, marginBottom: '2px' }}>
          {title}
        </p>
        <p style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.neutral[500] }}>
          {time} • {user}
        </p>
      </div>
    </div>
  );
}
