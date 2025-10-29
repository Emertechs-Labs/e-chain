import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../../lib/contract-wrapper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contract = searchParams.get('contract');

    if (!contract) {
      return NextResponse.json({ error: 'Contract address required' }, { status: 400 });
    }

    // Call the totalSold function on the EventTicket contract using wrapper with fallback
    const totalSold = await readContract(
      'EventTicket',
      'totalSold',
      []
    );

    return NextResponse.json({
      totalSold: Number(totalSold) || 0,
      contract
    });
  } catch (error) {
    console.error('Error fetching ticket sales:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ticket sales',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}