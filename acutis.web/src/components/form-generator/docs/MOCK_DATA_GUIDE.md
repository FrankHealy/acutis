# Mock Data Layer Guide

This guide explains how to use the mock data layer for development when your C# backend isn't available.

## Overview

The mock data system provides:
- **File-based persistence** - Data stored in `dat/mock/*.json` files
- **Full CRUD operations** - Create, Read, Update, Delete
- **Session management** - Track admission progress
- **Activity logging** - Automatic activity feed updates
- **Easy toggling** - Switch between mock and real API with one environment variable

## Quick Start

### 1. Setup Mock Data Directory

```bash
# Create the mock data directory in your project root
mkdir -p dat/mock

# Copy the JSON files from the design system package
cp acutis-design-system/dat/mock/*.json dat/mock/
```

Your structure should look like:
```
your-project/
├── dat/
│   └── mock/
│       ├── admissions.json
│       ├── sessions.json
│       └── activity.json
├── src/
│   ├── lib/
│   │   └── mockDataService.ts     <- Copy from package
│   └── ...
└── app/
    └── api/
        └── admissions/
            ├── stats/
            │   └── route.ts        <- API routes
            ├── [id]/
            │   ├── start/
            │   │   └── route.ts
            │   └── sessions/
            │       └── [sessionId]/
            │           └── route.ts
            └── activity/
                └── route.ts
```

### 2. Enable Mock Mode

Add to your `.env.local`:

```bash
# Enable mock data mode
NEXT_PUBLIC_USE_MOCK_DATA=true

# These are ignored when mock mode is enabled
BACKEND_API_URL=https://your-backend.azurewebsites.net
SERVICE_ACCOUNT_TOKEN=your-token
```

### 3. Copy Mock Service

**File:** `src/lib/mockDataService.ts`

Copy the `mockDataService.ts` file from the package to your `src/lib/` directory.

### 4. Setup API Routes

#### Option A: Copy Complete API Routes

Copy all files from `api-routes/` in the package to your `app/api/admissions/` directory.

#### Option B: Add to Existing Routes

If you already have API routes, just add the mock check at the top:

```typescript
// app/api/admissions/stats/route.ts
import { mockAdmissionsService } from '@/lib/mockDataService';

export async function GET(request: NextRequest) {
  // Check if using mock data
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  
  if (useMock) {
    const stats = mockAdmissionsService.getStats();
    return NextResponse.json(stats);
  }
  
  // Your existing real API call
  const response = await fetch(`${process.env.BACKEND_API_URL}/api/admissions/stats`);
  return NextResponse.json(await response.json());
}
```

## JSON File Structure

### admissions.json

Contains all admission records and aggregated stats:

```json
{
  "admissions": [
    {
      "id": "adm-001",
      "firstName": "Michael",
      "lastName": "O'Brien",
      "status": "expected",
      "expectedTime": "10:00",
      "admissionType": "alcohol",
      "phoneEvalCompleted": true,
      "isReturning": false,
      "unit": "detox",
      "createdAt": "2026-01-18T08:00:00Z",
      "notes": ""
    }
  ],
  "stats": {
    "expectedToday": 4,
    "completedToday": 5,
    "needsReview": 2,
    "occupancy": {
      "current": 47,
      "total": 60,
      "percentage": 78
    }
  }
}
```

**Status values:**
- `expected` - Admission scheduled, not yet arrived
- `arrived` - Person has arrived, not started process
- `in_progress` - Currently going through admission
- `completed` - Admission finished

### sessions.json

Tracks multi-step admission sessions:

```json
{
  "sessions": [
    {
      "id": "sess-001",
      "admissionId": "adm-006",
      "currentStep": 2,
      "totalSteps": 5,
      "data": {
        "personalInfo": { /* form data */ },
        "medicalInfo": null,
        "consents": null,
        "roomAssignment": null
      },
      "startedAt": "2026-01-18T08:35:00Z",
      "lastUpdatedAt": "2026-01-18T08:45:00Z",
      "completedAt": null
    }
  ]
}
```

### activity.json

Activity feed log:

```json
{
  "activities": [
    {
      "id": "act-001",
      "type": "admission_completed",
      "icon": "user_plus",
      "text": "New admission completed for David Walsh",
      "admissionId": "adm-007",
      "timestamp": "2026-01-18T09:30:00Z",
      "user": {
        "name": "Sarah Murphy",
        "id": "user-001"
      },
      "metadata": {
        "unit": "ladies"
      }
    }
  ]
}
```

## Mock Service API

### Stats
```typescript
const stats = mockAdmissionsService.getStats(date?: string);
// Returns: AdmissionsStats
```

### Admissions List
```typescript
const admissions = mockAdmissionsService.getAdmissions({
  date?: string,
  status?: string,
  unit?: string
});
// Returns: Admission[]
```

### Single Admission
```typescript
const admission = mockAdmissionsService.getAdmission(id: string);
// Returns: Admission | null
```

### Create Admission (Walk-in)
```typescript
const newAdmission = mockAdmissionsService.createAdmission({
  firstName: 'John',
  lastName: 'Doe',
  status: 'arrived',
  admissionType: 'alcohol',
  phoneEvalCompleted: false,
  isReturning: false,
  unit: 'detox',
  notes: 'Walk-in arrival'
});
// Returns: Admission with generated ID
```

### Update Admission
```typescript
const updated = mockAdmissionsService.updateAdmission('adm-001', {
  status: 'completed',
  notes: 'Admission completed successfully'
});
// Returns: Updated Admission
```

### Session Management
```typescript
// Start new session
const session = mockAdmissionsService.startSession('adm-001');

// Get existing session
const session = mockAdmissionsService.getSession('adm-001', 'sess-001');

// Update session progress
const updated = mockAdmissionsService.updateSession('adm-001', 'sess-001', {
  currentStep: 3,
  data: {
    medicalInfo: { /* ... */ }
  }
});

// Complete admission
mockAdmissionsService.completeAdmission('adm-001', 'sess-001');
```

### Activity Log
```typescript
const activities = mockAdmissionsService.getRecentActivity(limit: 10);
// Returns: Activity[] (sorted by timestamp, newest first)
```

## Data Persistence

### How It Works

1. All operations read from JSON files in `dat/mock/`
2. Write operations update the JSON files immediately
3. Data persists between server restarts
4. No database needed for development

### File Locking

The service uses synchronous file operations to avoid race conditions:
- Reads are atomic
- Writes happen immediately
- No caching (always fresh data)

### Resetting Data

To reset to initial state:

```bash
# Backup your changes
cp dat/mock/admissions.json dat/mock/admissions.backup.json

# Restore original files
cp acutis-design-system/dat/mock/*.json dat/mock/
```

## Testing with Mock Data

### Example: Test Admission Flow

```typescript
// 1. Start with expected admission
const admissions = mockAdmissionsService.getAdmissions();
console.log(admissions[0].status); // "expected"

// 2. Update to arrived
mockAdmissionsService.updateAdmission('adm-001', { status: 'arrived' });

// 3. Start admission process
const session = mockAdmissionsService.startSession('adm-001');
console.log(session.currentStep); // 1

// 4. Progress through steps
mockAdmissionsService.updateSession('adm-001', session.id, {
  currentStep: 2,
  data: { personalInfo: { /* ... */ } }
});

// 5. Complete admission
mockAdmissionsService.completeAdmission('adm-001', session.id);

// 6. Check activity log
const activities = mockAdmissionsService.getRecentActivity(5);
// Should show: "Admission process started", "New admission completed"
```

### Example: Add Walk-in

```typescript
const walkIn = mockAdmissionsService.createAdmission({
  firstName: 'Emergency',
  lastName: 'WalkIn',
  status: 'arrived',
  admissionType: 'alcohol',
  phoneEvalCompleted: false,
  isReturning: false,
  unit: 'detox',
  expectedTime: '',
  notes: 'Unscheduled walk-in arrival'
});

console.log(walkIn.id); // "adm-008" (auto-generated)

// Check updated stats
const stats = mockAdmissionsService.getStats();
console.log(stats.expectedToday); // Updated count
```

## Switching Between Mock and Real API

### Development (Mock Mode)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Your app will:
- Use local JSON files
- See changes persist immediately
- Work offline
- Have predictable test data

### Production (Real API)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
BACKEND_API_URL=https://your-backend.azurewebsites.net
SERVICE_ACCOUNT_TOKEN=your-production-token
```

Your app will:
- Connect to C# backend
- Use real database
- Require authentication
- Work with live data

### Hybrid Mode (Advanced)

You can mix mock and real data:

```typescript
// Use mock for admissions, real for other services
const useMockAdmissions = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

if (useMockAdmissions) {
  return mockAdmissionsService.getAdmissions();
} else {
  return realApiService.getAdmissions();
}
```

## Customizing Mock Data

### Adding Test Scenarios

**File:** `dat/mock/admissions.json`

```json
{
  "admissions": [
    // Regular admission
    {
      "id": "adm-001",
      "status": "expected",
      // ...
    },
    // Returning patient
    {
      "id": "adm-002",
      "isReturning": true,
      // ...
    },
    // Missing phone eval
    {
      "id": "adm-003",
      "phoneEvalCompleted": false,
      // ...
    },
    // Different unit
    {
      "id": "adm-004",
      "unit": "ladies",
      // ...
    }
  ]
}
```

### Simulating Errors

Add to your mock service:

```typescript
// mockDataService.ts
export class MockAdmissionsService {
  private simulateError = false;
  
  enableErrorSimulation() {
    this.simulateError = true;
  }
  
  getStats() {
    if (this.simulateError) {
      throw new Error('Simulated network error');
    }
    // ... normal implementation
  }
}
```

### Adding Delays

Simulate network latency:

```typescript
// mockDataService.ts
async getStats() {
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
  return readJsonFile<AdmissionsData>('admissions.json').stats;
}
```

## Troubleshooting

### "Mock data file not found"
**Solution:** Ensure JSON files are in `dat/mock/` directory at project root.

### "Cannot find module '@/lib/mockDataService'"
**Solution:** Check that mockDataService.ts is in `src/lib/` and your tsconfig paths are set up.

### Changes not persisting
**Solution:** Check file permissions on `dat/mock/` directory. Ensure Next.js dev server has write access.

### Stats not updating
**Solution:** Stats are recalculated on each request. Check that your admission records have proper `createdAt` dates.

### Mock mode not activating
**Solution:** 
1. Check `.env.local` has `NEXT_PUBLIC_USE_MOCK_DATA=true`
2. Restart Next.js dev server after changing env vars
3. Verify with `console.log(process.env.NEXT_PUBLIC_USE_MOCK_DATA)`

## Best Practices

1. **Keep mock data realistic** - Use actual Irish names, proper dates, realistic scenarios
2. **Don't commit sensitive data** - Add `dat/mock/*.json` to `.gitignore` if it contains real info
3. **Test both modes** - Regularly test with mock=true and mock=false to catch integration issues
4. **Document custom scenarios** - Add comments to JSON files explaining test cases
5. **Version control initial state** - Keep a `dat/mock-initial/` backup of clean data

## Migration Path

### Phase 1: Full Mock (Week 1-2)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```
Develop UI, workflows, state management

### Phase 2: Hybrid (Week 3)
```bash
# Some features use mock, some use real API
```
Connect one endpoint at a time to backend

### Phase 3: Real API (Week 4+)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```
Full backend integration, keep mock for testing

## Next Steps

1. Copy mock data files to `dat/mock/`
2. Add mockDataService.ts to your project
3. Update API routes to check mock flag
4. Test admission flow end-to-end
5. Customize mock data for your scenarios
6. Build features without waiting for backend
