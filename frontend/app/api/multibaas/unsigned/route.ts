import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, contractLabel, method, args, from, value, traceId } = body || {};

    const baseUrl = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
    const apiKey = process.env.MULTIBAAS_API_KEY || process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;

    console.debug('[app/api/multibaas/unsigned] start', { traceId, address, contractLabel, method, args, from, hasApiKey: !!apiKey });

    if (!baseUrl || !apiKey) {
      console.error('[app/api/multibaas/unsigned] Missing MultiBaas server configuration', { baseUrl, hasApiKey: !!apiKey });
      return NextResponse.json({ error: 'Missing MultiBaas server configuration' }, { status: 500 });
    }

    const cleanedBase = (baseUrl || '').replace(/\/+$/g, '');
    const url = `${cleanedBase}/chains/ethereum/addresses/${address}/contracts/${contractLabel}/methods/${method}`;

    const payload = { args, from, ...(value && { value }) };

    console.debug('[app/api/multibaas/unsigned] proxying request to MultiBaas', { traceId, url, payload });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    console.debug('[app/api/multibaas/unsigned] got response from MultiBaas', { traceId, status: response.status, data });

    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    console.error('[app/api/multibaas/unsigned] Server proxy to MultiBaas failed:', { error: err?.message ?? err, stack: err?.stack });
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
