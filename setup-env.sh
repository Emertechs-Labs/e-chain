#!/bin/bash

# Echain Environment Setup Script
# Run this script to set up production environment variables
# Usage: ./setup-env.sh

set -e

echo "🚀 Echain Production Environment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for input
prompt() {
    local var_name=$1
    local description=$2
    local default_value=$3

    echo -e "${BLUE}$description${NC}"
    if [ -n "$default_value" ]; then
        echo -e "${YELLOW}Default: $default_value${NC}"
    fi
    read -p "Enter value (or press Enter for default): " value

    if [ -z "$value" ] && [ -n "$default_value" ]; then
        value=$default_value
    fi

    if [ -z "$value" ]; then
        echo -e "${RED}❌ Required value not provided${NC}"
        return 1
    fi

    eval "$var_name=\"$value\""
    return 0
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from template...${NC}"
    cp .env.example .env.production 2>/dev/null || echo "# Echain Production Environment" > .env.production
fi

echo -e "${GREEN}✅ Environment file ready${NC}"
echo ""

# Setup sections
echo -e "${BLUE}📋 Setting up environment variables...${NC}"
echo ""

# RPC Providers
echo -e "${YELLOW}🔗 RPC Provider Setup${NC}"
echo "You'll need to sign up for these services:"
echo "1. Chainstack: https://chainstack.com/"
echo "2. Spectrum Nodes: https://spectrumnodes.com/"
echo "3. Coinbase Developer Platform: https://www.coinbase.com/developer-platform/"
echo ""

if prompt "CHAINSTACK_RPC" "Chainstack Base Mainnet RPC URL" ""; then
    echo "BASE_MAINNET_CHAINSTACK_RPC=$CHAINSTACK_RPC" >> .env.production
fi

if prompt "SPECTRUM_RPC" "Spectrum Nodes Base Mainnet RPC URL" ""; then
    echo "BASE_MAINNET_SPECTRUM_RPC=$SPECTRUM_RPC" >> .env.production
fi

if prompt "COINBASE_RPC" "Coinbase Base Mainnet RPC URL" ""; then
    echo "BASE_MAINNET_COINBASE_RPC=$COINBASE_RPC" >> .env.production
fi

echo ""

# Monitoring
echo -e "${YELLOW}📊 Monitoring Setup${NC}"
echo "Sign up at: https://sentry.io/"
echo ""

if prompt "SENTRY_DSN" "Sentry DSN (Data Source Name)" ""; then
    echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.production
fi

echo ""

# Slack
echo -e "${YELLOW}💬 Slack Integration${NC}"
echo "Create webhook at: https://api.slack.com/apps"
echo ""

if prompt "SLACK_WEBHOOK" "Slack Feedback Webhook URL" ""; then
    echo "SLACK_FEEDBACK_WEBHOOK_URL=$SLACK_WEBHOOK" >> .env.production
fi

echo ""

# Security
echo -e "${YELLOW}🔐 Security Setup${NC}"

if prompt "ADMIN_API_KEY" "Admin API Key (generate a secure random string)" ""; then
    echo "ADMIN_API_KEY=$ADMIN_API_KEY" >> .env.production
fi

if prompt "JWT_SECRET" "JWT Secret (generate a secure random string)" ""; then
    echo "JWT_SECRET=$JWT_SECRET" >> .env.production
fi

echo ""

# Storage
echo -e "${YELLOW}💾 Storage Setup${NC}"

if prompt "BLOB_TOKEN" "Vercel Blob Read/Write Token" ""; then
    echo "BLOB_READ_WRITE_TOKEN=$BLOB_TOKEN" >> .env.production
fi

echo ""

# Database (optional for now)
echo -e "${YELLOW}🗄️  Database Setup (Optional)${NC}"
echo "You can set this up later with Supabase, Railway, or PlanetScale"
echo ""

if prompt "DATABASE_URL" "Database URL (optional - press Enter to skip)" ""; then
    if [ -n "$DATABASE_URL" ]; then
        echo "DATABASE_URL=$DATABASE_URL" >> .env.production
    fi
fi

echo ""

# Summary
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review .env.production file"
echo "2. Add variables to Vercel dashboard"
echo "3. Run validation: npm run validate:env"
echo "4. Deploy to production"
echo ""
echo -e "${YELLOW}📖 See docs/ENVIRONMENT_SETUP_GUIDE.md for detailed instructions${NC}"
echo ""

# Validation
echo -e "${BLUE}🔍 Running validation...${NC}"
cd frontend
npm run validate:env

echo ""
echo -e "${GREEN}🎉 Setup complete! Ready for production deployment.${NC}"