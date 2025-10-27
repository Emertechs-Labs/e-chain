#!/usr/bin/env node

/**
 * Vercel Environment Setup Script
 *
 * This script helps configure production environment variables in Vercel
 * Run with: node scripts/setup-vercel-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Vercel Environment Variables for Echain...\n');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Vercel CLI not found. Please install it first:');
  console.log('   npm install -g vercel');
  process.exit(1);
}

// Check if user is logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Not logged in to Vercel. Please login first:');
  console.log('   vercel login');
  process.exit(1);
}

// Check if we're in a Vercel project
try {
  execSync('vercel link --yes', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Could not link to Vercel project. Make sure you\'re in the right directory.');
  process.exit(1);
}

console.log('✅ Vercel project linked successfully\n');

// Environment variables to set in Vercel
const productionEnvVars = [
  // Required for production
  { key: 'NEXT_PUBLIC_REOWN_PROJECT_ID', description: 'Reown (WalletConnect) Project ID' },
  { key: 'BLOB_READ_WRITE_TOKEN', description: 'Vercel Blob Storage Token' },
  { key: 'ADMIN_API_KEY', description: 'Admin API Key for backend operations' },
  { key: 'JWT_SECRET', description: 'JWT Secret for authentication' },
  { key: 'NEXT_PUBLIC_SENTRY_DSN', description: 'Sentry DSN for error monitoring' },

  // Optional but recommended
  { key: 'EDGE_CONFIG', description: 'Vercel Edge Config ID' },
  { key: 'NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC', description: 'Chainstack RPC URL' },
  { key: 'NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC', description: 'Spectrum RPC URL' },
  { key: 'NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC', description: 'Coinbase RPC URL' },
  { key: 'NEXT_PUBLIC_ONCHAINKIT_API_KEY', description: 'Coinbase OnchainKit API Key' },
  { key: 'SENDGRID_API_KEY', description: 'SendGrid API Key for emails' },
  { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth Client ID' },
  { key: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth Client Secret' },
  { key: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', description: 'Google Maps API Key' },
];

console.log('📋 The following environment variables need to be configured in Vercel:\n');

productionEnvVars.forEach((envVar, index) => {
  console.log(`${index + 1}. ${envVar.key}`);
  console.log(`   Description: ${envVar.description}`);
  console.log(`   Vercel Command: vercel env add ${envVar.key} production\n`);
});

console.log('🔧 To set these up, run the following commands:\n');

// Generate the commands
productionEnvVars.forEach(envVar => {
  console.log(`# ${envVar.description}`);
  console.log(`vercel env add ${envVar.key} production`);
  console.log('');
});

console.log('📖 Setup Instructions:');
console.log('1. Get API keys from the respective services (see .env.local for links)');
console.log('2. Run the vercel env add commands above');
console.log('3. For sensitive values, use: vercel env add KEY production < value.txt');
console.log('4. Verify with: vercel env ls production');
console.log('\n🎯 After setup, run: npm run validate:env to verify configuration');

console.log('\n💡 Pro tip: Store your API keys securely and never commit them to git!');