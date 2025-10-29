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

    if (!contract) {
      return NextResponse.json({ error: 'Contract address required' }, { status: 400 });
    }

    // Validate contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(contract)) {
      return NextResponse.json({ error: 'Invalid contract address format' }, { status: 400 });
    }

    console.log(`[user-tickets API] Checking balance for ${address} on contract ${contract}`);

    // Call the balanceOf function on the specified contract with automatic fallback
    const balance = await readContract(
      contract as `0x${string}`,
      'balanceOf',
      [address]
    );

    console.log(`[user-tickets API] Balance result: ${Number(balance)}`);

    return NextResponse.json({
      hasTicket: Number(balance) > 0,
      balance: Number(balance),
      address,
      contract
    });
  } catch (error) {
    console.error('[user-tickets API] Error checking user tickets:', error);
    return NextResponse.json({ 
      error: 'Failed to check user tickets',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}