# Coinbase AgentKit MCP Server for Echain

A Model Context Protocol (MCP) server that integrates Coinbase AgentKit, enabling AI agents to perform onchain actions through the Coinbase Developer Platform within the Echain ecosystem.

## Features

- **Full AgentKit Integration**: Access to all Coinbase AgentKit tools and capabilities
- **Onchain Operations**: Token transfers, smart contract interactions, trading, and more
- **Standardized Protocol**: MCP-compliant interface for consistent AI agent interactions
- **Multi-Network Support**: Support for multiple blockchain networks through AgentKit

## Prerequisites

- Node.js 18+
- Coinbase Developer Platform API credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the server:
```bash
npm run build
```

## Configuration

Set the following environment variables:

```bash
export CDP_API_KEY_NAME="your-cdp-api-key-name"
export CDP_API_KEY_PRIVATE_KEY="your-cdp-api-private-key"
```

You can get these credentials from the [Coinbase Developer Platform](https://portal.cdp.coinbase.com/).

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Available Tools

The server provides access to all tools available through Coinbase AgentKit, including but not limited to:

- **Wallet Management**: Create and manage wallets across multiple networks
- **Token Operations**: Transfer tokens, check balances, and manage assets
- **Trading**: Execute trades on decentralized exchanges
- **Smart Contracts**: Interact with smart contracts and dApps
- **Network Operations**: Cross-chain transfers and network-specific operations

The exact tools available depend on your AgentKit configuration and the networks you have access to.

## Integration with Echain

This MCP server integrates AgentKit with the Echain platform to provide comprehensive blockchain functionality:

- Multi-chain wallet management and operations
- Cross-chain asset transfers and bridging
- DeFi trading and liquidity management
- Smart contract deployment and interaction
- Real-time blockchain data access

## Development

### Project Structure
```
tools/mcp-server/
├── src/
│   └── index.ts          # Main server implementation using AgentKit
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
└── README.md            # This file
```

### Building
```bash
npm run build
```

### Testing
The server requires valid CDP API credentials to function. Without them, it will fail to initialize.

## Security

- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Regularly rotate API credentials
- Monitor wallet activities for suspicious transactions

## Troubleshooting

### Common Issues

#### Tool Execution Errors
- Ensure your CDP API keys are correctly set
- Verify that the requested tool is supported by your AgentKit instance
- Check for sufficient funds or permissions for blockchain transactions

#### MCP Server Connection Issues
- Verify that the transport layer is correctly configured
- Check for port conflicts if using network-based transports

### Debugging Tips
- Enable verbose logging in your MCP server setup
- Use environment variables to toggle debug modes

## License

MIT