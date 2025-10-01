import { NextResponse } from 'next/server';
import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

// Helper function to create API client with different base paths for testing
const createApiClient = (basePath?: string) => {
  const accessToken = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;
  const defaultBasePath = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
  
  // Apply standardization to basePath
  const normalizeBasePath = (raw?: string) => {
    if (!raw) return undefined;
    if (raw.includes('/api/')) return raw.replace(/\/$/, '');
    return raw.replace(/\/$/, '') + '/api/v0';
  };
  
  const cfg = new Configuration({
    basePath: normalizeBasePath(basePath || defaultBasePath),
    accessToken
  });
  
  return {
    contractsApi: new ContractsApi(cfg)
  };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      chain = 'base-sepolia',
      address = 'eventfactory',
      contractLabel = 'eventfactory',
      method = 'createEvent',
      args = [
        "Test Event via debug",
        "ipfs://placeholder",
        "100000000000000000",
        "100",
        "1796068800",
        "1796072400"
      ],
      from = "0x5474bA789F5CbD31aea2BcA1939989746242680D"
    } = body;

    const client = createApiClient();
    
    try {
      // Get detailed debug info
      const debugInfo = {
        apiKeyPresent: !!process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
        apiUrl: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
        chainParam: chain,
        address,
        contractLabel,
        method,
        args,
        from,
      };

      // Try to call the contract
      const response = await client.contractsApi.callContractFunction(
        chain as any,
        address,
        contractLabel,
        method,
        {
          args,
          from,
        }
      );

      return NextResponse.json({
        status: 'success',
        debugInfo,
        result: response.data
      });
    } catch (error: any) {
      // Get the full error details
      const errorDetails = {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        name: error?.name,
      };
      
      console.error('[debug-contract-call] API error:', {
        chain,
        error: errorDetails
      });
      
      return NextResponse.json({
        status: 'error',
        debugInfo: {
          apiKeyPresent: !!process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
          apiUrl: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
          chainParam: chain,
          address,
          contractLabel,
          method,
          args,
          from,
        },
        error: errorDetails
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}