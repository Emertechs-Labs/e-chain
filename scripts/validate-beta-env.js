#!/usr/bin/env node

/**
 * Echain Beta Environment Validation Script
 * Validates all required environment variables for beta deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Echain Beta Environment Validator');
console.log('=====================================\n');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../frontend/.env.local') });

// Required environment variables for beta
const requiredVars = {
  // Base Network
  'NEXT_PUBLIC_BASE_RPC_URL': 'Base Sepolia RPC URL',
  'NEXT_PUBLIC_BASE_CHAIN_ID': 'Base Sepolia Chain ID',

  // Contract Addresses
  'NEXT_PUBLIC_EVENT_FACTORY_ADDRESS': 'Event Factory Contract Address',
  'NEXT_PUBLIC_EVENT_TICKET_ADDRESS': 'Event Ticket Contract Address',
  'NEXT_PUBLIC_POAP_ADDRESS': 'POAP Contract Address',
  'NEXT_PUBLIC_INCENTIVE_ADDRESS': 'Incentive Manager Contract Address',
  'NEXT_PUBLIC_MARKETPLACE_ADDRESS': 'Marketplace Contract Address',

  // Wallet Integration
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': 'WalletConnect Project ID',

  // Email Service (at least one)
  'RESEND_API_KEY': 'Resend API Key (optional if SendGrid used)',
  'SENDGRID_API_KEY': 'SendGrid API Key (optional if Resend used)',

  // Beta System
  'BETA_ACCESS_CODE': 'Beta Access Code',
  'ADMIN_ACCESS_CODE': 'Admin Access Code',

  // Monitoring (optional but recommended)
  'SENTRY_DSN': 'Sentry DSN (optional)',
  'BETA_FEEDBACK_DISCORD_WEBHOOK': 'Discord Webhook for feedback (optional)',
};

// Optional but recommended variables
const recommendedVars = {
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'Google Maps API Key',
  'DISCORD_CLIENT_ID': 'Discord OAuth Client ID',
  'GOOGLE_CLIENT_ID': 'Google OAuth Client ID',
  'TWITTER_CLIENT_ID': 'Twitter OAuth Client ID',
};

let allValid = true;
let warnings = [];

console.log('📋 Checking Required Variables:');
console.log('-------------------------------');

for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];

  if (!value || value.trim() === '') {
    console.log(`❌ ${varName}: MISSING - ${description}`);
    allValid = false;
  } else {
    // Basic validation for specific variables
    if (varName.includes('ADDRESS') && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
      console.log(`❌ ${varName}: INVALID FORMAT - Must be valid Ethereum address`);
      allValid = false;
    } else if (varName === 'NEXT_PUBLIC_BASE_CHAIN_ID' && value !== '84532') {
      console.log(`❌ ${varName}: INVALID - Must be 84532 for Base Sepolia`);
      allValid = false;
    } else {
      console.log(`✅ ${varName}: SET`);
    }
  }
}

console.log('\n📋 Checking Recommended Variables:');
console.log('----------------------------------');

for (const [varName, description] of Object.entries(recommendedVars)) {
  const value = process.env[varName];

  if (!value || value.trim() === '') {
    console.log(`⚠️  ${varName}: NOT SET - ${description} (recommended for full functionality)`);
    warnings.push(`${varName} not configured`);
  } else {
    console.log(`✅ ${varName}: SET`);
  }
}

// Check email configuration
console.log('\n📧 Checking Email Configuration:');
const hasResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '';
const hasSendGrid = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim() !== '';

if (!hasResend && !hasSendGrid) {
  console.log('❌ Email Service: NO EMAIL SERVICE CONFIGURED');
  console.log('   At least one email service (Resend or SendGrid) is required for beta user registration');
  allValid = false;
} else if (hasResend && hasSendGrid) {
  console.log('✅ Email Service: MULTIPLE SERVICES CONFIGURED (will use Resend as primary)');
} else if (hasResend) {
  console.log('✅ Email Service: RESEND CONFIGURED');
} else {
  console.log('✅ Email Service: SENDGRID CONFIGURED');
}

// Check RPC providers
console.log('\n🌐 Checking RPC Configuration:');
const primaryRPC = process.env.NEXT_PUBLIC_BASE_RPC_URL;
const hasMultipleRPCs = process.env.NEXT_PUBLIC_CHAINSTACK_RPC_URL ||
                       process.env.NEXT_PUBLIC_COINBASE_RPC_URL ||
                       process.env.NEXT_PUBLIC_SPECTRUM_RPC_URL;

if (primaryRPC && primaryRPC.includes('sepolia.base.org')) {
  console.log('✅ Primary RPC: BASE SEPOLIA PUBLIC RPC');
} else {
  console.log('⚠️  Primary RPC: CUSTOM RPC CONFIGURED');
}

if (hasMultipleRPCs) {
  console.log('✅ Fallback RPCs: MULTIPLE PROVIDERS CONFIGURED');
} else {
  console.log('⚠️  Fallback RPCs: ONLY PRIMARY RPC CONFIGURED (recommended to add fallbacks)');
  warnings.push('Only primary RPC configured');
}

// Summary
console.log('\n🎯 VALIDATION SUMMARY');
console.log('====================');

if (allValid) {
  console.log('✅ ALL REQUIRED VARIABLES ARE CONFIGURED');
  console.log('🚀 READY FOR BETA DEPLOYMENT');

  if (warnings.length > 0) {
    console.log('\n⚠️  RECOMMENDATIONS:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
} else {
  console.log('❌ MISSING REQUIRED VARIABLES');
  console.log('🛑 NOT READY FOR BETA DEPLOYMENT');
  console.log('\nPlease configure all required variables before deploying.');
}

console.log('\n📝 Next Steps:');
console.log('1. Copy the production environment variables to Vercel');
console.log('2. Test the application locally with: npm run dev');
console.log('3. Deploy to Vercel and test health endpoints');
console.log('4. Share beta registration link with users');

process.exit(allValid ? 0 : 1);