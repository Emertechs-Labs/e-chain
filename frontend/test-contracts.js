import { readContract, writeContract } from './lib/contract-wrapper';

async function testContractFunctions() {
  console.log('Testing contract functions...');
  
  try {
    // Test 1: Check if EventFactory.isVerifiedOrganizer exists
    console.log('Testing EventFactory.isVerifiedOrganizer...');
    const isVerified = await readContract('EventFactory', 'isVerifiedOrganizer', ['0x5474bA789F5CbD31aea2BcA1939989746242680D']);
    console.log('✅ EventFactory.isVerifiedOrganizer result:', isVerified);
    
    // Test 2: Check if EventFactory.getEventDetails exists
    console.log('Testing EventFactory.getEventDetails...');
    try {
      const eventDetails = await readContract('EventFactory', 'getEventDetails', [1]);
      console.log('✅ EventFactory.getEventDetails result:', eventDetails);
    } catch (e) {
      console.log('⚠️ EventFactory.getEventDetails failed (might not exist):', e.message);
    }
    
    // Test 3: Check if IncentiveManager.loyaltyPoints exists
    console.log('Testing IncentiveManager.loyaltyPoints...');
    try {
      const loyaltyPoints = await readContract('IncentiveManager', 'loyaltyPoints', ['0x5474bA789F5CbD31aea2BcA1939989746242680D']);
      console.log('✅ IncentiveManager.loyaltyPoints result:', loyaltyPoints);
    } catch (e) {
      console.log('⚠️ IncentiveManager.loyaltyPoints failed (might not exist):', e.message);
    }
    
    // Test 4: Check if IncentiveManager.referralRewards exists
    console.log('Testing IncentiveManager.referralRewards...');
    try {
      const referralRewards = await readContract('IncentiveManager', 'referralRewards', ['0x5474bA789F5CbD31aea2BcA1939989746242680D']);
      console.log('✅ IncentiveManager.referralRewards result:', referralRewards);
    } catch (e) {
      console.log('⚠️ IncentiveManager.referralRewards failed (might not exist):', e.message);
    }
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Contract test failed:', error);
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.testContractFunctions = testContractFunctions;
}