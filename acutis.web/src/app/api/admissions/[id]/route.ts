/**
 * GET /api/admissions/[id]
 *
 * Returns a single admission by ID
 * Uses mock data if NEXT_PUBLIC_USE_MOCK_DATA=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockAdmissionsService } from '@/lib/mockDataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const useMock =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      !process.env.BACKEND_API_URL;

    if (useMock) {
      const admission = mockAdmissionsService.getAdmission(id);
      if (!admission) {
        return NextResponse.json(
          { error: 'Admission not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(admission);
    }

    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SERVICE_ACCOUNT_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Backend request failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get admission error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admission' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admissions/[id]
 *
 * Update a single admission
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();
    const useMock =
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
      !process.env.BACKEND_API_URL;

    if (useMock) {
      const updated = mockAdmissionsService.updateAdmission(id, body);
      return NextResponse.json(updated);
    }

    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admissions/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SERVICE_ACCOUNT_TOKEN}`,
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
    console.error('Update admission error:', error);
    return NextResponse.json(
      { error: 'Failed to update admission' },
      { status: 500 }
    );
  }
}
