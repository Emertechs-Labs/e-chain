import { NextResponse } from 'next/server';
import { getUnsignedTransaction, getUnsignedTransactionForChain } from '../../../../lib/multibaas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizerAddress } = body || {};

    if (!organizerAddress || typeof organizerAddress !== 'string' || !organizerAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'Valid organizer address required' }, { status: 400 });
    }

    // Prepare payload for server-side unsigned tx creation
    const payload = {
      // Using contract address directly for more reliable operation
      address: '0xA97cB40548905B05A67fCD4765438aFBEA4030fc', // EventFactory contract address
      contractLabel: 'eventfactory',
      method: 'selfVerifyOrganizer', // Updated to use the public verification method
      blockchain: 'base-sepolia', // Updated to use 'base-sepolia' instead of 'eip155-84532'
      args: [organizerAddress],
      from: organizerAddress, // The organizer verifies themselves
      value: '2000000000000000', // 0.002 ETH for verification fee
      autoStart: false,
      traceId: `verify-organizer-${Date.now()}`
    };

    try {
      // Get the unsigned transaction for self-verification using the blockchain parameter
      const result = await getUnsignedTransactionForChain(
        payload.blockchain,
        payload.address,
        payload.contractLabel,
        payload.method,
        payload.args,
        payload.from,
        payload.value
      );
      
      return NextResponse.json({
        message: 'Organizer self-verification transaction prepared',
        txData: result,
        fee: '0.002 ETH',
        note: 'This transaction can be signed by the organizer directly'
      }, { status: 200 });
    } catch (error: any) {
      console.error('[app/api/multibaas/verify-organizer] Failed to get unsigned transaction:', error);
      return NextResponse.json({
        message: 'Failed to prepare verification transaction',
        error: error.message,
        payload
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error('[app/api/multibaas/verify-organizer] Error:', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}