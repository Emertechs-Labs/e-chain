import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return relevant environment variables (NOT sensitive ones)
    const envInfo = {
      NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL || 'not set',
      NEXT_PUBLIC_MULTIBAAS_CHAIN_ID: process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID || 'not set',
      NEXT_PUBLIC_MULTIBAAS_CHAIN: process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN || 'not set',
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'not set',
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'not set',
      
      // Contract addresses
      NEXT_PUBLIC_EVENT_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS || 'not set',
      
      // No sensitive data like API keys
      HAS_MULTIBAAS_API_KEY: !!process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
      
      // Chain name derivation logic (copied from multibaas.ts)
      DERIVED_CHAIN_NAME: derivedChainName(),
    };
    
    return NextResponse.json(envInfo);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Copy of the chain name derivation logic from multibaas.ts
function derivedChainName(): string {
  const CHAIN_ID_TO_LABEL: Record<string, string> = {
    '84532': 'base-sepolia', // Correct mapping for Base Sepolia
  };

  const explicitChain = process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN;
  const numericChainId = process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID;
  
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
}