import { NextResponse } from 'next/server';
import { callContractRead, CHAIN_NAME } from '../../../../lib/multibaas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, contractLabel = 'EventFactory', traceId } = body || {};

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Missing address in request body' }, { status: 400 });
    }

    console.debug('[app/api/multibaas/check-organizer] start', { traceId, address, contractLabel });

    try {
      // Map known aliases to contract labels (from MultiBaas deployment)
      const aliasToContract: Record<string, string> = {
        'eventfactory1': 'eventfactory',
        'eventticket1': 'eventticket',
        'incentivemanager1': 'incentivemanager',
        'poapattendance1': 'poapattendance',
      };
      const contract = aliasToContract[contractLabel] || contractLabel; // fallback if not mapped

      // Call the contract read method isVerifiedOrganizer(address)
      const result = await callContractRead(contractLabel, contract, 'isVerifiedOrganizer', [address]);
      console.debug('[app/api/multibaas/check-organizer] result', { traceId, result });
      return NextResponse.json({ verified: !!result }, { status: 200 });
    } catch (err: any) {
      console.error('[app/api/multibaas/check-organizer] upstream error', { traceId, message: err?.message, status: err?.response?.status, data: err?.response?.data });
      const status = err?.response?.status ?? 500;
      const data = err?.response?.data ?? { error: err?.message ?? 'MultiBaas error' };
      return NextResponse.json({ error: 'MultiBaas read error', status, body: data }, { status });
    }
  } catch (err: any) {
    console.error('[app/api/multibaas/check-organizer] Server error', { error: err?.message ?? err });
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
