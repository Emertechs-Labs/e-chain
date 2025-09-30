import { NextResponse } from 'next/server';
import { Configuration, ContractsApi, MetricsApi } from '@curvegrid/multibaas-sdk';

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
    contractsApi: new ContractsApi(cfg),
    metricsApi: new MetricsApi(cfg)
  };
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chain = searchParams.get('chain');
    
    if (!chain) {
      return NextResponse.json({ error: 'Missing chain parameter' }, { status: 400 });
    }
    
    const client = createApiClient();
    
    try {
      // Try to get blockchain info with the provided chain parameter
      const response = await client.metricsApi.blockchainMetrics(chain as any);
      
      return NextResponse.json({
        chain,
        status: 'success',
        result: response.data
      });
    } catch (error: any) {
      console.error('[chain-test] API error:', {
        chain,
        status: error?.response?.status,
        message: error?.response?.data?.message || error?.message,
        data: error?.response?.data
      });
      
      return NextResponse.json({
        chain,
        status: 'error',
        error: error?.response?.data || error?.message || 'Unknown error',
        statusCode: error?.response?.status
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}