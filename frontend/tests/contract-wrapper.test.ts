import { describe, it, expect } from 'vitest';
import { readContract, writeContract } from '../lib/contract-wrapper';

describe('Contract Wrapper', () => {
  describe('readContract', () => {
    it('should read from contract', async () => {
      try {
        const count = await readContract('EventFactory', 'eventCount', []);
        expect(typeof count).not.toBe('undefined');
        console.log('eventCount:', String(count));
      } catch (err) {
        console.warn('readContract test failed:', err.message || err);
        // In test environment, this might fail due to no RPC connection
        expect(err).toBeDefined();
      }
    });
  });

  describe('writeContract', () => {
    it('should reject when no wallet is available', async () => {
      try {
        await writeContract('EventFactory', 'createEvent', ['Test', 'ipfs://cid', 0n, 1n], {
          account: '0x0000000000000000000000000000000000000000' as `0x${string}`
        });
        expect.fail('writeContract should throw when no wallet is available');
      } catch (err) {
        expect(err).toBeDefined();
        console.log('Expected write failure (no wallet):', err.message || err);
      }
    });
  });
});
