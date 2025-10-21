# Echain Wallet App

A standalone wallet application built with Next.js that uses the `@echain/wallet` package for Base network wallet management.

## Features

- Wallet connection and management
- Base network integration
- Unified wallet UI components
- RPC health monitoring

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

The wallet app provides a simple interface to connect wallets and interact with the Base network. It uses the shared `@echain/wallet` package for all wallet functionality.

## Architecture

This app demonstrates how to use the `@echain/wallet` package in a standalone application. The package provides:

- Wallet connection hooks
- UI components for wallet interaction
- Base network configuration
- RPC management utilities

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking