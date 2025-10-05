#!/usr/bin/env node

/**
 * Simple test script to verify contract wrapper functionality
 */

import { readContract } from '../lib/contract-wrapper.js';

async function testContractWrapper() {
  console.log('🔄 Testing contract wrapper with debugging...');

  try {
    // Test eventCount first (this should exist)
    console.log('Testing eventCount...');
    const eventCount = await readContract('EventFactory', 'eventCount', []);
    console.log(`✅ eventCount: ${eventCount}`);

    // Test isVerifiedOrganizer
    console.log('Testing isVerifiedOrganizer...');
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Example address
    const isVerified = await readContract('EventFactory', 'isVerifiedOrganizer', [testAddress]);
    console.log(`✅ isVerifiedOrganizer(${testAddress}): ${isVerified}`);

    return { eventCount, isVerified };

  } catch (error) {
    console.error('❌ Contract call failed:', error.message);
    throw error;
  }
}

// Run the test
testContractWrapper()
  .then((result) => {
    console.log('\n🎉 Test completed successfully!');
    console.log('Result:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });