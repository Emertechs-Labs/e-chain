import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { address, contractLabel, method, args, from, value, traceId } = req.body || {};

    const baseUrl = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
    const apiKey = process.env.MULTIBAAS_API_KEY || process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;

    console.debug('[api/multibaas/unsigned] start', { traceId, address, contractLabel, method, args, from, hasApiKey: !!apiKey });

    if (!baseUrl || !apiKey) {
      console.error('[api/multibaas/unsigned] Missing MultiBaas server configuration', { baseUrl, hasApiKey: !!apiKey });
      return res.status(500).json({ error: 'Missing MultiBaas server configuration' });
    }

    const cleanedBase = baseUrl.replace(/\/+$/g, '');
    const url = `${cleanedBase}/chains/ethereum/addresses/${address}/contracts/${contractLabel}/methods/${method}`;

    const body = { args, from, ...(value && { value }) };

    console.debug('[api/multibaas/unsigned] proxying request to MultiBaas', { traceId, url, body });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    console.debug('[api/multibaas/unsigned] got response from MultiBaas', { traceId, status: response.status, data });

    return res.status(response.status).json(data);
  } catch (err: any) {
    console.error('[api/multibaas/unsigned] Server proxy to MultiBaas failed:', { error: err?.message ?? err, stack: err?.stack });
    return res.status(500).json({ error: err?.message ?? 'Unknown error' });
  }
}
