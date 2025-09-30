import fs from 'fs';
import path from 'path';
import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

// Load .env.local if present (simple parser)
const envFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  const txt = fs.readFileSync(envFile, 'utf8');
  txt.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2] || '';
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY || process.env.MULTIBAAS_API_KEY;

if (!DEPLOYMENT_URL || !ACCESS_TOKEN) {
  console.error('Missing MultiBaas config. Set NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL and NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY in .env.local or env.');
  process.exit(1);
}

const basePath = DEPLOYMENT_URL.includes('/api/') ? DEPLOYMENT_URL.replace(/\/$/, '') : DEPLOYMENT_URL.replace(/\/$/, '') + '/api/v0';

const cfg = new Configuration({ basePath, accessToken: ACCESS_TOKEN });
const api = new ContractsApi(cfg);

const alias = 'eventfactory1';
const contractLabel = 'eventfactory';
const chain = 'ethereum'; // maps to Base Sepolia in this deployment

(async () => {
  try {
    console.log('Calling owner() on', alias, 'contract', contractLabel, 'chain', chain);
    const resp = await api.callContractFunction(chain, alias, contractLabel, 'owner', { args: [] });
    const owner = resp.data.result.output;
    console.log('owner:', owner);

    console.log('Checking isVerifiedOrganizer for owner...');
    const resp2 = await api.callContractFunction(chain, alias, contractLabel, 'isVerifiedOrganizer', { args: [owner] });
    console.log('isVerifiedOrganizer result:', resp2.data.result.output);
  } catch (e) {
    console.error('MultiBaas call error:', e?.response?.data ?? e.message ?? e);
    process.exit(1);
  }
})();
