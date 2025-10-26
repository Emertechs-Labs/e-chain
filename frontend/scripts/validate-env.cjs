#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set
 * Run with: npm run validate:env or node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Required environment variables by category
const requiredEnvVars = {
  'Wallet & Web3': [
    'NEXT_PUBLIC_REOWN_PROJECT_ID',
    'NEXT_PUBLIC_WS_PROVIDER',
  ],
  'Network Configuration': [
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_ACTIVE_NETWORK',
  ],
  'RPC Endpoints (at least one)': {
    oneOf: [
      'NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL',
      'NEXT_PUBLIC_BASE_SEPOLIA_CHAINSTACK_RPC',
      'NEXT_PUBLIC_BASE_SEPOLIA_SPECTRUM_RPC',
      'NEXT_PUBLIC_BASE_SEPOLIA_COINBASE_RPC',
      // Production RPC endpoints
      'BASE_MAINNET_CHAINSTACK_RPC',
      'BASE_MAINNET_SPECTRUM_RPC',
      'BASE_MAINNET_COINBASE_RPC',
    ],
  },
  'Contract Addresses': [
    'NEXT_PUBLIC_EVENT_FACTORY_ADDRESS',
    'NEXT_PUBLIC_EVENT_TICKET_ADDRESS',
    'NEXT_PUBLIC_POAP_ADDRESS',
    'NEXT_PUBLIC_INCENTIVE_ADDRESS',
    'NEXT_PUBLIC_MARKETPLACE_ADDRESS',
  ],
  'Storage (at least Vercel Blob)': {
    oneOf: [
      'BLOB_READ_WRITE_TOKEN',
      'PINATA_JWT',
    ],
  },
  'Production Monitoring': {
    oneOf: [
      'NEXT_PUBLIC_SENTRY_DSN',
      'SLACK_FEEDBACK_WEBHOOK_URL',
    ],
  },
  'Security': [
    'ADMIN_API_KEY',
    'JWT_SECRET',
  ],
};

// Optional but recommended
const recommendedEnvVars = [
  'EDGE_CONFIG',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NEXT_PUBLIC_SENTRY_DSN',
];

// Development-only variables
const developmentEnvVars = [
  'NEXT_PUBLIC_DEBUG_MODE',
  'NEXT_PUBLIC_USE_MOCK_DATA',
];

function loadEnvFile() {
  // Check for production environment first
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const envPaths = [
    path.join(__dirname, '..', '.env.production'),
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
  ];

  let envPath = null;
  for (const testPath of envPaths) {
    if (fs.existsSync(testPath)) {
      envPath = testPath;
      break;
    }
  }

  if (!envPath) {
    console.error(`${colors.red}❌ Error: No environment file found${colors.reset}`);
    console.log(`${colors.yellow}Please create one of the following:${colors.reset}`);
    console.log(`${colors.cyan}  - .env.production (for production)${colors.reset}`);
    console.log(`${colors.cyan}  - .env.local (for development)${colors.reset}`);
    console.log(`${colors.cyan}  - .env (fallback)${colors.reset}\n`);
    console.log(`${colors.yellow}You can copy from .env.example:${colors.reset}`);
    console.log(`${colors.cyan}  cp .env.example .env.local${colors.reset}\n`);
    return null;
  }

  console.log(`${colors.blue}📄 Loading environment from: ${path.basename(envPath)}${colors.reset}\n`);

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, '').trim();
      if (value) {
        env[key] = value;
      }
    }
  });

  return env;
}

function validateRequired(env) {
  const errors = [];
  const warnings = [];

  console.log(`${colors.blue}🔍 Validating Required Environment Variables...${colors.reset}\n`);

  for (const [category, vars] of Object.entries(requiredEnvVars)) {
    console.log(`${colors.cyan}📋 ${category}:${colors.reset}`);

    if (Array.isArray(vars)) {
      // All variables in this category are required
      vars.forEach(varName => {
        if (!env[varName]) {
          console.log(`  ${colors.red}❌ ${varName}${colors.reset}`);
          errors.push(`Missing required variable: ${varName}`);
        } else {
          console.log(`  ${colors.green}✓ ${varName}${colors.reset}`);
        }
      });
    } else if (vars.oneOf) {
      // At least one of these variables is required
      const hasOne = vars.oneOf.some(varName => env[varName]);
      if (!hasOne) {
        console.log(`  ${colors.red}❌ At least one required${colors.reset}`);
        errors.push(`At least one of these variables is required: ${vars.oneOf.join(', ')}`);
      } else {
        vars.oneOf.forEach(varName => {
          if (env[varName]) {
            console.log(`  ${colors.green}✓ ${varName}${colors.reset}`);
          } else {
            console.log(`  ${colors.yellow}○ ${varName} (optional)${colors.reset}`);
          }
        });
      }
    }

    console.log('');
  }

  return { errors, warnings };
}

function validateRecommended(env) {
  console.log(`${colors.blue}💡 Checking Recommended Variables...${colors.reset}\n`);

  const missing = [];

  recommendedEnvVars.forEach(varName => {
    if (!env[varName]) {
      console.log(`  ${colors.yellow}⚠ ${varName} (recommended but optional)${colors.reset}`);
      missing.push(varName);
    } else {
      console.log(`  ${colors.green}✓ ${varName}${colors.reset}`);
    }
  });

  console.log('');
  return missing;
}

function validateContractAddresses(env) {
  console.log(`${colors.blue}🔗 Validating Contract Addresses...${colors.reset}\n`);

  const addressPattern = /^0x[a-fA-F0-9]{40}$/;
  const errors = [];

  const addressVars = [
    'NEXT_PUBLIC_EVENT_FACTORY_ADDRESS',
    'NEXT_PUBLIC_EVENT_TICKET_ADDRESS',
    'NEXT_PUBLIC_POAP_ADDRESS',
    'NEXT_PUBLIC_INCENTIVE_ADDRESS',
    'NEXT_PUBLIC_MARKETPLACE_ADDRESS',
  ];

  addressVars.forEach(varName => {
    const address = env[varName];
    if (address) {
      if (!addressPattern.test(address)) {
        console.log(`  ${colors.red}❌ ${varName}: Invalid address format${colors.reset}`);
        errors.push(`Invalid address format for ${varName}: ${address}`);
      } else {
        console.log(`  ${colors.green}✓ ${varName}${colors.reset}`);
      }
    }
  });

  console.log('');
  return errors;
}

function validateChainId(env) {
  const chainId = env.NEXT_PUBLIC_CHAIN_ID;
  const network = env.NEXT_PUBLIC_ACTIVE_NETWORK;

  console.log(`${colors.blue}⛓️  Validating Network Configuration...${colors.reset}\n`);

  if (network === 'sepolia' && chainId !== '84532') {
    console.log(`  ${colors.yellow}⚠ Warning: Chain ID ${chainId} doesn't match Base Sepolia (84532)${colors.reset}`);
  } else if (network === 'mainnet' && chainId !== '8453') {
    console.log(`  ${colors.yellow}⚠ Warning: Chain ID ${chainId} doesn't match Base Mainnet (8453)${colors.reset}`);
  } else {
    console.log(`  ${colors.green}✓ Network: ${network} (Chain ID: ${chainId})${colors.reset}`);
  }

  console.log('');
}

function printSummary(errors, warnings, missingRecommended) {
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}📊 VALIDATION SUMMARY${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  if (errors.length === 0) {
    console.log(`${colors.green}✅ All required environment variables are set!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}❌ Found ${errors.length} error(s):${colors.reset}`);
    errors.forEach(error => {
      console.log(`   ${colors.red}• ${error}${colors.reset}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  Found ${warnings.length} warning(s):${colors.reset}`);
    warnings.forEach(warning => {
      console.log(`   ${colors.yellow}• ${warning}${colors.reset}`);
    });
    console.log('');
  }

  if (missingRecommended.length > 0) {
    console.log(`${colors.yellow}💡 ${missingRecommended.length} recommended variable(s) not set:${colors.reset}`);
    missingRecommended.forEach(varName => {
      console.log(`   ${colors.yellow}• ${varName}${colors.reset}`);
    });
    console.log('');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}🎉 Your environment is fully configured!${colors.reset}\n`);
    return 0;
  } else if (errors.length === 0) {
    console.log(`${colors.yellow}✓ Configuration valid (with warnings)${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.red}❌ Configuration invalid - please fix the errors above${colors.reset}\n`);
    console.log(`${colors.cyan}📖 See .env.example for guidance on setting up each variable${colors.reset}\n`);
    return 1;
  }
}

// Main validation logic
function main() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}🔐 Echain Environment Variable Validator${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  const env = loadEnvFile();
  if (!env) {
    process.exit(1);
  }

  const { errors: requiredErrors, warnings } = validateRequired(env);
  const addressErrors = validateContractAddresses(env);
  const missingRecommended = validateRecommended(env);
  validateChainId(env);

  const allErrors = [...requiredErrors, ...addressErrors];
  const exitCode = printSummary(allErrors, warnings, missingRecommended);

  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { loadEnvFile, validateRequired, validateContractAddresses };
