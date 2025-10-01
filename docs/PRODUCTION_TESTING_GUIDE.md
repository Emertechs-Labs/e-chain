# Production Testing Guide for Echain DApp

This guide provides step-by-step instructions for testing your Echain DApp with the production MultiBaas URL to ensure everything is working correctly before final deployment.

## Prerequisites

- Node.js 18+ installed
- Valid MultiBaas deployment and API keys
- Contract addresses for your deployed smart contracts
- MetaMask or compatible wallet with Base Sepolia testnet configured

## Step 1: Configure Environment Variables

Create or update your `.env.local` file in the `frontend` directory with the production values:

```bash
# MultiBaas Configuration
NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL=https://your-production-deployment.multibaas.com
NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY=your_production_dapp_user_api_key
NEXT_PUBLIC_MULTIBAAS_WEB3_API_KEY=your_production_web3_api_key
NEXT_PUBLIC_MULTIBAAS_CHAIN_ID=84532

# Contract Addresses (Base Sepolia production deployment)
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xYourProductionEventFactoryAddress
NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0xYourProductionEventTicketAddress
NEXT_PUBLIC_POAP_ADDRESS=0xYourProductionPoapAddress
NEXT_PUBLIC_INCENTIVE_ADDRESS=0xYourProductionIncentiveAddress
```

## Step 2: Run Automated Tests

We've provided a script to automatically test your MultiBaas production integration:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies if needed
npm install

# Run the production MultiBaas test
node scripts/test-production-multibaas.js
```

This script will:
1. Test the direct connection to MultiBaas
2. Read contract data from EventFactory
3. Generate an unsigned transaction
4. Test the local API proxy (requires running dev server)

## Step 3: Test with Development Server

Start your Next.js development server with the production MultiBaas URL:

```bash
# Start the development server
npm run dev
```

Once the server is running, visit http://localhost:3000 and test the following features:

### Testing Checklist:

1. **Wallet Connection**
   - [ ] Connect wallet using MetaMask
   - [ ] Ensure wallet connects successfully to Base Sepolia
   - [ ] Verify account address shows correctly in UI

2. **Read Operations**
   - [ ] Load the events list page - should display existing events
   - [ ] Check event details page - should load event data
   - [ ] View ticket information - should display correct data

3. **Write Operations**
   - [ ] Create a new event (if you have organizer status)
   - [ ] Purchase a ticket for an existing event
   - [ ] Claim a POAP if available for an event you attended

4. **API Proxy**
   - [ ] Test the API proxy directly: `node scripts/test-multibaas-proxy.js`
   - [ ] Verify unsigned transaction route: http://localhost:3000/api/debug/unsigned-tx

## Step 4: Test MultiBaas Dashboard Integration

1. Log in to your MultiBaas dashboard at your production URL
2. Check that contract aliases are correctly set up:
   - EventFactory should be linked to the correct address
   - EventTicket should be linked to the correct address
   - POAPAttendance should be linked to the correct address
   - IncentiveManager should be linked to the correct address

3. Verify event syncing is enabled for all contracts

## Step 5: Verify Contract Events and Transactions

1. Create a test event via your DApp UI
2. Verify the transaction appears in MultiBaas Transaction Explorer
3. Check that event data was properly captured in the Events tab

## Step 6: Perform a Full End-to-End Test

Complete an entire user journey to ensure all components work together:

1. Connect wallet
2. Create an event (as organizer)
3. Visit the event details page
4. Purchase a ticket for the event
5. Verify ticket ownership in your profile
6. Check for the event in the MultiBaas dashboard

## Troubleshooting

### Common Issues:

1. **Connection Errors**
   - Check MultiBaas API keys and permissions
   - Verify CORS settings in MultiBaas dashboard
   - Check network connectivity to MultiBaas endpoint

2. **Contract Interaction Failures**
   - Ensure contract addresses are correct
   - Verify contract aliases in MultiBaas match your frontend
   - Check that your wallet has sufficient Base Sepolia ETH

3. **Transaction Failures**
   - Review the transaction in MetaMask for error messages
   - Check browser console for JavaScript errors
   - Verify gas limits and parameters in the transaction

### Debug Tools:

- Use the Network tab in browser DevTools to inspect API calls
- Check the console for detailed error messages
- Run `node scripts/direct-multibaas-call.js` to test direct API calls
- Verify transaction details in the MultiBaas dashboard

## Final Checklist

Before production release, verify:

- [ ] All automated tests pass
- [ ] Manual UI testing is successful
- [ ] Contract interactions work (read and write)
- [ ] Events are being correctly synced in MultiBaas
- [ ] API proxy routes function properly
- [ ] Error handling works as expected

## Support

If you encounter issues, please:
1. Check the documentation in `docs/curvegridDocs/`
2. Review error messages carefully
3. Consult the MultiBaas documentation: https://docs.curvegrid.com/multibaas/