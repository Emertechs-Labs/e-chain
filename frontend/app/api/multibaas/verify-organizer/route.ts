import { NextResponse } from 'next/server';
import { getUnsignedTransaction } from '../../../../lib/multibaas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizerAddress } = body || {};

    if (!organizerAddress || typeof organizerAddress !== 'string' || !organizerAddress.startsWith('0x')) {
      return NextResponse.json({ error: 'Valid organizer address required' }, { status: 400 });
    }

    // Prepare payload for server-side unsigned tx creation
    const payload = {
      address: 'eventfactory',
      contractLabel: 'eventfactory',
      method: 'verifyOrganizer',
      blockchain: 'eip155-84532',
      args: [organizerAddress],
      from: process.env.OWNER_ADDRESS || '', // Contract owner address
      autoStart: false,
      traceId: `verify-organizer-${Date.now()}`
    };

    // This would need to be signed by the owner
    // For now, return the payload for manual processing
    return NextResponse.json({
      message: 'Organizer verification payload prepared',
      payload,
      note: 'This transaction must be signed by the contract owner'
    }, { status: 200 });

  } catch (err: any) {
    console.error('[app/api/multibaas/verify-organizer] Error:', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}