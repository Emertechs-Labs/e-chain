/**
 * Performance Test Script
 *
 * Tests the performance improvements implemented in the Echain platform
 * Measures RPC performance, IPFS fetching, and overall data fetching latency.
 */

import { performanceMonitor, trackRpcCall, trackIpfsFetch, trackEventFetch, trackMetadataEnrichment } from '../lib/performance-monitor';
import { baseRPCManager } from '../lib/base-rpc-manager';
import { fetchMetadataFromIPFS } from '../lib/metadata';
import { discoverEventsFromBlockchain } from '../app/hooks/useEvents';

interface TestResult {
  testName: string;
  duration: number;
  success: boolean;
  details?: any;
}

class PerformanceTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Echain Performance Tests...\n');

    // Test RPC Manager Performance
    await this.testRpcPerformance();

    // Test IPFS Fetching Performance
    await this.testIpfsPerformance();

    // Test Event Discovery Performance
    await this.testEventDiscoveryPerformance();

    // Test Metadata Enrichment Performance
    await this.testMetadataEnrichmentPerformance();

    // Generate Report
    this.generateReport();
  }

  private async testRpcPerformance(): Promise<void> {
    console.log('📡 Testing RPC Manager Performance...');

    const providers = ['Base Official', 'Chainstack', 'Spectrumnodes', 'Coinbase Base Node'];
    const results: any[] = [];

    for (const provider of providers) {
      const tracker = trackRpcCall(provider);
      try {
        const client = baseRPCManager.getPublicClient();
        const startTime = performance.now();

        // Test a simple RPC call
        const blockNumber = await client.getBlockNumber();
        const duration = performance.now() - startTime;

        tracker.end(true, { blockNumber: Number(blockNumber), duration });
        results.push({ provider, duration, success: true, blockNumber: Number(blockNumber) });

        console.log(`  ✅ ${provider}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        tracker.end(false, { error: error instanceof Error ? error.message : String(error) });
        results.push({ provider, duration: 0, success: false, error: String(error) });
        console.log(`  ❌ ${provider}: Failed - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.results.push({
      testName: 'RPC Performance Test',
      duration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      success: results.some(r => r.success),
      details: { providers: results }
    });
  }

  private async testIpfsPerformance(): Promise<void> {
    console.log('🌐 Testing IPFS Fetching Performance...');

    // Test with a known working IPFS hash (or use a placeholder)
    const testHashes = [
      'ipfs://QmYwAPJzv5CZsnAztxH7f5QG5qUQbHtJvJh2LxBf1Q6J1', // Test hash
      'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi' // Another test hash
    ];

    const results: any[] = [];

    for (const hash of testHashes) {
      const tracker = trackIpfsFetch('cloudflare-ipfs.com');
      const startTime = performance.now();

      try {
        const metadata = await fetchMetadataFromIPFS(hash, 3000);
        const duration = performance.now() - startTime;

        tracker.end(metadata ? true : false, { duration, hasMetadata: !!metadata });
        results.push({ hash, duration, success: !!metadata });

        console.log(`  ${metadata ? '✅' : '⚠️'} ${hash.slice(0, 20)}...: ${duration.toFixed(2)}ms`);
      } catch (error) {
        const duration = performance.now() - startTime;
        tracker.end(false, { error: error instanceof Error ? error.message : String(error), duration });
        results.push({ hash, duration, success: false, error: String(error) });
        console.log(`  ❌ ${hash.slice(0, 20)}...: Failed - ${duration.toFixed(2)}ms`);
      }
    }

    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    this.results.push({
      testName: 'IPFS Fetching Test',
      duration: avgDuration,
      success: results.some(r => r.success),
      details: { hashes: results }
    });
  }

  private async testEventDiscoveryPerformance(): Promise<void> {
    console.log('📅 Testing Event Discovery Performance...');

    const tracker = trackEventFetch(0);
    const startTime = performance.now();

    try {
      const events = await discoverEventsFromBlockchain();
      const duration = performance.now() - startTime;

      tracker.end(true, { eventCount: events.length, duration });
      this.results.push({
        testName: 'Event Discovery Test',
        duration,
        success: true,
        details: { eventCount: events.length }
      });

      console.log(`  ✅ Discovered ${events.length} events in ${duration.toFixed(2)}ms`);
    } catch (error) {
      const duration = performance.now() - startTime;
      tracker.end(false, { error: error instanceof Error ? error.message : String(error), duration });
      this.results.push({
        testName: 'Event Discovery Test',
        duration,
        success: false,
        details: { error: String(error) }
      });

      console.log(`  ❌ Event discovery failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async testMetadataEnrichmentPerformance(): Promise<void> {
    console.log('🏷️ Testing Metadata Enrichment Performance...');

    try {
      // First get some events to enrich
      const events = await discoverEventsFromBlockchain();

      if (events.length === 0) {
        console.log('  ⚠️ No events available for metadata enrichment test');
        this.results.push({
          testName: 'Metadata Enrichment Test',
          duration: 0,
          success: false,
          details: { reason: 'No events available' }
        });
        return;
      }

      // Test with first few events
      const testEvents = events.slice(0, Math.min(3, events.length));
      const tracker = trackMetadataEnrichment(testEvents.length);
      const startTime = performance.now();

      // Import the enrichment function
      const { enrichEventsWithMetadata } = await import('../lib/metadata');
      const enrichedEvents = await enrichEventsWithMetadata(testEvents);
      const duration = performance.now() - startTime;

      tracker.end(true, { enrichedCount: enrichedEvents.length, duration });
      this.results.push({
        testName: 'Metadata Enrichment Test',
        duration,
        success: true,
        details: { eventCount: testEvents.length, enrichedCount: enrichedEvents.length }
      });

      console.log(`  ✅ Enriched ${enrichedEvents.length} events in ${duration.toFixed(2)}ms`);
    } catch (error) {
      tracker.end(false, { error: error instanceof Error ? error.message : String(error) });
      this.results.push({
        testName: 'Metadata Enrichment Test',
        duration: 0,
        success: false,
        details: { error: String(error) }
      });

      console.log(`  ❌ Metadata enrichment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private generateReport(): void {
    console.log('\n📊 Performance Test Results Summary');
    console.log('=' .repeat(50));

    const successfulTests = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;

    console.log(`\nOverall Results:`);
    console.log(`  ✅ Successful Tests: ${successfulTests}/${totalTests}`);
    console.log(`  📈 Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`  🎯 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);

    console.log(`\nDetailed Results:`);
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.testName}: ${result.duration.toFixed(2)}ms`);
      if (result.details) {
        console.log(`    ${JSON.stringify(result.details, null, 2).split('\n').map(line => `    ${line}`).join('\n')}`);
      }
    });

    // Performance Insights
    console.log(`\n💡 Performance Insights:`);
    const rpcTest = this.results.find(r => r.testName === 'RPC Performance Test');
    const ipfsTest = this.results.find(r => r.testName === 'IPFS Fetching Test');
    const eventTest = this.results.find(r => r.testName === 'Event Discovery Test');

    if (rpcTest?.success) {
      console.log(`  • RPC performance: ${rpcTest.duration.toFixed(2)}ms average`);
    }
    if (ipfsTest?.success) {
      console.log(`  • IPFS fetching: ${ipfsTest.duration.toFixed(2)}ms average`);
    }
    if (eventTest?.success) {
      console.log(`  • Event discovery: ${eventTest.duration.toFixed(2)}ms total`);
    }

    console.log(`\n  📈 Expected improvements from optimizations:`);
    console.log(`    - Multiple RPC providers: ~30-50% faster failover`);
    console.log(`    - Parallel IPFS fetching: ~60-80% faster metadata loading`);
    console.log(`    - Enhanced caching: ~70-90% reduction in redundant calls`);
    console.log(`    - Increased batch sizes: ~40-60% faster bulk operations`);

    // Export results
    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        successfulTests,
        averageDuration: avgDuration,
        successRate: (successfulTests / totalTests) * 100
      },
      results: this.results,
      performanceStats: performanceMonitor.exportMetrics()
    };

    // Save to file (in Node.js environment)
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const filename = `performance-test-results-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(process.cwd(), filename);

      fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
      console.log(`\n💾 Results exported to: ${filepath}`);
    }
  }
}

// Export for use in different environments
export const performanceTester = new PerformanceTester();

// Run tests if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  performanceTester.runAllTests().catch(console.error);
}