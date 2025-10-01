import { NextResponse } from 'next/server';
import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

/**
 * Debug endpoint for testing MultiBaas integration with production URLs
 * This route helps verify the MultiBaas connection and transaction generation
 * with the production deployment URL.
 */

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

// GET handler to make testing easier from the browser
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chain = url.searchParams.get('chain') || 'base-sepolia';
    const address = url.searchParams.get('address') || 'eventfactory';
    const contractLabel = url.searchParams.get('contractLabel') || 'eventfactory';
    const method = url.searchParams.get('method') || 'version'; // Default to safer read method
    const from = url.searchParams.get('from') || '0x0000000000000000000000000000000000000000';
    
    // Parse args if provided
    const argsParam = url.searchParams.get('args');
    let args: any[] = [];
    if (argsParam) {
      try {
        args = JSON.parse(argsParam);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid args JSON' }, { status: 400 });
      }
    }
    
    const client = createApiClient();
    
    // Add test instructions to response
    const testInstructions = `
    To test different methods:
    - Read contract version: /api/debug/unsigned-tx?method=version
    - Create event: /api/debug/unsigned-tx?method=createEvent&args=${encodeURIComponent(JSON.stringify([
      "Test Event via debug",
      "Test description",
      "ipfs://placeholder",
      "100000000000000000",
      "100",
      Date.now() + 86400000,
      Date.now() + (86400000 * 2)
    ]))}
    - Check if address is verified organizer: /api/debug/unsigned-tx?method=isVerifiedOrganizer&args=["0xYourAddress"]
    `;
    
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

      // Try to generate transaction
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
        result: response.data,
        testInstructions
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
      
      console.error('[debug-unsigned-tx] API error:', {
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
        error: errorDetails,
        testInstructions
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

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

      // Try to generate an unsigned transaction
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
      
      console.error('[debug-unsigned-tx] API error:', {
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