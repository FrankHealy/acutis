# Quick Start - Mock Data System

Get up and running with the mock data layer in 5 minutes.

## What You Get

✅ **File-based persistence** - All data stored in JSON files  
✅ **Full CRUD operations** - Create, read, update, delete admissions  
✅ **Session tracking** - Multi-step admission forms with progress  
✅ **Activity logging** - Automatic activity feed updates  
✅ **Easy toggle** - Switch between mock and real API instantly  

## Installation

### 1. Extract Package

```bash
unzip acutis-design-system.zip
cd your-project-root
```

### 2. Run Setup Script

```bash
chmod +x acutis-design-system/setup-mock.sh
./acutis-design-system/setup-mock.sh
```

This will:
- Create `dat/mock/` directory with JSON files
- Copy `mockDataService.ts` to `src/lib/`
- Create `.env.local` with mock mode enabled
- Set up directory structure

### 3. Add Types

Create `src/units/detox/types.ts`:

```typescript
export interface Admission {
  id: string;
  firstName: string;
  lastName: string;
  status: 'expected' | 'arrived' | 'in_progress' | 'completed';
  expectedTime?: string;
  admissionType: 'alcohol' | 'drugs' | 'gambling';
  phoneEvalCompleted: boolean;
  isReturning: boolean;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface AdmissionsStats {
  expectedToday: number;
  completedToday: number;
  needsReview: number;
  occupancy: {
    current: number;
    total: number;
    percentage: number;
  };
}

export interface AdmissionSession {
  id: string;
  admissionId: string;
  currentStep: number;
  totalSteps: number;
  data: any;
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
}
```

### 4. Set Up API Routes

Copy the route templates from `api-routes/` to your Next.js app:

```bash
# Create directories
mkdir -p app/api/admissions/{stats,activity}
mkdir -p app/api/admissions/[id]/{start,complete}
mkdir -p app/api/admissions/[id]/sessions/[sessionId]

# Copy route files (adjust paths as needed)
```

**Or manually create**: See `IMPLEMENTATION_GUIDE.md` for full route examples.

### 5. Verify Setup

Check your structure:

```
your-project/
├── dat/
│   └── mock/                       ✓ Mock data files
│       ├── admissions.json
│       ├── sessions.json
│       └── activity.json
├── src/
│   ├── lib/
│   │   └── mockDataService.ts      ✓ Mock service
│   └── units/
│       └── detox/
│           └── types.ts             ✓ TypeScript types
├── app/
│   └── api/
│       └── admissions/
│           └── stats/
│               └── route.ts         ✓ API routes
└── .env.local                       ✓ NEXT_PUBLIC_USE_MOCK_DATA=true
```

## Usage

### Start Dev Server

```bash
npm run dev
```

Visit: `http://localhost:3000/detox/admissions`

### Toggle Mock/Real API

Edit `.env.local`:

```bash
# Development (mock data)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Production (real API)
NEXT_PUBLIC_USE_MOCK_DATA=false
BACKEND_API_URL=https://your-backend.azurewebsites.net
```

**Restart dev server after changing!**

## Test It

### View Dashboard

```bash
curl http://localhost:3000/api/admissions/stats
```

Should return:
```json
{
  "expectedToday": 4,
  "completedToday": 5,
  "needsReview": 2,
  "occupancy": {
    "current": 47,
    "total": 60,
    "percentage": 78
  }
}
```

### List Admissions

```bash
curl http://localhost:3000/api/admissions
```

Returns array of admissions.

### Start Admission

```bash
curl -X POST http://localhost:3000/api/admissions/adm-001/start
```

Returns new session object.

## Customize Mock Data

Edit files in `dat/mock/`:

### Add New Admission

**File:** `dat/mock/admissions.json`

```json
{
  "admissions": [
    {
      "id": "adm-999",
      "firstName": "Test",
      "lastName": "User",
      "status": "expected",
      "expectedTime": "15:00",
      "admissionType": "alcohol",
      "phoneEvalCompleted": true,
      "isReturning": false,
      "unit": "detox",
      "createdAt": "2026-01-18T12:00:00Z",
      "notes": "Test admission"
    }
    // ... other admissions
  ]
}
```

Save file, refresh browser. **Changes persist immediately.**

### Change Stats

**File:** `dat/mock/admissions.json`

```json
{
  "stats": {
    "occupancy": {
      "current": 50,    // Changed from 47
      "total": 60,
      "percentage": 83  // Changed from 78
    }
  }
}
```

## Common Tasks

### Add Walk-in Admission

In your component:

```typescript
const handleWalkIn = async () => {
  const response = await fetch('/api/admissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      status: 'arrived',
      admissionType: 'alcohol',
      phoneEvalCompleted: false,
      isReturning: false,
      unit: 'detox',
      notes: 'Walk-in arrival'
    })
  });
  
  const admission = await response.json();
  console.log('Created:', admission.id); // "adm-008"
};
```

### Update Admission Status

```typescript
const handleComplete = async (admissionId: string) => {
  const response = await fetch(`/api/admissions/${admissionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'completed',
      notes: 'Admission completed'
    })
  });
};
```

### Track Session Progress

```typescript
// Start session
const session = await fetch(`/api/admissions/${id}/start`, {
  method: 'POST'
}).then(r => r.json());

// Update progress
await fetch(`/api/admissions/${id}/sessions/${session.id}`, {
  method: 'PATCH',
  body: JSON.stringify({
    currentStep: 2,
    data: { personalInfo: { /* ... */ } }
  })
});

// Complete
await fetch(`/api/admissions/${id}/complete`, {
  method: 'POST',
  body: JSON.stringify({ sessionId: session.id })
});
```

## Troubleshooting

### "Mock data file not found"

**Solution:** Run setup script again or manually copy files:
```bash
cp acutis-design-system/dat/mock/*.json dat/mock/
```

### Changes not appearing

**Solution:** 
1. Restart Next.js dev server
2. Hard refresh browser (Ctrl+Shift+R)
3. Check file was actually saved

### Mock mode not working

**Solution:**
```bash
# Verify env var
echo $NEXT_PUBLIC_USE_MOCK_DATA

# Check .env.local
cat .env.local | grep NEXT_PUBLIC_USE_MOCK_DATA

# Restart dev server
npm run dev
```

### API returning 500 errors

**Solution:**
1. Check browser console for errors
2. Check terminal for server errors
3. Verify `mockDataService.ts` is in `src/lib/`
4. Verify types match between frontend and mock service

## Next Steps

1. ✅ Mock data working? Great!
2. 📖 Read `MOCK_DATA_GUIDE.md` for advanced features
3. 🎨 Customize `dat/mock/*.json` for your test scenarios
4. 🧪 Build features without waiting for backend
5. 🔄 Switch to real API when ready

## Resources

- **MOCK_DATA_GUIDE.md** - Comprehensive guide
- **IMPLEMENTATION_GUIDE.md** - Integration instructions
- **API_INTEGRATION.ts** - Backend integration examples
- **dat/mock/*.json** - Your test data

## Support

If something's not working:
1. Check file paths match the structure above
2. Verify `.env.local` has mock mode enabled
3. Restart dev server after any env changes
4. Check console/terminal for errors
5. Review `MOCK_DATA_GUIDE.md` troubleshooting section

Happy developing! 🚀
