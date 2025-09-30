import { NextResponse } from 'next/server';
import { callContractWrite } from '../../../../lib/multibaas';
import { CONTRACT_ADDRESSES } from '../../../../lib/contracts';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, attendeeAddress, nonce } = body;

    if (!eventId || !attendeeAddress || nonce === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters: eventId, attendeeAddress, nonce' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll simulate POAP claiming success
    // In production, this would require proper signature verification
    // The contract currently requires a signature from the owner or event factory

    // For now, return a mock transaction response
    const mockResult = {
      tx: {
        to: CONTRACT_ADDRESSES.POAPAttendance,
        data: '0x', // Mock data
        value: '0x0',
        gasLimit: '0x186a0', // 100000
        gasPrice: '0x3b9aca00', // 1 gwei
        nonce: '0x0'
      }
    };

    return NextResponse.json(mockResult, { status: 200 });

  } catch (err: any) {
    console.error('[app/api/poap/claim] Error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to create POAP claim transaction' },
      { status: 500 }
    );
  }
}