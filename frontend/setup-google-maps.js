#!/usr/bin/env node

/**
 * Google Maps Setup Script for Echain
 * 
 * This script helps you set up Google Maps integration
 * Run with: node setup-google-maps.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗺️  Google Maps Setup for Echain\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

async function setupGoogleMaps() {
  try {
    // Step 1: Check if .env.local exists
    if (!fs.existsSync(envPath)) {
      console.log('📋 Creating .env.local from .env.example...');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env.local created successfully');
      } else {
        console.log('❌ .env.example not found. Please create .env.local manually.');
        return;
      }
    }

    // Step 2: Ask for API key
    console.log('\n🔑 Google Maps API Key Setup');
    console.log('1. Go to: https://console.cloud.google.com/');
    console.log('2. Create a project and enable Maps JavaScript API');
    console.log('3. Create an API key');
    console.log('4. Copy the API key below\n');

    const apiKey = await new Promise((resolve) => {
      rl.question('Enter your Google Maps API key: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!apiKey) {
      console.log('❌ No API key provided. Setup cancelled.');
      rl.close();
      return;
    }

    // Step 3: Update .env.local
    console.log('\n📝 Updating .env.local...');
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY already exists
    if (envContent.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')) {
      // Update existing key
      envContent = envContent.replace(
        /NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*/,
        `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}`
      );
    } else {
      // Add new key
      envContent += `\n# Google Maps Configuration\nNEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKey}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ API key added to .env.local');

    // Step 4: Install dependencies
    console.log('\n📦 Installing Google Maps dependencies...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npm install @googlemaps/js-api-loader @types/google.maps', { 
        stdio: 'inherit',
        cwd: __dirname 
      });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.log('❌ Failed to install dependencies. Please run manually:');
      console.log('   npm install @googlemaps/js-api-loader @types/google.maps');
    }

    // Step 5: Show next steps
    console.log('\n🔄 Next Steps:');
    console.log('1. Uncomment GoogleMapsProvider in app/providers.tsx');
    console.log('2. Uncomment useGoogleMaps in app/components/maps/EventLocationMap.tsx');
    console.log('3. Run: npm run dev');
    console.log('4. Test the map functionality on an event page');

    console.log('\n📚 For detailed instructions, see: docs/GOOGLE_MAPS_SETUP.md');
    console.log('✅ Google Maps setup completed!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupGoogleMaps();
