# Making the Admissions Dashboard Work

## Files You Need

I've created 2 new files for you:

1. **AdmissionsRedesigned.tsx** - The dashboard component (what you're seeing)
2. **admission-intake-page.tsx** - The intake flow when you click "Start Admission"

## Where to Place Them

### 1. Dashboard Component

**File:** AdmissionsRedesigned.tsx

**Place at:**
```
src/app/admissions/page.tsx
```

**Or if using units structure:**
```
src/units/admissions/page.tsx
```

This is your main admissions page that shows when you navigate to `/admissions`.

---

### 2. Intake Flow Page

**File:** admission-intake-page.tsx

**Place at:**
```
src/app/admissions/intake/[id]/page.tsx
```

This handles:
- `/admissions/intake/adm-001` - Start admission for expected person
- `/admissions/intake/adm-001?continue=true` - Continue existing admission
- `/admissions/intake/new?type=walkin` - Walk-in admission

**Folder structure:**
```
src/app/admissions/
├── page.tsx                    ← AdmissionsRedesigned.tsx
└── intake/
    └── [id]/
        └── page.tsx            ← admission-intake-page.tsx
```

---

## What Each Button Does

### Dashboard Buttons

1. **"Start Admission"** button
   - Navigates to: `/admissions/intake/{admissionId}`
   - Loads dynamic form from Form Generator
   - Shows multi-step admission flow

2. **"Continue Admission"** button (for "Arrived" status)
   - Navigates to: `/admissions/intake/{admissionId}?continue=true`
   - Loads saved form data and resumes where left off

3. **"Walk-in / Not on List"** banner
   - Navigates to: `/admissions/intake/new?type=walkin`
   - Starts new admission for unexpected arrival

4. **"View All Admissions"** quick action
   - Navigates to: `/admissions/list`
   - You'll need to create this page (shows all admissions)

5. **"Form Configuration"** quick action
   - Navigates to: `/configuration/forms`
   - Where admins edit form configurations (Form Designer UI)

6. **"Reports & Analytics"** quick action
   - Navigates to: `/reports/admissions`
   - You'll need to create this page (analytics dashboard)

---

## API Endpoints Needed

The dashboard calls these endpoints:

### 1. Get Expected Admissions
```typescript
GET /api/admissions?status=expected

Response:
[
  {
    id: "adm-001",
    firstName: "Michael",
    lastName: "O'Brien",
    expectedTime: "10:00",
    status: "expected",
    primarySubstance: "Alcohol",
    phoneEval: true,
    returning: false
  }
]
```

### 2. Get Dashboard Stats
```typescript
GET /api/admissions/stats

Response:
{
  expectedToday: 4,
  completedToday: 5,
  needsReview: 2,
  occupancy: 78,
  totalBeds: 60,
  occupiedBeds: 47,
  completedYesterday: 3
}
```

### 3. Get Form Configuration
```typescript
GET /api/forms/detox

Response:
{
  id: "form-detox-admission",
  name: "Detox Admission Form",
  steps: [...]
}
```

### 4. Get Single Admission
```typescript
GET /api/admissions/{id}

Response:
{
  id: "adm-001",
  firstName: "Michael",
  lastName: "O'Brien",
  formData: { ... },
  currentStep: 2,
  status: "in_progress"
}
```

### 5. Save/Update Admission
```typescript
POST /api/admissions
PUT /api/admissions/{id}

Body:
{
  formData: { firstName: "Michael", ... },
  currentStep: 2,
  status: "in_progress"
}
```

**Good news:** These API routes are included in the Form Generator package!

---

## Mock Data vs Real API

The dashboard automatically falls back to mock data if API calls fail:

```typescript
// Tries API first
const response = await fetch('/api/admissions?status=expected');
const data = await response.json();

// Falls back to mock if API fails
catch (error) {
  setAdmissions(getMockAdmissions());
}
```

So it works even if your API isn't ready yet!

---

## Environment Variable

Make sure you have this in `.env.local`:

```bash
# Use mock data (development)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Or use real API (production)
NEXT_PUBLIC_USE_MOCK_DATA=false
BACKEND_API_URL=https://your-backend.azurewebsites.net
SERVICE_ACCOUNT_TOKEN=your-token
```

---

## Testing It

### Step 1: Place Files
```bash
# Copy dashboard
cp AdmissionsRedesigned.tsx src/app/admissions/page.tsx

# Create intake folder and copy page
mkdir -p src/app/admissions/intake/\[id\]
cp admission-intake-page.tsx src/app/admissions/intake/\[id\]/page.tsx
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Navigate to Dashboard
```
http://localhost:3000/admissions
```

### Step 4: Click "Start Admission"
Should navigate to intake flow and load the dynamic form!

---

## What You'll See

### 1. Dashboard loads
- Shows 4 stat cards at top
- Shows walk-in banner
- Shows list of expected admissions
- Shows quick actions sidebar
- Shows recent activity

### 2. Click "Start Admission"
- Navigates to `/admissions/intake/adm-001`
- Shows progress bar (Step 1 of 5)
- Loads form configuration from `/api/forms/detox`
- Renders fields using DynamicFormRenderer
- Shows Back/Next buttons

### 3. Fill Out Form
- Type in fields
- Click "Next Step"
- Saves progress to API
- Moves to next step

### 4. Complete Admission
- On final step, click "Complete Admission"
- Saves to API with status "completed"
- Redirects back to dashboard

---

## Common Issues

### Issue: Dashboard shows but nothing loads
**Fix:** API endpoints aren't working, but mock data should kick in automatically. Check browser console for errors.

### Issue: Clicking "Start Admission" does nothing
**Fix:** Check that you placed `admission-intake-page.tsx` at the correct path: `src/app/admissions/intake/[id]/page.tsx`

### Issue: Form doesn't render
**Fix:** Make sure you have:
1. DynamicFormRenderer.tsx in `src/configuration/form-generator/components/`
2. forms.json in `src/configuration/form-generator/data/mock/`
3. API route at `src/app/api/forms/[unit]/route.ts`

### Issue: Import errors
**Fix:** Update import paths to match your project structure:
```typescript
// Change these imports to match your structure
import { Card } from '@/components/design-system/Card';
import { DynamicFormRenderer } from '@/configuration/form-generator/components/DynamicFormRenderer';
```

---

## Quick Checklist

- [ ] AdmissionsRedesigned.tsx → `src/app/admissions/page.tsx`
- [ ] admission-intake-page.tsx → `src/app/admissions/intake/[id]/page.tsx`
- [ ] Design system components installed
- [ ] Form Generator installed
- [ ] API routes copied
- [ ] .env.local configured
- [ ] Dev server running
- [ ] Navigate to `/admissions`
- [ ] Click "Start Admission"
- [ ] Form loads!

---

## Next Steps

Once this is working, you can:

1. **Create the List View**
   - `src/app/admissions/list/page.tsx`
   - Shows all admissions (not just expected)
   - Filterable, searchable table

2. **Create Form Designer**
   - `src/app/configuration/forms/page.tsx`
   - UI for editing form configurations
   - Drag & drop from elements library

3. **Create Reports Dashboard**
   - `src/app/reports/admissions/page.tsx`
   - Charts and analytics
   - Admission trends, completion rates

4. **Connect to Real Backend**
   - Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
   - Configure `BACKEND_API_URL`
   - API routes will proxy to your C# backend

---

**Everything should work now!** Click "Start Admission" and you'll see the dynamic form in action! 🚀
