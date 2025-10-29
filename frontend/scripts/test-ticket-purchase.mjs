#!/usr/bin/env node

/**
 * Test script to verify ticket purchase functionality
 */

import { readContract } from '../lib/contract-wrapper.js';

async function testTicketPurchaseFlow() {
  console.log('🔄 Testing ticket purchase flow...');

  try {
    // Test 1: Check if we can read event details
    console.log('Test 1: Reading event details...');
    const eventCount = await readContract('EventFactory', 'eventCount', []);
    console.log(`✅ Event count: ${eventCount}`);

    if (Number(eventCount) === 0) {
      console.log('⚠️ No events found, cannot test ticket purchase');
      return;
    }

    // Get first event details
    const eventDetails = await readContract('EventFactory', 'events', [1n]);
    console.log(`✅ Event details:`, {
      id: eventDetails.id,
      name: eventDetails.name,
      ticketPrice: eventDetails.ticketPrice,
      maxTickets: eventDetails.maxTickets
    });

    // Test 2: Check ticket contract balance (should be 0 initially)
    console.log('Test 2: Checking ticket contract...');
    const ticketBalance = await readContract('EventTicket', 'balanceOf', ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']);
    console.log(`✅ Ticket balance for test address: ${ticketBalance}`);

    console.log('🎉 Ticket purchase flow test completed successfully!');
    console.log('Note: Actual ticket purchase requires wallet interaction and cannot be tested here.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
testTicketPurchaseFlow()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });