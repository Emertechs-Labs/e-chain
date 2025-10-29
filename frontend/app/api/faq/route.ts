/**
 * FAQ API Route
 * 
 * GET /api/faq - Fetch all FAQs with optional filtering
 * POST /api/faq - Create new FAQ (Admin only)
 * 
 * Supports search and category filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import getDatabase, { FAQ } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/faq
 * 
 * Fetch FAQs with optional filtering
 * Query params:
 * - category: Filter by category
 * - search: Full-text search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const db = getDatabase();
    let query = `
      SELECT 
        id,
        question,
        answer,
        category,
        tags_json as tags,
        helpful_count as helpfulCount,
        not_helpful_count as notHelpfulCount,
        sort_order as sortOrder,
        is_active as isActive,
        created_at as createdAt,
        updated_at as updatedAt
      FROM faqs
      WHERE is_active = 1
    `;
    
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      // Use FTS for search
      query = `
        SELECT 
          f.id,
          f.question,
          f.answer,
          f.category,
          f.tags_json as tags,
          f.helpful_count as helpfulCount,
          f.not_helpful_count as notHelpfulCount,
          f.sort_order as sortOrder,
          f.is_active as isActive,
          f.created_at as createdAt,
          f.updated_at as updatedAt
        FROM faqs f
        JOIN faqs_fts fts ON f.rowid = fts.rowid
        WHERE fts MATCH ? AND f.is_active = 1
      `;
      params.unshift(search);
      
      if (category) {
        query += ' AND f.category = ?';
        params.push(category);
      }
    }
    
    query += ' ORDER BY sort_order ASC';
    
    const stmt = db.prepare(query);
    const rows = params.length > 0 ? stmt.all(...params) : stmt.all();
    
    // Parse JSON fields
    const faqs = (rows as any[]).map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      isActive: Boolean(row.isActive)
    }));
    
    // Get categories for filtering
    const categories = db.prepare(`
      SELECT DISTINCT category
      FROM faqs
      WHERE is_active = 1
      ORDER BY category ASC
    `).all().map((row: any) => row.category);
    
    return NextResponse.json({
      success: true,
      data: faqs,
      meta: {
        total: faqs.length,
        categories,
        filters: {
          category: category || null,
          search: search || null
        }
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
    
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch FAQs',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

/**
 * POST /api/faq
 * 
 * Create new FAQ (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { question, answer, category, tags } = body;
    
    if (!question || !answer || !category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: question, answer, category'
      }, { status: 400 });
    }
    
    const db = getDatabase();
    const id = `faq-${Date.now()}`;
    
    // Get max sort order
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM faqs').get() as { max: number };
    const sortOrder = (maxOrder.max || 0) + 1;
    
    const stmt = db.prepare(`
      INSERT INTO faqs (id, question, answer, category, tags_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      question,
      answer,
      category,
      JSON.stringify(tags || []),
      sortOrder
    );
    
    return NextResponse.json({
      success: true,
      data: { id, ...body },
      message: 'FAQ created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating FAQ:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create FAQ',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
