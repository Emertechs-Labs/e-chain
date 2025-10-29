import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../../lib/contract-wrapper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const contract = searchParams.get('contract');

    if (!address || !contract) {
      return NextResponse.json({
        error: 'Missing required parameters: address and contract'
      }, { status: 400 });
    }

    console.log(`[debug-ticket-balance] Checking balance for ${address} in contract ${contract}`);

    // Check balance
    const balance = await readContract(contract as `0x${string}`, 'balanceOf', [address]);
    console.log(`[debug-ticket-balance] Balance result:`, balance);

    // If balance > 0, get token IDs
    const tokenIds = [];
    if (Number(balance) > 0) {
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await readContract(contract as `0x${string}`, 'tokenOfOwnerByIndex', [address, i]);
          tokenIds.push(Number(tokenId));

          // Check if ticket is valid
          const isValid = await readContract(contract as `0x${string}`, 'isValidTicket', [tokenId]);
          console.log(`[debug-ticket-balance] Token ${tokenId} valid:`, isValid);
        } catch (error) {
          console.error(`[debug-ticket-balance] Error getting token ${i}:`, error);
        }
      }
    }

    return NextResponse.json({
      address,
      contract,
      balance: Number(balance),
      tokenIds,
      success: true
    });
  } catch (error: any) {
    console.error('[debug-ticket-balance] Error:', error);
    return NextResponse.json({
      error: error?.message || 'Unknown error',
      success: false
    }, { status: 500 });
  }
}