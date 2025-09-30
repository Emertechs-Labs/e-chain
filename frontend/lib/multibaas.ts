import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

// Read environment but avoid throwing during module import. Validate at runtime.
const envVars = {
  MULTIBAAS_API_KEY: process.env.MULTIBAAS_API_KEY,
  NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
  NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
  NEXT_PUBLIC_MULTIBAAS_CHAIN: process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN,
  NEXT_PUBLIC_MULTIBAAS_CHAIN_ID: process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID,
};

if (!envVars.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL || (!envVars.MULTIBAAS_API_KEY && !envVars.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY)) {
  console.warn('[multibaas] Some MultiBaas environment variables are missing. Set MULTIBAAS_API_KEY and NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL to enable server-side calls.');
}

const CHAIN_ID_TO_LABEL: Record<string, string> = {
  '84532': 'ethereum',
};

const explicitChain = envVars.NEXT_PUBLIC_MULTIBAAS_CHAIN;
const numericChainId = envVars.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID;
export const CHAIN_NAME = (() => {
  if (explicitChain) {
    if (/^\d+$/.test(explicitChain)) {
      return CHAIN_ID_TO_LABEL[explicitChain] || explicitChain;
    }
    return explicitChain;
  }

  if (numericChainId) {
    return CHAIN_ID_TO_LABEL[numericChainId] || numericChainId;
  }

  return 'base-sepolia';
})();

const normalizeBasePath = (raw?: string) => {
  if (!raw) return undefined;
  if (raw.includes('/api/')) return raw.replace(/\/$/, '');
  return raw.replace(/\/$/, '') + '/api/v0';
};

const getAccessToken = () => envVars.MULTIBAAS_API_KEY || envVars.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;

const createContractsApi = () => {
  const basePath = normalizeBasePath(envVars.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL);
  const accessToken = getAccessToken();

  if (!basePath) throw new Error('[multibaas] MULTIBAAS deployment URL is not configured.');
  if (!accessToken) throw new Error('[multibaas] MULTIBAAS API key is not configured.');

  const cfg = new Configuration({ basePath, accessToken });
  return new ContractsApi(cfg);
};

export const callContractRead = async (address: string, contractLabel: string, method: string, args: any[] = []) => {
  const api = createContractsApi();
  const response = await api.callContractFunction(CHAIN_NAME as any, address, contractLabel, method, { args });
  const result = response.data.result;
  if (result.kind === 'MethodCallResponse') return result.output;
  throw new Error(`Unexpected response type for read call: ${result.kind}`);
};

export const callContractWrite = async (address: string, contractLabel: string, method: string, args: any[] = [], from: string, value?: string) => {
  const api = createContractsApi();
  const response = await api.callContractFunction(CHAIN_NAME as any, address, contractLabel, method, { args, from, ...(value && { value }) });
  const result = response.data.result;
  if (result.kind === 'TransactionToSignResponse') return result;
  throw new Error(`Unexpected response type for write call: ${result.kind}`);
};

export const getUnsignedTransaction = async (address: string, contractLabel: string, method: string, args: any[] = [], from: string, value?: string) => {
  const api = createContractsApi();
  const response = await api.callContractFunction(CHAIN_NAME as any, address, contractLabel, method, { args, from, ...(value && { value }) });
  const result = response.data.result;
  if (result.kind === 'TransactionToSignResponse') return result;
  throw new Error(`Unexpected response type for unsigned transaction: ${result.kind}`);
};

export const getUnsignedTransactionForChain = async (chain: string, address: string, contractLabel: string, method: string, args: any[] = [], from: string, value?: string) => {
  const normalizeChainLabel = (input?: string) => {
    if (!input) return CHAIN_NAME;
    const s = String(input).trim();
    const m = s.match(/^eip155[:\-]?(\d+)$/i);
    if (m) return CHAIN_ID_TO_LABEL[m[1]] || CHAIN_NAME;
    if (/^\d+$/.test(s)) return CHAIN_ID_TO_LABEL[s] || CHAIN_NAME;
    return s;
  };

  const resolvedChain = normalizeChainLabel(chain);
  const api = createContractsApi();
  const response = await api.callContractFunction(resolvedChain as any, address, contractLabel, method, { args, from, ...(value && { value }) });
  const result = response.data.result;
  if (result.kind === 'TransactionToSignResponse') return result;
  throw new Error(`Unexpected response type for unsigned transaction: ${result.kind}`);
};