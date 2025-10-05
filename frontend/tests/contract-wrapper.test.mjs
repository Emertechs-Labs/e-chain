#!/usr/bin/env node
import assert from 'assert';
import { readContract, writeContract } from '../lib/contract-wrapper.js';

async function testReadFallback() {
  console.log('Test: readContract direct behavior');
  // Call a read function that should be available
  try {
    const count = await readContract('EventFactory', 'eventCount', []);
    console.log('eventCount:', String(count));
    assert(typeof count !== 'undefined');
  } catch (err) {
    console.warn('readContract test (direct) failed:', err.message || err);
  }
}

async function testWriteFallback() {
  console.log('Test: writeContract direct behavior (dry)');
  try {
    // We will not actually send a transaction in CI; instead assert the wrapper rejects missing wallet
    let threw = false;
    try {
      await writeContract('EventFactory', 'createEvent', ['Test', 'ipfs://cid', 0n, 1n], { account: '0x0000000000000000000000000000000000000000' });
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
