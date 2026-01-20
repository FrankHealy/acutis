/**
 * GET /api/admissions/stats
 *
 * Returns admission statistics
 * Uses mock data if NEXT_PUBLIC_USE_MOCK_DATA=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockAdmissionsService } from '@/lib/mockDataService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || undefined;
  
  try {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.BACKEND_API_URL;
    
    if (useMock) {
      const stats = mockAdmissionsService.getStats(date);
      return NextResponse.json(stats);
    }
    
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/stats?date=${date}`,
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
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
