#!/usr/bin/env node
// Direct test script that calls MultiBaas Contracts API to get an unsigned transaction
// Usage: node scripts/direct-multibaas-call.js

import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

const basePath = 'https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com/api/v0';
const accessToken = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;

if (!accessToken) {
  console.error('NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY environment variable not set');
  process.exit(1);
}

const cfg = new Configuration({ basePath, accessToken });
const api = new ContractsApi(cfg);

(async () => {
  try {
    const chain = 'eip155-84532';
    const address = 'eventfactory1';
    const contractLabel = 'eventfactory1';
    const method = 'createEvent';
    const args = [];
    const from = '0x0000000000000000000000000000000000000000';

    console.log('Requesting unsigned tx from MultiBaas...');
    const resp = await api.callContractFunction(chain, address, contractLabel, method, { args, from });
    console.log('HTTP', resp.status);
    console.log(JSON.stringify(resp.data, null, 2));
  } catch (err) {
    console.error('MultiBaas call failed:', err?.response?.status, err?.response?.data || err.message);
    process.exit(1);
  }
})();
