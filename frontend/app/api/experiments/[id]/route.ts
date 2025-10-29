/**
 * Experiments API - Manage A/B tests for frames
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Mock experiments - in production, fetch from database
const EXPERIMENTS = {
  frame_buttons_default: {
    id: 'frame_buttons_default',
    name: 'Frame Button Test',
    active: true,
    traffic: 1.0,
    variants: [
      {
        id: 'control',
        name: 'Control - Original',
        weight: 0.5,
        config: {
          primaryText: 'Get Ticket',
          secondaryText: 'View Event',
          primaryColor: '#10b981',
          layout: 'horizontal',
        },
      },
      {
        id: 'variant_a',
        name: 'Variant A - Urgent CTA',
        weight: 0.5,
        config: {
          primaryText: '🎟️ Claim Now',
          secondaryText: 'Learn More',
          primaryColor: '#f59e0b',
          layout: 'vertical',
        },
      },
    ],
  },
  price_display_default: {
    id: 'price_display_default',
    name: 'Price Display Test',
    active: true,
    traffic: 1.0,
    variants: [
      {
        id: 'control',
        name: 'Control - ETH Only',
        weight: 0.33,
        config: {
          format: 'eth',
          showDiscount: false,
          emphasize: false,
        },
      },
      {
        id: 'variant_a',
        name: 'Variant A - USD Conversion',
        weight: 0.33,
        config: {
          format: 'both',
          showDiscount: false,
          emphasize: true,
        },
      },
      {
        id: 'variant_b',
        name: 'Variant B - Discount Emphasis',
        weight: 0.34,
        config: {
          format: 'both',
          showDiscount: true,
          emphasize: true,
        },
      },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experimentId = params.id;
    const experiment = EXPERIMENTS[experimentId as keyof typeof EXPERIMENTS];

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(experiment, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (error) {
    console.error('Experiment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiment' },
      { status: 500 }
    );
  }
}
