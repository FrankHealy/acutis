/**
 * TRANSFORMATION GUIDE
 * Visual comparison of old vs new design patterns
 */

// ============================================================================
// PATTERN 1: STAT CARDS
// ============================================================================

/* ❌ OLD STYLE (Admissions Page - Rectangular with corner badges) */
const OldStatCard = () => {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      position: 'relative',
    }}>
      {/* Icon in corner */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '40px',
        height: '40px',
        backgroundColor: '#E3F2FD',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        📅
      </div>
      
      <div>
        <p style={{ fontSize: '14px', color: '#616161' }}>Expected Today</p>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold' }}>4</h2>
        <p style={{ fontSize: '12px', color: '#9E9E9E' }}>4 pending arrival</p>
      </div>
    </div>
  );
};

/* ✅ NEW STYLE (Dashboard - Circular badges with horizontal layout) */
import { StatCard } from './StatCard';

const NewStatCard = () => {
  return (
    <StatCard
      icon={<span>📅</span>}
      label="Expected Today"
      value="4"
      subtitle="4 pending arrival"
      color="blue"
    />
  );
};

// Result: Icon becomes prominent circular badge on left, creating visual hierarchy


// ============================================================================
// PATTERN 2: ACTION BUTTONS
// ============================================================================

/* ❌ OLD STYLE (Standard button) */
const OldActionButton = () => {
  return (
    <button style={{
      padding: '12px 24px',
      backgroundColor: '#4A90E2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }}>
      New Admission
    </button>
  );
};

/* ✅ NEW STYLE (Quick Action card) */
import { QuickAction } from './QuickAction';

const NewActionCard = () => {
  return (
    <QuickAction
      icon={<span>➕</span>}
      label="New Admission"
      color="blue"
      onClick={() => console.log('Action')}
    />
  );
};

// Result: Actions become visually distinct cards with icons, better for scanning


// ============================================================================
// PATTERN 3: LIST ITEMS WITH STATUS
// ============================================================================

/* ❌ OLD STYLE (Text initials) */
const OldListItem = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        backgroundColor: '#E3F2FD',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#4A90E2',
      }}>
        MO
      </div>
      <div>
        <strong>Michael O'Brien</strong>
        <p>Expected: 10:00</p>
      </div>
    </div>
  );
};

/* ✅ NEW STYLE (IconBadge with consistent styling) */
import { IconBadge } from './IconBadge';

const NewListItem = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <IconBadge
        icon={<span>MO</span>}
        color="blue"
        size="sm"
      />
      <div>
        <strong>Michael O'Brien</strong>
        <p>Expected: 10:00</p>
      </div>
    </div>
  );
};

// Result: Circular badges create consistent visual language across all list items


// ============================================================================
// PATTERN 4: PAGE HEADERS
// ============================================================================

/* ❌ OLD STYLE (Basic text) */
const OldPageHeader = () => {
  return (
    <div>
      <h1>Admissions</h1>
      <p>Sunday 18 January 2026</p>
    </div>
  );
};

/* ✅ NEW STYLE (Consistent typography from design system) */
import { designTokens } from './tokens';

const NewPageHeader = () => {
  return (
    <div style={{ marginBottom: designTokens.spacing.xl }}>
      <h1 style={{
        fontSize: designTokens.typography.fontSize['4xl'],
        fontWeight: designTokens.typography.fontWeight.bold,
        color: designTokens.colors.text.primary,
        margin: 0,
        marginBottom: designTokens.spacing.sm,
      }}>
        Admissions
      </h1>
      <p style={{
        fontSize: designTokens.typography.fontSize.base,
        color: designTokens.colors.text.secondary,
        margin: 0,
      }}>
        Sunday 18 January 2026
      </p>
    </div>
  );
};

// Result: Typography hierarchy matches dashboard exactly


// ============================================================================
// PATTERN 5: CARDS/CONTAINERS
// ============================================================================

/* ❌ OLD STYLE (Inconsistent shadows and spacing) */
const OldCard = () => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      {/* Content */}
    </div>
  );
};

/* ✅ NEW STYLE (Design system card) */
import { Card, CardHeader } from './Card';

const NewCard = () => {
  return (
    <Card padding="lg" shadow="md">
      <CardHeader title="Expected Admissions" />
      {/* Content */}
    </Card>
  );
};

// Result: Consistent rounded corners (12px), shadows, and spacing


// ============================================================================
// PATTERN 6: COLOR USAGE
// ============================================================================

/* ❌ OLD STYLE (Arbitrary/inconsistent colors) */
const oldColors = {
  badge1: '#3498db',  // Random blue
  badge2: '#2ecc71',  // Random green
  badge3: '#e67e22',  // Random orange
};

/* ✅ NEW STYLE (Design system colors) */
import { designTokens } from './tokens';

const newColors = {
  badge1: designTokens.colors.primary.blue,    // #4A90E2
  badge2: designTokens.colors.primary.green,   // #27AE60
  badge3: designTokens.colors.primary.orange,  // #FF8C42
};

// Result: Colors are consistent across entire application


// ============================================================================
// PATTERN 7: TIMELINE/SCHEDULE DISPLAY
// ============================================================================

/* ❌ OLD STYLE (Linear list) */
const OldSchedule = () => {
  return (
    <div>
      <div>06:30 - Wake Up Bell</div>
      <div>07:15 - Roll Call</div>
      <div>08:30 - Room Check</div>
    </div>
  );
};

/* ✅ NEW STYLE (Visual timeline with IconBadges) */
import { TimelineBadge } from './IconBadge';

const NewSchedule = () => {
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <TimelineBadge
        icon={<span>🔔</span>}
        time="06:30"
        description="Wake Up Bell"
        color="orange"
      />
      <TimelineBadge
        icon={<span>👥</span>}
        time="07:15"
        description="Roll Call"
        color="blue"
      />
      <TimelineBadge
        icon={<span>🚪</span>}
        time="08:30"
        description="Room Check"
        color="green"
      />
    </div>
  );
};

// Result: Events become visually scannable with color-coded circular badges


// ============================================================================
// KEY DIFFERENCES SUMMARY
// ============================================================================

/**
 * VISUAL CHANGES:
 * ===============
 * 1. Square/rectangular badges → Circular badges (border-radius: full)
 * 2. Corner-positioned icons → Left-aligned prominent icons
 * 3. Small badges (40x40) → Larger, more visible badges (56x72px)
 * 4. Subtle backgrounds → Bold, solid color backgrounds
 * 5. Icons as decoration → Icons as primary visual element
 * 
 * LAYOUT CHANGES:
 * ===============
 * 1. Vertical layouts → Horizontal icon + content layouts
 * 2. Tight spacing → Generous spacing (24px gaps)
 * 3. Sharp corners (4px) → Rounded corners (12px for cards, full for badges)
 * 4. Light shadows → Medium shadows with hover elevation
 * 
 * COLOR CHANGES:
 * ==============
 * 1. Varied/arbitrary colors → Consistent color system
 * 2. Muted tones → Vibrant, distinctive colors
 * 3. Each feature has different colors → Colors indicate types consistently
 * 
 * INTERACTION CHANGES:
 * ====================
 * 1. Standard buttons → Interactive cards
 * 2. Simple hover → Hover with scale + shadow + translate
 * 3. Static → Smooth transitions (250ms)
 */

export const TransformationPrinciples = {
  from: {
    shape: 'Rectangular',
    iconSize: 'Small (20-24px)',
    iconPosition: 'Corner/inline',
    spacing: 'Compact (8-12px)',
    colors: 'Varied/arbitrary',
    shadows: 'Light',
    corners: 'Sharp (4px)',
  },
  to: {
    shape: 'Circular',
    iconSize: 'Large (32-40px in 56-72px circles)',
    iconPosition: 'Prominent left-aligned',
    spacing: 'Generous (16-24px)',
    colors: 'Systematic/meaningful',
    shadows: 'Medium with elevation',
    corners: 'Rounded (12px cards, full circles)',
  },
};
