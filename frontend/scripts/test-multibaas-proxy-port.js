#!/usr/bin/env node
// Test script to POST to the local MultiBaas proxy on port 3001
const url = 'http://localhost:3000/api/multibaas/unsigned';

const payload = {
  address: 'eventfactory',
  contractLabel: 'eventfactory',
  method: 'createEvent',
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
