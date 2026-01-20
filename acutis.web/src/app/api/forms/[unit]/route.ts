/**
 * GET /api/forms/[unit]
 * 
 * Get form configuration for a specific unit
 * Uses mock data if NEXT_PUBLIC_USE_MOCK_DATA=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { mockAdmissionsService } from '@/lib/mockDataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { unit: string } }
) {
  const unit = params.unit;
  
  try {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.BACKEND_API_URL;
    
    if (useMock) {
      const form = mockAdmissionsService.getFormConfigurationByUnit(unit);
      
      if (!form) {
        return NextResponse.json(
          { error: 'Form configuration not found for unit' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(form);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/forms/${unit}`,
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
    console.error('Get form config error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/forms/[unit]
 * 
 * Update form configuration for a unit
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { unit: string } }
) {
  const unit = params.unit;
  
  try {
    const body = await request.json();
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !process.env.BACKEND_API_URL;
    
    if (useMock) {
      const existing = mockAdmissionsService.getFormConfigurationByUnit(unit);
      
      if (!existing) {
        return NextResponse.json(
          { error: 'Form configuration not found' },
          { status: 404 }
        );
      }
      
      const updated = mockAdmissionsService.updateFormConfiguration(
        existing.id,
        body
      );
      
      return NextResponse.json(updated);
    }
    
    // Call real backend
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/forms/${unit}`,
      {
        method: 'PUT',
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
    console.error('Update form config error:', error);
    return NextResponse.json(
      { error: 'Failed to update form configuration' },
      { status: 500 }
    );
  }
}
