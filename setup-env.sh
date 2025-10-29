#!/bin/bash

# Echain Environment Setup Script
# Run this script to set up LOCAL production environment variables
# Usage: ./setup-env.sh

set -e

echo "🚀 Echain Production Environment Setup"
echo "======================================"
echo ""
echo "⚠️  SECURITY WARNING: This repository is PUBLIC on GitHub!"
echo "   This script creates .env.production for LOCAL use only."
echo "   NEVER commit .env.production or any file with real secrets!"
echo "   Set environment variables in your deployment platform (Vercel, etc.)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
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

# Base Network Configuration
echo -e "${YELLOW}🌐 Base Network Configuration${NC}"
echo "Base Sepolia testnet settings:"
echo "RPC URL: https://sepolia.base.org"
echo "Chain ID: 84532"
echo ""

# Wallet Integration
echo -e "${YELLOW}🔗 Wallet Integration Setup${NC}"
echo "Sign up at: https://cloud.walletconnect.com/"
echo ""

if prompt "WALLETCONNECT_ID" "WalletConnect Project ID" ""; then
    echo "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$WALLETCONNECT_ID" >> .env.production
    echo "NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=$WALLETCONNECT_ID" >> .env.production
fi

echo ""

# Coinbase OnchainKit
echo -e "${YELLOW}💰 Coinbase OnchainKit Setup${NC}"
echo "Get API key at: https://www.coinbase.com/developer-platform"
echo ""

if prompt "ONCHAINKIT_KEY" "Coinbase OnchainKit API Key" ""; then
    echo "NEXT_PUBLIC_ONCHAINKIT_API_KEY=$ONCHAINKIT_KEY" >> .env.production
fi

echo ""

# Database
echo -e "${YELLOW}🗄️  Database Setup${NC}"
echo "Recommended: Supabase (https://supabase.com/)"
echo "Alternatives: PlanetScale, Railway"
echo ""

if prompt "DATABASE_URL" "Database Connection URL" ""; then
    echo "DATABASE_URL=$DATABASE_URL" >> .env.production
fi

echo ""

# Security Keys
echo -e "${YELLOW}🔐 Security Keys Setup${NC}"

if prompt "NEXTAUTH_SECRET" "NextAuth Secret (generate with: openssl rand -hex 32)" ""; then
    echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env.production
fi

if prompt "JWT_SECRET" "JWT Secret (generate with: openssl rand -hex 64)" ""; then
    echo "JWT_SECRET=$JWT_SECRET" >> .env.production
fi

echo ""

# Sentry
echo -e "${YELLOW}📊 Sentry Monitoring Setup${NC}"
echo "Sign up at: https://sentry.io/"
echo ""

if prompt "SENTRY_DSN" "Sentry DSN (Data Source Name)" ""; then
    echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.production
    echo "SENTRY_DSN=$SENTRY_DSN" >> .env.production
fi

echo ""

# Email Service
echo -e "${YELLOW}📧 Email Service Setup (Optional)${NC}"
echo "Recommended: Resend (https://resend.com/)"
echo "Alternative: SendGrid (https://sendgrid.com/)"
echo ""

if prompt "EMAIL_API_KEY" "Email API Key (optional - press Enter to skip)" ""; then
    if [ -n "$EMAIL_API_KEY" ]; then
        echo "RESEND_API_KEY=$EMAIL_API_KEY" >> .env.production
        echo "RESEND_FROM_EMAIL=noreply@echain.app" >> .env.production
    fi
fi

echo ""

# RPC Providers
echo -e "${YELLOW}🔗 Premium RPC Providers (Optional)${NC}"
echo "Recommended providers:"
echo "1. Chainstack: https://chainstack.com/"
echo "2. Coinbase: https://www.coinbase.com/developer-platform/"
echo "3. Spectrum: https://spectrumnodes.com/"
echo ""

if prompt "CHAINSTACK_RPC" "Chainstack Base Sepolia RPC URL (optional)" ""; then
    if [ -n "$CHAINSTACK_RPC" ]; then
        echo "NEXT_PUBLIC_CHAINSTACK_RPC_URL=$CHAINSTACK_RPC" >> .env.production
    fi
fi

if prompt "COINBASE_RPC" "Coinbase Base Sepolia RPC URL (optional)" ""; then
    if [ -n "$COINBASE_RPC" ]; then
        echo "NEXT_PUBLIC_COINBASE_RPC_URL=$COINBASE_RPC" >> .env.production
    fi
fi

if prompt "SPECTRUM_RPC" "Spectrum Base Sepolia RPC URL (optional)" ""; then
    if [ -n "$SPECTRUM_RPC" ]; then
        echo "NEXT_PUBLIC_SPECTRUM_RPC_URL=$SPECTRUM_RPC" >> .env.production
    fi
fi

echo ""

# Social Authentication (Optional)
echo -e "${YELLOW}🔑 Social Authentication (Optional)${NC}"
echo "Configure social login providers:"
echo ""

if prompt "GOOGLE_CLIENT_ID" "Google OAuth Client ID (optional)" ""; then
    if [ -n "$GOOGLE_CLIENT_ID" ]; then
        echo "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env.production
        if prompt "GOOGLE_CLIENT_SECRET" "Google OAuth Client Secret" ""; then
            echo "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET" >> .env.production
        fi
    fi
fi

if prompt "DISCORD_CLIENT_ID" "Discord OAuth Client ID (optional)" ""; then
    if [ -n "$DISCORD_CLIENT_ID" ]; then
        echo "DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID" >> .env.production
        if prompt "DISCORD_CLIENT_SECRET" "Discord OAuth Client Secret" ""; then
            echo "DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET" >> .env.production
        fi
        if prompt "DISCORD_WEBHOOK" "Discord Webhook URL for feedback" ""; then
            echo "DISCORD_WEBHOOK_URL=$DISCORD_WEBHOOK" >> .env.production
        fi
    fi
fi

echo ""

# Summary
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo -e "${RED}� CRITICAL SECURITY REMINDER:${NC}"
echo "   - .env.production is for LOCAL testing only"
echo "   - NEVER commit .env.production to the PUBLIC repository"
echo "   - Set these variables in your deployment platform (Vercel)"
echo "   - Use .env.example as a template for deployment setup"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Test locally with: npm run validate:env"
echo "2. Copy values to your deployment platform"
echo "3. Delete .env.production after testing"
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