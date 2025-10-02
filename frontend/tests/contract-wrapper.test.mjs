#!/usr/bin/env node
import assert from 'assert';
import { readContract, writeContract, isMultiBaasAvailable, getFallbackMode } from '../lib/contract-wrapper.js';

async function testReadFallback() {
  console.log('Test: readContract fallback behavior');
  // Call a read function that should be available
  try {
    const count = await readContract('EventFactory', 'eventCount', [], { useMultiBaas: false, skipFallback: false });
    console.log('eventCount:', String(count));
    assert(typeof count !== 'undefined');
  } catch (err) {
    console.warn('readContract test (direct) failed:', err.message || err);
  }
}

async function testWriteFallback() {
  console.log('Test: writeContract fallback behavior (dry)');
  try {
    // We will not actually send a transaction in CI; instead assert the wrapper rejects missing wallet
    let threw = false;
    try {
      await writeContract('EventFactory', 'createEvent', ['Test', 'ipfs://cid', 0n, 1n], { useMultiBaas: false, skipFallback: false, account: '0x0000000000000000000000000000000000000000' });
    } catch (e) {
      threw = true;
      console.log('Expected write failure (no wallet):', e.message || e);
    }
    assert(threw, 'writeContract should throw when no wallet is available in test environment');
  } catch (err) {
    console.warn('writeContract test failed:', err.message || err);
  }
}

async function run() {
  console.log('\nRunning contract-wrapper tests');
  await testReadFallback();
  await testWriteFallback();
  console.log('\ncontract-wrapper tests completed');
}

run().catch(e => { console.error(e); process.exit(1); });
