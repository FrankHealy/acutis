/**
 * Session Management API Routes
 * 
 * Handles admission session operations with mock data support
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockAdmissionsService } from '@/lib/mockDataService';

/**
 * POST /api/admissions/[id]/start
 * Start a new admission session
 */
export async function POST_StartSession(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admissionId = params.id;
  
  try {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      const session = mockAdmissionsService.startSession(admissionId);
      return NextResponse.json(session);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/${admissionId}/start`,
      {
        method: 'POST',
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
    console.error('Start session error:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admissions/[id]/sessions/[sessionId]
 * Get session details
 */
export async function GET_Session(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  const { id, sessionId } = params;
  
  try {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      const session = mockAdmissionsService.getSession(id, sessionId);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(session);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/${id}/sessions/${sessionId}`,
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
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admissions/[id]/sessions/[sessionId]
 * Update session progress
 */
export async function PATCH_UpdateSession(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  const { id, sessionId } = params;
  
  try {
    const body = await request.json();
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      const session = mockAdmissionsService.updateSession(
        id,
        sessionId,
        body
      );
      return NextResponse.json(session);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/${id}/sessions/${sessionId}`,
      {
        method: 'PATCH',
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
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admissions/[id]/complete
 * Complete admission
 */
export async function POST_CompleteAdmission(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admissionId = params.id;
  
  try {
    const { sessionId } = await request.json();
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      mockAdmissionsService.completeAdmission(admissionId, sessionId);
      return NextResponse.json({ success: true });
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/${admissionId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SERVICE_ACCOUNT_TOKEN}`,
        },
        body: JSON.stringify({ sessionId }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Backend request failed');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Complete admission error:', error);
    return NextResponse.json(
      { error: 'Failed to complete admission' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admissions/activity
 * Get recent activity
 */
export async function GET_Activity(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  
  try {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    
    if (useMock) {
      const activities = mockAdmissionsService.getRecentActivity(limit);
      return NextResponse.json(activities);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/activity?limit=${limit}`,
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
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: 'Failed to get activity' },
      { status: 500 }
    );
  }
}
