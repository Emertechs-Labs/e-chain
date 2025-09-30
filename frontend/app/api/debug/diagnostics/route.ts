import { NextResponse } from 'next/server';

// Chain ID mapping for diagnostics
const CHAIN_ID_TO_LABEL: Record<string, string> = {
  '84532': 'base-sepolia', // Correct mapping for Base Sepolia
};

export async function GET() {
  try {
    // Build environment diagnostic data
    const multibaasDeploymentUrl = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
    
    // Check if the URL is properly formatted with API path
    let formattedUrl = multibaasDeploymentUrl;
    if (multibaasDeploymentUrl) {
      formattedUrl = multibaasDeploymentUrl.includes('/api/') 
        ? multibaasDeploymentUrl 
        : multibaasDeploymentUrl.replace(/\/$/, '') + '/api/v0';
    }
    
    // Derive chain name using same logic as the library
    const chainName = (() => {
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
    })();

    // Diagnostics data
    const diagnostics = {
      environment: process.env.NODE_ENV || 'unknown',
      multibaas: {
        url: {
          raw: multibaasDeploymentUrl || 'not set',
          formatted: formattedUrl || 'not set',
        },
        chain: {
          explicitChain: process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN || 'not set',
          numericChainId: process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID || 'not set',
          derivedName: chainName,
        },
        apiKeyPresent: !!process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
      },
      contracts: {
        eventFactory: process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS || 'not set',
        eventTicket: process.env.NEXT_PUBLIC_EVENT_TICKET_ADDRESS || 'not set',
        poap: process.env.NEXT_PUBLIC_POAP_ADDRESS || 'not set',
        incentive: process.env.NEXT_PUBLIC_INCENTIVE_ADDRESS || 'not set',
        marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || 'not set',
      },
      aliases: {
        eventFactory: 'eventfactory',  // Show expected aliases
        eventTicket: 'eventticket',
        poap: 'poapattendance',
        incentive: 'incentivemanager',
        marketplace: 'marketplace',
      }
    };
    
    return NextResponse.json(diagnostics);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}