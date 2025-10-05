import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return relevant environment variables for direct contract interaction
    const envInfo = {
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || 'not set',
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'not set',

      // Contract addresses
      NEXT_PUBLIC_EVENT_FACTORY_ADDRESS: process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS || 'not set',
      NEXT_PUBLIC_EVENT_TICKET_ADDRESS: process.env.NEXT_PUBLIC_EVENT_TICKET_ADDRESS || 'not set',
      NEXT_PUBLIC_POAP_ADDRESS: process.env.NEXT_PUBLIC_POAP_ADDRESS || 'not set',
      NEXT_PUBLIC_INCENTIVE_ADDRESS: process.env.NEXT_PUBLIC_INCENTIVE_ADDRESS || 'not set',
      NEXT_PUBLIC_MARKETPLACE_ADDRESS: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || 'not set',

      // Wallet integration
      HAS_RAINBOWKIT_PROJECT_ID: !!process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID,

      // IPFS/Pinata (optional)
      HAS_PINATA_JWT: !!process.env.NEXT_PUBLIC_PINATA_JWT,
    };

    return NextResponse.json(envInfo);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}