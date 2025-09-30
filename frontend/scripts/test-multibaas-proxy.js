#!/usr/bin/env node
// Simple test script to POST to the local MultiBaas proxy and print response
// Usage: node scripts/test-multibaas-proxy.js

const url = 'http://localhost:3000/api/multibaas/unsigned';

const payload = {
  address: 'EventFactory',
  contractLabel: 'EventFactory',
  method: 'createEvent',
  // Try the MultiBaas/EIP-155 chain label format which many deployments expect
  blockchain: 'eip155-84532',
  args: [],
  from: '0x0000000000000000000000000000000000000000',
  traceId: `test-${Date.now()}`,
};

(async () => {
  try {
    console.log('Posting to', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log('HTTP', res.status, res.statusText);
    try {
      const json = JSON.parse(text);
      console.log('Response JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response text:', text);
    }
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
