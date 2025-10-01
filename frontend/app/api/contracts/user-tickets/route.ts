import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../../lib/contract-wrapper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const contract = searchParams.get('contract');

    if (!address || !contract) {
      return NextResponse.json({ error: 'Address and contract required' }, { status: 400 });
    }

    // Call the balanceOf function on the EventTicket contract with automatic fallback
    const balance = await readContract(
      'EventTicket',
      'balanceOf',
      [address]
    );

    return NextResponse.json({
      hasTicket: Number(balance) > 0,
      balance: Number(balance),
      address,
      contract
    });
  } catch (error) {
    console.error('Error checking user tickets:', error);
    return NextResponse.json({ error: 'Failed to check user tickets' }, { status: 500 });
  }
}