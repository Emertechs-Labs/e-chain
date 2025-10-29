# Echain Troubleshooting Guide

**Version**: 1.0
**Last Updated**: October 27, 2025
**Platform**: Web3 Event Platform on Base Sepolia

## Quick Diagnosis

### Check Your Connection
1. **Wallet Connected**: Green checkmark in top-right corner
2. **Network**: Should show "Base Sepolia"
3. **Balance**: Sufficient ETH for transactions
4. **Internet**: Stable connection required

### Common Symptoms & Solutions

## Wallet Connection Issues

### Problem: "Wallet not detected"
**Symptoms**: Can't connect wallet, no wallet options appear
**Solutions**:
1. Install MetaMask, Rainbow, or Coinbase Wallet
2. Ensure wallet is unlocked
3. Refresh the page
4. Try a different browser (Chrome recommended)
5. Clear browser cache and cookies

### Problem: "Wrong network"
**Symptoms**: Error message about network mismatch
**Solutions**:
1. Open wallet extension
2. Switch to "Base Sepolia" testnet
3. If Base Sepolia not available, add it manually:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency: ETH

### Problem: "Transaction rejected by user"
**Symptoms**: Wallet popup appears but transaction fails
**Solutions**:
1. Check wallet balance (need ETH for gas)
2. Ensure you're not rejecting transactions
3. Try again with lower gas settings
4. Check if wallet is locked

## Transaction Issues

### Problem: "Transaction stuck pending"
**Symptoms**: Transaction submitted but not confirming
**Solutions**:
1. Wait 1-2 minutes (normal for Base network)
2. Check transaction on [BaseScan](https://sepolia.basescan.org)
3. If stuck >5 minutes, try speeding up in wallet
4. Contact support with transaction hash

### Problem: "Insufficient funds"
**Symptoms**: Transaction fails with balance error
**Solutions**:
1. Get testnet ETH from [Base Sepolia Faucet](https://sepoliafaucet.com)
2. Check wallet balance
3. Ensure sufficient ETH for gas fees
4. Some faucets: https://faucet.quicknode.com/base/sepolia

### Problem: "Transaction reverted"
**Symptoms**: Transaction fails on blockchain
**Possible Causes**:
- Event sold out
- Invalid parameters
- Contract paused (maintenance)
- Network issues

**Solutions**:
1. Check event status
2. Verify input parameters
3. Try again later
4. Contact event organizer

## Event Creation Issues

### Problem: "Event creation failed"
**Symptoms**: Can't create new events
**Solutions**:
1. Ensure wallet connected and funded
2. Check all required fields filled
3. Verify event parameters (dates, ticket counts)
4. Try again with simpler settings

### Problem: "Invalid event parameters"
**Symptoms**: Form validation errors
**Common Issues**:
- Event name too short (<3 characters)
- Invalid date (past dates not allowed)
- Ticket price too low (<0.001 ETH)
- Max tickets >1000

## Ticket Purchase Issues

### Problem: "Can't buy tickets"
**Symptoms**: Purchase button disabled or fails
**Solutions**:
1. Ensure event hasn't sold out
2. Check ticket availability
3. Verify wallet balance
4. Ensure correct quantity selected

### Problem: "Ticket not received"
**Symptoms**: Purchase successful but no ticket in wallet
**Solutions**:
1. Wait for transaction confirmation (1-2 minutes)
2. Check wallet for NFT receipt
3. Refresh wallet if needed
4. Contact support with transaction hash

## POAP Issues

### Problem: "Can't claim POAP"
**Symptoms**: Claim button disabled or fails
**Requirements**:
1. Must hold valid ticket NFT
2. Event must have ended
3. Haven't already claimed
4. Contract must be active

**Solutions**:
1. Verify ticket ownership
2. Check event end time
3. Ensure not already claimed
4. Try again later if network busy

## Performance Issues

### Problem: "Page loading slow"
**Symptoms**: Slow page loads, timeouts
**Solutions**:
1. Check internet connection
2. Try different browser
3. Clear cache and cookies
4. Disable browser extensions temporarily
5. Try incognito/private mode

### Problem: "App freezing"
**Symptoms**: Interface becomes unresponsive
**Solutions**:
1. Refresh the page
2. Clear browser data
3. Try different device/browser
4. Check for browser updates
5. Contact support if persistent

## Error Messages

### "Rate limit exceeded"
**Meaning**: Too many requests in short time
**Solution**: Wait 1-2 minutes, then try again

### "Contract call failed"
**Meaning**: Smart contract interaction failed
**Solutions**:
- Check network connection
- Verify wallet connection
- Try again later
- Contact support

### "Invalid input"
**Meaning**: Form data doesn't meet requirements
**Solution**: Check all fields and correct validation errors

### "Network error"
**Meaning**: Connection to blockchain failed
**Solutions**:
- Check internet connection
- Switch network in wallet
- Try different RPC endpoint
- Wait for network recovery

## Browser-Specific Issues

### Chrome
- Ensure extensions not blocking
- Try disabling ad blockers
- Update Chrome to latest version

### Firefox
- Check privacy settings
- Allow third-party cookies
- Update Firefox

### Safari
- Allow popups for wallet connections
- Check privacy settings
- Update Safari

### Mobile Browsers
- Use wallet's built-in browser
- Ensure stable internet
- Close other apps for better performance

## Advanced Troubleshooting

### Check Browser Console
1. Press F12 or right-click > Inspect
2. Go to Console tab
3. Look for error messages
4. Share errors with support

### Check Network Tab
1. Press F12 > Network tab
2. Reload page
3. Look for failed requests (red entries)
4. Check response details

### Wallet Logs
- MetaMask: Settings > Advanced > Download logs
- Rainbow: Help > Export logs
- Share logs with support when requested

## Getting Help

### When to Contact Support
- Issues persist after trying solutions
- Financial loss or security concerns
- Critical functionality broken
- Error messages with transaction hashes

### What to Include in Support Request
1. **Description**: What you were doing when error occurred
2. **Error Messages**: Exact text of any errors
3. **Browser**: Chrome/Firefox/Safari + version
4. **Wallet**: MetaMask/Rainbow + version
5. **Transaction Hash**: If applicable (0x...)
6. **Screenshots**: Of error messages
7. **Console Logs**: If requested

### Support Channels
- **Discord**: Fastest response (24h)
- **Email**: support@echain.com (48h)
- **Status Page**: Check for outages

## Prevention Tips

### Regular Maintenance
- Keep wallet software updated
- Clear browser cache monthly
- Backup wallet seed phrases
- Monitor account activity

### Security Best Practices
- Never share private keys
- Use hardware wallet for large amounts
- Verify URLs before connecting
- Be cautious of phishing attempts

### Performance Optimization
- Use Chrome for best compatibility
- Close unnecessary browser tabs
- Ensure stable internet connection
- Keep device updated

---

*This guide is updated regularly. If your issue isn't covered, please contact support.*

**Emergency Contact**: For critical security issues, email security@echain.com immediately.