/**
 * Analytics Dashboard API
 * Aggregates metrics for Frame performance monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const eventId = searchParams.get('eventId');

    // In production, fetch from database
    // For now, return mock data
    const metrics = await getMetrics(timeRange, eventId);

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}

async function getMetrics(timeRange: string, eventId: string | null) {
  // TODO: Replace with actual database queries
  // This is mock data for demonstration

  const baseMetrics = {
    overview: {
      totalViews: 12453,
      totalEngagements: 3421,
      totalConnects: 1234,
      totalPurchases: 456,
      totalShares: 234,
      conversionRate: 0.0366, // 3.66%
      viralCoefficient: 1.95, // conversions per share
      kFactor: 0.46, // viral loop metric
      averageRevenuePerUser: 0.023, // ETH
    },
    funnel: {
      views: 12453,
      engagements: 3421,
      connects: 1234,
      purchases: 456,
      shares: 234,
      viewToEngageRate: 0.2747,
      engageToConnectRate: 0.3606,
      connectToPurchaseRate: 0.3695,
      overallConversionRate: 0.0366,
    },
    viral: {
      shares: 234,
      conversions: 456,
      viralCoefficient: 1.95,
      kFactor: 0.46,
      topReferrers: [
        {
          fid: 12345,
          username: 'vitalik',
          referrals: 89,
          conversions: 23,
        },
        {
          fid: 23456,
          username: 'dankrad',
          referrals: 67,
          conversions: 19,
        },
        {
          fid: 34567,
          username: 'sassal',
          referrals: 45,
          conversions: 15,
        },
        {
          fid: 45678,
          username: 'jessepollak',
          referrals: 34,
          conversions: 12,
        },
        {
          fid: 56789,
          username: 'ted',
          referrals: 28,
          conversions: 9,
        },
      ],
    },
  };

  // Adjust metrics based on time range
  const multipliers = {
    '1h': 0.04,
    '24h': 1,
    '7d': 7,
    '30d': 30,
  };

  const multiplier = multipliers[timeRange as keyof typeof multipliers] || 1;

  return {
    overview: {
      ...baseMetrics.overview,
      totalViews: Math.floor(baseMetrics.overview.totalViews * multiplier),
      totalEngagements: Math.floor(baseMetrics.overview.totalEngagements * multiplier),
      totalConnects: Math.floor(baseMetrics.overview.totalConnects * multiplier),
      totalPurchases: Math.floor(baseMetrics.overview.totalPurchases * multiplier),
      totalShares: Math.floor(baseMetrics.overview.totalShares * multiplier),
    },
    funnel: {
      ...baseMetrics.funnel,
      views: Math.floor(baseMetrics.funnel.views * multiplier),
      engagements: Math.floor(baseMetrics.funnel.engagements * multiplier),
      connects: Math.floor(baseMetrics.funnel.connects * multiplier),
      purchases: Math.floor(baseMetrics.funnel.purchases * multiplier),
      shares: Math.floor(baseMetrics.funnel.shares * multiplier),
    },
    viral: {
      ...baseMetrics.viral,
      shares: Math.floor(baseMetrics.viral.shares * multiplier),
      conversions: Math.floor(baseMetrics.viral.conversions * multiplier),
      topReferrers: baseMetrics.viral.topReferrers.map(r => ({
        ...r,
        referrals: Math.floor(r.referrals * multiplier),
        conversions: Math.floor(r.conversions * multiplier),
      })),
    },
  };
}
