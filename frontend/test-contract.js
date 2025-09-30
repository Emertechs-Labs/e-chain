import { readContract } from 'wagmi/actions';
import { config } from '../lib/wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../lib/contracts';

async function testContract() {
  try {
    console.log('Testing contract calls...');

    const eventCount = await readContract(config, {
      address: CONTRACT_ADDRESSES.EventFactory,
      abi: CONTRACT_ABIS.EventFactory,
      functionName: 'eventCount',
      args: []
    });

    console.log('Event count:', Number(eventCount));

    if (Number(eventCount) > 0) {
      const eventData = await readContract(config, {
        address: CONTRACT_ADDRESSES.EventFactory,
        abi: CONTRACT_ABIS.EventFactory,
        functionName: 'getEventDetails',
        args: [BigInt(1)]
      });

      console.log('Event data:', eventData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testContract();