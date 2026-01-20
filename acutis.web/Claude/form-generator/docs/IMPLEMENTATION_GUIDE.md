# Complete Implementation Guide

This guide shows how to integrate the functional admissions system into your existing Acutis architecture.

## Your Current Structure

```
├── app/
│   ├── detox/
│   │   └── page.tsx
│   └── ...
│
└── src/
    ├── components/
    │   └── design-system/          <- ADD: Design system here
    │
    └── units/
        ├── detox/
        │   ├── components/          <- ADD: Functional components here
        │   ├── hooks/               <- ADD: Data fetching hooks here
        │   ├── services/            <- ADD: API services here
        │   └── types.ts             <- ADD: TypeScript types here
        └── ...
```

## Step-by-Step Implementation

### Step 1: Add Design System

Place the design system in your shared components:

```
src/
  └── components/
      └── design-system/
          ├── tokens.ts
          ├── Card.tsx
          ├── IconBadge.tsx
          ├── StatCard.tsx
          ├── QuickAction.tsx
          └── index.ts
```

### Step 2: Create Types

**File:** `src/units/detox/types.ts`

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
  data: AdmissionData;
  startedAt: Date;
  lastUpdated: Date;
}

export interface AdmissionData {
  personalInfo?: PersonalInfo;
  medicalInfo?: MedicalInfo;
  consents?: Consents;
  roomAssignment?: RoomAssignment;
}

// Add more interfaces as needed...
```

### Step 3: Create API Service

**File:** `src/units/detox/services/admissionsService.ts`

```typescript
import type { Admission, AdmissionsStats, AdmissionSession } from '../types';

class AdmissionsService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  async getStats(date?: string): Promise<AdmissionsStats> {
    return this.request(`/api/admissions/stats?date=${date || new Date().toISOString()}`);
  }

  async getAdmissions(params?: any): Promise<Admission[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admissions?${queryString}`);
  }

  async startSession(admissionId: string): Promise<AdmissionSession> {
    return this.request(`/api/admissions/${admissionId}/start`, {
      method: 'POST',
    });
  }

  async getSession(admissionId: string, sessionId: string): Promise<AdmissionSession> {
    return this.request(`/api/admissions/${admissionId}/sessions/${sessionId}`);
  }

  async updateSession(
    admissionId: string,
    sessionId: string,
    data: { currentStep: number; data: any }
  ): Promise<AdmissionSession> {
    return this.request(`/api/admissions/${admissionId}/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async completeAdmission(admissionId: string, sessionId: string): Promise<void> {
    return this.request(`/api/admissions/${admissionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }
}

export const admissionsService = new AdmissionsService();
```

### Step 4: Create Data Hooks

**File:** `src/units/detox/hooks/useAdmissions.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { admissionsService } from '../services/admissionsService';
import type { Admission, AdmissionsStats } from '../types';

export function useAdmissionsData() {
  const [stats, setStats] = useState<AdmissionsStats>({
    expectedToday: 0,
    completedToday: 0,
    needsReview: 0,
    occupancy: { current: 0, total: 0, percentage: 0 },
  });
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, admissionsData] = await Promise.all([
        admissionsService.getStats(),
        admissionsService.getAdmissions({ date: new Date().toISOString() }),
      ]);

      setStats(statsData);
      setAdmissions(admissionsData);
    } catch (err) {
      setError('Failed to load admissions data');
      console.error('Load data error:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  return {
    stats,
    admissions,
    isLoadingData,
    error,
    refresh: loadData,
  };
}

export function useRecentActivity() {
  // Implement similar pattern for activity feed
  return [];
}

export function useStartAdmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAdmission = async (admissionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await admissionsService.startSession(admissionId);
      return session;
    } catch (err) {
      setError('Failed to start admission');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { startAdmission, isLoading, error };
}
```

### Step 5: Create Page Component

**File:** `src/units/detox/components/AdmissionsPage.tsx`

Copy `AdmissionsFunctional.tsx` here and update imports:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { StatCard, StatGrid } from '@/components/design-system/StatCard';
import { QuickAction } from '@/components/design-system/QuickAction';
import { Card, CardHeader } from '@/components/design-system/Card';
import { useAdmissionsData, useStartAdmission } from '../hooks/useAdmissions';
import { admissionsService } from '../services/admissionsService';

export function AdmissionsPage() {
  const router = useRouter();
  const { stats, admissions, isLoadingData } = useAdmissionsData();
  const { startAdmission, isLoading } = useStartAdmission();

  const handleStartAdmission = async (admissionId: string) => {
    try {
      const session = await startAdmission(admissionId);
      router.push(`/detox/admissions/${admissionId}/intake?sessionId=${session.id}`);
    } catch (err) {
      // Error already handled in hook
    }
  };

  // Rest of component...
}
```

### Step 6: Create Route

**File:** `app/detox/admissions/page.tsx`

```typescript
import { AdmissionsPage } from '@/units/detox/components/AdmissionsPage';

export default function DetoxAdmissionsRoute() {
  return <AdmissionsPage />;
}
```

### Step 7: Create Intake Route

**File:** `app/detox/admissions/[id]/intake/page.tsx`

```typescript
import { AdmissionIntakeFlow } from '@/units/detox/components/AdmissionIntakeFlow';

export default function IntakeRoute({ params }: { params: { id: string } }) {
  return <AdmissionIntakeFlow admissionId={params.id} />;
}
```

## API Integration Options

### Option A: Direct C# Backend Integration

If calling C# API directly from frontend:

1. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.azurewebsites.net
   ```

2. The service will call your C# endpoints directly
3. Handle CORS in your C# backend
4. Implement auth token management

### Option B: Next.js API Routes (Recommended)

If you want an intermediate layer:

1. Create Next.js API routes in `app/api/admissions/`
2. Routes proxy to C# backend
3. Better for:
   - Token management
   - Request validation
   - Rate limiting
   - Caching

**File:** `app/api/admissions/stats/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/stats?date=${date}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SERVICE_ACCOUNT_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
```

## C# Backend Requirements

Your C# backend needs these endpoints:

```csharp
// AdmissionsController.cs

[HttpGet("api/admissions/stats")]
public async Task<ActionResult<AdmissionsStatsDto>> GetStats([FromQuery] DateTime? date)
{
    var stats = await _admissionsService.GetStatsAsync(date ?? DateTime.Today);
    return Ok(stats);
}

[HttpGet("api/admissions")]
public async Task<ActionResult<List<AdmissionDto>>> GetAdmissions(
    [FromQuery] DateTime? date,
    [FromQuery] string? status)
{
    var admissions = await _admissionsService.GetAdmissionsAsync(date, status);
    return Ok(admissions);
}

[HttpPost("api/admissions/{id}/start")]
public async Task<ActionResult<AdmissionSessionDto>> StartSession(string id)
{
    var session = await _admissionsService.CreateSessionAsync(id);
    return Ok(session);
}

[HttpGet("api/admissions/{id}/sessions/{sessionId}")]
public async Task<ActionResult<AdmissionSessionDto>> GetSession(string id, string sessionId)
{
    var session = await _admissionsService.GetSessionAsync(id, sessionId);
    if (session == null) return NotFound();
    return Ok(session);
}

[HttpPatch("api/admissions/{id}/sessions/{sessionId}")]
public async Task<ActionResult<AdmissionSessionDto>> UpdateSession(
    string id,
    string sessionId,
    [FromBody] UpdateSessionDto dto)
{
    var session = await _admissionsService.UpdateSessionAsync(id, sessionId, dto);
    return Ok(session);
}

[HttpPost("api/admissions/{id}/complete")]
public async Task<IActionResult> CompleteAdmission(
    string id,
    [FromBody] CompleteAdmissionDto dto)
{
    await _admissionsService.CompleteAdmissionAsync(id, dto.SessionId);
    return Ok();
}
```

## Database Schema (Example)

```sql
-- Admissions table
CREATE TABLE Admissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    ExpectedTime DATETIME2,
    AdmissionType NVARCHAR(50) NOT NULL,
    PhoneEvalCompleted BIT DEFAULT 0,
    IsReturning BIT DEFAULT 0,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Admission Sessions table
CREATE TABLE AdmissionSessions (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    AdmissionId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Admissions(Id),
    CurrentStep INT NOT NULL,
    TotalSteps INT NOT NULL,
    Data NVARCHAR(MAX), -- JSON
    StartedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastUpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2
);
```

## Testing the Integration

### 1. Test with Mock Data

Update `useAdmissionsData` hook to return mock data initially:

```typescript
const [stats, setStats] = useState<AdmissionsStats>({
  expectedToday: 4,
  completedToday: 5,
  needsReview: 2,
  occupancy: { current: 47, total: 60, percentage: 78 },
});
```

### 2. Test API Endpoints

Use Postman or curl to test your C# endpoints:

```bash
curl -X GET https://your-backend.azurewebsites.net/api/admissions/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Incremental Integration

1. Start with stats display (read-only)
2. Add list display
3. Add start admission flow
4. Add intake form
5. Add completion flow

## Authentication Setup

If using Azure AD / Entra ID:

**File:** `src/lib/auth.ts`

```typescript
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export async function getAccessToken() {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length > 0) {
    const response = await msalInstance.acquireTokenSilent({
      scopes: ['api://your-api-client-id/access_as_user'],
      account: accounts[0],
    });
    
    return response.accessToken;
  }
  
  throw new Error('No account logged in');
}
```

Initialize on app load:

```typescript
// app/layout.tsx or _app.tsx
useEffect(() => {
  getAccessToken().then(token => {
    admissionsService.setAuthToken(token);
  });
}, []);
```

## Deployment Checklist

- [ ] Environment variables set in production
- [ ] CORS configured in C# backend
- [ ] Authentication tokens working
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Form validation working
- [ ] Success/error notifications
- [ ] Analytics/logging setup

## Troubleshooting

**Issue:** CORS errors
- Solution: Configure CORS in C# Startup.cs/Program.cs

**Issue:** Auth token not working
- Solution: Verify Azure AD app registration and scopes

**Issue:** 404 on API calls
- Solution: Check NEXT_PUBLIC_API_URL and backend URL

**Issue:** Data not updating
- Solution: Check network tab, verify API response format

## Next Steps

1. Implement remaining form steps
2. Add PDF generation for intake forms
3. Add email notifications
4. Add calendar integration
5. Add reporting/analytics
6. Add audit logging

## Support Files Reference

- `AdmissionsFunctional.tsx` - Main admissions dashboard
- `AdmissionIntakeFlow.tsx` - Multi-step intake form
- `API_INTEGRATION.ts` - Complete API integration guide
- Design system components in `/components/design-system`
