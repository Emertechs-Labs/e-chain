#!/usr/bin/env node
// List contracts registered in the MultiBaas deployment

const base = 'https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com/api/v0';
const apiKey = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY || process.env.MULTIBAAS_API_KEY;

if (!apiKey) {
  console.error('MultiBaas API key not set in environment (NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY or MULTIBAAS_API_KEY)');
  process.exit(1);
}

(async () => {
  try {
    const res = await fetch(`${base}/contracts`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('HTTP', res.status);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('HTTP', res.status, 'response:', text);
    }
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
