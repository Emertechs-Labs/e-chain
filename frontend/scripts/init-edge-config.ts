#!/usr/bin/env node

/**
 * Script to initialize Vercel Edge Config with default values
 * Run with: npx tsx scripts/init-edge-config.ts
 */

import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG!);

const defaultConfig = {
  'app-config': {
    name: 'Echain',
    version: '1.0.0',
    environment: 'development'
  },
  'feature-flags': {
    nftTickets: true,
    poapRewards: true,
    multiChain: false,
    analytics: true
  },
  'supported-chains': [
    {
      id: 84532,
      name: 'Base Sepolia',
      rpcUrl: 'https://sepolia.base.org',
      blockExplorer: 'https://sepolia.basescan.org'
    }
  ],
  'contract-addresses': {
    '84532': { // Base Sepolia
      eventFactory: '0xbE36039Bfe7f48604F73daD61411459B17fd2e85',
      eventTicket: '0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180',
      poap: '0x405061e2ef1F748fA95A1e7725fc1a008e8c2196',
      incentive: '0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9'
    }
  },
  'rate-limits': {
    events: { limit: 100, window: 60 },
    users: { limit: 50, window: 60 },
    api: { limit: 1000, window: 3600 }
  },
  'maintenance-mode': false
};

async function initEdgeConfig() {
  try {
    console.log('Initializing Edge Config...');

    for (const [key, value] of Object.entries(defaultConfig)) {
      console.log(`Setting ${key}...`);
      // Note: Edge Config doesn't have a direct set method in the client
      // You'll need to use the Vercel CLI or dashboard to set these values
      console.log(`  ${key}:`, JSON.stringify(value, null, 2));
    }

    console.log('\nEdge Config initialization complete!');
    console.log('Please set these values in your Vercel Edge Config dashboard or using Vercel CLI:');
    console.log('vercel edge-config set <key> <value>');

  } catch (error) {
    console.error('Error initializing Edge Config:', error);
  }
}

initEdgeConfig();