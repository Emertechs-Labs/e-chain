#!/usr/bin/env node

/**
 * Dynamic Data System Verification Script
 * 
 * Tests all implemented APIs and database functionality
 * Run: node scripts/verify-dynamic-data.js
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Color output
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

async function testEndpoint(name, url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    http.get(`${BASE_URL}${url}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const success = res.statusCode === 200;
        
        if (success) {
          try {
            const json = JSON.parse(data);
            log(`✅ ${name}`, 'green');
            log(`   Status: ${res.statusCode}`, 'cyan');
            log(`   Duration: ${duration}ms`, 'cyan');
            log(`   Success: ${json.success}`, 'cyan');
            if (json.data) {
              if (Array.isArray(json.data)) {
                log(`   Records: ${json.data.length}`, 'cyan');
              }
            }
            resolve({ success: true, name, duration, data: json });
          } catch (e) {
            log(`⚠️  ${name} - JSON parse error`, 'yellow');
            resolve({ success: false, name, error: e.message });
          }
        } else {
          log(`❌ ${name}`, 'red');
          log(`   Status: ${res.statusCode}`, 'red');
          resolve({ success: false, name, status: res.statusCode });
        }
      });
    }).on('error', (err) => {
      log(`❌ ${name} - ${err.message}`, 'red');
      resolve({ success: false, name, error: err.message });
    });
  });
}

async function runTests() {
  log('\n=================================', 'blue');
  log('Dynamic Data System Verification', 'blue');
  log('=================================\n', 'blue');
  
  log(`Testing against: ${BASE_URL}\n`, 'cyan');
  
  const tests = [
    { name: 'Pricing API - Get All Tiers', url: '/api/pricing' },
    { name: 'Statistics API - Platform Metrics', url: '/api/statistics' },
    { name: 'FAQ API - All FAQs', url: '/api/faq' },
    { name: 'FAQ API - Category Filter', url: '/api/faq?category=General' },
    { name: 'FAQ API - Search', url: '/api/faq?search=wallet' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    results.push(result);
    console.log('');
  }
  
  // Summary
  log('=================================', 'blue');
  log('Test Summary', 'blue');
  log('=================================\n', 'blue');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`Total Tests: ${results.length}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'cyan');
  
  const avgDuration = results
    .filter(r => r.duration)
    .reduce((sum, r) => sum + r.duration, 0) / passed;
  
  if (avgDuration) {
    log(`\nAverage Response Time: ${avgDuration.toFixed(0)}ms`, 'cyan');
  }
  
  // Detailed Results
  if (failed === 0) {
    log('\n✅ All tests passed! System is working correctly.\n', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.\n', 'yellow');
  }
  
  // Specific Data Checks
  log('=================================', 'blue');
  log('Data Validation', 'blue');
  log('=================================\n', 'blue');
  
  const pricingResult = results.find(r => r.name.includes('Pricing API'));
  if (pricingResult && pricingResult.data) {
    const tiers = pricingResult.data.data;
    if (tiers && tiers.length >= 4) {
      log(`✅ Pricing tiers: ${tiers.length} tiers found`, 'green');
      tiers.forEach(tier => {
        log(`   - ${tier.name}: $${tier.priceMonthly}/month`, 'cyan');
      });
    } else {
      log(`⚠️  Pricing tiers: Expected 4+, found ${tiers?.length || 0}`, 'yellow');
    }
  }
  
  const faqResult = results.find(r => r.name === 'FAQ API - All FAQs');
  if (faqResult && faqResult.data) {
    const faqs = faqResult.data.data;
    if (faqs && faqs.length >= 5) {
      log(`\n✅ FAQs: ${faqs.length} FAQs found`, 'green');
      const categories = faqResult.data.meta?.categories || [];
      log(`   Categories: ${categories.join(', ')}`, 'cyan');
    } else {
      log(`\n⚠️  FAQs: Expected 5+, found ${faqs?.length || 0}`, 'yellow');
    }
  }
  
  const statsResult = results.find(r => r.name.includes('Statistics'));
  if (statsResult && statsResult.data) {
    const stats = statsResult.data.data;
    if (stats) {
      log(`\n✅ Platform Statistics:`, 'green');
      log(`   Total Events: ${stats.totalEvents || 0}`, 'cyan');
      log(`   Active Events: ${stats.activeEvents || 0}`, 'cyan');
      log(`   RPC Provider: ${stats.rpcProvider || 'N/A'}`, 'cyan');
      log(`   Cache Status: ${stats.cached ? 'HIT' : 'MISS'}`, 'cyan');
    }
  }
  
  log('\n=================================', 'blue');
  log('Verification Complete', 'blue');
  log('=================================\n', 'blue');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  log(`\nFatal error: ${err.message}`, 'red');
  process.exit(1);
});
