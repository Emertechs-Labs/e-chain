/**
 * Platform Statistics API Route
 * 
 * GET /api/statistics - Fetch platform-wide statistics
 * 
 * Aggregates data from blockchain and database to provide real-time
 * platform metrics including events, tickets sold, revenue, and more.
 * 
 * Uses caching to prevent overwhelming the RPC endpoints.
 * 
 * @see https://docs.base.org/base-chain/quickstart/connecting-to-base
 * @see https://chainstack.com/ - For reliable Base RPC endpoints
 * @see https://spectrumnodes.com/ - Alternative RPC provider
 */

import { NextResponse } from 'next/server';
import getDatabase from '@/lib/database';
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

/**
 * Get Base RPC URL with fallback to multiple providers
 * Priority: Chainstack > Spectrum > Base public RPC
 */
function getBaseRpcUrl(): string {
  // Chainstack provides high-performance RPC endpoints
  // https://chainstack.com/
  if (process.env.CHAINSTACK_RPC_URL) {
    return process.env.CHAINSTACK_RPC_URL;
  }
  
  // Spectrum Nodes alternative
  // https://spectrumnodes.com/
  if (process.env.SPECTRUM_RPC_URL) {
    return process.env.SPECTRUM_RPC_URL;
  }
  
  // Coinbase Base Node
  // https://www.coinbase.com/developer-platform/products/base-node
  if (process.env.COINBASE_BASE_NODE_URL) {
    return process.env.COINBASE_BASE_NODE_URL;
  }
  
  // Fallback to public Base RPC
  // https://docs.base.org/base-chain/quickstart/connecting-to-base
  return process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
}

/**
 * Calculate platform statistics from blockchain and database
 */
async function calculateStatistics() {
  const startTime = Date.now();
  const db = getDatabase();
  
  try {
    // Create viem public client for Base
    const client = createPublicClient({
      chain: base,
      transport: http(getBaseRpcUrl(), {
        timeout: 10_000,
        retryCount: 3,
        retryDelay: 1000,
      }),
    });
    
    // Get block number for validation
    const blockNumber = await client.getBlockNumber();
    
    // Query database for event statistics
    const eventStats = db.prepare(`
      SELECT 
        COUNT(*) as totalEvents,
        SUM(CAST(json_extract(data, '$.ticketsSold') AS INTEGER)) as totalTicketsSold,
        SUM(CAST(json_extract(data, '$.revenue') AS REAL)) as totalRevenue
      FROM events
      WHERE deleted = 0
    `).get() as any;
    
    // Query for active events (events with upcoming dates)
    const activeEvents = db.prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE deleted = 0
      AND datetime(json_extract(data, '$.date')) > datetime('now')
    `).get() as any;
    
    // Query for users (unique wallet addresses)
    const userCount = db.prepare(`
      SELECT COUNT(DISTINCT wallet_address) as count
      FROM (
        SELECT json_extract(data, '$.organizer') as wallet_address FROM events WHERE deleted = 0
        UNION
        SELECT buyer_address FROM ticket_purchases
      )
    `).get() as any;
    
    // Calculate platform fees (2.5% of revenue)
    const platformFees = (eventStats.totalRevenue || 0) * 0.025;
    
    const statistics = {
      totalEvents: eventStats.totalEvents || 0,
      totalTicketsSold: eventStats.totalTicketsSold || 0,
      totalRevenue: (eventStats.totalRevenue || 0).toFixed(4),
      totalRevenueUSD: 0, // TODO: Fetch ETH price and calculate
      activeEvents: activeEvents.count || 0,
      activeUsers: userCount.count || 0,
      platformFees: platformFees.toFixed(4),
      platformFeesUSD: 0, // TODO: Fetch ETH price and calculate
      blockNumber: blockNumber.toString(),
      networkStatus: 'healthy',
      rpcProvider: getBaseRpcUrl().includes('chainstack') ? 'Chainstack' : 
                   getBaseRpcUrl().includes('spectrum') ? 'Spectrum' :
                   getBaseRpcUrl().includes('coinbase') ? 'Coinbase' : 'Base Public',
    };
    
    const calculationDuration = Date.now() - startTime;
    
    // Cache the statistics
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO platform_statistics 
      (metric_name, metric_value, last_calculated, calculation_duration_ms)
      VALUES (?, ?, datetime('now'), ?)
    `);
    
    stmt.run('platform_stats', JSON.stringify(statistics), calculationDuration);
    
    return {
      ...statistics,
      lastUpdated: new Date().toISOString(),
      calculationDurationMs: calculationDuration,
      cached: false
    };
    
  } catch (error) {
    console.error('Error calculating statistics:', error);
    
    // Return cached data if available
    const cached = db.prepare(`
      SELECT metric_value, last_calculated, calculation_duration_ms
      FROM platform_statistics
      WHERE metric_name = 'platform_stats'
      ORDER BY last_calculated DESC
      LIMIT 1
    `).get() as any;
    
    if (cached) {
      return {
        ...JSON.parse(cached.metric_value),
        lastUpdated: cached.last_calculated,
        calculationDurationMs: cached.calculation_duration_ms,
        cached: true,
        error: 'Using cached data due to calculation error'
      };
    }
    
    throw error;
  }
}

/**
 * GET /api/statistics
 * 
 * Returns platform-wide statistics
 * Cached for 5 minutes to reduce RPC load
 */
export async function GET() {
  try {
    const db = getDatabase();
    
    // Check if we have recent cached data
    const cached = db.prepare(`
      SELECT metric_value, last_calculated, calculation_duration_ms
      FROM platform_statistics
      WHERE metric_name = 'platform_stats'
      AND datetime(last_calculated, '+' || ? || ' seconds') > datetime('now')
      ORDER BY last_calculated DESC
      LIMIT 1
    `).get(CACHE_DURATION_MS / 1000) as any;
    
    if (cached) {
      const cacheAge = Date.now() - new Date(cached.last_calculated).getTime();
      
      return NextResponse.json({
        success: true,
        data: {
          ...JSON.parse(cached.metric_value),
          lastUpdated: cached.last_calculated,
          calculationDurationMs: cached.calculation_duration_ms,
          cached: true,
          cacheAgeSeconds: Math.floor(cacheAge / 1000)
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache-Status': 'HIT',
          'X-Cache-Age': Math.floor(cacheAge / 1000).toString()
        }
      });
    }
    
    // Calculate fresh statistics
    const statistics = await calculateStatistics();
    
    return NextResponse.json({
      success: true,
      data: statistics
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache-Status': 'MISS'
      }
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch platform statistics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}

/**
 * POST /api/statistics/refresh
 * 
 * Force refresh statistics (Admin only)
 */
export async function POST() {
  try {
    // TODO: Add authentication
    
    const statistics = await calculateStatistics();
    
    return NextResponse.json({
      success: true,
      data: statistics,
      message: 'Statistics refreshed successfully'
    });
    
  } catch (error) {
    console.error('Error refreshing statistics:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh statistics',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
