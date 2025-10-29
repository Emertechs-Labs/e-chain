// Health Check API Route
import { NextRequest, NextResponse } from 'next/server';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const healthResult = {
      status: 'healthy' as HealthStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local',
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
      checks: {
        environment: await checkEnvironment(),
        rpcProvider: await checkRPCProvider(),
        contracts: await checkContracts(),
      },
    };

    // Determine overall status
    const checkStatuses = Object.values(healthResult.checks).map(c => c.status);
    if (checkStatuses.includes('unhealthy')) {
      healthResult.status = 'unhealthy';
    } else if (checkStatuses.includes('degraded')) {
      healthResult.status = 'degraded';
    }

    const statusCode = healthResult.status === 'healthy' ? 200 : 503;

    return NextResponse.json(healthResult, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}

async function checkEnvironment() {
  const startTime = Date.now();
  const requiredEnvVars = [
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_EVENT_FACTORY_ADDRESS',
  ];

  const missing = requiredEnvVars.filter(v => !process.env[v]);

  return {
    status: missing.length === 0 ? 'healthy' as HealthStatus : 'unhealthy' as HealthStatus,
    message: missing.length === 0 
      ? 'All required environment variables present' 
      : `Missing: ${missing.join(', ')}`,
    responseTime: Date.now() - startTime,
    lastChecked: new Date().toISOString(),
  };
}

async function checkRPCProvider() {
  const startTime = Date.now();
  
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return {
        status: 'healthy' as HealthStatus,
        message: 'RPC provider accessible',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } else {
      return {
        status: 'degraded' as HealthStatus,
        message: `RPC returned ${response.status}`,
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy' as HealthStatus,
      message: error instanceof Error ? error.message : 'RPC check failed',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  }
}

async function checkContracts() {
  const startTime = Date.now();
  
  try {
    const factoryAddress = process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS;
    
    if (!factoryAddress) {
      return {
        status: 'unhealthy' as HealthStatus,
        message: 'Contract address not configured',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(factoryAddress)) {
      return {
        status: 'unhealthy' as HealthStatus,
        message: 'Invalid contract address format',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'healthy' as HealthStatus,
      message: 'Contract configuration valid',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy' as HealthStatus,
      message: error instanceof Error ? error.message : 'Contract check failed',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
    };
  }
}
