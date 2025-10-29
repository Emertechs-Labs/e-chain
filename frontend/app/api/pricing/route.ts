/**
 * Pricing API Route
 * 
 * GET /api/pricing - Fetch all active pricing tiers
 * 
 * @see https://docs.base.org/base-chain/quickstart/connecting-to-base
 * @see https://chainstack.com/ - For additional Base RPC endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import getDatabase, { PricingTier } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/pricing
 * 
 * Fetches all active pricing tiers from the database
 * Returns tiers sorted by sort_order
 * 
 * @returns {Promise<NextResponse>} JSON response with pricing tiers
 */
export async function GET() {
  try {
    const db = getDatabase();
    
    const rows = db.prepare(`
      SELECT 
        id,
        name,
        description,
        price_monthly as priceMonthly,
        price_yearly as priceYearly,
        features_json as features,
        limits_json as limits,
        badge,
        is_active as isActive,
        sort_order as sortOrder,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pricing_tiers
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `).all();
    
    // Parse JSON fields
    const pricingTiers = rows.map((row: any) => ({
      ...row,
      features: JSON.parse(row.features),
      limits: JSON.parse(row.limits),
      isActive: Boolean(row.isActive)
    }));
    
    return NextResponse.json({
      success: true,
      data: pricingTiers,
      timestamp: new Date().toISOString(),
      cached: false
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
    
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pricing tiers',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

/**
 * POST /api/pricing
 * 
 * Create a new pricing tier (Admin only)
 * Requires authentication token
 * 
 * @body {object} Pricing tier data
 * @returns {Promise<NextResponse>} JSON response with created tier
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware
    // For now, check for admin token in header
    const authToken = request.headers.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, description, priceMonthly, priceYearly, features, limits, badge } = body;
    
    // Validation
    if (!name || !features || !limits) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, features, limits'
      }, { status: 400 });
    }
    
    const db = getDatabase();
    const id = `tier-${Date.now()}`;
    
    const stmt = db.prepare(`
      INSERT INTO pricing_tiers (
        id, name, description, price_monthly, price_yearly, 
        features_json, limits_json, badge, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Get current max sort_order
    const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM pricing_tiers').get() as { max: number };
    const sortOrder = (maxOrder.max || 0) + 1;
    
    stmt.run(
      id,
      name,
      description || null,
      priceMonthly || 0,
      priceYearly || 0,
      JSON.stringify(features),
      JSON.stringify(limits),
      badge || null,
      sortOrder
    );
    
    return NextResponse.json({
      success: true,
      data: { id, ...body },
      message: 'Pricing tier created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating pricing tier:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create pricing tier',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
