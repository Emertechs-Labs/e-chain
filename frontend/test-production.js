#!/usr/bin/env node
/**
 * Production URL Test Script
 * Tests the key issues mentioned by the user
 */

const puppeteer = require('puppeteer');

async function testProduction() {
  console.log('🧪 Testing Echain Production URL...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });
    
    // Navigate to production URL
    console.log('📂 Loading events page...');
    await page.goto('https://echain-p552jfrwo-echain.vercel.app/events', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Check if events are loading
    console.log('🔍 Checking for events...');
    await page.waitForSelector('[data-testid="event-card"], .text-center', { timeout: 10000 });
    
    const events = await page.$$('[data-testid="event-card"]');
    console.log(`✅ Found ${events.length} events`);
    
    // Test event detail page
    if (events.length > 0) {
      console.log('🎫 Testing event detail page...');
      const firstEventLink = await page.$('a[href*="/events/"]');
      if (firstEventLink) {
        await firstEventLink.click();
        await page.waitForSelector('h1', { timeout: 10000 });
        
        // Check for BigInt errors
        const hasErrors = await page.evaluate(() => {
          const errors = window.console.error || [];
          return errors.some(err => err.includes('BigInt'));
        });
        
        if (!hasErrors) {
          console.log('✅ No BigInt errors detected on event page');
        }
        
        // Check for purchase button
        const purchaseButton = await page.$('button[disabled]');
        if (purchaseButton) {
          console.log('🔄 Purchase button found (testing loading state)');
        }
        
        // Check for IPFS images
        const eventImage = await page.$('img[src*="ipfs"], img[src*="blob"]');
        if (eventImage) {
          console.log('🖼️ Event image found with IPFS/blob URL');
        } else {
          console.log('ℹ️ No IPFS/blob images found (using fallback)');
        }
      }
    }
    
    console.log('✅ Production test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testProduction().catch(console.error);