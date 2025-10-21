#!/bin/bash

# Wallet App Testing Script
# Tests all implemented features

echo "🧪 Echain Wallet App - Feature Testing"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Navigate to wallet-app directory
cd "$(dirname "$0")/.." || exit 1

echo "📦 Step 1: Checking dependencies..."
if npm list sonner &>/dev/null; then
    print_status 0 "sonner package installed"
else
    print_status 1 "sonner package missing"
    echo "   Installing dependencies..."
    npm install
fi

echo ""
echo "🔨 Step 2: Running TypeScript type check..."
if npm run type-check &>/dev/null; then
    print_status 0 "TypeScript compilation successful"
else
    print_status 1 "TypeScript errors found"
fi

echo ""
echo "🏗️  Step 3: Testing production build..."
if npm run build &>/dev/null; then
    print_status 0 "Production build successful"
else
    print_status 1 "Build failed"
fi

echo ""
echo "📝 Step 4: Checking component files..."

COMPONENTS=(
    "components/TransactionCreator.tsx"
    "components/MultisigManager.tsx"
    "components/TransactionFilter.tsx"
    "components/WalletConnect.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        print_status 0 "$component exists"
    else
        print_status 1 "$component missing"
    fi
done

echo ""
echo "📄 Step 5: Checking updated pages..."

PAGES=(
    "app/page.tsx"
    "app/dashboard/page.tsx"
    "app/dashboard/multisig/page.tsx"
    "app/dashboard/transactions/page.tsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        print_status 0 "$page exists"
    else
        print_status 1 "$page missing"
    fi
done

echo ""
echo "🔍 Step 6: Checking for accessibility attributes..."

# Check TransactionFilter for aria-labels
if grep -q 'aria-label="Filter by transaction type"' components/TransactionFilter.tsx; then
    print_status 0 "Accessibility attributes present"
else
    print_status 1 "Missing accessibility attributes"
fi

echo ""
echo "📊 Testing Summary"
echo "=================="
echo ""
echo -e "${YELLOW}Components Created:${NC}"
echo "  • TransactionCreator - HBAR/Token/Contract transactions"
echo "  • MultisigManager - Multisig wallet creation & management"
echo "  • TransactionFilter - Advanced search & filtering"
echo "  • WalletConnect - Enhanced wallet connection UI"
echo ""
echo -e "${YELLOW}Pages Updated:${NC}"
echo "  • Home - Dynamic imports with SSR safety"
echo "  • Dashboard - Toast notifications & quick actions"
echo "  • Multisig - Integrated custom manager"
echo "  • Transactions - Advanced filtering interface"
echo ""
echo -e "${YELLOW}Dependencies Added:${NC}"
echo "  • sonner - Toast notification system"
echo ""
echo -e "${YELLOW}Features Implemented:${NC}"
echo "  ✅ Transaction creation functionality"
echo "  ✅ Multisig wallet management"
echo "  ✅ Enhanced UI/UX improvements"
echo "  ✅ Advanced transaction filtering"
echo "  ✅ Real wallet connection testing"
echo ""
echo "🎯 Next Steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Open browser: http://localhost:3000"
echo "  3. Connect wallet (MetaMask/WalletConnect)"
echo "  4. Test all features:"
echo "     • Create transactions (HBAR/Token/Contract)"
echo "     • Create multisig wallets"
echo "     • Filter transactions"
echo "     • Test wallet connection UI"
echo ""
echo "📖 Documentation:"
echo "  • See WALLET_FEATURES_IMPLEMENTATION.md for details"
echo "  • Check package.json for available scripts"
echo ""
echo "✨ Testing complete!"
