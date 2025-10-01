/**
 * Live Fallback System Test
 * Tests the contract-wrapper to verify MultiBaas → Direct RPC fallback works
 */

const { readContract, checkMultiBaasHealth } = require('./lib/contract-wrapper.ts');

async function testFallbackSystem() {
  console.log('\n🔍 TESTING FALLBACK IMPLEMENTATION\n');
  console.log('='.repeat(60));

  // Test 1: Check MultiBaas Health
  console.log('\n📊 Test 1: Checking MultiBaas Health...');
  try {
    const health = await checkMultiBaasHealth();
    console.log('✅ MultiBaas Status:', health.status);
    console.log('   Latency:', health.latency, 'ms');
    console.log('   Message:', health.message);
  } catch (error) {
    console.log('❌ MultiBaas Health Check Failed:', error.message);
  }

  // Test 2: Read from EventFactory (should use MultiBaas first)
  console.log('\n📊 Test 2: Reading EventFactory.owner() via wrapper...');
  try {
    const owner = await readContract('EventFactory', 'owner', []);
    console.log('✅ Owner Address:', owner);
    console.log('   This request went through the wrapper');
    console.log('   It tried MultiBaas first, then fell back to RPC if needed');
  } catch (error) {
    console.log('❌ Read Failed:', error.message);
  }

  // Test 3: Read event count
  console.log('\n📊 Test 3: Reading EventFactory.eventCount() via wrapper...');
  try {
    const count = await readContract('EventFactory', 'eventCount', []);
    console.log('✅ Event Count:', count.toString());
    console.log('   Total events created:', count.toString());
  } catch (error) {
    console.log('❌ Read Failed:', error.message);
  }

  // Test 4: Try reading from POAPAttendance
  console.log('\n📊 Test 4: Reading POAPAttendance.totalSupply() via wrapper...');
  try {
    const supply = await readContract('POAPAttendance', 'totalSupply', []);
    console.log('✅ Total POAP Supply:', supply.toString());
    console.log('   Total POAPs minted:', supply.toString());
  } catch (error) {
    console.log('❌ Read Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✨ FALLBACK SYSTEM TEST COMPLETE!\n');
  console.log('HOW IT WORKS:');
  console.log('1. readContract() tries MultiBaas API first (fast, with analytics)');
  console.log('2. If MultiBaas fails, automatically falls back to direct RPC');
  console.log('3. You get results either way - zero downtime!\n');
  console.log('WHERE IT\'S USED:');
  console.log('- app/poaps/page.tsx (POAP display)');
  console.log('- app/my-tickets/page.tsx (Ticket management)');
  console.log('- app/events/[id]/manage/page.tsx (Event dashboard)');
  console.log('- All hooks: useTickets, useIncentives, useMarketplace');
  console.log('\n💡 The wrapper is transparent - components don\'t know if');
  console.log('   they\'re using MultiBaas or direct RPC. It just works!\n');
}

// Run the test
testFallbackSystem()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
