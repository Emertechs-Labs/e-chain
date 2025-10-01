#!/usr/bin/env node
/**
 * Production MultiBaas Integration Test Script
 * 
 * This script tests various aspects of your DApp integration with MultiBaas
 * in a production environment.
 * 
 * Usage:
 * 1. Set up your .env.local file with production MultiBaas credentials
 * 2. Run: node scripts/test-production-multibaas.js
 */

require('dotenv').config({ path: '.env.local' });
const { Configuration, ContractsApi } = require('@curvegrid/multibaas-sdk');

// Configuration
const MB_DEPLOYMENT_URL = process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL;
const MB_API_KEY = process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY;
const EVENT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS;
const CHAIN_ID = process.env.NEXT_PUBLIC_MULTIBAAS_CHAIN_ID || '84532';
const TEST_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with test wallet

// Chain mapping
const CHAIN_ID_TO_LABEL = {
  '84532': 'base-sepolia', // Base Sepolia testnet
};

// Helper: normalize MultiBaas URL
const normalizeBasePath = (raw) => {
  if (!raw) return undefined;
  if (raw.includes('/api/')) return raw.replace(/\/$/, '');
  return raw.replace(/\/$/, '') + '/api/v0';
};

// Validate environment
if (!MB_DEPLOYMENT_URL || !MB_API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL:', MB_DEPLOYMENT_URL ? '✅' : '❌');
  console.error('NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY:', MB_API_KEY ? '✅' : '❌');
  process.exit(1);
}

// Test functions
async function testDirectMultiBaasConnection() {
  console.log('\n🔄 Testing direct MultiBaas connection...');
  
  try {
    const basePath = normalizeBasePath(MB_DEPLOYMENT_URL);
    const cfg = new Configuration({ basePath, accessToken: MB_API_KEY });
    const api = new ContractsApi(cfg);
    
    console.log(`Connecting to ${basePath}...`);
    const chainResponse = await api.getChainStatus(CHAIN_ID_TO_LABEL[CHAIN_ID] || 'base-sepolia');
    
    console.log('✅ MultiBaas connection successful!');
    console.log(`Chain: ${chainResponse.data.result.label}`);
    console.log(`Chain ID: ${chainResponse.data.result.chainID}`);
    console.log(`Latest Block: ${chainResponse.data.result.blockNumber}`);
    
    return true;
  } catch (err) {
    console.error('❌ MultiBaas connection failed:', err.message);
    if (err.response?.data) {
      console.error('Response data:', err.response.data);
    }
    return false;
  }
}

async function testContractRead() {
  console.log('\n🔄 Testing contract read operation...');
  
  try {
    const basePath = normalizeBasePath(MB_DEPLOYMENT_URL);
    const cfg = new Configuration({ basePath, accessToken: MB_API_KEY });
    const api = new ContractsApi(cfg);
    const chain = CHAIN_ID_TO_LABEL[CHAIN_ID] || 'base-sepolia';
    
    console.log(`Reading EventFactory contract (${EVENT_FACTORY_ADDRESS || 'eventfactory'})...`);
    
    // Use either contract address or alias
    const addressOrAlias = EVENT_FACTORY_ADDRESS || 'eventfactory';
    const contractLabel = 'eventfactory';
    
    // Try to read contract version
    const versionResponse = await api.callContractFunction(chain, addressOrAlias, contractLabel, 'version', { args: [] });
    console.log('✅ Contract read successful!');
    console.log('Contract version:', versionResponse.data.result.output);
    
    return true;
  } catch (err) {
    console.error('❌ Contract read failed:', err.message);
    if (err.response?.data) {
      console.error('Response data:', err.response.data);
    }
    return false;
  }
}

async function testUnsignedTransaction() {
  console.log('\n🔄 Testing unsigned transaction generation...');
  
  try {
    const basePath = normalizeBasePath(MB_DEPLOYMENT_URL);
    const cfg = new Configuration({ basePath, accessToken: MB_API_KEY });
    const api = new ContractsApi(cfg);
    const chain = CHAIN_ID_TO_LABEL[CHAIN_ID] || 'base-sepolia';
    
    // Get unsigned transaction
    console.log('Generating unsigned transaction for EventFactory.createEvent...');
    
    // Test parameters for creating an event
    const params = {
      args: [
        "Test Event", // name
        "Test description", // description
        Date.now() + 86400000, // startTime (tomorrow)
        Date.now() + (86400000 * 2), // endTime (day after tomorrow)
        "Test location", // location
        "https://example.com/image.jpg", // imageUrl
        100, // maxAttendees
        "10000000000000000" // ticketPrice (0.01 ETH)
      ],
      from: TEST_WALLET_ADDRESS
    };
    
    const addressOrAlias = EVENT_FACTORY_ADDRESS || 'eventfactory';
    const contractLabel = 'eventfactory';
    
    const response = await api.callContractFunction(chain, addressOrAlias, contractLabel, 'createEvent', params);
    
    if (response.data.result.kind !== 'TransactionToSignResponse') {
      throw new Error(`Expected TransactionToSignResponse but got ${response.data.result.kind}`);
    }
    
    const tx = response.data.result.tx;
    console.log('✅ Unsigned transaction generated successfully!');
    console.log('Transaction details:');
    console.log(`  To: ${tx.to}`);
    console.log(`  Value: ${tx.value}`);
    console.log(`  Gas limit: ${tx.gas}`);
    console.log(`  Data length: ${tx.data.length} bytes`);
    
    return true;
  } catch (err) {
    console.error('❌ Unsigned transaction generation failed:', err.message);
    if (err.response?.data) {
      console.error('Response data:', err.response.data);
    }
    return false;
  }
}

async function testAPIProxy() {
  console.log('\n🔄 Testing MultiBaas API proxy...');
  
  try {
    // Test the local API proxy
    const url = 'http://localhost:3000/api/multibaas/unsigned';
    console.log(`Calling API proxy at ${url}...`);
    
    const payload = {
      address: 'eventfactory',
      contractLabel: 'eventfactory',
      method: 'version',
      args: [],
      from: TEST_WALLET_ADDRESS,
      traceId: `test-${Date.now()}`,
      blockchain: 'eip155-' + CHAIN_ID
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API proxy returned ${res.status}: ${errorText}`);
    }
    
    const result = await res.json();
    console.log('✅ API proxy call successful!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return true;
  } catch (err) {
    console.error('❌ API proxy call failed:', err.message);
    console.error('Make sure your Next.js development server is running on port 3000');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 TESTING MULTIBAAS PRODUCTION INTEGRATION 🧪');
  console.log('=============================================');
  console.log('Environment:');
  console.log(`MultiBaas URL: ${MB_DEPLOYMENT_URL}`);
  console.log(`Chain ID: ${CHAIN_ID} (${CHAIN_ID_TO_LABEL[CHAIN_ID] || 'unknown chain'})`);
  console.log(`EventFactory: ${EVENT_FACTORY_ADDRESS || 'Using alias "eventfactory"'}`);
  console.log('=============================================\n');

  try {
    // Step 1: Direct MultiBaas connection
    const connectResult = await testDirectMultiBaasConnection();
    
    // Step 2: Test contract read if connection successful
    let readResult = false;
    if (connectResult) {
      readResult = await testContractRead();
    }
    
    // Step 3: Test unsigned transaction generation
    let txResult = false;
    if (connectResult) {
      txResult = await testUnsignedTransaction();
    }
    
    // Step 4: Test API proxy - needs local server running
    let proxyResult = false;
    if (connectResult) {
      proxyResult = await testAPIProxy();
    }
    
    // Results summary
    console.log('\n🧪 TEST RESULTS SUMMARY 🧪');
    console.log('===========================');
    console.log(`MultiBaas Connection: ${connectResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Contract Read: ${readResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Unsigned Transaction: ${txResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`API Proxy: ${proxyResult ? '✅ PASS' : '❌ FAIL'}`);
    console.log('===========================');
    
    // Overall result
    if (connectResult && readResult && txResult) {
      console.log('✅ MultiBaas production integration is working correctly!');
      if (!proxyResult) {
        console.log('⚠️ API proxy test failed, but direct MultiBaas communication works');
        console.log('   Make sure your Next.js dev server is running before testing the proxy');
      }
    } else {
      console.log('❌ MultiBaas production integration has issues that need to be resolved');
    }
  } catch (error) {
    console.error('❌ An unexpected error occurred during testing:', error);
    process.exit(1);
  }
}

runTests();