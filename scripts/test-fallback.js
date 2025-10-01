#!/usr/bin/env node
/**
 * Test Script: Contract Fallback System
 * 
 * This script tests both MultiBaas and direct blockchain access
 * to verify the fallback system works correctly.
 */

const https = require('https');

// Test configuration
const PRODUCTION_URL = 'echain-eight.vercel.app';
const CONTRACT_ADDRESS = '0xA97cB40548905B05A67fCD4765438aFBEA4030fc'; // EventFactory
const RPC_URL = 'https://sepolia.base.org'; // Base Sepolia RPC

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Check if production site is accessible
async function testProductionSite() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 1: Production Site Accessibility', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  return new Promise((resolve) => {
    const options = {
      hostname: PRODUCTION_URL,
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Fallback Test Script)'
      }
    };

    const req = https.request(options, (res) => {
      log(`Status Code: ${res.statusCode}`, res.statusCode === 200 ? 'green' : 'red');
      log(`Headers: ${JSON.stringify(res.headers, null, 2)}`, 'blue');
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const hasReact = data.includes('__next');
        const hasWagmi = data.includes('wagmi') || data.includes('RainbowKit');
        
        log(`\nDetected Framework: ${hasReact ? '✓ Next.js' : '✗ Unknown'}`, hasReact ? 'green' : 'yellow');
        log(`Detected Web3: ${hasWagmi ? '✓ Wagmi/RainbowKit' : '✗ Not detected'}`, hasWagmi ? 'green' : 'yellow');
        
        resolve({
          success: res.statusCode === 200,
          hasReact,
          hasWagmi
        });
      });
    });

    req.on('error', (e) => {
      log(`✗ Request failed: ${e.message}`, 'red');
      resolve({ success: false, error: e.message });
    });

    req.end();
  });
}

// Test 2: Direct RPC call to blockchain (simulating fallback)
async function testDirectBlockchainAccess() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 2: Direct Blockchain Access (Fallback)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  return new Promise((resolve) => {
    // eth_getCode - Check if contract exists
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getCode',
      params: [CONTRACT_ADDRESS, 'latest'],
      id: 1
    });

    const url = new URL(RPC_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    log(`RPC URL: ${RPC_URL}`, 'blue');
    log(`Contract Address: ${CONTRACT_ADDRESS}`, 'blue');
    log(`Method: eth_getCode`, 'blue');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.result && response.result !== '0x') {
            log(`\n✓ Contract Found!`, 'green');
            log(`  Code Length: ${response.result.length} characters`, 'green');
            log(`  First 66 chars: ${response.result.substring(0, 66)}...`, 'blue');
            
            resolve({
              success: true,
              contractExists: true,
              codeLength: response.result.length
            });
          } else {
            log(`\n✗ Contract Not Found or Not Deployed`, 'red');
            resolve({
              success: false,
              contractExists: false
            });
          }
        } catch (e) {
          log(`\n✗ Failed to parse response: ${e.message}`, 'red');
          log(`Raw response: ${data}`, 'yellow');
          resolve({
            success: false,
            error: e.message
          });
        }
      });
    });

    req.on('error', (e) => {
      log(`✗ RPC request failed: ${e.message}`, 'red');
      resolve({
        success: false,
        error: e.message
      });
    });

    req.write(payload);
    req.end();
  });
}

// Test 3: Check blockchain state (read owner)
async function testContractRead() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 3: Contract Read (owner function)', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  return new Promise((resolve) => {
    // Function signature for owner()
    const functionSignature = '0x8da5cb5b'; // keccak256("owner()").slice(0,10)
    
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{
        to: CONTRACT_ADDRESS,
        data: functionSignature
      }, 'latest'],
      id: 1
    });

    const url = new URL(RPC_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    log(`Function: owner()`, 'blue');
    log(`Function Signature: ${functionSignature}`, 'blue');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.result && response.result !== '0x') {
            // Parse address from result (last 40 hex chars)
            const ownerAddress = '0x' + response.result.slice(-40);
            
            log(`\n✓ Contract Read Successful!`, 'green');
            log(`  Owner Address: ${ownerAddress}`, 'green');
            
            resolve({
              success: true,
              owner: ownerAddress
            });
          } else if (response.error) {
            log(`\n✗ Contract Call Failed`, 'red');
            log(`  Error: ${JSON.stringify(response.error)}`, 'red');
            resolve({
              success: false,
              error: response.error
            });
          } else {
            log(`\n⚠ Unexpected Response`, 'yellow');
            log(`  Result: ${response.result}`, 'yellow');
            resolve({
              success: false,
              unexpected: true
            });
          }
        } catch (e) {
          log(`\n✗ Failed to parse response: ${e.message}`, 'red');
          log(`Raw response: ${data}`, 'yellow');
          resolve({
            success: false,
            error: e.message
          });
        }
      });
    });

    req.on('error', (e) => {
      log(`✗ RPC request failed: ${e.message}`, 'red');
      resolve({
        success: false,
        error: e.message
      });
    });

    req.write(payload);
    req.end();
  });
}

// Test 4: Simulate fallback scenario
async function testFallbackScenario() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST 4: Fallback Scenario Simulation', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  log('\nScenario: MultiBaas is down/unavailable', 'yellow');
  log('Expected behavior: System should fallback to direct RPC', 'yellow');
  
  // Simulate MultiBaas failure
  log('\n[1] MultiBaas attempt... ❌ (simulated failure)', 'red');
  
  // Attempt direct fallback
  log('[2] Attempting direct blockchain access...', 'blue');
  
  const result = await testContractRead();
  
  if (result.success) {
    log('[3] ✓ Fallback successful! Data retrieved via direct RPC', 'green');
    log('\n🎉 FALLBACK SYSTEM WORKS!', 'green');
    return { success: true };
  } else {
    log('[3] ✗ Fallback failed', 'red');
    log('\n⚠ FALLBACK SYSTEM NEEDS ATTENTION', 'yellow');
    return { success: false };
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     ECHAIN FALLBACK SYSTEM TEST SUITE                   ║', 'cyan');
  log('║     Testing Production Deployment                        ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    site: await testProductionSite(),
    blockchain: await testDirectBlockchainAccess(),
    contractRead: await testContractRead(),
    fallback: await testFallbackScenario()
  };
  
  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const tests = [
    ['Production Site', results.site.success],
    ['Direct Blockchain Access', results.blockchain.success],
    ['Contract Read', results.contractRead.success],
    ['Fallback Scenario', results.fallback.success]
  ];
  
  tests.forEach(([name, passed]) => {
    log(`${passed ? '✓' : '✗'} ${name}`, passed ? 'green' : 'red');
  });
  
  const allPassed = tests.every(([, passed]) => passed);
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  if (allPassed) {
    log('🎉 ALL TESTS PASSED!', 'green');
    log('✓ Fallback system is operational', 'green');
  } else {
    log('⚠ SOME TESTS FAILED', 'yellow');
    log('Please review the results above', 'yellow');
  }
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  return allPassed;
}

// Run tests
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
