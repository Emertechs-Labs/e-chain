import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../../lib/contract-wrapper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const contract = searchParams.get('contract');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // Use the specific contract address if provided, otherwise use default EventTicket
    const contractAddress = contract || 'EventTicket';

    // Call the balanceOf function on the specified contract with automatic fallback
    const balance = await readContract(
      contractAddress as any,
      'balanceOf',
      [address]
    );

    return NextResponse.json({
      hasTicket: Number(balance) > 0,
      balance: Number(balance),
      address,
      contract: contractAddress
    });
  } catch (error) {
    console.error('Error checking user tickets:', error);
    return NextResponse.json({ error: 'Failed to check user tickets' }, { status: 500 });
  }
}