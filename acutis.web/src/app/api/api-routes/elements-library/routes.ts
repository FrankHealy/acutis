/**
 * Form Elements Library API Routes
 * 
 * Endpoints for accessing and managing the reusable form elements library
 */

import { NextRequest, NextResponse } from 'next/server';
import { formElementsLibraryService } from '@/lib/formElementsLibraryService';

/**
 * GET /api/forms/elements-library
 * Get complete library
 */
export async function GET_Library(request: NextRequest) {
  try {
    const library = formElementsLibraryService.getLibrary();
    return NextResponse.json(library);
  } catch (error) {
    console.error('Get library error:', error);
    return NextResponse.json(
      { error: 'Failed to load library' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/elements-library/categories
 * Get all categories
 */
export async function GET_Categories(request: NextRequest) {
  try {
    const categories = formElementsLibraryService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to load categories' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/elements-library/category/[categoryId]
 * Get specific category
 */
export async function GET_Category(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const category = formElementsLibraryService.getCategory(params.categoryId);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Failed to load category' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/elements-library/element/[elementId]
 * Get specific element
 */
export async function GET_Element(
  request: NextRequest,
  { params }: { params: { elementId: string } }
) {
  try {
    const element = formElementsLibraryService.getElement(params.elementId);
    
    if (!element) {
      return NextResponse.json(
        { error: 'Element not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(element);
  } catch (error) {
    console.error('Get element error:', error);
    return NextResponse.json(
      { error: 'Failed to load element' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/elements-library/search?q=keyword
 * Search elements
 */
export async function GET_Search(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query required' },
        { status: 400 }
      );
    }
    
    const results = formElementsLibraryService.searchElements(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forms/elements-library/custom
 * Add custom element
 */
export async function POST_CustomElement(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate element
    const validation = formElementsLibraryService.validateElement(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid element', details: validation.errors },
        { status: 400 }
      );
    }
    
    const newElement = formElementsLibraryService.addCustomElement(body);
    return NextResponse.json(newElement);
  } catch (error) {
    console.error('Add custom element error:', error);
    return NextResponse.json(
      { error: 'Failed to add element' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/forms/elements-library/custom/[elementId]
 * Remove custom element
 */
export async function DELETE_CustomElement(
  request: NextRequest,
  { params }: { params: { elementId: string } }
) {
  try {
    const success = formElementsLibraryService.removeCustomElement(params.elementId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Element not found or cannot be deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete element error:', error);
    return NextResponse.json(
      { error: 'Failed to delete element' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/forms/elements-library/expand
 * Expand form template using library elements
 */
export async function POST_ExpandTemplate(request: NextRequest) {
  try {
    const formTemplate = await request.json();
    const expandedForm = formElementsLibraryService.expandFormTemplate(formTemplate);
    return NextResponse.json(expandedForm);
  } catch (error) {
    console.error('Expand template error:', error);
    return NextResponse.json(
      { error: 'Failed to expand template' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/elements-library/popular
 * Get most popular elements
 */
export async function GET_PopularElements(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const popular = formElementsLibraryService.getPopularElements(limit);
    return NextResponse.json(popular);
  } catch (error) {
    console.error('Get popular elements error:', error);
    return NextResponse.json(
      { error: 'Failed to load popular elements' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/elements-library/stats
 * Get library statistics
 */
export async function GET_Statistics(request: NextRequest) {
  try {
    const stats = formElementsLibraryService.getStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    );
  }
}
