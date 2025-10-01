# Direct MultiBaas API Testing Commands

# Replace YOUR_DEPLOYMENT_URL and YOUR_API_KEY with actual values

## 1. List Available Blockchains
```bash
curl -X GET "https://YOUR_DEPLOYMENT_URL/api/v0/chains" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## 2. Check Base Sepolia Status (if configured)
```bash
curl -X GET "https://YOUR_DEPLOYMENT_URL/api/v0/chains/base-sepolia/status" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## 3. List Available Contracts
```bash
curl -X GET "https://YOUR_DEPLOYMENT_URL/api/v0/contracts" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## 4. Check Contract Addresses (if configured)
```bash
curl -X GET "https://YOUR_DEPLOYMENT_URL/api/v0/chains/base-sepolia/addresses" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## Expected Responses:

### Successful Chain List Response:
```json
{
  "status": 200,
  "message": "success",
  "result": [
    {
      "label": "base-sepolia",
      "chainID": 84532,
      "blockNumber": 12345678
    }
  ]
}
```

### Error Response (if blockchain not configured):
```json
{
  "status": 404,
  "message": "blockchain not found"
}
```

## If You Get 404 Errors:

Your MultiBaas deployment needs Base Sepolia blockchain configuration. This typically requires:

1. **Admin Access**: Login to MultiBaas dashboard
2. **Add Blockchain**: Configure Base Sepolia (Chain ID: 84532)
3. **Deploy/Link Contracts**: Add your contract addresses
4. **Test Connection**: Verify blockchain status

## Common Issues:

- **Wrong API Key**: Ensure you're using the correct API key for your deployment
- **Permission Issues**: API key might not have access to blockchain operations
- **Deployment State**: MultiBaas deployment might be in setup/configuration mode
- **Network Issues**: MultiBaas might not have Base Sepolia configured yet