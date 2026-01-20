# Screening & Forecasting Dashboard - Implementation Guide

## Overview
This dashboard provides a comprehensive intake management system for addiction treatment facilities with three core sections:
1. **Call Logging** - Track and manage incoming inquiry calls
2. **Evaluation Queue** - Conduct phone evaluations with accordion-style forms
3. **Capacity Management** - Monitor bed availability and forecast capacity

## Files Included

### Main Dashboard
- `ScreeningDashboard.tsx` - Main container component with section navigation

### Components
- `components/CallLogging.tsx` - Call tracking with daily stats and new call forms
- `components/EvaluationQueue.tsx` - Evaluation management with accordion forms
- `components/CapacityManagement.tsx` - Capacity tracking and forecasting

## Design Principles

### Consistent with Existing Design
✅ Matches the design patterns from your existing components:
- Same card styling (rounded-xl, shadow-sm, border)
- Consistent color scheme (blue primary, purple accents)
- Matching typography and spacing
- Modal patterns similar to admission forms
- Accordion layout like the admission form sections

### Key Features

#### Call Logging Section
- **Daily Stats Cards**: Calls Today, New Calls, High Urgency, Scheduled Evals
- **Detailed Call List**: Shows caller info, concern type, urgency, and notes
- **New Call Form**: Modal form for logging incoming calls
- Status tracking: new, callback-scheduled, evaluation-scheduled, declined

#### Evaluation Queue Section
- **Stats Dashboard**: Pending, In Progress, Scheduled, Completed evaluations
- **Candidate Table**: List of all evaluation candidates
- **Accordion Evaluation Form**: 5 collapsible sections
  - Personal Information ⭐ (required)
  - Medical History ⭐ (required)
  - Substance Use History ⭐ (required)
  - Living Arrangements
  - Mental Health Assessment
- Progress tracking per section
- Save progress and complete evaluation actions

#### Capacity Management Section
- **Overall Stats**: Total capacity, occupied, available, waitlist
- **Unit Cards**: Individual unit status with visual capacity bars
- **Current vs Forecast Views**: Toggle between current status and future forecasting
- **7/14/30 Day Forecast**: Configurable forecast periods
- Color-coded status: Critical (red), High (orange), Moderate (yellow), Good (green)

## Installation

### 1. File Structure
```
your-app/
├── pages/ or app/
│   └── units/
│       └── screening/
│           └── page.tsx  (import ScreeningDashboard here)
└── components/
    └── screening/
        ├── CallLogging.tsx
        ├── EvaluationQueue.tsx
        └── CapacityManagement.tsx
```

### 2. Install Dependencies
```bash
npm install lucide-react
# or
yarn add lucide-react
```

### 3. Integration Steps

#### A. Update StartupLanding.tsx
```typescript
// Modify the onClick for Screening & Forecasting button:
<Tile 
  delayMs={100} 
  label="Screening & Forecasting" 
  Icon={Heart} 
  color="border-green-400 bg-green-50 text-green-700" 
  onClick={() => router.push('/units/screening')} 
/>
```

#### B. Create the Route
Create `app/units/screening/page.tsx` or `pages/units/screening.tsx`:

```typescript
import ScreeningDashboard from '@/components/screening/ScreeningDashboard';

export default function ScreeningPage() {
  return <ScreeningDashboard />;
}
```

#### C. Add Components
Place the component files in your components directory:
```
components/screening/
├── CallLogging.tsx
├── EvaluationQueue.tsx
└── CapacityManagement.tsx
```

## Customization

### Colors
The components use your existing color scheme:
- Primary: Blue (#3b82f6)
- Secondary: Purple (#a855f7)
- Success: Green (#22c55e)
- Warning: Orange (#f97316)
- Danger: Red (#ef4444)

### Data Integration
Replace the sample data with your API calls:

```typescript
// In CallLogging.tsx
const { data: todayCalls } = useQuery({
  queryKey: ['calls', 'today'],
  queryFn: () => fetchTodayCalls()
});

// In EvaluationQueue.tsx
const { data: candidates } = useQuery({
  queryKey: ['evaluations'],
  queryFn: () => fetchEvaluationCandidates()
});

// In CapacityManagement.tsx
const { data: units } = useQuery({
  queryKey: ['capacity'],
  queryFn: () => fetchUnitCapacity()
});
```

### Styling Adjustments
All components use Tailwind CSS. Adjust spacing, colors, or layout by modifying the className properties.

## Features to Implement Next

### Backend Integration
1. **Call Logging API**
   - POST `/api/calls` - Create new call log
   - GET `/api/calls?date=today` - Fetch today's calls
   - PATCH `/api/calls/:id` - Update call status

2. **Evaluation API**
   - GET `/api/evaluations` - Fetch evaluation queue
   - POST `/api/evaluations` - Create evaluation
   - PATCH `/api/evaluations/:id` - Update evaluation progress
   - POST `/api/evaluations/:id/complete` - Complete evaluation

3. **Capacity API**
   - GET `/api/capacity` - Fetch all unit capacities
   - GET `/api/capacity/forecast?days=7` - Get forecast data
   - PATCH `/api/capacity/:unitId` - Update capacity

### Enhanced Features
1. **Real-time Updates**: Add WebSocket for live capacity updates
2. **Analytics Dashboard**: Trends, conversion rates, average wait times
3. **Automated Notifications**: SMS/Email for callbacks and evaluations
4. **Export Reports**: PDF/Excel exports for management
5. **Calendar Integration**: Schedule evaluations with calendar sync

## Mobile Responsiveness

All components are fully responsive:
- **Desktop**: Multi-column layouts with full tables
- **Tablet**: Adjusted grid layouts (2 columns)
- **Mobile**: Single column, stacked cards

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Testing Checklist

- [ ] Navigation between sections works
- [ ] Call form opens and closes properly
- [ ] Evaluation accordion expands/collapses
- [ ] Capacity forecast toggles correctly
- [ ] All stats display accurate numbers
- [ ] Modal forms are scrollable on small screens
- [ ] Responsive layouts work on all devices
- [ ] Icons render correctly (lucide-react installed)

## Support

For issues or questions about implementation, refer to:
- Your existing component patterns in the codebase
- Tailwind CSS documentation
- Lucide React icon library
- React best practices

## License
Proprietary - All rights reserved (Acutis Healthcare)
