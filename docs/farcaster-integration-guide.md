# Farcaster Integration User Guide

## Overview
Echain now supports Farcaster authentication as an optional alternative to traditional wallet connections. This guide explains how to use the new features for a seamless Web3 experience.

**Status**: ✅ **FULLY IMPLEMENTED AND PRODUCTION READY**
- All 5 sprints completed (69/69 story points)
- Security audit passed with enterprise-grade protections
- Comprehensive monitoring and logging in place
- Backend validation for secure recovery
- Production deployment configuration ready

## Farcaster Login

### How to Sign In with Farcaster
1. On the main page, click the "Connect Wallet" button
2. You'll see two options:
   - **Sign in with Farcaster**: Click this for social login
   - **Connect Wallet**: Traditional wallet connection
3. If you choose Farcaster, sign in with your Farcaster account
4. After authentication, you'll be prompted to connect your wallet for full features

### Benefits
- **Social Login**: No need to remember wallet credentials
- **Auto-Linking**: Your wallet can be automatically connected if previously linked
- **Cross-Platform**: Works on Farcaster clients and Base apps

## Account Recovery

### Using Farcaster for Recovery
If you lose access to your wallet, you can recover your account using Farcaster:

1. Navigate to `/recovery` or click the recovery link
2. Sign in with your Farcaster account
3. The system will verify your linked addresses
4. Sign a recovery message to prove ownership
5. If successful, regain access to your events and assets

### Important Notes
- Recovery requires your Farcaster account to be linked to the lost wallet
- This is a social recovery option, not a replacement for wallet backups
- Always backup your wallet seed phrases separately

## Farcaster Frames

### Viewing Events in Frames
Echain events can be shared as interactive Frames in Farcaster:

1. When viewing an event page, it includes Frame metadata
2. In Farcaster clients (like Warpcast), the event appears as an embed
3. Click "View Event" to open the full page
4. Click "RSVP" to interact directly within the Frame

### Frame Interactions
- **View Details**: See event information without leaving Farcaster
- **RSVP**: Quick social engagement
- **Share**: Frames enhance discoverability

## Base App Features

### Gasless Transactions
On Base, transactions can be gasless:
- Coinbase Paymaster covers gas fees
- Seamless purchasing without ETH balance requirements
- Automatic for supported operations

### PWA Installation
Install Echain as a native app on Base-compatible devices:
1. Visit the site on a mobile browser
2. Use the browser's "Add to Home Screen" option
3. Access Echain like a native app

## Security Considerations

### Farcaster Auth
- ✅ **Production Security**: Enterprise-grade security with comprehensive audit
- ✅ **Cryptographic Verification**: Secure signature validation with nonce-based replay protection
- ✅ **No Private Keys Stored**: Relies on Farcaster's secure custody model
- ✅ **Rate Limiting**: IP-based rate limiting prevents abuse
- ✅ **Comprehensive Monitoring**: All authentication events logged and monitored

### Recovery
- ✅ **Backend Validation**: Secure server-side validation with nonce-based signatures
- ✅ **Replay Attack Prevention**: Nonce expiry and usage tracking
- ✅ **Rate Limiting**: Recovery attempts limited per IP address
- ✅ **Audit Logging**: All recovery attempts monitored for security
- ✅ **Social Recovery Best Practices**: Clear warnings about limitations and wallet backup importance

### Frames
- ✅ **MiniKit Security**: Coinbase's secure iframe communication
- ✅ **Input Validation**: Comprehensive validation of all Frame data
- ✅ **CSP Headers**: Strict Content Security Policy for Frame interactions
- ✅ **Frame Ancestor Restrictions**: Limited to approved Farcaster domains
- ✅ **Secure Redirects**: All Frame actions redirect to secure full pages

## Troubleshooting

### Farcaster Login Issues
- Ensure your Farcaster account is active
- Check network connectivity
- Try refreshing the page

### Recovery Problems
- Verify your Farcaster account owns the linked addresses
- Ensure you're using the correct Farcaster account
- Contact support if issues persist

### Frame Not Loading
- Update your Farcaster client
- Check MiniKit compatibility
- Fallback to direct links

## Support
For issues with Farcaster integration, check the [Farcaster Docs](https://docs.farcaster.xyz) or contact Echain support.