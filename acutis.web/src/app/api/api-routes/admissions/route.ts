/**
 * GET /api/admissions
 * 
 * Returns list of admissions with optional filters
 * Uses mock data if NEXT_PUBLIC_USE_MOCK_DATA=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockAdmissionsService } from '@/lib/mockDataService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || undefined;
  const status = searchParams.get('status') || undefined;
  const unit = searchParams.get('unit') || undefined;
  
  try {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      const admissions = mockAdmissionsService.getAdmissions({ date, status, unit });
      return NextResponse.json(admissions);
    }
    
    // Call real backend
    const queryString = new URLSearchParams({ 
      ...(date && { date }),
      ...(status && { status }),
      ...(unit && { unit }),
    }).toString();
    
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions?${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SERVICE_ACCOUNT_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Get admissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admissions
 * 
 * Create new admission (walk-in)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      const admission = mockAdmissionsService.createAdmission(body);
      return NextResponse.json(admission);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SERVICE_ACCOUNT_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Create admission error:', error);
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 }
    );
  }
}
