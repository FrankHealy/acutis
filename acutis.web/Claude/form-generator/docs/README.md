# Acutis Design System

A comprehensive design system based on the Acutis Dashboard visual style, emphasizing circular icons, clean cards, and cohesive color usage.

## Design Principles

### 1. **Icon-First Communication**
The dashboard uses circular icon badges as primary visual elements, making information scannable and recognizable at a glance.

### 2. **Consistent Visual Hierarchy**
- Large, bold numbers for key metrics
- Clear labels in secondary text color
- Subtle supporting text in tertiary color

### 3. **Color-Coded Categories**
Each action type or data category has a consistent color:
- **Blue**: Primary actions, general information
- **Green**: Completed, success states
- **Orange**: Warnings, needs attention
- **Purple**: User/resident related
- **Teal**: Operational tasks
- **Red**: Critical, lunch/break

### 4. **Generous White Space**
Clean layouts with ample padding and spacing between elements for easy scanning.

### 5. **Soft Shadows & Rounded Corners**
Subtle depth with medium shadows and 12px border radius for a modern, approachable feel.

## File Structure

```
acutis-design-system/
├── tokens.ts                    # Design tokens (colors, spacing, typography)
├── styles.css                   # CSS custom properties version
├── Card.tsx                     # Base card component
├── IconBadge.tsx               # Circular icon badges (dashboard timeline style)
├── StatCard.tsx                # Stat cards with icon badges
├── QuickAction.tsx             # Quick action cards
├── AdmissionsRedesigned.tsx    # Complete example implementation
└── README.md                   # This file
```

## Quick Start

### Option 1: TypeScript/React Components

```tsx
import { designTokens } from './tokens';
import { Card, CardHeader } from './Card';
import { StatCard, StatGrid } from './StatCard';
import { IconBadge } from './IconBadge';

// Use in your components
<StatCard
  icon={<CalendarIcon />}
  label="Expected Today"
  value="4"
  subtitle="4 pending arrival"
  color="blue"
/>
```

### Option 2: CSS Custom Properties

```css
@import './styles.css';

/* Use CSS variables in your styles */
.my-card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}

/* Or use utility classes */
<div class="acutis-card">
  <div class="acutis-icon-badge acutis-icon-badge--blue acutis-icon-badge--lg">
    📅
  </div>
</div>
```

## Core Components

### IconBadge

The signature circular icon component from the dashboard.

```tsx
<IconBadge
  icon={<BellIcon />}
  color="orange"
  size="lg"
  label="06:30"
  sublabel="Wake Up Bell"
  showIndicator={true}  // Shows red notification dot
  active={true}         // Scales up and enhances shadow
/>
```

**Props:**
- `icon`: React node (icon component)
- `color`: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'red'
- `size`: 'sm' (40px) | 'md' (56px) | 'lg' (72px) | 'xl' (96px)
- `label`: Text below icon
- `sublabel`: Secondary text below label
- `showIndicator`: Shows notification dot
- `active`: Highlight state
- `onClick`: Click handler

### StatCard

Dashboard-style stat cards with circular icons.

```tsx
<StatCard
  icon={<UsersIcon />}
  label="Current Occupancy"
  value="78%"
  subtitle="47 of 60 beds"
  color="purple"
  trend={{ value: '+5% from last week', direction: 'up' }}
/>
```

**Props:**
- `icon`: React node
- `label`: Card label
- `value`: Main value (string | number)
- `subtitle`: Optional supporting text
- `color`: Badge color
- `trend`: Optional trend indicator
- `onClick`: Click handler

### QuickAction

Colored action cards with hover effects.

```tsx
<QuickAction
  icon={<SettingsIcon />}
  label="Form Configuration"
  color="purple"
  onClick={() => navigate('/settings')}
/>
```

**Props:**
- `icon`: React node
- `label`: Action label
- `color`: Background tint color
- `onClick`: Click handler (required)

### Card

Base card component for custom layouts.

```tsx
<Card padding="lg" shadow="md">
  <CardHeader 
    icon={<ClipboardIcon />}
    title="Expected Admissions"
    subtitle="4 pending arrival"
  />
  {/* Your content */}
</Card>
```

## Design Tokens

### Colors

```typescript
// Primary colors
designTokens.colors.primary.blue     // #4A90E2
designTokens.colors.primary.green    // #27AE60
designTokens.colors.primary.orange   // #FF8C42
designTokens.colors.primary.purple   // #9B59B6
designTokens.colors.primary.teal     // #00BCD4
designTokens.colors.primary.red      // #E74C3C

// Status colors
designTokens.colors.status.success   // #27AE60
designTokens.colors.status.warning   // #F39C12
designTokens.colors.status.danger    // #E74C3C
designTokens.colors.status.info      // #4A90E2

// Text colors
designTokens.colors.text.primary     // #212121
designTokens.colors.text.secondary   // #616161
designTokens.colors.text.tertiary    // #9E9E9E
designTokens.colors.text.inverse     // #FFFFFF
```

### Spacing

```typescript
designTokens.spacing.xs    // 4px
designTokens.spacing.sm    // 8px
designTokens.spacing.md    // 16px
designTokens.spacing.lg    // 24px
designTokens.spacing.xl    // 32px
designTokens.spacing['2xl'] // 48px
designTokens.spacing['3xl'] // 64px
```

### Typography

```typescript
// Font sizes
designTokens.typography.fontSize.xs    // 12px
designTokens.typography.fontSize.sm    // 14px
designTokens.typography.fontSize.base  // 16px
designTokens.typography.fontSize.lg    // 18px
designTokens.typography.fontSize.xl    // 20px
designTokens.typography.fontSize['2xl'] // 24px
designTokens.typography.fontSize['3xl'] // 30px
designTokens.typography.fontSize['4xl'] // 36px

// Font weights
designTokens.typography.fontWeight.normal    // 400
designTokens.typography.fontWeight.medium    // 500
designTokens.typography.fontWeight.semibold  // 600
designTokens.typography.fontWeight.bold      // 700
```

### Shadows & Borders

```typescript
designTokens.shadows.sm    // Subtle shadow
designTokens.shadows.md    // Standard card shadow
designTokens.shadows.lg    // Elevated/hover shadow
designTokens.shadows.xl    // Maximum elevation

designTokens.borderRadius.sm   // 4px
designTokens.borderRadius.md   // 8px
designTokens.borderRadius.lg   // 12px (standard for cards)
designTokens.borderRadius.xl   // 16px
designTokens.borderRadius.full // 9999px (circles)
```

## Layout Patterns

### Stat Grid

```tsx
import { StatGrid } from './StatCard';

<StatGrid columns={4}>
  <StatCard {...} />
  <StatCard {...} />
  <StatCard {...} />
  <StatCard {...} />
</StatGrid>
```

### Quick Actions Grid

```tsx
import { QuickActionsGrid } from './QuickAction';

<QuickActionsGrid columns={3}>
  <QuickAction {...} />
  <QuickAction {...} />
  <QuickAction {...} />
</QuickActionsGrid>
```

## Transforming the Admissions Page

### Before (Rectangular Style)

```tsx
// Old rectangular stat card
<div className="stat-card">
  <div className="corner-badge">📅</div>
  <h3>Expected Today</h3>
  <div className="value">4</div>
  <p>4 pending arrival</p>
</div>
```

### After (Dashboard Style)

```tsx
// New circular icon style
<StatCard
  icon={<CalendarIcon />}
  label="Expected Today"
  value="4"
  subtitle="4 pending arrival"
  color="blue"
/>
```

## Color Usage Guidelines

### When to use each color:

- **Blue** (`#4A90E2`): Default/primary actions, calendar events, general information
- **Green** (`#27AE60`): Completed tasks, success states, positive trends
- **Orange** (`#FF8C42`): Warnings, items needing attention, wake-up calls
- **Purple** (`#9B59B6`): People/residents, user-related actions, occupancy
- **Teal** (`#00BCD4`): Operational tasks, maintenance, OT (Occupational Therapy)
- **Red** (`#E74C3C`): Critical items, breaks, lunch periods

## Best Practices

### DO ✓
- Use circular IconBadges for primary visual elements
- Maintain consistent spacing with design tokens
- Use the color system consistently across features
- Provide labels and sublabels for IconBadges
- Use StatCards for key metrics

### DON'T ✗
- Mix rectangular badges with circular badges
- Use arbitrary colors outside the design system
- Overcrowd cards with too much information
- Use different shadow/radius values than specified
- Create new badge styles without updating the system

## Migration Guide

To migrate existing pages to the dashboard style:

1. **Replace stat cards**
   ```tsx
   // Old
   <div className="stat-box">...</div>
   
   // New
   <StatCard icon={...} label="..." value="..." color="blue" />
   ```

2. **Replace action buttons**
   ```tsx
   // Old
   <button className="action-btn">...</button>
   
   // New
   <QuickAction icon={...} label="..." color="blue" onClick={...} />
   ```

3. **Update icon displays**
   ```tsx
   // Old
   <div className="icon-wrapper"><Icon /></div>
   
   // New
   <IconBadge icon={<Icon />} color="blue" size="md" />
   ```

4. **Apply consistent spacing**
   ```tsx
   // Use design tokens
   style={{ padding: designTokens.spacing.lg }}
   
   // Or CSS variables
   style={{ padding: 'var(--spacing-lg)' }}
   ```

## Integration with Next.js

### 1. Create a theme provider (optional)

```tsx
// theme-provider.tsx
import { createContext, useContext } from 'react';
import { designTokens } from './tokens';

const ThemeContext = createContext(designTokens);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={designTokens}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 2. Import global styles

```tsx
// _app.tsx or layout.tsx
import '../acutis-design-system/styles.css';
```

### 3. Use components

```tsx
// pages/admissions.tsx
import { StatCard, StatGrid } from '@/acutis-design-system/StatCard';
import { QuickAction } from '@/acutis-design-system/QuickAction';

export default function AdmissionsPage() {
  return (
    <StatGrid columns={4}>
      <StatCard icon={<CalendarIcon />} label="Expected" value="4" color="blue" />
      {/* ... */}
    </StatGrid>
  );
}
```

## Tailwind Integration (Optional)

If using Tailwind, you can map design tokens to your config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'acutis-blue': '#4A90E2',
        'acutis-green': '#27AE60',
        // ... other colors
      },
      spacing: {
        // Map to design tokens
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        // ... other shadows
      }
    }
  }
}
```

## Examples

See `AdmissionsRedesigned.tsx` for a complete, production-ready example of how to transform the Admissions page using this design system.

## Support

For questions or issues with the design system, contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Based On**: Acutis Dashboard Design
